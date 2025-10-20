# 空き情報データ再設計

## 目的

- 事業所視点の空き状況レポートと相談支援専門員視点の観測メモを独立データとして保持する。
- 背景情報を即時保存・共有できるようにし、ドラフト操作による手間を排除する。
- リコメンド表示では両視点を統合しつつ、データの上書きを防ぎ文脈を残す。

## Prisma スキーマ案

```prisma
model FacilityAvailabilityReport {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facilityId     String   @map("facility_id") @db.Uuid
  status         String   @db.VarChar(20)
  validFrom      DateTime @map("valid_from") @db.Timestamptz
  validUntil     DateTime? @map("valid_until") @db.Timestamptz
  contextSummary String?  @map("context_summary") @db.VarChar(200)
  contextDetails Json     @map("context_details")
  note           String?  @db.Text
  confidence     Int?     @db.SmallInt
  reportedById   String   @map("reported_by_id") @db.Uuid
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz

  facility Facility     @relation(fields: [facilityId], references: [id])
  reporter FacilityStaff @relation(fields: [reportedById], references: [id])

  @@index([facilityId, validUntil])
  @@map("facility_availability_reports")
}

model SupporterAvailabilityNote {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facilityId     String   @map("facility_id") @db.Uuid
  supporterId    String   @map("supporter_id") @db.Uuid
  planId         String?  @map("plan_id") @db.Uuid
  clientId       String?  @map("client_id") @db.Uuid
  status         String   @db.VarChar(20)
  intent         String?  @db.VarChar(30)
  note           String?  @db.Text
  contextSummary String?  @map("context_summary") @db.VarChar(200)
  contextDetails Json     @map("context_details")
  expiresAt      DateTime @map("expires_at") @db.Timestamptz
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz

  facility Facility   @relation(fields: [facilityId], references: [id])
  supporter Supporter @relation(fields: [supporterId], references: [id])

  @@index([facilityId, supporterId])
  @@index([planId])
  @@map("supporter_availability_notes")
}
```

### `contextDetails` の JSON 形式

```json
[
  {
    "category": "age",           // age | disability | equipment | timeframe | other
    "detail": "18歳以上に対応可能",
    "applicableTo": ["client:123"],
    "lastConfirmedAt": "2025-10-01T03:00:00Z"
  }
]
```

- `category` は UI フィルタ用の区分。
- `applicableTo` にクライアントIDや特性タグを格納することで、共有時に絞り込みを行う。
- 相談員メモでは主観的コメントも許容し、事業所レポートでは客観的条件に限定する運用を想定。

## フィールドの意味と入力負荷対策

- `facilityId`: 施設に紐づく必須キー。両データセットを同一施設単位で束ねる。
- `status`: 丸（available）・三角（limited）・バツ（unavailable）をラジオ入力で選択。
- `intent`: 相談員メモの用途。入力コスト削減のため `general` をデフォルトとし、「問い合わせ前」「訪問後」などのクイックタグ（選択任意）から選ぶ方式にする。未選択なら `general` で保存。
- `note`: 自由記述の背景メモ。相談員が入力する唯一のテキスト欄。施設レポート側では任意。
- `contextSummary`: `note` から自動生成（先頭 60～80 文字を切り出し）。ユーザー入力不要。
- `contextDetails`: クイックタグ入力の結果をシステムが JSON に変換。`note` の内容から抽出できる場合は自動生成の余地あり。手動編集UIは提供せず、タグ/チェックボックスの組み合わせで構築。
- `expiresAt`: メモの有効期限。「保存日時 + 30日」を自動設定し、ユーザーは変更できない（管理者が調整する可能性のみ別途検討）。
- `confidence`: 施設レポート側のみ任意入力。事業所が確度を伝えたい場合に利用。

## ドメインレイヤー設計

- `FacilityAvailability` 集約: レポートをラップし、`create`/`save` で不変データを扱う。
- `SupporterAvailability` 集約: 相談員メモをラップ。
- 共通 Value Object `AvailabilityContext` で `contextDetails` の Zod バリデーションを実施。入力側はタグ指定を受け取り、Value Object が型変換する。
- リポジトリ
  - `facilityAvailabilityRepository`: `save`, `delete`, `findLatest`, `findAll`
  - `supporterAvailabilityRepository`: 同上

## ユースケース

- `recordFacilityAvailability(input)` — 施設スタッフが更新。`reportedById` は必須。
- `recordSupporterAvailability(input)` — 相談員が即時保存。共有範囲はテナントに依存せず全相談員で閲覧可能（GovTech連携前提）。
- `listAvailabilityForRecommendation(facilityId, clientTraits)` — 指定施設の最新レポートと関連メモをまとめて返す。

## リコメンド計算（草案）

1. 施設レポート最新値（期限内）と相談員メモ（30日以内・未失効）を取得。
2. 基本スコア
   - 施設レポート: `status` を 0.7（available=0.7, limited=0.35, unavailable=0）で評価。
   - 相談員メモ: `status` を平均化し 0.4 を掛け合わせ（available=0.4, limited=0.2, unavailable=0）。
3. 文脈補正
   - `applicableTo` が利用者条件に一致 → +0.2。
   - `confidence` が 40 未満 → -0.2。
   - `expiresAt` を過ぎたメモは集計対象外。
4. UI 表示
   - 基本は従来通りの◯/△/×アイコンを表示し、算出スコアは補助情報としてパーセンテージで併記（例: `◯ 78%`）。微妙な判定時はツールチップで詳細内訳を提示。

## 次のアクション

1. Prisma/Zod 定義を確定し、`expiresAt` 自動算出ロジックを実装する。
2. `contextDetails` を描画する UI コンポーネントの仕様策定。
3. リコメンド結果カードのプロトタイプを作成し、◯/△/×とパーセンテージ併用表示の見え方を検証。

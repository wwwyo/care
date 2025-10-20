# 中野区サービス等利用計画案 Excel 出力仕様

## 目的

- `.agent/nakanoku.xlsx` の様式1-1/1-2に対応した計画案Excelを生成するためのデータ要求を定義する。
- Prisma新スキーマ（`PlanVersion` 拡張、`plan_prioritized_supports`、`plan_weekly_schedule_cells`）と既存クライアント情報のどちらから値を取得するかを明示する。
- フィールドの必須/任意、入力制約、フォーマットを整理し、UI・ドメイン実装・エクスポート実装の共通仕様とする。

## 対象データモデル概要

### PlanVersion（拡張）

> 値の正当性はドメイン層（Value Object/Factory）で `enum` 相当の定数を定義して検証する。DBには`String`として保存。

| カテゴリ | カラム | 役割 / 入力制約 | Excel参照 |
| --- | --- | --- | --- |
| 文書メタ | `form_category` | 許容値: `new` / `renewal` / `revision`。 | A1 チェックボックス |
| 文書メタ | `form_revision_month` (Date) | 更新月（`YYYY-MM-01`形式で保存）。新規/変更時はnull許容。 | A1 更新月 | 
| 文書メタ | `municipality_name` | 例: `中野区` 固定値。 | I2 |
| 利用者スナップショット | `client_name_snapshot` | 計画作成時の氏名。 | A3 |
| 利用者スナップショット | `client_name_kana_snapshot` | 任意、ふりがな用途。 | 参考情報 |
| 利用者スナップショット | `client_postal_code_snapshot` | `123-4567` 形式。 | F3 |
| 利用者スナップショット | `client_address_snapshot` | 市区町村以下を含む全文字列。 | E3 |
| 受給者証 | `recipient_certificate_number` | 数字+ハイフンを許容。 | A4 |
| 受給者証 | `regional_certificate_number` | 任意。 | A5 |
| 障害区分 | `disability_classification` | 「身体」「知的」など。複数選択時は全角スペース区切り推奨。 | J1/J2 |
| 障害支援区分 | `disability_support_level` | 例: 「区分3」。 | E4 |
| 負担上限 | `user_burden_limit` | 金額または区分。 | E5 |
| 事業者情報 | `support_office_name` | 相談支援事業者名。 | G4 |
| 事業者情報 | `plan_creator_name` | 計画作成担当者氏名。 | G5 |
| 事業者情報 | `plan_creator_title` | 任意。 | G5 備考 |
| 事業者情報 | `plan_creator_phone` | 任意。ハイフン可。 | G19 |
| 計画作成日 | `plan_created_on` | Date (`YYYY-MM-DD`)。 | A6 |
| モニタリング開始 | `monitoring_start_month` | `YYYY-MM-01` で保存。 | D6 |
| モニタリング終了 | `monitoring_end_month` | 任意。 | 補助値 |
| 同意情報 | `consent_signer_name` | 利用者署名欄表示。 | H6 |
| 同意情報 | `consent_signed_on` | Date。 | H6 |
| 同意情報 | `consent_notes` | 任意。 | H6 備考 |
| 生活意向 | `user_intentions` | 様式1-1「利用者及びその家族の生活に対する意向」。 | A7 |
| 支援方針 | `overall_support_policy` | 「総合的な援助の方針」。 | A11 |
| 長期目標 | `long_term_goal` | 「長期目標」。 | B12 |
| 短期目標 | `short_term_goal` | 「短期目標」。 | B14 |
| モニタリング頻度 | `monitoring_frequency` | 許容値: `first_three_then_six` / `first_three_then_year` / `every_six_months` / `every_year` / `other`。 | A40~I40 |
| モニタリング頻度(その他) | `monitoring_frequency_other` | `PlanMonitoringFrequency.OTHER` 選択時のみ利用。 | C41 |
| 追加欄 | `non_weekly_service_notes` | 週単位以外のサービス。 | I19 |
| 追加欄 | `medicalCareNotes` | 通院介護の場合の留意点。 | I20 |
| 追加欄 | `medical_institution` | 通院先。 | I21 |
| 追加欄 | `medical_visit_frequency` | 回数表記。 | I22 |
| 追加欄 | `medical_travel_time` | 所要時間表記。 | I23 |
| 追加欄 | `envisioned_life_with_services` | サービス提供で実現する生活全体像。 | A34 |

### PlanPrioritizedSupport

| カラム | 役割 / 制約 | Excel参照 |
| --- | --- | --- |
| `priority_order` | 1始まりの連番。 | A20, A24, ... |
| `need_description` | 課題・ニーズ。 | B17列 |
| `support_goal` | 支援目標。 | C17列 |
| `achievement_timing` | 達成時期。 | E17列 |
| `welfare_service_name` | サービス名カテゴリ。 | F17列 |
| `service_detail` | 種類・内容・量（F18セル群）。 | F18 |
| `provider_name` | 提供事業者名。 | G18 |
| `provider_contact` | 担当者名・電話。 | G19 |
| `user_role` | 本人役割。 | H17列 |
| `evaluation_timing` | 評価時期。 | I17列 |
| `notes` | 留意事項。 | J17列 |

### PlanWeeklyScheduleCell

| カラム | 役割 / 制約 | Excel参照 |
| --- | --- | --- |
| `time_slot` | 24hフォーマットで保存（例: `06:00`）。 | A列（6:00 等） |
| `column_type` | 許容値: `monday` / `tuesday` / `wednesday` / `thursday` / `friday` / `saturday` / `sunday_holiday` / `main_activity`。 | B8~I34 |
| `content` | 該当セルの本文。 | 各曜日欄 |
| `provider_name` | 任意。セル中に事業者名を分離したい場合に利用。 | B8~H34 |
| `notes` | 備考。 | 任意 |

## 既存データ連携

- `ClientProfile` / `ClientAddress` が存在する場合、PlanVersion作成時にスナップショットへコピーする。これにより後日の情報変更がExcel履歴と乖離しない。
- `SupporterProfile` から `plan_creator_name` 初期値を生成可能。
- 受給者証番号等が他機能で保持されていないため、新たにPlanVersionへ直接保存する。

## バリデーション指針

- 文字列上限は自治体様式に合わせて255文字中心。`notes` やストーリー系は `Text` とし複数行を許容。
- 氏名・住所欄は全角/半角を区別しない。郵便番号は数字7桁＋ハイフンを許容。
- `PlanPrioritizedSupport` は最低1件登録を推奨。順位が飛ばないようAPI側で連番再採番を行う。
- `PlanWeeklyScheduleCell` は許容スロットのみ登録。時刻はExcel側行と一致させる（6:00, 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00, 24:00, 02:00, 04:00）。

## 出力ロジック概要

1. `PlanVersion` を取得し、同一バージョンに紐づく `PlanPrioritizedSupport` / `PlanWeeklyScheduleCell` を読み込む。
2. クライアントの最新プロフィール・住所と PlanVersion スナップショットを突合し、欠落データのみ補完。
3. Excelテンプレートを読み込み、各セルへ対応する値を埋め込む。
   - 文字列セルは既存テキストを上書き。
   - チェックボックスは `form_category` を元に該当セルへ「☑/□」を描画。
   - 週次表は `time_slot` + `column_type` でセル位置を決定。
4. 未設定値はテンプレート既定の空欄を維持する。

## 今後のタスク例

- UI/Server Actionsで新カラムへの入力フォームを整備。
- 既存 `PlanService` ベースの編集画面を `PlanPrioritizedSupport` へ置換。
- エクスポート用ユースケース実装とテスト（テンプレート・Mockデータで検証）。

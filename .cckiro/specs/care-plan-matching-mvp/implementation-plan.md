# 実装計画 - ケアプラン施設マッチングシステムMVP

最終更新: 2025-01-13

## 進捗サマリー
- **現在のフェーズ**: フェーズ3（認証基盤実装）準備中
- **完了フェーズ**: フェーズ1 ✅, フェーズ2 ✅
- **進捗率**: 25% (2/8フェーズ完了)

## 1. 実装概要

### 1.1 実装方針
- **TDD（テスト駆動開発）**: 各機能の実装前にテストを作成
- **段階的実装**: 基盤から順に構築し、動作確認しながら進める
- **ドメイン駆動設計**: ビジネスロジックをドメイン層に集約
- **型安全性**: TypeScriptの型システムを最大限活用

### 1.2 技術スタック確認
- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS v4 + shadcn/ui
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Better Auth (Magic Link)
- **ORM**: Prisma

## 2. 実装フェーズ

### フェーズ1: プロジェクト基盤構築（Day 1-2）✅ 完了 2025-01-13

#### 1.1 プロジェクト初期化
```bash
# 作業内容
- Next.js 15プロジェクトの作成 ✅
- Bunの設定 ✅
- TypeScript設定の最適化 ✅
- Biome設定（Linter/Formatter）✅
- Git設定（.gitignore）✅
```

#### 1.2 基本ディレクトリ構造の作成 ✅
```
care/
├── app/          # Next.js App Router ✅
├── domain/       # ドメインモデル層 ✅
├── uc/           # ユースケース層 ✅
├── infra/        # インフラ層 ✅
├── components/   # UIコンポーネント ✅
├── lib/          # ユーティリティ ✅
├── supabase/     # Supabase設定 ✅
│   ├── migrations/  # DBマイグレーション ✅
│   └── config.toml  # ローカル設定 ✅
└── tests/        # テストファイル ✅
```

#### 1.3 開発環境セットアップ ✅
- 環境変数テンプレート（.env.local.example）✅
  - NEXT_PUBLIC_SUPABASE_URL ✅
  - NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
  - SUPABASE_SERVICE_ROLE_KEY ✅
  - NEXT_PUBLIC_APP_URL ✅
- Supabase基本設定（lib/supabase/）✅
- Tailwind CSS v4の設定 ✅
- 認証基本実装（Magic Linkログイン画面）✅

### フェーズ2: データベース構築（Day 3-5）

#### 2.1 Supabaseテーブル定義(prisma)
実装順序：
1. 基本テーブル（tenants, supporters, users, facilities）
2. 認証プロファイル連携（auth.users連携）
3. プロファイル関連テーブル（*_profiles, *_addresses）
4. ビジネスロジックテーブル（plans, plan_versions, slots）
5. 関連テーブル（consents, inquiries, audits）

#### 2.2 Row Level Security (RLS) 設定
- 各テーブルのRLSポリシー定義
- マルチテナント分離の実装
- ロールベースアクセス制御

#### 2.3 マイグレーションとシード
- Prismaでスキーマ管理
- 開発用シードデータの作成
- Edge Functionsでの初期化処理

### フェーズ3: 認証基盤実装（Day 6-8）

#### 3.1 Better Auth設定
実装内容：
- Better Authの基本セットアップ
- Magic Link認証の設定
- メールテンプレートのカスタマイズ
- セッション管理設定（データベースセッション）

#### 3.2 ユーザータイプ別認証インフラ
- **User向け認証**
  - 別ドメイン: user.care-app.jp
  - 専用の認証フロー（シンプルなMagic Link）
  - users テーブルとの連携
  
- **Supporter向け認証**
  - 別ドメイン: supporter.care-app.jp
  - 組織（tenant）選択を含む認証フロー
  - supporters テーブルとの連携
  - テナントコンテキストの設定
  
- **施設管理者向け認証**
  - 別ドメイン: facility.care-app.jp
  - 施設選択を含む認証フロー
  - facility_staff テーブルとの連携
  - 施設コンテキストの設定

#### 3.3 認証ヘルパー実装
- Better Auth用のカスタムヘルパー
- Server Components用認証
- Server Actions用認証
- Middleware設定（ドメイン別ルーティング）

### フェーズ4: ドメイン層実装（Day 9-12）

#### 4.1 ドメインモデル
```typescript
// 実装順序
1. domain/models/supporter.ts
2. domain/models/user.ts
3. domain/models/facility.ts
4. domain/models/plan.ts
5. domain/models/plan-version.ts
6. domain/models/consent.ts
7. domain/models/inquiry.ts
```

#### 4.2 リポジトリインターフェース
- 各モデルに対応するリポジトリインターフェースの定義
- Supabase Clientを使用した実装
- 型安全なクエリビルダーの活用

#### 4.3 ドメインサービス
- PlanVersioningService（計画書バージョン管理）
- FacilityMatchingService（施設マッチングロジック）
- ConsentService（同意管理）

### フェーズ5: ユースケース層実装（Day 13-16）

#### 5.1 認証関連ユースケース
```
uc/auth/
├── send-magic-link.ts      # Better Auth API使用
├── verify-magic-link.ts    # Better Auth API使用
├── get-current-user.ts     # Better Auth Helper使用
└── logout.ts               # Better Auth API使用
```

#### 5.2 計画書管理ユースケース
```
uc/plans/
├── create-plan.ts
├── update-plan-version.ts
├── get-plan-with-versions.ts
└── import-plan-pdf.ts
```

#### 5.3 施設検索ユースケース
```
uc/search/
├── search-facilities.ts
├── calculate-match-score.ts
└── save-search-results.ts
```

#### 5.4 空き状況管理ユースケース
```
uc/slots/
├── update-slot-status.ts
├── get-current-slots.ts
└── bulk-update-slots.ts
```

#### 5.5 同意管理ユースケース
```
uc/consents/
├── create-consent-request.ts
├── send-consent-email.ts
├── verify-consent-token.ts
└── grant-consent.ts
```

#### 5.6 照会管理ユースケース
```
uc/inquiries/
├── create-inquiry.ts
├── get-facility-inquiries.ts
├── reply-to-inquiry.ts
└── get-inquiry-thread.ts
```

### フェーズ6: UI実装（Day 17-25）

#### 6.1 共通コンポーネント
```
components/ui/
├── button.tsx
├── form.tsx
├── input.tsx
├── select.tsx
├── card.tsx
├── dialog.tsx
├── toast.tsx
└── data-table.tsx
```

#### 6.2 認証画面
- `/login` - ログイン画面
- Magic Link送信フォーム
- 認証待機画面

#### 6.3 Supporter向け画面
優先度順：
1. `/plans/import` - 計画書入力画面
2. `/search/results` - 施設検索結果画面
3. `/cases/:id` - ケース詳細画面
4. ダッシュボード

#### 6.4 FacilityStaff向け画面
優先度順：
1. `/facility/slots` - 空き状況更新画面
2. `/facility/inquiries` - 照会管理画面
3. 施設ダッシュボード

#### 6.5 User向け画面
1. `/consent/:token` - 同意確認画面
2. `/my/plans` - 計画書一覧画面
3. `/my/plans/:id` - 計画書詳細画面

### フェーズ7: 統合テスト・性能改善（Day 26-28）

#### 7.1 E2Eテスト
- Playwrightによる主要フローのE2Eテスト
- クロスブラウザテスト

#### 7.2 性能最適化
- データベースインデックスの最適化
- Server Componentsの最適化
- 画像・アセットの最適化

#### 7.3 セキュリティ監査
- 認証・認可の再確認
- SQLインジェクション対策確認
- XSS対策確認

### フェーズ8: デプロイ準備（Day 29-30）

#### 8.1 本番環境設定
- Vercelプロジェクト設定
- 環境変数の設定
- データベース接続設定

#### 8.2 CI/CD設定
- GitHub Actions設定
- 自動テスト実行
- 自動デプロイ設定

#### 8.3 監視・ログ設定
- Sentryエラー監視
- Vercel Analytics
- カスタムメトリクス

## 3. 各フェーズの成果物とテスト

### フェーズ1の成果物
- [x] package.json（依存関係定義、@supabase/supabase-js、prisma含む）✅ 2025-01-13
- [x] tsconfig.json（TypeScript設定）✅ 2025-01-13
- [x] next.config.ts（Next.js設定）✅ 2025-01-13
- [x] biome.json（Biome設定）✅ 2025-01-13
- [x] .env.local.example（Supabase環境変数テンプレート）✅ 2025-01-13
- [x] supabase/config.toml（Supabaseローカル設定）✅ 2025-01-13
- [x] README.md（プロジェクト説明）✅ 2025-01-13
- [x] prisma/schema.prisma（データベーススキーマ定義）✅ 2025-01-13

### フェーズ2の成果物
- [x] supabase/migrations/（SQLマイグレーションファイル）✅ 2025-01-14
- [x] prisma/seed.ts（シードデータ）✅ 2025-01-14
- [x] RLSポリシーのテスト ✅ 2025-01-14
- [x] データベース設計書の実装反映確認 ✅ 2025-01-14

### フェーズ3の成果物
- [ ] 認証フロー統合テスト
- [ ] セキュリティテスト（トークン有効期限等）
- [ ] 各ユーザータイプのログインE2Eテスト

### フェーズ4の成果物
- [ ] ドメインモデルの単体テスト（100%カバレッジ）
- [ ] リポジトリインターフェースのモック実装
- [ ] ドメインサービスの統合テスト

### フェーズ5の成果物
- [ ] 各ユースケースの単体テスト
- [ ] ユースケース間の統合テスト
- [ ] エラーハンドリングテスト

### フェーズ6の成果物
- [ ] Storybookによるコンポーネントカタログ
- [ ] 各画面のスナップショットテスト
- [ ] アクセシビリティテスト

### フェーズ7の成果物
- [ ] E2Eテストレポート
- [ ] パフォーマンス測定レポート
- [ ] セキュリティ監査レポート

### フェーズ8の成果物
- [ ] デプロイメントガイド
- [ ] 運用マニュアル
- [ ] 監視ダッシュボード

## 5. 実装優先順位

### Must Have（MVP必須）
1. 認証システム（Magic Link）
2. 計画書入力・管理
3. 施設検索・マッチング
4. 空き状況管理
5. 同意取得フロー

### Should Have（早期実装推奨）
1. 計画書バージョン管理
2. 照会機能
3. 監査ログ
4. User向けマイページ

### Nice to Have（余裕があれば）
1. PDF自動解析
2. 高度な検索フィルタ
3. リアルタイム通知
4. 統計ダッシュボード

## 6. 開発規約

### コーディング規約
- Biomeの設定に従う（高速なLinter/Formatter）
- 関数名・変数名は明確で意味のある名前を使用
- コメントは「なぜ」を説明（「何を」はコードで表現）

### Git運用
- feature/ブランチ戦略
- コミットメッセージはConventional Commits形式
- PRには必ずテストとレビューを含める

### テスト規約
- 新機能には必ずテストを追加
- ユニットテストは同期的に、統合テストは非同期で
- テストデータはファクトリパターンで生成

## 7. 次のステップ

実装開始前の確認事項：
1. [x] 開発環境の準備完了 ✅ 2025-01-13
2. [x] Supabaseプロジェクトの作成 ✅ 2025-01-13
3. [ ] チーム全員の役割分担明確化
4. [ ] Supabase環境（開発・ステージング・本番）の準備
5. [ ] メール送信設定（Better Auth）

実装開始後の進捗管理：
- 日次スタンドアップミーティング
- 週次進捗レビュー
- 各フェーズ完了時のデモ

## 8. 参考資料

- [Next.js 15 ドキュメント](https://nextjs.org/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Supabase Auth ガイド](https://supabase.com/docs/guides/auth)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui コンポーネント](https://ui.shadcn.com)
- [厚生労働省 障害福祉サービス](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/)
- [service計画案フォーマット](https://www.mhlw.go.jp/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/kaigi_shiryou/dl/20120220_01_04-04.pdf)
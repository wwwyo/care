# 実装計画 - ケアプラン施設マッチングシステムMVP

最終更新: 2025-01-13

## 進捗サマリー
- **現在のフェーズ**: フェーズ3（認証基盤実装）進行中
- **完了フェーズ**: フェーズ1 ✅, フェーズ2 ✅
- **進捗率**: 30% (2.5/8フェーズ完了)
- **最終更新**: 2025-01-15

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
- **Authentication**: Better Auth (Email/Password + Realm-based multi-user type) ← 変更
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
```

#### 1.3 開発環境セットアップ ✅
- 環境変数テンプレート（.env.local.example）✅
  - SUPABASE_SERVICE_ROLE_KEY ✅
  - NEXT_PUBLIC_APP_URL ✅
- Supabase基本設定（lib/supabase/）✅
- Tailwind CSS v4の設定 ✅
- 認証基本実装（Magic Linkサインイン画面）✅

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

### フェーズ3: 認証基盤実装（Day 6-8）🚧 進行中 2025-01-15

#### 3.1 Better Auth設定 ✅ 完了
実装内容：
- Better Authの基本セットアップ ✅
- ~~Magic Link認証の設定~~ → Email/Password認証に変更 ✅
- Realmフィールドによるユーザータイプ識別 ✅
- セッション管理設定（データベースセッション）✅
- Prismaアダプターの設定 ✅

#### 3.2 ユーザータイプ別認証インフラ ✅ 完了
- **Client向け認証** ✅
  - パス: `/login` (route group: `(client)`)
  - Email/Password認証フロー ✅
  - サインアップ時にrealm='client'を設定 ✅
  - clients テーブルとの連携（authUserIdで紐付け）✅

- **Supporter向け認証** ✅
  - パス: `/auth/supporters/signin`
  - Email/Password認証フロー ✅
  - サインアップ時にrealm='supporter'を設定 ✅
  - supporters テーブルとの連携（authUserIdで紐付け）✅
  - テナントコンテキストの設定（次フェーズ）

- **施設管理者向け認証** ✅
  - パス: `/facility/login`
  - Email/Password認証フロー ✅
  - サインアップ時にrealm='facility'を設定 ✅
  - facility_staff テーブルとの連携（authUserIdで紐付け）✅
  - 施設コンテキストの設定（次フェーズ）

#### 3.3 認証ヘルパー実装 🚧 進行中
- Better Auth用のカスタムヘルパー ✅
- Server Components用認証 🚧
- Server Actions用認証 🚧
- ~~Middleware設定（ドメイン別ルーティング）~~ → パスベースルーティングに変更 ✅
- Supabase Middlewareの削除 ✅


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
- [x] Better Auth基本設定 ✅ 2025-01-15
- [x] Email/Password認証実装 ✅ 2025-01-15
- [x] Realmベースのマルチユーザータイプ対応 ✅ 2025-01-15
- [x] 各ユーザータイプ用サインインページ ✅ 2025-01-15

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



## 8. 参考資料

- [Next.js 15 ドキュメント](https://nextjs.org/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Supabase Auth ガイド](https://supabase.com/docs/guides/auth)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui コンポーネント](https://ui.shadcn.com)
- [厚生労働省 障害福祉サービス](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/)
- [service計画案フォーマット](https://www.mhlw.go.jp/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/kaigi_shiryou/dl/20120220_01_04-04.pdf)
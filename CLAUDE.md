# CLAUDE.md

## Project Overview

ミタスケア - 厚生労働省標準様式のサービス等利用計画書を基に、福祉施設の空き状況と連動した施設候補検索と同意取得をワンストップで実現するWebアプリケーション。
## Architecture

### Tech Stack
- **Runtime**: Bun
- **Package Manager**: Bun
- **Frontend**: React 19 + Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Server Components + Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Magic Link authentication (email-based)
- **Deployment**: Vercel

### Directory Structure
```
care/
├── app/                # Next.js App Router + Server Actions、internalなUI Components
├── domain/             # ドメイン層（ビジネスロジック）
├── uc/                 # ユースケース層
├── infra/              # インフラストラクチャ層
│   ├── query/          # 読み取り専用クエリ（CQRS）
│   └── repositories/   # リポジトリ実装
├── components/         # 共通UIコンポーネント
├── hooks/              # 共通フック
├── lib/                # 共通ユーティリティ
├── prisma/             # データベーススキーマ
├── emails/             # メールテンプレート(React email)
├── public/             # 静的ファイル
├── .env.local          # 環境変数
├── .env.local.example        # 環境変数の例
```

### Key Design Patterns

1. **Multi-tenant Architecture**: Row Level Security
2. **RBAC**: Supporter, Client, FacilityAdmin
3. **CQRS**: 読み取りと書き込みの分離
4. **DDD**: ドメイン駆動設計
5. **Server Actions**: ページ近くに配置


### Database Schema

主要テーブル: users, tenants, plans, facilities, slots, consents, inquiries, audits
正規化設計で、各エンティティに関連テーブルを持つ


## Important Considerations

- **セキュリティ**: 個人情報の最小限収集、テナント間のデータ分離
- **UI/UX**: モバイルファースト、日本語対応
- **厚労省標準様式準拠**: サービス等利用計画書のフィールド対応

### テスト駆動開発（TDD）

テストファースト → 実装 → リファクタリングのサイクルで開発

## Code Guidelines

- index.ts での re-export 禁止
- ファイル名は kebab-case
- フォームは Next.js 15 の `Form` コンポーネント使用（shadcn/ui の Form は使用しない）
- 環境変数は env.ts でチェック後に使用
- 後方互換性は不要
- **Domain層のモデルのみclass定義を許可**（その他は関数型で実装）

### CQRSパターン

- **Query (infra/query/)**: 読み取り専用、Server Componentsから直接呼び出し
- **Repository (infra/repositories/)**: 書き込み・集約単位の操作、UseCase層から呼び出し

### レイヤー間の呼び出しルール

1. **Server Actions → UseCase → Domain ← Repository**
2. **Server Components → Query** (読み取り専用)

Domain層はUseCase経由でのみアクセス

### エラーハンドリング

uc,domain,repository層は例外をthrowせず、Union型でエラー表現

```typescript
type DomainError =
  | { type: 'NotFound'; message: string }
  | { type: 'ValidationError'; message: string };

// 成功時はデータ、失敗時はエラーオブジェクトを返す
function useCase(): Promise<Data | DomainError>
```
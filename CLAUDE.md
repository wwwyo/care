# CLAUDE.md

## Project Overview

ミタスケア - 厚生労働省標準様式のサービス等利用計画書を基に、福祉施設の空き状況と連動した施設候補検索と同意取得をワンストップで実現するWebアプリケーション。

### ドメイン前提知識

**福祉サービスの基本用語:**
- **サービス等利用計画書**: 障害者が福祉サービスを利用するための計画書（厚労省標準様式）
- **相談支援専門員/ケアマネージャー**: 計画書作成と利用者支援を行う専門職
- **サービス種別**: 生活介護、就労継続支援A型/B型、放課後等デイサービス等
- **空き状況**: ○（空あきり）、△（要相談）、×（満床）で管理
- **照会**: 施設への受入可否の問い合わせ
- **同意取得**: 利用者が施設利用に同意する法的プロセス
## Architecture

### Tech Stack
- **Runtime**: Bun
- **Package Manager**: Bun
- **Test**: Bun Test
- **Linter/Formatter**: Biome
- **Frontend**: React 19 + Next.js 15 (App Router), TypeScript v5.8, Tailwind CSS v4, shadcn/ui
- **Backend**: Server Components + Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Email + Password authentication (better-auth)
- **Deployment**: Vercel

### Directory Structure
```
care/
├── app/                # Next.js App Router + Server Actions、internalなUI Components
├── domain/             # ドメイン層（ビジネスロジック）
│   ├── common/         # 共通Value Object（Phone, Address等）
│   └── <feature>      # 機能別ドメインモデル
│       ├── client/     # 利用者（福祉サービス利用者）の情報管理
│       │               # 障害者や要介護者の基本情報、連絡先、緊急連絡先等を管理
│       ├── facility/   # 福祉施設の情報管理
│       │               # 施設基本情報、サービス種別（生活介護/就労継続等）、設備条件、営業時間等
│       ├── plan/       # サービス等利用計画書の作成・管理
│       │               # 厚労省標準様式準拠、バージョン管理、必須項目のバリデーション
│       ├── slot/       # 施設の空き枠管理
│       │               # 空き状況（○/△/×）、有効期限、自動ステータス変更
│       ├── supporter/  # 支援者（相談支援専門員）の管理
│       │               # ケアマネージャー情報、担当クライアント管理、テナント所属
│       ├── consent/    # 同意管理
│       │               # 利用者の同意取得、証跡保存、2段階管理（リクエスト/記録）
│       ├── inquiry/    # 照会管理
│       │               # 施設への問い合わせ、受入可否返信、メッセージ履歴
│       └── ...         # その他の機能ドメイン
├── uc/                 # ユースケース層
├── infra/              # インフラストラクチャ層
│   ├── query/          # 読み取り専用クエリ（CQRS-query）
│   └── repositories/   # リポジトリ実装 (CQRS-command)
├── components/         # 共通UIコンポーネント、shadcn/ui
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

**設計原則:**
- 柔軟性を重視してテーブルを責務に応じて分割
- NULLフィールドを最小化する設計を徹底
- 単一責任の原則に基づいたテーブル構成

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
  - ファクトリメソッドの命名は常に `create` とする（例: `Client.create()`）
  - `create` メソッドでは ID を `crypto.randomUUID()` で生成する
- **型アサーション（as）の使用禁止** - Zodスキーマによる型安全な実装を徹底
  - Domain層: 各種Value Objectで型安全性を保証
  - Server Actions: フォームデータはZodで最小限のバリデーション
  - Repository層: Prismaの型

### CQRSパターン

- **Query (infra/query/)**: 読み取り専用、Server Componentsから直接呼び出し
  - DTOへの詰め替えは不要、Prismaの型をそのまま返す
  - Server Componentsが必要に応じてデータを整形
- **Repository (infra/repositories/)**: 書き込み専用・集約単位の操作、UseCase層から呼び出し
  - 更新系APIは `save()` と `delete()` を基本とする
  - `create()` や `update()` は使用せず、`save()` で統一（新規作成・更新を内部で判定）
  - 理由: ドメインモデルの永続化に集中し、新規/更新の区別は実装詳細として隠蔽。呼び出し側の分岐を削減
  - **依存性逆転の原則**: Repositoryインターフェースは `domain/<feature>/repository.ts` に定義
  - infra層は domain層のインターフェースを実装（domain → infra の依存は禁止）
  - **実装パターン**: Singleton Pattern - オブジェクトに関数を定義する形式で実装（例: `export const clientRepository: ClientRepository = { save, delete, findById }`）

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
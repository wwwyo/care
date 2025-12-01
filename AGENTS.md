# AGENTS.md

## Project Overview

Care Hub(ケアハブ)
障がい福祉サービスの「空き情報」や「施設情報」が分断されている現状を解消し、
利用者・相談支援専門員・施設・行政をデータでつなぐことを目指します。
- 障がい福祉の空き情報を可視化
- 相談支援専門員の業務支援を起点に、一気通貫した行政AI（＝AI: AI Transformation）を実現
- 東京都のオープンデータを活用し、GovTech東京との協働体制の下で行政DXのモデルケースを構築

### Domain Knowledge

福祉サービスの基本用語:
- サービス等利用計画書: 障がい者が福祉サービスを利用するための計画書
- 相談支援専門員(相談員): 計画書作成と利用者支援を行う専門職
- 同意取得: 利用者が計画案に同意するプロセス

## Coding Rules

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
│   └── features/       # 機能別ドメインモデル
│       ├── _shared/    # 共通Value Object（Phone, Address等）
│       ├── client/     # 利用者（福祉サービス利用者）の情報管理
│       │               # 障害者や要介護者の基本情報、連絡先、緊急連絡先等を管理
│       ├── facility/   # 福祉施設の情報管理
│       │               # 施設基本情報、サービス種別（生活介護/就労継続等）、設備条件、営業時間等
│       ├── plan/       # サービス等利用計画書の作成・管理
│       │               # 厚労省標準様式準拠、バージョン管理、必須項目のバリデーション
│       ├── slot/       # 施設の空き枠管理
│       │               # 空き状況（○/△/×）、有効期限、自動ステータス変更
│       ├── supporter/  # 相談員（相談支援専門員）の管理
│       │               # ケアマネージャー情報、担当利用者管理、テナント所属
│       ├── consent/    # 同意管理
│       │               # 利用者の同意取得、証跡保存、2段階管理（リクエスト/記録）
│       ├── inquiry/    # 照会管理
│       │               # 施設への問い合わせ、受入可否返信、メッセージ履歴
│       └── <feature>/  # その他の機能ドメイン
│           ├── core/   # ドメイン層（ビジネスロジック）
│           │   ├── model.ts # ドメインモデル
│           │   └── repository.ts # リポジトリインターフェース
│           ├── infra/  # インフラ層（実装）
│           │   ├── repository/ # リポジトリ実装(CQRS-command)
│           │   └── query/ # クエリ実装(CQRS-query)
│           └── usecase/ # ユースケース層
│               └── *.ts # ユースケース実装
├── components/         # 共通UIコンポーネント、shadcn/ui
├── hooks/              # 共通フック
├── lib/                # 共通ユーティリティ
├── prisma/
├── emails/             # メールテンプレート(React email)
├── public/
├── .env
├── .env.example
```

### Key Design Patterns

1. **Multi-tenant Architecture**: Row Level Security
2. **CQRS**: 読み取りと書き込みの分離
3. **DDD**: バックエンドはドメイン駆動設計
4. **Server Actions**: Collocation(app/{page}/actions.ts 配置)

### Database Schema

**設計原則:**
- 柔軟性を重視してテーブルを責務に応じて分割
- NULLフィールドを最小化する設計を徹底
- 単一責任の原則に基づいたテーブル構成

## Important Considerations

- **セキュリティ**: 個人情報の最小限収集、テナント間のデータ分離
- **UI/UX**: モバイルファースト、日本語のみ対応

### テスト駆動開発（TDD）

テストファースト → 実装 → リファクタリングのサイクルで開発
- bun test
- bun lint:fix

## Code Guidelines

- index.ts での re-export 禁止
- ファイル名は kebab-case
- フォームは Next.js 15 の `Form` (import Form from 'next/form')コンポーネント使用（shadcn/ui の Form は使用しない）
- actions属性を使ってform actionを実行する
- フォームの状態管理: `useActionState` を使用（例: `const [state, formAction, isPending] = useActionState(fn, initialState)`）
  - エラー状態とローディング状態を統一的に管理
  - エラー時はフォームフィールドの値も保持し、defaultValueに設定（ユーザーの入力を失わない）
- 環境変数は `lib/env.ts` でチェック後に使用
- PoCのため後方互換性は不要
- UIフィードバック:
  - フォームバリデーションエラー: 該当フィールドの近くに表示（インライン）
  - 一時的な通知: actionの成功/エラー通知は出さなくてもわかるようなui設計を前提とし、ユーザが混乱する場合にのみ用いる。`components/ui/sonner` を使用
- Domain層のモデルのみclass定義を許可（その他は関数型で実装）
  - ファクトリメソッドの命名は常に `create` とする（例: `Client.create()`）
  - `create` メソッドでは ID を `crypto.randomUUID()` で生成する
  - Immutability: モデルは常にimmutableとして扱う
    - 更新系メソッドは新しいインスタンスを返す（例: `client.updateName(name)` は新しいClientインスタンスを返す）
    - 内部状態の直接変更は禁止（プロパティはreadonly）
- 型アサーション（as）の使用禁止 - Zodスキーマによる型安全な実装を徹底
  - Domain層: 各種Value Objectで型安全性を保証
  - Server Actions: フォームデータはZodで最小限のバリデーション
  - Repository層: Prismaの型

### CQRSパターン

- Query (infra/query/): 読み取り専用、Server Componentsから直接呼び出し
  - DTOへの詰め替えは不要、Prismaの型をそのまま返す
  - Server Componentsが必要に応じてデータを整形
- Repository (infra/repositories/): 書き込み専用・集約単位の操作、UseCase層から呼び出し
  - 更新系APIは `save()` と `delete()` を基本とする
  - `create()` や `update()` は使用せず、`save()` で統一（新規作成・更新を内部で判定）
  - 理由: ドメインモデルの永続化に集中し、新規/更新の区別は実装詳細として隠蔽。呼び出し側の分岐を削減
  - 依存性逆転の原則: Repositoryインターフェースは `domain/<feature>/repository.ts` に定義
  - infra層は domain層のインターフェースを実装（domain → infra の依存は禁止）
  - 実装パターン: Singleton Pattern - オブジェクトに関数を定義する形式で実装（例: `export const clientRepository: ClientRepository = { save, delete, findById }`）
  - **入出力の原則**: Repositoryは常にドメインモデルを受け取り、ドメインモデルを返す（Prismaの型変換は内部で処理）

### レイヤー間の呼び出しルール

1. Server Actions → UseCase → Domain ← Repository
2. Server Components → Query (読み取り専用)

Domain層はUseCase経由でのみアクセス

### エラーハンドリング

例外をthrowせず、エラーをunion型で表現してreturnする

```typescript
type DomainError =
  | { type: 'NotFound'; message: string }
  | { type: 'ValidationError'; message: string };

// 成功時はデータ、失敗時はエラーオブジェクトを返す
function useCase(): Promise<Data | DomainError>
```

try-catchの使用ガイドライン:
- `try-catch`は例外(外部ライブラリやPrismaなど)がthrowする可能性がある場合のみ使用
- 使用する際は最小スコープで実装（必要最小限のコードのみをtryブロックに含める）

## Exec Plan
- 複雑な機能実装は `.agent/plans.md` に実装計画を記載する
- `.agent/plans.md`は常に最新の状態に維持する。
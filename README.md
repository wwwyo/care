# Care Hub

厚生労働省標準様式のサービス等利用計画書を基に、福祉施設の空き状況と連動した施設候補検索と同意取得をワンストップで実現するWebアプリケーション。

## 技術スタック

- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **ORM**: Prisma
- **Authentication**: Supabase Auth (Magic Link)
- **Linter/Formatter**: Biome

## セットアップ

### 前提条件

- Bun 1.0以上
- Docker Desktop
- Supabase CLI

### 1. 依存関係のインストール

```bash
bun install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして使用してください：

```bash
cp .env.example .env
```

※ローカル開発用の設定は既に記入されています。

### 3. データベースのセットアップ

```bash
# Supabase CLIのインストール（まだの場合）
brew install supabase/tap/supabase

# ローカルでSupabaseを起動
supabase start

# Prismaスキーマをデータベースに反映
bun run db:push

# シードデータの投入
bun run db:seed
```

### 4. 開発サーバーの起動

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションにアクセスできます。

## 開発環境の起動方法

### 初回起動

```bash
# 1. Supabaseを起動
supabase start

# 2. データベースのセットアップ
bun run db:push
bun run db:seed

# 3. 開発サーバーを起動
bun dev
```

### 2回目以降の起動

```bash
# 1. Supabaseが起動していない場合
supabase start

# 2. 開発サーバーを起動
bun dev
```

### 便利なコマンド

```bash
# Prisma Studioでデータベースを確認
bun run db:studio

# Supabase Studioを開く
supabase status  # URLを確認
# ブラウザで http://127.0.0.1:54323 を開く

# データベースのリセット
supabase db reset
bun run db:push
bun run db:seed

# Supabaseの停止
supabase stop
```

## プロジェクト構造

```
care/
├── app/              # Next.js App Router
├── domain/           # ドメインモデル層
├── uc/               # ユースケース層
├── infra/            # インフラストラクチャ層
├── components/       # UIコンポーネント
├── lib/              # ユーティリティ
│   └── generated/    # Prisma Client (自動生成)
├── prisma/           # Prismaスキーマとマイグレーション
│   ├── schema.prisma # データベーススキーマ定義
│   └── seed.ts       # シードデータ
├── supabase/         # Supabase設定
│   └── config.toml   # ローカル設定
└── tests/            # テストファイル
```

## ユーザータイプ

1. **相談員（Supporter）**
   - 相談支援専門員、ケアマネージャー
   - サービス等利用計画書の作成と施設検索

2. **施設スタッフ（FacilityStaff）**
   - 福祉施設の職員
   - 空き状況の更新と照会への対応

3. **利用者（User）**
   - 福祉サービスを利用する本人または家族
   - 計画書の確認と同意手続き

## 開発コマンド

```bash
# 開発サーバー
bun dev

# ビルド
bun build

# リント
bun lint

# フォーマット
bun format

# テスト
bun test

# データベース関連
bun run db:generate  # Prisma Clientの生成
bun run db:push      # スキーマをDBに反映
bun run db:seed      # シードデータの投入
bun run db:studio    # Prisma Studioを起動
```

## トラブルシューティング

### Supabaseが起動しない場合

```bash
# Dockerが起動しているか確認
docker ps

# Supabaseを完全にリセット
supabase stop --backup
supabase start
```

### データベース接続エラーの場合

```bash
# Supabaseのステータスを確認
supabase status

# 環境変数が正しく設定されているか確認
cat .env | grep DATABASE_URL
```

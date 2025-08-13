# ケアプラン施設マッチングシステム

厚生労働省標準様式のサービス等利用計画書を基に、福祉施設の空き状況と連動した施設候補検索と同意取得をワンストップで実現するWebアプリケーション。

## 技術スタック

- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth (Magic Link)
- **Linter/Formatter**: Biome

## セットアップ

### 1. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、Supabaseの認証情報を設定してください：

```bash
cp .env.local.example .env.local
```

### 2. 依存関係のインストール

```bash
bun install
```

### 3. Supabaseのセットアップ

```bash
# Supabase CLIのインストール（まだの場合）
brew install supabase/tap/supabase

# ローカルでSupabaseを起動
supabase start

# マイグレーションの実行
supabase db push
```

### 4. 開発サーバーの起動

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションにアクセスできます。

## プロジェクト構造

```
care/
├── app/              # Next.js App Router
├── domain/           # ドメインモデル層
├── uc/               # ユースケース層
├── infra/            # インフラストラクチャ層
├── components/       # UIコンポーネント
├── lib/              # ユーティリティ
├── supabase/         # Supabase設定
│   ├── migrations/   # DBマイグレーション
│   └── seed.sql      # シードデータ
└── tests/            # テストファイル
```

## ユーザータイプ

1. **支援者（Supporter）**
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
```

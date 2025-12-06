# 実装メモ - ケアプラン施設マッチングシステムMVP

## 2025-01-15 認証システム変更

### 変更内容
#### Magic Link認証からEmail/Password認証への変更

**変更理由:**
- Magic Link認証はユーザータイプの区別が難しい
- Realmフィールドを使用したマルチユーザータイプ対応が必要
- サインアップ時にユーザータイプを明確に指定できる仕組みが必要

**実装内容:**
1. **Better Auth設定の変更**
   - `emailAndPassword`を有効化
   - `magicLink`プラグインを削除
   - `realm`フィールドをユーザーモデルに追加

2. **データベーススキーマの変更**
   - User モデルを Client モデルにリネーム（認証用Userと区別するため）
   - Better Auth用テーブル名を標準化
     - `User` → `users`
     - `Session` → `sessions`
     - `Account` → `accounts`
     - `Verification` → `verifications`

3. **サインインページの実装**
   - `/login` - 利用者用（realm='client'）
   - `/auth/supporters/signin` - 相談員用（realm='supporter'）
   - `/facility/login` - 施設管理者用（realm='facility'）
   - 各ページでサインアップ/サインインを切り替え可能
   - サインアップ時に自動的にrealmを設定

4. **ルーティング構造**
   - Route Groupを使用: `(client)`
   - 利用者用パスから`/client/`プレフィックスを除去
   - URLはシンプルに保ちつつ、内部的にグループ化

5. **Middleware対応**
   - Supabase用middlewareを削除（Better Authに移行のため）
   - 認証チェックはBetter Authのヘルパーで実装予定

### 次のステップ
1. **オンボーディングフロー実装**
   - `/onboarding` - 利用者用
   - `/supporter/onboarding` - 相談員用
   - `/facility/onboarding` - 施設管理者用

2. **プロファイル連携**
   - サインアップ後にauthUserIdで各テーブルと連携
   - ClientProfile, SupporterProfile, FacilityStaffの作成

3. **Server Components/Actions対応**
   - 認証状態の取得ヘルパー実装
   - 保護されたルートの実装

### 技術的な学び
- Better AuthのPrismaアダプターはテーブル名をカスタマイズ可能
- Route Groupsは内部的な整理に便利（URLには影響しない）
- Realmフィールドでユーザータイプを区別する設計は効果的
- 環境変数はdotenv-cliで管理（`bun run db:push`など）

### 問題と解決
1. **307リダイレクト問題**
   - 原因: Supabase middlewareが残っていた
   - 解決: middlewareを削除/簡素化

2. **Prisma Client生成エラー**
   - 原因: スキーマ変更後の再生成が必要
   - 解決: `bun prisma generate`と`bun run db:push`

3. **環境変数読み込みエラー**
   - 原因: DIRECT_URLが読み込まれない
   - 解決: package.jsonのスクリプトでdotenv-cli使用
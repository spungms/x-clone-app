# つぶやきアプリ (X風シンプルSNS)

Vite + React + TypeScript + Supabase で作った、シンプルなX(Twitter)風つぶやきアプリ。
メール+パスワードのログイン（2段階認証なし）と、つぶやきの投稿・一覧表示ができる。

## 構成

- フロントエンド: Vite + React + TypeScript
- 認証・DB: [Supabase](https://supabase.com)（Auth + Postgres + Realtime）
- デプロイ: GitHub Actions → GitHub Pages

## 1. Supabaseプロジェクトを作る

1. https://supabase.com でプロジェクトを新規作成
2. ダッシュボードの `Project Settings > API` から以下をメモする
   - `Project URL`
   - `anon public` key
3. `SQL Editor` を開き、[`supabase/schema.sql`](supabase/schema.sql) の中身をそのまま実行してテーブルとRLSポリシーを作成する
4. `Authentication > Providers` で Email が有効になっていることを確認（デフォルトで有効）
5. `Authentication > Settings` で「Confirm email」をオフにすると、確認メールなしですぐログインできて動作確認が楽（本番運用するなら有効のままでOK）

## 2. ローカルで環境変数を設定する

```bash
cp .env.example .env.local
```

`.env.local` を開いて、SupabaseのURLとanon keyを入力する。

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

`.env.local` は `.gitignore` で除外されているので、Gitにはコミットされない。

## 3. ローカルで動かす

```bash
npm install
npm run dev
```

## 4. GitHubにデプロイする

1. GitHubに空のリポジトリを作成し、このプロジェクトをpushする
2. リポジトリの `Settings > Pages` で `Build and deployment > Source` を **GitHub Actions** に設定する
3. リポジトリの `Settings > Secrets and variables > Actions` で以下のSecretsを登録する
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. `main` ブランチにpushすると `.github/workflows/deploy.yml` が自動でビルド・デプロイする

### 環境変数についての注意

- `.env.local` や `.env` ファイル自体は `.gitignore` でGitの管理対象外にしてあるので、**リポジトリのソースコードにSupabaseの鍵が平文で残ることはない**。
- ただし `VITE_SUPABASE_ANON_KEY` はブラウザ上で動くクライアントアプリの性質上、ビルド後のJSファイル（配信されるHTML/JS）には必ず含まれる。これはSupabaseの設計上想定された挙動で、`anon key` は「公開されても問題ない」前提のキー。実際のデータ保護は `supabase/schema.sql` で設定した **RLS(Row Level Security)ポリシー** が担っている。
- **絶対に公開してはいけないのは `service_role key`**。このアプリでは使用していないが、今後Supabaseの管理系操作を追加する場合は、サーバーサイド（GitHub Actionsのビルド時ではなく、実行時のバックエンド）でのみ使うこと。

## テーブル構成

`supabase/schema.sql` 参照。`tweets` テーブルのみのシンプル構成。

- 誰でも閲覧可能（`select`）
- ログインユーザーは自分の `user_id` でのみ投稿可能（`insert`）
- 自分の投稿のみ削除可能（`delete`）

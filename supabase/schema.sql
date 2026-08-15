-- X風つぶやきアプリ用スキーマ
-- Supabaseダッシュボードの SQL Editor で実行してください

create table if not exists public.tweets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  content text not null check (char_length(content) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.tweets enable row level security;

-- 誰でも閲覧可能
create policy "tweets_select_all"
  on public.tweets for select
  using (true);

-- ログインユーザーは自分のuser_idでのみ投稿可能
create policy "tweets_insert_own"
  on public.tweets for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 自分の投稿のみ削除可能
create policy "tweets_delete_own"
  on public.tweets for delete
  to authenticated
  using (auth.uid() = user_id);

-- 投稿一覧をリアルタイム購読できるようにする
alter publication supabase_realtime add table public.tweets;

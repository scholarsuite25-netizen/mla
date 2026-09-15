-- 0008_wordpress_blog_enhancements.sql
-- Adds WordPress-grade features: categories, tags, excerpt, SEO metadata, and comments.

-- 1. Extend blog_posts with WordPress fields
alter table public.blog_posts
  add column if not exists category text not null default 'Leadership',
  add column if not exists tags text[] not null default '{}',
  add column if not exists excerpt text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists allow_comments boolean not null default true,
  add column if not exists featured boolean not null default false;

-- Create index on category and tags for fast retrieval
create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists blog_posts_tags_idx on public.blog_posts using gin (tags);

-- 2. Create blog_comments table
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  author_name text not null,
  author_email text not null,
  author_id uuid references public.profiles (id) on delete set null,
  content text not null,
  status text not null default 'approved'
    check (status in ('pending', 'approved', 'spam')),
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_id_idx on public.blog_comments (post_id);
create index if not exists blog_comments_status_idx on public.blog_comments (status);

-- 3. Row Level Security for blog_comments
alter table public.blog_comments enable row level security;

-- Anyone can read approved comments
drop policy if exists blog_comments_select_approved on public.blog_comments;
create policy blog_comments_select_approved on public.blog_comments
  for select
  using (status = 'approved');

-- Anyone can submit a comment
drop policy if exists blog_comments_insert on public.blog_comments;
create policy blog_comments_insert on public.blog_comments
  for insert
  with check (true);

-- Super admin can view all comments (including pending/spam)
drop policy if exists blog_comments_admin_select on public.blog_comments;
create policy blog_comments_admin_select on public.blog_comments
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('super_admin', 'institution_admin')
    )
  );

-- Super admin can update/moderate comments
drop policy if exists blog_comments_admin_update on public.blog_comments;
create policy blog_comments_admin_update on public.blog_comments
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('super_admin', 'institution_admin')
    )
  );

-- Super admin can delete comments
drop policy if exists blog_comments_admin_delete on public.blog_comments;
create policy blog_comments_admin_delete on public.blog_comments
  for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('super_admin', 'institution_admin')
    )
  );

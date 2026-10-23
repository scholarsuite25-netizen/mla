-- 0016: Add pathway column to profiles for tracking member learning track / category
begin;

alter table public.profiles
  add column if not exists pathway text default null;

commit;

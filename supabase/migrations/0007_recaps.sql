-- 0007: staff-curated event recaps + audio archives.
-- Wrap-up content for past events so members who missed a session can still
-- read the official recap or stream the curated recording (staff-uploaded).

-- Helper: which institution owns an event (platform events are null).
create or replace function public.event_institution_id(evt uuid)
returns uuid
language sql stable security definer set search_path = public as $$
  select institution_id from public.events where id = evt;
$$;

-- Definable curator check: Super Admin anywhere, or an Institution Admin
-- for events that belong to their own institution.
create or replace function public.can_curate_event(evt uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select
    public.is_super_admin()
    or (
      public.is_institution_admin()
      and public.event_institution_id(evt) is not null
      and public.event_institution_id(evt) = public.my_institution_id()
    );
$$;

create table if not exists public.event_recaps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  cover_image_url text,
  audio_url text,
  video_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_recaps enable row level security;

-- published recaps are public (like the event itself)
drop policy if exists recaps_select_published on public.event_recaps;
create policy recaps_select_published on public.event_recaps
  for select to anon, authenticated using (status = 'published');

drop policy if exists recaps_select_super_admin on public.event_recaps;
create policy recaps_select_super_admin on public.event_recaps
  for select to authenticated using (public.is_super_admin());

drop policy if exists recaps_select_creator on public.event_recaps;
create policy recaps_select_creator on public.event_recaps
  for select to authenticated using (created_by = auth.uid());

-- staff curation lifecycle
drop policy if exists recaps_insert_admin on public.event_recaps;
create policy recaps_insert_admin on public.event_recaps
  for insert to authenticated
  with check (created_by = auth.uid() and public.can_curate_event(event_id));

drop policy if exists recaps_update_admin on public.event_recaps;
create policy recaps_update_admin on public.event_recaps
  for update to authenticated
  using (public.can_curate_event(event_id))
  with check (public.can_curate_event(event_id));

drop policy if exists recaps_delete_admin on public.event_recaps;
create policy recaps_delete_admin on public.event_recaps
  for delete to authenticated using (public.can_curate_event(event_id));

-- keep updated_at fresh
drop trigger if exists event_recaps_touch on public.event_recaps;
create trigger event_recaps_touch
  before update on public.event_recaps
  for each row execute function public.set_updated_at();

-- Storage: public bucket for curated recap audio so members can stream
-- the official recording of a past session from its recap page.
insert into storage.buckets (id, name, public, file_size_limit)
values ('recordings', 'recordings', true, 26214400)
on conflict (id) do nothing;
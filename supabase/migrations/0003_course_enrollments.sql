-- ---------- 0003: course enrollment + module progress ----------
-- Phase 2 member progress tracking (data model addition, in spec §8 Phase 2).

-- 18. course_enrollments -----------------------------------------------------
create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (course_id, profile_id)
);

create index if not exists course_enrollments_profile_id_idx
  on public.course_enrollments (profile_id);

-- 19. course_module_progress -----------------------------------------------------
create table if not exists public.course_module_progress (
  id uuid primary key default gen_random_uuid(),
  course_module_id uuid not null references public.course_modules (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (course_module_id, profile_id)
);

create index if not exists course_module_progress_profile_id_idx
  on public.course_module_progress (profile_id);

alter table public.course_enrollments enable row level security;
alter table public.course_module_progress enable row level security;

-- course_enrollments
create policy course_enrollments_select_own on public.course_enrollments
  for select to authenticated
  using (profile_id = auth.uid());

create policy course_enrollments_insert_own on public.course_enrollments
  for insert to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.courses c
      where c.id = course_id and c.status = 'published'
    )
  );

create policy course_enrollments_select_super_admin on public.course_enrollments
  for select to authenticated using (public.is_super_admin());

create policy course_enrollments_delete_super_admin on public.course_enrollments
  for delete to authenticated using (public.is_super_admin());

-- course_module_progress
create policy course_module_progress_select_own on public.course_module_progress
  for select to authenticated
  using (profile_id = auth.uid());

create policy course_module_progress_insert_own on public.course_module_progress
  for insert to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.course_modules cm
      join public.course_enrollments e on e.course_id = cm.course_id
      where cm.id = course_module_id and e.profile_id = auth.uid()
    )
  );

create policy course_module_progress_update_own on public.course_module_progress
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy course_module_progress_select_super_admin on public.course_module_progress
  for select to authenticated using (public.is_super_admin());

create policy course_module_progress_delete_super_admin on public.course_module_progress
  for delete to authenticated using (public.is_super_admin());
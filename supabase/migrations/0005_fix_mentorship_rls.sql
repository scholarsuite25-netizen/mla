-- ---------- 0005: break RLS recursion in mentorship visibility ----------
-- 0004 added profiles -> mentorship_requests subqueries, but
-- mr_select_institution_admin (0001) subqueries profiles back, creating
-- infinite RLS recursion on mentorship_requests. Fix: move both checks
-- into SECURITY DEFINER helpers so no RLS re-enters the other table.

create or replace function public.is_active_mentor(pid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.mentor_profiles mp
    where mp.profile_id = pid and mp.is_active = true
  );
$$;

create or replace function public.is_mentorship_participant(pid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.mentorship_requests r
    where (r.mentor_id = pid and r.mentee_id = auth.uid())
       or (r.mentee_id = pid and r.mentor_id = auth.uid())
  );
$$;

drop policy if exists profiles_select_active_mentors on public.profiles;
drop policy if exists profiles_select_mentorship_participants on public.profiles;

create policy profiles_select_active_mentors on public.profiles
  for select to anon, authenticated
  using (public.is_active_mentor(id));

create policy profiles_select_mentorship_participants on public.profiles
  for select to authenticated
  using (public.is_mentorship_participant(id));
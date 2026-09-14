-- ---------- 0004: mentorship name visibility ----------
-- Phase 3 requires reading other members' names: active mentors in the
-- public directory, and the two participants of a mentorship request.
-- Both are additive permissive policies (RLS merges), with no wider
-- PII exposure than the feature needs.

create policy profiles_select_active_mentors on public.profiles
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.mentor_profiles mp
      where mp.profile_id = profiles.id and mp.is_active = true
    )
  );

create policy profiles_select_mentorship_participants on public.profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.mentorship_requests r
      where (r.mentor_id = profiles.id and r.mentee_id = auth.uid())
         or (r.mentee_id = profiles.id and r.mentor_id = auth.uid())
    )
  );
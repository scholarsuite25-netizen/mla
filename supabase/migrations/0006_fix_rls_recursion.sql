-- ---------- 0006: eliminate RLS self-recursion ------------------
-- Policies that reference `profiles` with a NON-correlated subquery
-- (`select ... from profiles where id = auth.uid()`) are materialized as
-- InitPlans, which re-enter RLS on `profiles` and recurse forever — even a
-- member reading their own profile hit "infinite recursion detected in
-- policy for relation profiles". Fix: move those lookups into SECURITY
-- DEFINER functions (definers bypass RLS), and rewrite the affected
-- policies to call them.

-- Helpers (definer = no RLS re-entry).
create or replace function public.my_institution_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select institution_id from public.profiles where id = auth.uid();
$$;

create or replace function public.my_role()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.institution_of(pid uuid)
returns uuid
language sql stable security definer set search_path = public as $$
  select institution_id from public.profiles where id = pid;
$$;

-- profiles --------------------------------------------------------
drop policy if exists profiles_select_institution_admin on public.profiles;

create policy profiles_select_institution_admin on public.profiles
  for select to authenticated
  using (
    public.is_institution_admin()
    and institution_id = public.my_institution_id()
  );

drop policy if exists profiles_update_own on public.profiles;

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = public.my_role()
    and institution_id is not distinct from public.my_institution_id()
  );

drop policy if exists profiles_update_institution_admin on public.profiles;

create policy profiles_update_institution_admin on public.profiles
  for update to authenticated
  using (
    public.is_institution_admin()
    and institution_id = public.my_institution_id()
  )
  with check (
    public.is_institution_admin()
    and institution_id = public.my_institution_id()
    and role = 'member'
  );

-- mentorship_requests ---------------------------------------------
drop policy if exists mr_select_institution_admin on public.mentorship_requests;

create policy mr_select_institution_admin on public.mentorship_requests
  for select to authenticated
  using (
    public.is_institution_admin()
    and public.institution_of(mentor_id) = public.institution_of(auth.uid())
  );

-- events ----------------------------------------------------------
drop policy if exists events_insert_admin on public.events;

create policy events_insert_admin on public.events
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and (
      public.is_super_admin()
      or (
        public.is_institution_admin()
        and institution_id is not null
        and institution_id = public.my_institution_id()
      )
    )
  );
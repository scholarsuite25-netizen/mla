-- ============================================================
-- MLA — Phase 0 schema (17 tables from the build brief)
-- Applied with: npm run db:migrate  (see scripts/migrate.mjs)
-- RLS is enabled on EVERY table. Plain-English explanations of
-- each policy live in docs/RLS_POLICIES.md.
-- ============================================================

begin;

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- role checks used inside RLS policies (defined after `profiles` exists)

-- auto-create a profile whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

-- ---------- 1. institutions ----------
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists institutions_name_lower_key
  on public.institutions (lower(name));

-- ---------- 2. profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'member'
    check (role in ('super_admin', 'institution_admin', 'member')),
  institution_id uuid references public.institutions (id) on delete set null,
  email_notifications_enabled boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_institution_id_idx on public.profiles (institution_id);
create index if not exists profiles_role_idx on public.profiles (role);

-- role checks used inside RLS policies
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and is_active
  );
$$;

create or replace function public.is_institution_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'institution_admin' and is_active
  );
$$;

-- ---------- 3. institution_admin_requests ----------
create table if not exists public.institution_admin_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  institution_id uuid not null references public.institutions (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 4. blog_posts ----------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  body text not null default '',
  cover_image_url text,
  published_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists blog_posts_slug_key on public.blog_posts (slug);

-- ---------- 5. courses ----------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  published_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 6. course_modules ----------
create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  content text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, order_index)
);

-- ---------- 7. notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  reference_id uuid,
  message text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_id_idx
  on public.notifications (profile_id, is_read);

-- ---------- 8. subscribers ----------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subscribed_at timestamptz not null default now()
);

create unique index if not exists subscribers_email_lower_key
  on public.subscribers (lower(email));

-- ---------- 9. mentor_profiles ----------
create table if not exists public.mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  bio text not null default '',
  expertise_tags text[] not null default '{}',
  availability text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 10. mentorship_requests ----------
create table if not exists public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles (id) on delete cascade,
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  institution_id uuid references public.institutions (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentorship_requests_mentee_idx on public.mentorship_requests (mentee_id);
create index if not exists mentorship_requests_mentor_idx on public.mentorship_requests (mentor_id);

-- ---------- 11. events ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions (id) on delete set null,
  title text not null,
  description text not null default '',
  start_time timestamptz not null,
  end_time timestamptz,
  location_or_link text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists events_institution_id_idx on public.events (institution_id);

-- ---------- 12. event_rsvps ----------
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  rsvp_status text not null default 'going'
    check (rsvp_status in ('going', 'maybe', 'declined')),
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

-- ---------- 13. digital_products ----------
create table if not exists public.digital_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('ebook', 'software', 'pdf')),
  description text not null default '',
  price numeric(12, 2) not null default 0,
  cover_image_url text,
  file_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 14. orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id),
  product_id uuid not null references public.digital_products (id),
  amount numeric(12, 2) not null,
  paystack_reference text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_id_idx on public.orders (buyer_id);

-- ---------- 15. product_licenses ----------
create table if not exists public.product_licenses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.digital_products (id),
  buyer_id uuid not null references public.profiles (id),
  license_key text not null,
  max_activations integer not null default 3 check (max_activations > 0),
  activation_count integer not null default 0,
  is_revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists product_licenses_key_uq on public.product_licenses (license_key);
create index if not exists product_licenses_buyer_idx on public.product_licenses (buyer_id);

-- ---------- 16. license_activations ----------
create table if not exists public.license_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.product_licenses (id) on delete cascade,
  device_fingerprint text not null,
  activated_at timestamptz not null default now(),
  unique (license_id, device_fingerprint)
);

-- ---------- 17. audit_log ----------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- ---------- triggers ----------
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger institution_admin_requests_set_updated_at
  before update on public.institution_admin_requests
  for each row execute function public.set_updated_at();

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create trigger mentorship_requests_set_updated_at
  before update on public.mentorship_requests
  for each row execute function public.set_updated_at();

create trigger digital_products_set_updated_at
  before update on public.digital_products
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.institution_admin_requests enable row level security;
alter table public.blog_posts enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.notifications enable row level security;
alter table public.subscribers enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.digital_products enable row level security;
alter table public.orders enable row level security;
alter table public.product_licenses enable row level security;
alter table public.license_activations enable row level security;
alter table public.audit_log enable row level security;

-- institutions -----------------------------------------------
create policy institutions_select_public on public.institutions
  for select to anon, authenticated using (true);

create policy institutions_insert_public on public.institutions
  for insert to anon, authenticated with check (true);

create policy institutions_update_super_admin on public.institutions
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- profiles ----------------------------------------------------
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

create policy profiles_select_institution_admin on public.profiles
  for select to authenticated
  using (
    public.is_institution_admin()
    and institution_id = (select p.institution_id from public.profiles p where p.id = auth.uid())
  );

create policy profiles_select_super_admin on public.profiles
  for select to authenticated using (public.is_super_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and institution_id is not distinct from (select p.institution_id from public.profiles p where p.id = auth.uid())
  );

create policy profiles_update_super_admin on public.profiles
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy profiles_update_institution_admin on public.profiles
  for update to authenticated
  using (
    public.is_institution_admin()
    and institution_id = (select p.institution_id from public.profiles p where p.id = auth.uid())
  )
  with check (
    public.is_institution_admin()
    and institution_id = (select p.institution_id from public.profiles p where p.id = auth.uid())
    and role = 'member'
  );

-- institution_admin_requests ----------------------------------
create policy iar_select_own on public.institution_admin_requests
  for select to authenticated using (profile_id = auth.uid());

create policy iar_select_super_admin on public.institution_admin_requests
  for select to authenticated using (public.is_super_admin());

create policy iar_insert_own on public.institution_admin_requests
  for insert to authenticated
  with check (profile_id = auth.uid() and status = 'pending');

create policy iar_update_super_admin on public.institution_admin_requests
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- blog_posts --------------------------------------------------
create policy blog_posts_select_published on public.blog_posts
  for select to anon, authenticated using (status = 'published');

create policy blog_posts_select_super_admin on public.blog_posts
  for select to authenticated using (public.is_super_admin());

create policy blog_posts_insert_super_admin on public.blog_posts
  for insert to authenticated with check (public.is_super_admin());

create policy blog_posts_update_super_admin on public.blog_posts
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy blog_posts_delete_super_admin on public.blog_posts
  for delete to authenticated using (public.is_super_admin());

-- courses -----------------------------------------------------
create policy courses_select_published on public.courses
  for select to anon, authenticated using (status = 'published');

create policy courses_select_super_admin on public.courses
  for select to authenticated using (public.is_super_admin());

create policy courses_insert_super_admin on public.courses
  for insert to authenticated with check (public.is_super_admin());

create policy courses_update_super_admin on public.courses
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy courses_delete_super_admin on public.courses
  for delete to authenticated using (public.is_super_admin());

-- course_modules ----------------------------------------------
create policy course_modules_select_published on public.course_modules
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.status = 'published'
    )
  );

create policy course_modules_select_super_admin on public.course_modules
  for select to authenticated using (public.is_super_admin());

create policy course_modules_insert_super_admin on public.course_modules
  for insert to authenticated with check (public.is_super_admin());

create policy course_modules_update_super_admin on public.course_modules
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy course_modules_delete_super_admin on public.course_modules
  for delete to authenticated using (public.is_super_admin());

-- notifications -----------------------------------------------
create policy notifications_select_own on public.notifications
  for select to authenticated using (profile_id = auth.uid());

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
-- insert happens server-side only (service role); no insert policy.

-- subscribers -------------------------------------------------
create policy subscribers_insert_public on public.subscribers
  for insert to anon, authenticated with check (true);

create policy subscribers_select_super_admin on public.subscribers
  for select to authenticated using (public.is_super_admin());

create policy subscribers_delete_super_admin on public.subscribers
  for delete to authenticated using (public.is_super_admin());

-- mentor_profiles ---------------------------------------------
create policy mentor_profiles_select_active on public.mentor_profiles
  for select to anon, authenticated using (is_active = true);

create policy mentor_profiles_select_super_admin on public.mentor_profiles
  for select to authenticated using (public.is_super_admin());

create policy mentor_profiles_insert_own on public.mentor_profiles
  for insert to authenticated with check (profile_id = auth.uid());

create policy mentor_profiles_update_own on public.mentor_profiles
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy mentor_profiles_update_super_admin on public.mentor_profiles
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- mentorship_requests -----------------------------------------
create policy mr_insert_own on public.mentorship_requests
  for insert to authenticated
  with check (mentee_id = auth.uid() and status = 'pending');

create policy mr_select_participant on public.mentorship_requests
  for select to authenticated
  using (mentee_id = auth.uid() or mentor_id = auth.uid());

create policy mr_select_super_admin on public.mentorship_requests
  for select to authenticated using (public.is_super_admin());

create policy mr_select_institution_admin on public.mentorship_requests
  for select to authenticated
  using (
    public.is_institution_admin()
    and (
      select p.institution_id from public.profiles p where p.id = mentorship_requests.mentor_id
    ) = (
      select p.institution_id from public.profiles p where p.id = auth.uid()
    )
  );

create policy mr_update_mentor on public.mentorship_requests
  for update to authenticated
  using (mentor_id = auth.uid())
  with check (mentor_id = auth.uid() and status in ('accepted', 'rejected'));

create policy mr_update_super_admin on public.mentorship_requests
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- events ------------------------------------------------------
create policy events_select_public on public.events
  for select to anon, authenticated using (true);

create policy events_insert_admin on public.events
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and (
      public.is_super_admin()
      or (
        public.is_institution_admin()
        and institution_id is not null
        and institution_id = (select p.institution_id from public.profiles p where p.id = auth.uid())
      )
    )
  );

create policy events_update_admin_own on public.events
  for update to authenticated
  using (created_by = auth.uid())
  with check (
    created_by = auth.uid()
    and (public.is_super_admin() or public.is_institution_admin())
  );

create policy events_delete_admin_own on public.events
  for delete to authenticated
  using (
    created_by = auth.uid()
    and (public.is_super_admin() or public.is_institution_admin())
  );

-- event_rsvps ------------------------------------------------
create policy event_rsvps_insert_own on public.event_rsvps
  for insert to authenticated with check (profile_id = auth.uid());

create policy event_rsvps_select_own_or_creator on public.event_rsvps
  for select to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from public.events e where e.id = event_id and e.created_by = auth.uid()
    )
  );

create policy event_rsvps_update_own on public.event_rsvps
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy event_rsvps_delete_own on public.event_rsvps
  for delete to authenticated using (profile_id = auth.uid());

-- digital_products -------------------------------------------
create policy digital_products_select_published on public.digital_products
  for select to anon, authenticated using (status = 'published');

create policy digital_products_select_super_admin on public.digital_products
  for select to authenticated using (public.is_super_admin());

create policy digital_products_insert_super_admin on public.digital_products
  for insert to authenticated with check (public.is_super_admin());

create policy digital_products_update_super_admin on public.digital_products
  for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy digital_products_delete_super_admin on public.digital_products
  for delete to authenticated using (public.is_super_admin());

-- orders ------------------------------------------------------
create policy orders_select_own on public.orders
  for select to authenticated using (buyer_id = auth.uid());

create policy orders_select_super_admin on public.orders
  for select to authenticated using (public.is_super_admin());
-- writes happen server-side only (service role);

-- product_licenses -------------------------------------------
create policy product_licenses_select_own on public.product_licenses
  for select to authenticated using (buyer_id = auth.uid());

create policy product_licenses_select_super_admin on public.product_licenses
  for select to authenticated using (public.is_super_admin());
-- writes happen server-side only (service role);

-- license_activations ----------------------------------------
create policy license_activations_select_super_admin on public.license_activations
  for select to authenticated using (public.is_super_admin());
-- writes happen server-side only (service role);

-- audit_log --------------------------------------------------
create policy audit_log_select_super_admin on public.audit_log
  for select to authenticated using (public.is_super_admin());
-- writes happen server-side only (service role);

-- ---------- grants ----------
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

commit;
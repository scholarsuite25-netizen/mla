-- 0010: Enterprise System Audit Log & Realtime Activity Ledger
-- Enhances audit_log table with categories, severity, details JSONB payload, actor emails,
-- and automated triggers for user on-boardings, license issuances, and mentorship transitions.

begin;

-- 1. Extend audit_log columns
alter table public.audit_log add column if not exists details jsonb default '{}'::jsonb;
alter table public.audit_log add column if not exists actor_email text;
alter table public.audit_log add column if not exists ip_address text;
alter table public.audit_log add column if not exists severity text not null default 'info';
alter table public.audit_log add column if not exists category text not null default 'general';

-- 2. Performance indexes for search, category filtering, and time-series queries
create index if not exists audit_log_category_idx on public.audit_log (category);
create index if not exists audit_log_severity_idx on public.audit_log (severity);
create index if not exists audit_log_action_idx on public.audit_log (action);
create index if not exists audit_log_actor_id_idx on public.audit_log (actor_id);
create index if not exists audit_log_target_id_idx on public.audit_log (target_id);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- 3. Trigger for user on-boarding (profiles insertion)
create or replace function public.log_profile_onboarding()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_log (
    actor_id,
    action,
    target_table,
    target_id,
    category,
    severity,
    details,
    created_at
  ) values (
    NEW.id,
    'member.onboarded',
    'profiles',
    NEW.id,
    'membership',
    'info',
    jsonb_build_object(
      'full_name', coalesce(NEW.full_name, 'Anonymous Member'),
      'role', coalesce(NEW.role, 'scholar'),
      'institution_id', NEW.institution_id
    ),
    coalesce(NEW.created_at, now())
  );
  return NEW;
end;
$$;

drop trigger if exists on_profile_created_audit on public.profiles;
create trigger on_profile_created_audit
  after insert on public.profiles
  for each row
  execute function public.log_profile_onboarding();

-- 4. Trigger for cryptographic license issuances
create or replace function public.log_license_issuance()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_log (
    actor_id,
    action,
    target_table,
    target_id,
    category,
    severity,
    details,
    created_at
  ) values (
    NEW.buyer_id,
    'license.issued',
    'product_licenses',
    NEW.id,
    'licenses',
    'notice',
    jsonb_build_object(
      'license_key', NEW.license_key,
      'product_id', NEW.product_id,
      'max_activations', NEW.max_activations,
      'is_revoked', NEW.is_revoked
    ),
    coalesce(NEW.created_at, now())
  );
  return NEW;
end;
$$;

drop trigger if exists on_license_created_audit on public.product_licenses;
create trigger on_license_created_audit
  after insert on public.product_licenses
  for each row
  execute function public.log_license_issuance();

-- 5. Trigger for mentorship state changes (applications & transitions)
create or replace function public.log_mentorship_state()
returns trigger
language plpgsql
security definer
as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.audit_log (
      actor_id,
      action,
      target_table,
      target_id,
      category,
      severity,
      details,
      created_at
    ) values (
      NEW.mentee_id,
      'mentorship.requested',
      'mentorship_requests',
      NEW.id,
      'mentorship',
      'info',
      jsonb_build_object(
        'mentor_id', NEW.mentor_id,
        'mentee_id', NEW.mentee_id,
        'status', NEW.status
      ),
      coalesce(NEW.created_at, now())
    );
  elsif (TG_OP = 'UPDATE' and OLD.status is distinct from NEW.status) then
    insert into public.audit_log (
      actor_id,
      action,
      target_table,
      target_id,
      category,
      severity,
      details,
      created_at
    ) values (
      coalesce(NEW.mentor_id, NEW.mentee_id),
      'mentorship.' || NEW.status,
      'mentorship_requests',
      NEW.id,
      'mentorship',
      case 
        when NEW.status in ('approved', 'accepted') then 'notice'
        when NEW.status in ('rejected', 'cancelled') then 'warning'
        else 'info'
      end,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'mentor_id', NEW.mentor_id,
        'mentee_id', NEW.mentee_id
      ),
      now()
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_mentorship_request_audit on public.mentorship_requests;
create trigger on_mentorship_request_audit
  after insert or update on public.mentorship_requests
  for each row
  execute function public.log_mentorship_state();

-- 6. Backfill existing records for historic continuity
-- Backfill profiles
insert into public.audit_log (actor_id, action, target_table, target_id, category, severity, details, created_at)
select
  p.id,
  'member.onboarded',
  'profiles',
  p.id,
  'membership',
  'info',
  jsonb_build_object('full_name', coalesce(p.full_name, 'Member'), 'role', p.role, 'institution_id', p.institution_id),
  coalesce(p.created_at, now())
from public.profiles p
where not exists (
  select 1 from public.audit_log a
  where a.target_table = 'profiles' and a.target_id = p.id and a.action = 'member.onboarded'
);

-- Backfill product licenses
insert into public.audit_log (actor_id, action, target_table, target_id, category, severity, details, created_at)
select
  l.buyer_id,
  'license.issued',
  'product_licenses',
  l.id,
  'licenses',
  'notice',
  jsonb_build_object('license_key', l.license_key, 'product_id', l.product_id, 'max_activations', l.max_activations, 'is_revoked', l.is_revoked),
  coalesce(l.created_at, now())
from public.product_licenses l
where not exists (
  select 1 from public.audit_log a
  where a.target_table = 'product_licenses' and a.target_id = l.id and a.action = 'license.issued'
);

-- Backfill mentorship requests
insert into public.audit_log (actor_id, action, target_table, target_id, category, severity, details, created_at)
select
  r.mentee_id,
  'mentorship.' || r.status,
  'mentorship_requests',
  r.id,
  'mentorship',
  'info',
  jsonb_build_object('mentor_id', r.mentor_id, 'mentee_id', r.mentee_id, 'status', r.status),
  coalesce(r.created_at, now())
from public.mentorship_requests r
where not exists (
  select 1 from public.audit_log a
  where a.target_table = 'mentorship_requests' and a.target_id = r.id
);

-- 7. Normalize categories and severity for existing rows
update public.audit_log set category = 'licenses', severity = 'warning'
where action like 'license.%' and (category = 'general' or category is null);

update public.audit_log set category = 'membership'
where action like 'member.%' and (category = 'general' or category is null);

update public.audit_log set category = 'mentorship'
where (action like 'mentorship.%' or action like 'institution_admin.%') and (category = 'general' or category is null);

update public.audit_log set category = 'courses'
where action like 'course.%' and (category = 'general' or category is null);

update public.audit_log set category = 'shop'
where action like 'order.%' and (category = 'general' or category is null);

update public.audit_log set category = 'courses'
where action like 'blog_post.%' and (category = 'general' or category is null);

-- 8. Add table to Supabase Realtime publication if available
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'audit_log'
  ) then
    alter publication supabase_realtime add table public.audit_log;
  end if;
exception when others then
  null;
end $$;

commit;

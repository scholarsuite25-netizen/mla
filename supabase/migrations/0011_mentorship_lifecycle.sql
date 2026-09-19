-- ---------- 0011: mentorship request lifecycle & anti-abuse ----------
-- Global best-practice hardening of the mentor/mentee module:
--  1. Full status lifecycle: cancelled (mentee withdrawal) and ended (match
--     termination) in addition to pending/accepted/rejected/approved.
--  2. ended_at timestamp so archives stay meaningful.
--  3. DB-enforced uniqueness of one active request per (mentee, mentor) pair.
--  4. RLS: requests may only target an ACTIVE mentor and never self.
--  5. RLS: mentee may withdraw their own pending request.
--  6. RLS: either participant may end an approved match.
--  7. Audit trigger only records USER-initiated transitions (auth.uid()
--     present). Service-role transitions (final super-admin approval,
--     moderation) are audited by the server action with the correct admin
--     actor, avoiding duplicate rows and mis-attributed actors.

begin;

alter table public.mentorship_requests drop constraint if exists mentorship_requests_status_check;
alter table public.mentorship_requests
  add constraint mentorship_requests_status_check
  check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'approved', 'ended'));

alter table public.mentorship_requests add column if not exists ended_at timestamptz;

create unique index if not exists mentorship_requests_active_uq
  on public.mentorship_requests (mentee_id, mentor_id)
  where status in ('pending', 'accepted', 'approved');

-- Requests may only target the caller's self OR an active mentor, never self.
drop policy if exists mr_insert_own on public.mentorship_requests;
create policy mr_insert_own on public.mentorship_requests
  for insert to authenticated
  with check (
    mentee_id = auth.uid()
    and status = 'pending'
    and mentor_id <> auth.uid()
    and exists (
      select 1 from public.mentor_profiles mp
      where mp.profile_id = mentor_id and mp.is_active = true
    )
  );

-- Mentee may withdraw their own pending request.
drop policy if exists mr_update_mentee_cancel on public.mentorship_requests;
create policy mr_update_mentee_cancel on public.mentorship_requests
  for update to authenticated
  using (mentee_id = auth.uid() and status = 'pending')
  with check (mentee_id = auth.uid() and status = 'cancelled');

-- Either participant may end an approved match.
drop policy if exists mr_update_participant_end on public.mentorship_requests;
create policy mr_update_participant_end on public.mentorship_requests
  for update to authenticated
  using ((mentee_id = auth.uid() or mentor_id = auth.uid()) and status = 'approved')
  with check ((mentee_id = auth.uid() or mentor_id = auth.uid()) and status = 'ended');

-- Audit: user-initiated transitions carry auth.uid() (accurate actor).
-- Service-role transitions are audited by the server action instead.
create or replace function public.log_mentorship_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.audit_log (
      actor_id, action, target_table, target_id, category, severity, details, created_at
    ) values (
      NEW.mentee_id,
      'mentorship.requested',
      'mentorship_requests',
      NEW.id,
      'mentorship',
      'info',
      jsonb_build_object('mentor_id', NEW.mentor_id, 'mentee_id', NEW.mentee_id, 'status', NEW.status),
      coalesce(NEW.created_at, now())
    );
    return NEW;
  end if;

  if (TG_OP = 'UPDATE' and auth.uid() is not null and OLD.status is distinct from NEW.status) then
    insert into public.audit_log (
      actor_id, action, target_table, target_id, category, severity, details, created_at
    ) values (
      auth.uid(),
      'mentorship.' || NEW.status,
      'mentorship_requests',
      NEW.id,
      'mentorship',
      case
        when NEW.status in ('approved', 'accepted') then 'notice'
        when NEW.status in ('rejected', 'cancelled', 'ended') then 'warning'
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

commit;
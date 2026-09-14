-- 0002: signup trigger now copies institution_id from user metadata.
-- The registration form sets user_metadata.institution_id before signUp,
-- so the auto-created profile gets the right institution immediately.
begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, institution_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    (new.raw_user_meta_data->>'institution_id')::uuid
  );
  return new;
end;
$$;

commit;
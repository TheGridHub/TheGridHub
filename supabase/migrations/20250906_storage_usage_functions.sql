-- Helper function to compute user storage in MB
begin;

create or replace function public.user_storage_mb(uid uuid)
returns double precision
language sql
stable
security definer
as $$
  select coalesce(sum(size_bytes),0) / 1024.0 / 1024.0
  from public.project_files
  where user_id = uid;
$$;

grant execute on function public.user_storage_mb(uuid) to authenticated;

commit;

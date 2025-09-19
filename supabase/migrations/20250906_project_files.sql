-- Files attached to projects, tracked per user for storage enforcement
begin;

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id text,
  key text not null,
  url text,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

alter table public.project_files enable row level security;

drop policy if exists project_files_select_own on public.project_files;
create policy project_files_select_own on public.project_files for select using (auth.uid() = user_id);

drop policy if exists project_files_modify_own on public.project_files;
create policy project_files_modify_own on public.project_files for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists project_files_user_idx on public.project_files(user_id);
create index if not exists project_files_project_idx on public.project_files(project_id);

commit;

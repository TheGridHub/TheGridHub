-- Per-user feature flag overrides (admin-managed)
begin;

create table if not exists public.feature_flag_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  flag_key text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, flag_key)
);

alter table public.feature_flag_overrides enable row level security;
-- No public policies; only service role should read/write

create index if not exists feature_flag_overrides_user_idx on public.feature_flag_overrides(user_id);
create index if not exists feature_flag_overrides_flag_idx on public.feature_flag_overrides(flag_key);

commit;

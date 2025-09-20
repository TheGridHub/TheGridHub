-- Feature flags table
create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  enabled boolean not null default false,
  description text,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists feature_flags_key_idx on feature_flags (key);


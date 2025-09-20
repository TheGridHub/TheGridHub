-- Create application logs table for observability
create table if not exists app_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  level text not null check (level in ('DEBUG','INFO','WARN','ERROR')),
  message text not null,
  details jsonb,
  trace_id text,
  user_id text
);

-- Helpful index for latest errors
create index if not exists app_logs_created_at_idx on app_logs (created_at desc);
create index if not exists app_logs_level_idx on app_logs (level);


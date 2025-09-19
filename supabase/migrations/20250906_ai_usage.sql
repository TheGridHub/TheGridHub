-- Tracks daily AI suggestions usage per user
-- Free plan: 10 per day; Pro: unlimited

begin;

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day date not null default (now() at time zone 'utc')::date,
  count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

-- Touch updated_at
create or replace function public._ai_usage_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DO $$
BEGIN
  BEGIN
    CREATE TRIGGER ai_usage_set_updated_at
    BEFORE UPDATE ON public.ai_usage
    FOR EACH ROW EXECUTE FUNCTION public._ai_usage_touch_updated_at();
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

alter table public.ai_usage enable row level security;

drop policy if exists ai_usage_select_own on public.ai_usage;
create policy ai_usage_select_own on public.ai_usage for select using (auth.uid() = user_id);

drop policy if exists ai_usage_modify_own on public.ai_usage;
create policy ai_usage_modify_own on public.ai_usage for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists ai_usage_user_day_idx on public.ai_usage(user_id, day);

commit;

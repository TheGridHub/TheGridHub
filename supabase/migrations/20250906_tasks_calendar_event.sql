-- Add calendar event linkage to tasks
begin;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS calendar_event_id text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS calendar_provider text check (calendar_provider in ('google','office365'));
commit;

-- Migration: Add completedAt to tasks, and trigger to set it on first transition to COMPLETED
-- Safe to run multiple times

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS "completedAt" timestamptz;

CREATE OR REPLACE FUNCTION public.tasks_set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS DISTINCT FROM 'COMPLETED') AND NEW."completedAt" IS NULL THEN
    NEW."completedAt" = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tasks_set_completed_at'
  ) THEN
    CREATE TRIGGER trg_tasks_set_completed_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.tasks_set_completed_at();
  END IF;
END $$;


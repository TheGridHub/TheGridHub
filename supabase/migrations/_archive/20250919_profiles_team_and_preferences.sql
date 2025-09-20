-- Add team_name and preferences to profiles, idempotently
begin;

-- team_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='team_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN team_name text NULL;
  END IF;
END $$;

-- preferences column as jsonb
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='preferences'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN preferences jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

commit;


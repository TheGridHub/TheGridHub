-- Migration: Ensure single onboarding row per user + keep updated_at fresh
-- Safe to run repeatedly

-- 1) Add UNIQUE constraint on userId if missing
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_onboarding'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'user_onboarding' AND c.conname = 'user_onboarding_user_unique'
    ) THEN
      ALTER TABLE public.user_onboarding
      ADD CONSTRAINT user_onboarding_user_unique UNIQUE ("userId");
    END IF;
  END IF;
END $$;

-- 2) Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Attach trigger to user_onboarding if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'user_onboarding_set_updated_at'
  ) THEN
    CREATE TRIGGER user_onboarding_set_updated_at
    BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 4) Helpful index (already exists in earlier migration, keep idempotent)
CREATE INDEX IF NOT EXISTS user_onboarding_user_idx ON public.user_onboarding ("userId");
CREATE INDEX IF NOT EXISTS user_onboarding_lang_idx ON public.user_onboarding (language);


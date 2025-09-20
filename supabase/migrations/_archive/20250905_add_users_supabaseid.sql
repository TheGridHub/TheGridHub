-- Ensure users.supabaseId exists before RLS policies reference it
-- Idempotent and safe in all environments

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='users'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='users' AND column_name='supabaseId'
    ) THEN
      ALTER TABLE public.users ADD COLUMN "supabaseId" uuid;
    END IF;

    -- Add uniqueness if not present (ignore if fails due to existing dupes)
    BEGIN
      ALTER TABLE public.users ADD CONSTRAINT users_supabaseid_unique UNIQUE ("supabaseId");
    EXCEPTION WHEN duplicate_object THEN
      -- ignore
      NULL;
    END;

    -- Helpful index
    CREATE INDEX IF NOT EXISTS users_supabaseid_idx ON public.users ("supabaseId");
  END IF;
END $$;


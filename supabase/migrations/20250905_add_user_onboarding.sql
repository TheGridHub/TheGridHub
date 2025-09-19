-- Create user_onboarding table for onboarding flow
-- Stores per-user onboarding preferences and metadata

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Create table if missing (with quoted "userId" to preserve camelCase)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_onboarding'
  ) THEN
    CREATE TABLE public.user_onboarding (
      id uuid primary key default gen_random_uuid(),
      "userId" text not null,
      companyName text,
      focus text,
      invitedEmails text[],
      firstName text,
      lastName text,
      phone text,
      language text not null default 'en',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  END IF;
END $$;

-- If table exists with legacy column names, normalize to "userId"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_onboarding' AND column_name='user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_onboarding' AND column_name='userId'
  ) THEN
    ALTER TABLE public.user_onboarding RENAME COLUMN user_id TO "userId";
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_onboarding' AND column_name='userid'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_onboarding' AND column_name='userId'
  ) THEN
    ALTER TABLE public.user_onboarding RENAME COLUMN userid TO "userId";
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_onboarding' AND column_name='userId'
  ) THEN
    -- As a last resort, add the column
    ALTER TABLE public.user_onboarding ADD COLUMN "userId" text;
  END IF;
END $$;

-- Optional FK to users table (best-effort; ignore if users table not present yet)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Add FK only if not already present
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND table_name = 'user_onboarding' AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE public.user_onboarding
      ADD CONSTRAINT user_onboarding_user_fkey
      FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS user_onboarding_user_idx ON public.user_onboarding ("userId");
CREATE INDEX IF NOT EXISTS user_onboarding_lang_idx ON public.user_onboarding (language);


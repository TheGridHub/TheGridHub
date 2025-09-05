-- Create user_onboarding table for onboarding flow
-- Stores per-user onboarding preferences and metadata

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  userId text not null,
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
      FOREIGN KEY (userId) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Helpful indexes
create index if not exists user_onboarding_user_idx on public.user_onboarding (userId);
create index if not exists user_onboarding_lang_idx on public.user_onboarding (language);


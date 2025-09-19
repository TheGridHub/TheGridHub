-- Create profiles table to drive onboarding and plan enforcement
-- Idempotent: safe to run multiple times

begin;

create table if not exists public.profiles (
  user_id uuid primary key,
  plan text not null check (plan in ('free','pro')) default 'free',
  onboarding_complete boolean not null default false,
  subscription_status text not null check (subscription_status in ('active','pending','canceled')) default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If the table exists but missing PK, add it only when there is no PRIMARY KEY
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='profiles' AND constraint_type='PRIMARY KEY'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);
  END IF;
END $$;

-- Try to reference auth.users for cascade; ignore if auth schema is unavailable in build context
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    BEGIN
      ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_fk
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public._profiles_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  BEGIN
    CREATE TRIGGER profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public._profiles_touch_updated_at();
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Enable RLS and owner-only access (via Supabase auth.uid())
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

create index if not exists profiles_user_idx on public.profiles(user_id);

commit;

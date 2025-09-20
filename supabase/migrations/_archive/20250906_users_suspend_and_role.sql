-- Add suspended and appRole columns to users for soft suspension and app-level roles
begin;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='suspended'
    ) THEN
      ALTER TABLE public.users ADD COLUMN suspended boolean not null default false;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='appRole'
    ) THEN
      ALTER TABLE public.users ADD COLUMN "appRole" text not null default 'member';
    END IF;
  END IF;
END $$;

commit;

-- Add CRM (companies, contacts), notes, and activity events tables with RLS and indexes
-- Idempotent and aligned to existing conventions using public.users(userId) mapping via users."supabaseId" = auth.uid()

begin;

-- COMPANIES
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null,
  name text not null,
  domain text null,
  website text null,
  industry text null,
  size text null,
  tags text[] not null default '{}',
  description text null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- FK to users(id) if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='users'
  ) THEN
    BEGIN
      ALTER TABLE public.companies
      ADD CONSTRAINT companies_user_fk FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Touch updatedAt trigger for companies
create or replace function public._companies_touch_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

DO $$
BEGIN
  BEGIN
    CREATE TRIGGER companies_set_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public._companies_touch_updated_at();
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Indexes for companies
create index if not exists companies_user_idx on public.companies("userId");
create index if not exists companies_created_idx on public.companies("createdAt");
create index if not exists companies_name_ci_idx on public.companies(lower(name));
create unique index if not exists companies_user_domain_unique on public.companies("userId", lower(domain)) where domain is not null;

-- RLS for companies
alter table public.companies enable row level security;

drop policy if exists companies_select_own on public.companies;
create policy companies_select_own on public.companies for select using (
  exists (
    select 1 from public.users u where u.id = companies."userId" and u."supabaseId" = auth.uid()
  )
);

drop policy if exists companies_modify_own on public.companies;
create policy companies_modify_own on public.companies for all using (
  exists (
    select 1 from public.users u where u.id = companies."userId" and u."supabaseId" = auth.uid()
  )
) with check (
  exists (
    select 1 from public.users u where u.id = companies."userId" and u."supabaseId" = auth.uid()
  )
);


-- CONTACTS
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null,
  "companyId" uuid null,
  "firstName" text null,
  "lastName" text null,
  email text null,
  phone text null,
  title text null,
  status text not null default 'active' check (status in ('lead','active','customer','archived')),
  tags text[] not null default '{}',
  "avatarUrl" text null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- FKs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='users'
  ) THEN
    BEGIN
      ALTER TABLE public.contacts
      ADD CONSTRAINT contacts_user_fk FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='companies'
  ) THEN
    BEGIN
      ALTER TABLE public.contacts
      ADD CONSTRAINT contacts_company_fk FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Touch updatedAt trigger for contacts
create or replace function public._contacts_touch_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

DO $$
BEGIN
  BEGIN
    CREATE TRIGGER contacts_set_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public._contacts_touch_updated_at();
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Indexes for contacts
create index if not exists contacts_user_idx on public.contacts("userId");
create index if not exists contacts_company_idx on public.contacts("companyId");
create index if not exists contacts_created_idx on public.contacts("createdAt");
create index if not exists contacts_lastname_ci_idx on public.contacts(lower("lastName"));
create unique index if not exists contacts_user_email_ci_unique on public.contacts("userId", lower(email)) where email is not null;
create index if not exists contacts_tags_gin_idx on public.contacts using gin (tags);

-- RLS for contacts
alter table public.contacts enable row level security;

drop policy if exists contacts_select_own on public.contacts;
create policy contacts_select_own on public.contacts for select using (
  exists (
    select 1 from public.users u where u.id = contacts."userId" and u."supabaseId" = auth.uid()
  )
);

drop policy if exists contacts_modify_own on public.contacts;
create policy contacts_modify_own on public.contacts for all using (
  exists (
    select 1 from public.users u where u.id = contacts."userId" and u."supabaseId" = auth.uid()
  )
) with check (
  exists (
    select 1 from public.users u where u.id = contacts."userId" and u."supabaseId" = auth.uid()
  )
);


-- NOTES (polymorphic)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null,
  "entityType" text not null check ("entityType" in ('contact','company','project','task')),
  "entityId" uuid not null,
  content text not null,
  pinned boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='users'
  ) THEN
    BEGIN
      ALTER TABLE public.notes
      ADD CONSTRAINT notes_user_fk FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Touch updatedAt trigger for notes
create or replace function public._notes_touch_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

DO $$
BEGIN
  BEGIN
    CREATE TRIGGER notes_set_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public._notes_touch_updated_at();
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Indexes for notes
create index if not exists notes_user_idx on public.notes("userId");
create index if not exists notes_entity_idx on public.notes("entityType", "entityId");
create index if not exists notes_created_idx on public.notes("createdAt");

-- RLS for notes
alter table public.notes enable row level security;

drop policy if exists notes_select_own on public.notes;
create policy notes_select_own on public.notes for select using (
  exists (
    select 1 from public.users u where u.id = notes."userId" and u."supabaseId" = auth.uid()
  )
);

drop policy if exists notes_modify_own on public.notes;
create policy notes_modify_own on public.notes for all using (
  exists (
    select 1 from public.users u where u.id = notes."userId" and u."supabaseId" = auth.uid()
  )
) with check (
  exists (
    select 1 from public.users u where u.id = notes."userId" and u."supabaseId" = auth.uid()
  )
);


-- ACTIVITY EVENTS (for analytics)
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null,
  type text not null,
  "targetType" text not null,
  "targetId" uuid null,
  metadata jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='users'
  ) THEN
    BEGIN
      ALTER TABLE public.activity_events
      ADD CONSTRAINT activity_events_user_fk FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

create index if not exists activity_events_user_idx on public.activity_events("userId");
create index if not exists activity_events_created_idx on public.activity_events("createdAt");
create index if not exists activity_events_target_idx on public.activity_events("targetType", "targetId");

alter table public.activity_events enable row level security;

drop policy if exists activity_events_select_own on public.activity_events;
create policy activity_events_select_own on public.activity_events for select using (
  exists (
    select 1 from public.users u where u.id = activity_events."userId" and u."supabaseId" = auth.uid()
  )
);

drop policy if exists activity_events_modify_own on public.activity_events;
create policy activity_events_modify_own on public.activity_events for all using (
  exists (
    select 1 from public.users u where u.id = activity_events."userId" and u."supabaseId" = auth.uid()
  )
) with check (
  exists (
    select 1 from public.users u where u.id = activity_events."userId" and u."supabaseId" = auth.uid()
  )
);

commit;

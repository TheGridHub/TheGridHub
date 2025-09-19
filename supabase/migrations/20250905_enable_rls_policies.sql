-- Enable RLS and add owner-only policies for user data tables
-- Note: Service role bypasses RLS, so webhooks and admin jobs continue to work.

-- Helper: predicate that checks if the row belongs to the authenticated user via users.supabaseId
-- We inline this logic per-table to avoid dependency on a SQL function in case of limited permissions.

-- USERS
alter table if exists public.users enable row level security;
drop policy if exists users_select_self on public.users;
drop policy if exists users_modify_self on public.users;
create policy users_select_self on public.users for select using (
  supabaseId = auth.uid()
);
create policy users_modify_self on public.users for all using (
  supabaseId = auth.uid()
) with check (
  supabaseId = auth.uid()
);

-- USER_ONBOARDING
alter table if exists public.user_onboarding enable row level security;
drop policy if exists user_onboarding_select_own on public.user_onboarding;
drop policy if exists user_onboarding_modify_own on public.user_onboarding;
create policy user_onboarding_select_own on public.user_onboarding for select using (
  exists (select 1 from public.users u where u.id = user_onboarding."userId" and u."supabaseId" = auth.uid())
);
create policy user_onboarding_modify_own on public.user_onboarding for all using (
  exists (select 1 from public.users u where u.id = user_onboarding."userId" and u."supabaseId" = auth.uid())
) with check (
  exists (select 1 from public.users u where u.id = user_onboarding."userId" and u."supabaseId" = auth.uid())
);

-- PROJECTS
alter table if exists public.projects enable row level security;
drop policy if exists projects_select_own on public.projects;
drop policy if exists projects_modify_own on public.projects;
create policy projects_select_own on public.projects for select using (
  exists (select 1 from public.users u where u.id = projects."userId" and u."supabaseId" = auth.uid())
);
create policy projects_modify_own on public.projects for all using (
  exists (select 1 from public.users u where u.id = projects."userId" and u."supabaseId" = auth.uid())
) with check (
  exists (select 1 from public.users u where u.id = projects."userId" and u."supabaseId" = auth.uid())
);

-- TASKS
alter table if exists public.tasks enable row level security;
drop policy if exists tasks_select_own on public.tasks;
drop policy if exists tasks_modify_own on public.tasks;
create policy tasks_select_own on public.tasks for select using (
  exists (select 1 from public.users u where u.id = tasks."userId" and u."supabaseId" = auth.uid())
);
create policy tasks_modify_own on public.tasks for all using (
  exists (select 1 from public.users u where u.id = tasks."userId" and u."supabaseId" = auth.uid())
) with check (
  exists (select 1 from public.users u where u.id = tasks."userId" and u."supabaseId" = auth.uid())
);

-- GOALS
alter table if exists public.goals enable row level security;
drop policy if exists goals_select_own on public.goals;
drop policy if exists goals_modify_own on public.goals;
create policy goals_select_own on public.goals for select using (
  exists (select 1 from public.users u where u.id = goals."userId" and u."supabaseId" = auth.uid())
);
create policy goals_modify_own on public.goals for all using (
  exists (select 1 from public.users u where u.id = goals."userId" and u."supabaseId" = auth.uid())
) with check (
  exists (select 1 from public.users u where u.id = goals."userId" and u."supabaseId" = auth.uid())
);

-- NOTIFICATIONS
alter table if exists public.notifications enable row level security;
drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_modify_own on public.notifications;
create policy notifications_select_own on public.notifications for select using (
  exists (select 1 from public.users u where u.id = notifications."userId" and u."supabaseId" = auth.uid())
);
create policy notifications_modify_own on public.notifications for all using (
  exists (select 1 from public.users u where u.id = notifications."userId" and u."supabaseId" = auth.uid())
) with check (
  exists (select 1 from public.users u where u.id = notifications."userId" and u."supabaseId" = auth.uid())
);

-- TEAM MEMBERSHIPS
alter table if exists public.team_memberships enable row level security;
drop policy if exists team_memberships_select_own on public.team_memberships;
drop policy if exists team_memberships_modify_own on public.team_memberships;
create policy team_memberships_select_own on public.team_memberships for select using (
  exists (select 1 from public.users u where u.id = team_memberships."userId" and u."supabaseId" = auth.uid())
);
create policy team_memberships_modify_own on public.team_memberships for all using (
  exists (select 1 from public.users u where u.id = team_memberships."userId" and u."supabaseId" = auth.uid())
) with check (
  exists (select 1 from public.users u where u.id = team_memberships."userId" and u."supabaseId" = auth.uid())
);

-- INTEGRATIONS
alter table if exists public.integrations enable row level security;
drop policy if exists integrations_select_own on public.integrations;
drop policy if exists integrations_modify_own on public.integrations;
create policy integrations_select_own on public.integrations for select using (
  exists (select 1 from public.users u where u.id = integrations."userId" and u."supabaseId" = auth.uid())
);
create policy integrations_modify_own on public.integrations for all using (
  exists (select 1 from public.users u where u.id = integrations."userId" and u."supabaseId" = auth.uid())
) with check (
  exists (select 1 from public.users u where u.id = integrations."userId" and u."supabaseId" = auth.uid())
);

-- SUBSCRIPTIONS (optional: allow owner read)
alter table if exists public.subscriptions enable row level security;
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions for select using (
  exists (select 1 from public.users u where u.id = subscriptions."userId" and u."supabaseId" = auth.uid())
);
-- Note: inserts/updates are performed by service role via webhooks, so no user-level write policy here.

-- PAYMENTS (optional: allow owner read)
alter table if exists public.payments enable row level security;
drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments for select using (
  exists (select 1 from public.users u where u.id = payments."userId" and u."supabaseId" = auth.uid())
);
-- Writes come from webhooks (service role)


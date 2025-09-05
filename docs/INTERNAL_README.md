# INTERNAL_README.md

Audience: internal developers and operators of TheGridHub. Do not include secrets in this file. Use environment variables via Vercel or your local .env.local.

1) Prerequisites
- Node.js 20+
- npm
- Supabase project (DATABASE_URL, DIRECT_URL) and Supabase CLI (optional for migrations)
- Stripe account and test keys (for subscriptions)

2) Environment
- Local: copy .env.example to .env.local and fill values (no secrets in repo)
- Vercel: set all environment variables in the dashboard
- Key vars used by the app:
  - NEXT_PUBLIC_APP_URL
  - Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY (server), DATABASE_URL, DIRECT_URL
  - Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_* price IDs
  - Integrations: GOOGLE_CLIENT_ID/SECRET, MICROSOFT_CLIENT_ID/SECRET/TENANT_ID, SLACK_CLIENT_ID/SECRET/BOT_TOKEN/SIGNING_SECRET, optional JIRA_* for admin tests
  - Internal admin: THEGRIDHUB_ADMIN/_PW (and operator), ENCRYPTION_MASTER_KEY

3) Install & Dev
- Install: npm ci
- Start dev: npm run dev (Next.js App Router)
- Type-check: npm run type-check
- Lint: npm run lint (auto-fix: npm run lint:fix)

4) Database and migrations
Core schema (Prisma)
- Generate: npm run db:generate
- Apply: npm run db:push (uses npx prisma db push)

Supabase SQL migrations (custom tables/policies)
- Windows helper: pwsh -NoProfile -File .\scripts\migrate-supabase.ps1 -EnvFile .\.env.local
- Or CLI: supabase db push --workdir . --db-url {{SUPABASE_DB_URL}} --yes

Included migrations (supabase/migrations/)
- 20250905_add_app_logs.sql — Observability table used by lib/observability.ts
- 20250905_add_feature_flags.sql — Feature flags table used by admin
- 20250905_add_stripe_webhook_events.sql — Webhook idempotency log for Stripe
- 20250905_add_user_onboarding.sql — Stores onboarding details and language
- 20250905_enable_rls_policies.sql — RLS enabled with owner-only policies for all user data tables; service role bypasses RLS

5) Internal admin console
- Public routes: /admin-internal/login (public), /admin-internal (guarded by signed cookie)
- Login API: POST /api/admin-internal/login with THEGRIDHUB_ADMIN/_PW (or operator)
- Cookie signing key: ENCRYPTION_MASTER_KEY
- Health pages: /admin-internal (runtime/env), /admin-internal/db (schema, latency, RLS smoke)

6) Authentication
- Primary: Supabase Auth (email/password + OAuth providers via Supabase)
- Onboarding: /onboarding writes to user_onboarding; dashboard layout reads language
- Middleware: middleware.ts allows /admin-internal and guards dashboard pages; unauthenticated users are redirected to /login

7) Stripe billing
- Bootstrap products/prices: STRIPE_SECRET_KEY={{KEY}} node scripts/stripe/bootstrap.js
- Checkout: /api/stripe/create-checkout
- Webhook: /api/webhooks/stripe (uses STRIPE_WEBHOOK_SECRET; writes payments/subscriptions)
- Billing Portal: /api/stripe/billing-portal (customer derived from users.stripeCustomerId)

8) Integrations
- Google Workspace: /api/integrations/google/auth → callback (stores access/refresh tokens in integrations table)
- Office 365: /api/integrations/office365/auth → callback
- Slack: /api/integrations/slack/auth → callback (saves with user Cookie)
- Jira: store JSON creds in integrations.accessToken for now { baseUrl, email, apiToken }; /api/integrations/jira/create-issue uses that
- Admin-internal tests: POST to /api/admin-internal/integrations/*/test-* endpoints to verify tokens and scopes

9) Security
- next.config.js sets HSTS, XFO, XCTO, XXP, Referrer-Policy, Permissions-Policy, CSP (default-src 'self', connect-src includes https for Supabase and providers). If any provider requests fail, add the specific origin to CSP.
- RLS policies ensure only the resource owner can access their rows; webhooks operate via service role and bypass RLS.

10) E2E Smoke
- Cross-platform script: scripts/smoke.js
- Run:
  - BASE_URL=http://localhost:3000 node scripts/smoke.js
  - BASE_URL=https://your-app.example COOKIE="__session=..." node scripts/smoke.js
- npm script: npm run e2e:smoke

11) Deploy (Vercel)
- Set all env vars in Vercel Project → Settings → Environment Variables
- Ensure OAuth redirect URIs point to {NEXT_PUBLIC_APP_URL}/api/integrations/{provider}/callback
- Stripe webhook configured to {APP_URL}/api/webhooks/stripe with STRIPE_WEBHOOK_SECRET
- CI will build (type-check, lint, build). Apply Supabase SQL migrations via the helper script or run from local using the CLI (recommended before first deploy).

12) Troubleshooting
- 401 on /api/*: Ensure Supabase session cookie is present and middleware isn’t redirecting.
- CSP errors: Add missing domains to connect-src/image-src/font-src as needed.
- RLS errors: Verify users.supabaseId is set and user_onboarding rows reference users.id; service role works regardless.
- Stripe duplicate webhook: stripe_webhook_events prevents double-processing; check table contents.


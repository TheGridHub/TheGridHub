# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick commands

Prereqs
- Node.js 20+
- npm

Install
- Clean CI install: npm ci
- Local install: npm install

Develop
- Start dev server: npm run dev
- Type-check: npm run type-check
- Lint: npm run lint
- Lint (auto-fix): npm run lint:fix

Build & run
- Build (standalone): npm run build
- Optional static export: npm run build:static
- Start production server: npm start

Security checks
- Audit dependencies (moderate): npm run security:audit
- Audit (high severity): npm run security:check
- Attempt fixes: npm run security:fix

Database (Prisma / Postgres)
- Generate client: npx prisma generate
- Apply schema to DB: npx prisma db push
- Open Prisma Studio: npx prisma studio
Notes
- Uses DATABASE_URL and DIRECT_URL (see .env.example). Manual GitHub workflow exists to push schema to hosted DB.

Stripe bootstrap (create products/prices)
- Run with key: STRIPE_SECRET_KEY={{STRIPE_SECRET_KEY}} node scripts/stripe/bootstrap.js

“Single test” / API smoke (local or remote)
- App health: curl -sS "{{BASE_URL}}/api/health/app"
- Authenticated examples (provide a session cookie):
  - Projects: curl -sS -H "Cookie: {{COOKIE}}" "{{BASE_URL}}/api/projects"
  - Tasks: curl -sS -H "Cookie: {{COOKIE}}" "{{BASE_URL}}/api/tasks"
Replace {{BASE_URL}} (e.g., http://localhost:3000) and {{COOKIE}} with valid values.

Optional Windows helper (Supabase migrations)
- PowerShell (reads URL from env or an env file):
  - pwsh -NoProfile -File .\scripts\migrate-supabase.ps1 -EnvFile .\.env.local

## Architecture overview

Framework and runtime
- Next.js (App Router) with TypeScript. Server Actions enabled; build configured for standalone output.
- Linting via next lint (ESLint). Formatting via Prettier config.

Routing (App Router)
- app/ contains route groups and pages. Notable groups:
  - (dashboard): user-facing product surfaces (dashboard, tasks, goals, reports, settings, team, workspace)
  - (auth): sign-in/sign-up flows
  - (admin): admin-facing (flags, diagnostics); (admin-internal) extends internal admin areas (db, users, projects, tasks, etc.)
  - Top-level marketing/onboarding pages (pricing, privacy-policy, terms-of-service, why-thegridhub, welcome)
- API route handlers live under app/api/ with domain-oriented subtrees:
  - admin and admin-internal (feature flags, security, login, db, goals, projects, tasks, team, users, stripe)
  - health (app, db latency, schema checks), analytics, currency
  - profile, notifications, projects, tasks, team
  - billing (portal, checkout, session) and webhooks/stripe
  - integrations (google, office365, slack, jira) including auth, callback, status, and test endpoints

Authentication and identity
- Clerk is used for auth (@clerk/nextjs). Auth callback route under app/auth/callback/.

Data layer
- Prisma with PostgreSQL (Supabase in README). Primary schema at prisma/schema.prisma defines:
  - Core entities: User, Project, Task, Goal
  - Subscription/billing: Subscription, Payment
  - Notifications, Integration (Google/Office365/Slack tokens and feature flags), TeamMembership
- An additional prisma/schema-admin-security.prisma defines admin/audit models (AdminRole, AdminAudit, ActivityLog, UserSession, extended Subscription/Payment) for extended security/auditing scenarios.

Configuration
- next.config.js
  - output: 'standalone'; disables blocking on TS/ESLint errors during build; image domain allowlist; experimental serverActions.allowedOrigins; poweredByHeader disabled.
  - Optional bundle analyzer support when ANALYZE=true and @next/bundle-analyzer is installed.
- next.config.security.js
  - Security headers (HSTS, X-Frame-Options, CSP, etc.) and rewrites that hide sensitive paths. Consider this a hardening variant; it’s not imported by default.
- tsconfig.json
  - BaseUrl "." and path alias @/* mapped to repo root; moduleResolution: bundler.
- ESLint/Prettier
  - .eslintrc.json and .prettierrc.json at repo root.

External services and SDKs
- Clerk (auth), Supabase (data), Stripe (billing), Resend (email), Microsoft Graph, Google APIs, Slack API.
- OpenAI/AI SDK used for suggestions; Vercel Analytics included.

Scripts and ops
- scripts/quick-start.js: interactive bootstrap for Supabase + Vercel (creates .env.local, pushes schema, runs vercel). If npm run db:push is unavailable locally, use npx prisma db push.
- scripts/stripe/bootstrap.js: idempotently creates Stripe products/prices; prints env var names to set in Vercel.
- scripts/migrate-supabase.ps1: Windows-friendly flow to apply Supabase migrations without echoing secrets.

CI/CD (GitHub Actions)
- CI (ci.yml): Node 20, npm ci, type-check, lint (non-blocking), build, npm audit (non-blocking).
- E2E (e2e.yml): manual dispatch requiring BASE_URL and COOKIE; installs Playwright deps but executes API smoke via curl calls to critical endpoints.
- Prisma DB Push (prisma-db-push.yml): manual workflow to apply schema to a target DB using DATABASE_URL/DIRECT_URL secrets.
- Security (security.yml): npm audit, ESLint, type-check, CodeQL for JS/TS, Trivy FS scan, and TruffleHog secret scans.

## Notes for agents
- Node.js 20 is the expected runtime (see CI). Prefer npm ci in clean environments.
- There is no dedicated unit test runner configured; rely on type-check, lint, build, and API smoke tests (as shown above) when validating changes.
- TS path alias @/* maps to the repo root; prefer absolute imports via this alias.
- Environment variables are managed via .env.local locally and via Vercel for deployments (see README “Manual Setup”).

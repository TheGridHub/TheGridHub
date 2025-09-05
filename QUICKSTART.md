# TheGridHub - Getting Started Guide

Welcome to TheGridHub — a modern task and project management platform with deep integrations.

## Quick start
- Sign up: https://thegridhub.co/sign-up
- Pricing: https://thegridhub.co/pricing
- Contact: https://thegridhub.co/contact

## Develop locally
- Install: npm ci
- Start: npm run dev
- Migrations:
  - Prisma: npm run db:push
  - Supabase SQL: pwsh -NoProfile -File .\scripts\migrate-supabase.ps1 -EnvFile .\.env.local

## Verify
- Smoke tests:
  - BASE_URL=http://localhost:3000 node scripts/smoke.js
  - For authenticated checks, add COOKIE="__session=..."

## Docs (internal)
- See docs/INTERNAL_README.md for full environment and deployment details.


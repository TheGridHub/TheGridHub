# 🚀 TheGridHub Vercel + Supabase Setup Guide

## Prerequisites
- Node.js 20+
- npm
- Vercel CLI (optional)

## Deploy (Vercel + Supabase)
1) Create Supabase project and copy DATABASE_URL and DIRECT_URL
2) In Vercel Project → Settings → Environment Variables, add all required env vars (see docs/INTERNAL_README.md)
3) Push schemas:
   - Prisma: npm run db:push
   - Supabase SQL: pwsh -NoProfile -File .\scripts\migrate-supabase.ps1 -EnvFile .\.env.local
4) Deploy: vercel

## Local development
- cp .env.example .env.local (fill values)
- npm ci
- npm run db:push
- npm run dev

## Verify
- BASE_URL=http://localhost:3000 node scripts/smoke.js

## Support
- support@thegridhub.co
- Docs: docs/INTERNAL_README.md


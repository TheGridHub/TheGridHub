# 🚀 TheGridHub Production Deployment Checklist

## Pre-deploy
- Env vars set in Vercel (app + integrations + Stripe + Supabase)
- DATABASE_URL and DIRECT_URL valid
- Stripe webhook secret configured

## Deploy
1) Push DB schema: npm run db:push
2) Apply Supabase SQL: pwsh -NoProfile -File .\scripts\migrate-supabase.ps1 -EnvFile .\.env.local
3) vercel --prod

## Post-deploy
- Run smoke tests against production:
  - BASE_URL=https://thegridhub.co node scripts/smoke.js
- Check Stripe webhooks were received (stripe_webhook_events table)
- Verify key API endpoints and dashboards

## Troubleshooting
- Env vars missing: set in Vercel → Settings → Environment Variables
- DB errors: verify DATABASE_URL and run npm run db:push
- Build failures: inspect Vercel logs


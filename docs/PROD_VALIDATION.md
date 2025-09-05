# Production Validation Runbook

Use this checklist to validate production after deploy. For authenticated routes, log into the app in your browser first.

## 1) Health
- App: GET /api/health/app
- DB: GET /api/health/db
- DB Latency: GET /api/health/db/latency
- DB Schema: GET /api/health/db/schema-check (should be ok: true)
- Stripe: GET /api/health/stripe (shows last webhook event)

Or run them in the UI: /admin/diagnostics

## 2) Integrations
Run from /admin/diagnostics or the Settings → Integrations page.
- Slack: Check status; send test message to a channel.
- Google Workspace: Check status; send test email; create test calendar event; (optionally) create Meet calendar event.
- Microsoft 365: Check status; send test email; create test calendar event.
- Jira: From Integrations → Jira, save creds; from Diagnostics run "Jira: Create Issue" with taskId/projectId.

## 3) Core APIs
Run via Diagnostics page (lists), Postman collection (docs/postman), or curl:
- Projects: list, create, update (Slack channel/Jira key), delete
- Tasks: list, create (title required, optional projectId), update, delete
- Goals: list, create, update, delete
- Notifications: list, mark read, delete
- Team: list, invite (owner/admin only), change role, remove

## 4) Stripe Webhook E2E
- CLI: `stripe listen --forward-to {{BASE_URL}}/api/webhooks/stripe`
- Trigger: `stripe trigger customer.subscription.created`
- Verify: /admin/diagnostics → "Health: Stripe (last webhook)" shows the new event with status processed.

## 5) UI Guard Rails
- Projects → Slack channel picker disabled when Slack not connected; shows link to Integrations.
- Admin schema banner visible only for owners/admins if schema-check fails; links to Diagnostics.

## 6) Postman
- Import docs/postman/TheGridHub.postman_collection.json and TheGridHub.postman_environment.json.
- Set base_url and cookie (copy Cookie header from your logged-in browser).

## 7) Troubleshooting
- If health schema fails, review missing tables/columns and run pending migrations.
- If integration tests fail, check status endpoints first; reauthorize integration if needed.
- For 401/403s on team routes, ensure your user has owner/admin role; otherwise expected.


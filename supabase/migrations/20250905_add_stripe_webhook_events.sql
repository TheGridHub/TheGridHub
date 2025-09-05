-- Migration: Add stripe_webhook_events table for idempotent Stripe webhook processing
-- This table stores a record of every received Stripe webhook event ID to
-- prevent duplicate processing. Service role bypasses RLS; we enable RLS here
-- and do not add any public policies so only the service role can access it.

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  type text,
  created_at timestamptz not null default now(),
  payload jsonb not null,
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received','processed','error')),
  error text
);

-- Ensure uniqueness across deliveries
create unique index if not exists stripe_webhook_events_event_id_key
  on public.stripe_webhook_events (event_id);

-- Lock the table via RLS; only service role (bypasses RLS) should write/read
alter table public.stripe_webhook_events enable row level security;


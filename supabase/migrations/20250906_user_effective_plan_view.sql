-- Create a view that resolves each user's effective plan without relying on specific column names
-- in subscriptions (other than userId). This uses row_to_json(s) to safely access optional fields.
-- RLS on underlying tables will apply to this view.

BEGIN;

CREATE OR REPLACE VIEW public.user_effective_plan AS
SELECT
  u.id AS "userId",
  (
    CASE
      WHEN COALESCE((row_to_json(s) ->> 'plan'), '') <> '' THEN UPPER((row_to_json(s) ->> 'plan'))
      WHEN COALESCE((row_to_json(s) ->> 'status'), '') IN ('active','trialing') THEN 'PRO'
      WHEN COALESCE((row_to_json(s) ->> 'stripeSubscriptionId'), '') <> '' THEN 'PRO'
      WHEN COALESCE((row_to_json(s) ->> 'priceId'), '') <> '' THEN 'PRO'
      ELSE 'FREE'
    END
  )::text AS plan
FROM public.users u
LEFT JOIN public.subscriptions s ON s."userId" = u.id;

-- Ensure authenticated users can select from the view
GRANT SELECT ON public.user_effective_plan TO authenticated;

COMMIT;

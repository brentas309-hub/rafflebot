-- 23 Jul 2026 — Security review session (run manually in dashboard; recorded here for repo parity)

-- Organisations: anon may read ONLY the four public Stripe-wiring columns
REVOKE SELECT ON public.organisations FROM anon;
GRANT SELECT (owner_user_id, stripe_account_id, default_currency, stripe_onboarding_complete)
  ON public.organisations TO anon;

-- Raffles: safety net for authenticated users (was missing live; dashboards relied on the public policy)
CREATE POLICY "Authenticated users can view all raffles"
  ON public.raffles FOR SELECT
  TO authenticated
  USING (true);

-- Raffles: drop old over-broad public read; hide drafts from anon
DROP POLICY "Enable read access for all users" ON public.raffles;
ALTER POLICY "Anon can read raffles with a public slug"
  ON public.raffles
  USING (slug IS NOT NULL AND length(trim(slug)) > 0 AND status <> 'draft');

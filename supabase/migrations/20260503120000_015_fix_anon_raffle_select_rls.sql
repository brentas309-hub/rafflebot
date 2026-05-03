/*
  # Fix anonymous (public) read access on raffles

  Problem
  - Policy "Anyone can view active raffles" (from migration 010) referenced a `status`
    column and values that often did not match real rows (e.g. draft raffles, invalid 'active').
  - Some deployed databases do not have a `status` column on `raffles` at all, so policies
    that reference it fail to apply.

  Fix
  - Drop the old policy if it still exists.
  - Allow role `anon` to SELECT rows that have a non-empty `slug` (public share link).
    No `status` predicate — works regardless of which lifecycle columns exist on `raffles`.
*/

DROP POLICY IF EXISTS "Anyone can view active raffles" ON raffles;

CREATE POLICY "Anon can read raffles with a public slug"
  ON raffles
  FOR SELECT
  TO anon
  USING (
    slug IS NOT NULL
    AND length(trim(slug)) > 0
  );

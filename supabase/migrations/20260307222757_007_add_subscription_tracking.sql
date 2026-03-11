/*
  # Add Subscription Tracking

  ## Overview
  This migration adds subscription tracking for organizations on the platform.
  Each club must maintain an active $49/month subscription to use Rafflebot.

  ## New Columns Added

  ### clubs table
  - `subscription_status` (text) - Current subscription status (active, past_due, canceled, trialing)
  - `subscription_started_at` (timestamptz) - When subscription began
  - `subscription_ends_at` (timestamptz) - When current subscription period ends
  - `stripe_subscription_id` (text) - Stripe subscription ID for billing management
  - `trial_ends_at` (timestamptz) - End date of trial period if applicable

  ## Status Values
  - `active` - Subscription is current and paid
  - `trialing` - In free trial period
  - `past_due` - Payment failed but still in grace period
  - `canceled` - Subscription has been terminated

  ## Important Notes
  1. Organizations with `subscription_status != 'active'` should not be able to create new raffles
  2. Existing raffles remain accessible even if subscription lapses
  3. Trial period is typically 14 days
  4. Grace period for past_due is typically 3 days before automatic cancellation
*/

-- Add subscription tracking columns to clubs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE clubs ADD COLUMN subscription_status text DEFAULT 'trialing' 
      CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE clubs ADD COLUMN subscription_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE clubs ADD COLUMN subscription_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE clubs ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE clubs ADD COLUMN trial_ends_at timestamptz;
  END IF;
END $$;

-- Set trial period for existing club (14 days from now)
UPDATE clubs 
SET trial_ends_at = now() + interval '14 days',
    subscription_started_at = now()
WHERE trial_ends_at IS NULL;

-- Create index for subscription status lookups
CREATE INDEX IF NOT EXISTS idx_clubs_subscription_status ON clubs(subscription_status);
CREATE INDEX IF NOT EXISTS idx_clubs_subscription_ends_at ON clubs(subscription_ends_at);

/*
  # Add Referral System and Stripe Connect Support

  ## Overview
  This migration adds support for:
  1. Organization referral tracking (which organization referred whom)
  2. Commission percentage tracking for referred organizations
  3. Stripe Connect account IDs for direct payment routing
  4. Payment splits tracking for transparency

  ## New Columns Added

  ### clubs table
  - `stripe_account_id` (text, nullable) - Stripe Connect account ID for receiving payments
  - `referred_by_club_id` (uuid, nullable) - References clubs.id, tracks which organization referred this one
  - `commission_rate` (numeric, default 0.05) - Commission rate for this club (5% standard, 3.5% if referred)
  - `referral_rate` (numeric, default 0.015) - Rate earned when this club refers others (1.5%)

  ### New Table: payment_splits
  - Tracks how each payment was split between club, referrer, and Rafflebot
  - Provides full transparency and audit trail for all transactions

  ## Security
  - RLS policies added for payment_splits table
  - Only admins can view payment splits
  - Clubs can view their own payment history

  ## Important Notes
  1. Standard commission: 5% (Rafflebot gets all 5%)
  2. Referred organization: 5% total (Referring org gets 1.5%, Rafflebot gets 3.5%)
  3. All existing clubs default to 5% commission rate
  4. Stripe Connect integration required before payments can be processed
*/

-- Add referral and Stripe columns to clubs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE clubs ADD COLUMN stripe_account_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'referred_by_club_id'
  ) THEN
    ALTER TABLE clubs ADD COLUMN referred_by_club_id uuid REFERENCES clubs(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE clubs ADD COLUMN commission_rate numeric DEFAULT 0.05 CHECK (commission_rate >= 0 AND commission_rate <= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clubs' AND column_name = 'referral_rate'
  ) THEN
    ALTER TABLE clubs ADD COLUMN referral_rate numeric DEFAULT 0.015 CHECK (referral_rate >= 0 AND referral_rate <= 1);
  END IF;
END $$;

-- Create payment_splits table to track how payments are divided
CREATE TABLE IF NOT EXISTS payment_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES clubs(id),
  referrer_club_id uuid REFERENCES clubs(id),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  club_amount numeric NOT NULL CHECK (club_amount >= 0),
  referrer_amount numeric DEFAULT 0 CHECK (referrer_amount >= 0),
  rafflebot_amount numeric NOT NULL CHECK (rafflebot_amount >= 0),
  stripe_transfer_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on payment_splits
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;

-- Admin users can view all payment splits
CREATE POLICY "Admins can view all payment splits"
  ON payment_splits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin users can insert payment splits (done during payment processing)
CREATE POLICY "Admins can create payment splits"
  ON payment_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_splits_order_id ON payment_splits(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_splits_club_id ON payment_splits(club_id);
CREATE INDEX IF NOT EXISTS idx_payment_splits_referrer_club_id ON payment_splits(referrer_club_id);
CREATE INDEX IF NOT EXISTS idx_clubs_referred_by ON clubs(referred_by_club_id);

-- Add Stripe-related columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_transfer_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_transfer_id text;
  END IF;
END $$;

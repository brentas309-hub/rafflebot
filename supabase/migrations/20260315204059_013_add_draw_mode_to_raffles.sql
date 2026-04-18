/*
  # Add Draw Mode to Raffles

  ## Overview
  This migration adds draw mode functionality to raffles, allowing organizers to choose between:
  - "until_sold": Raffle automatically ends when all tickets are sold
  - "scheduled": Raffle ends at a specific date and time

  ## Changes

  1. New Columns
    - `draw_mode` (text, NOT NULL with default)
      - Determines how the raffle draw is triggered
      - Values: "until_sold" or "scheduled"
      - Default: "until_sold"

  2. Updates
    - Set default value for existing raffles to "until_sold"
    - Add check constraint to ensure only valid draw modes are used

  ## Notes
  - Existing raffles will default to "until_sold" mode
  - `draw_timestamp` remains nullable (only required when draw_mode = "scheduled")
  - `fundraising_goal` already exists in the table for goal tracking
*/

-- Add draw_mode column with default value
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS draw_mode text DEFAULT 'until_sold' NOT NULL;

-- Add check constraint for valid draw modes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'raffles_draw_mode_check'
  ) THEN
    ALTER TABLE raffles 
    ADD CONSTRAINT raffles_draw_mode_check 
    CHECK (draw_mode IN ('until_sold', 'scheduled'));
  END IF;
END $$;

-- Update any existing raffles with draw_timestamp to use scheduled mode
UPDATE raffles 
SET draw_mode = 'scheduled' 
WHERE draw_timestamp IS NOT NULL;

-- Create index for filtering by draw_mode
CREATE INDEX IF NOT EXISTS idx_raffles_draw_mode ON raffles(draw_mode);

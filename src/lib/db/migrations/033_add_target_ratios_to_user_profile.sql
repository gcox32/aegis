-- Add target_ratios column to user_profile table
-- This stores user-customizable target values for anthropomorphic ratios
-- Format: JSONB object mapping ratio label -> target value (e.g., {"Shoulder-to-Waist": 1.618})
ALTER TABLE public.user_profile 
  ADD COLUMN IF NOT EXISTS target_ratios JSONB;


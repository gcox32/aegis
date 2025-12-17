-- Add arm_length and leg_length columns to user_stats table
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS arm_length JSONB,
ADD COLUMN IF NOT EXISTS leg_length JSONB;


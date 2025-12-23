-- Remove unused projected_1rm_log and projected_1rm tables
-- These tables are no longer used since projected_1RM is stored directly
-- in workout_block_exercise_instance records

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view own projected 1RM log" ON train.projected_1rm_log;
DROP POLICY IF EXISTS "Users can view own projected 1RMs" ON train.projected_1rm;

-- Drop the projected_1rm table first (has foreign key to projected_1rm_log)
DROP TABLE IF EXISTS train.projected_1rm;

-- Drop the projected_1rm_log table
DROP TABLE IF EXISTS train.projected_1rm_log;


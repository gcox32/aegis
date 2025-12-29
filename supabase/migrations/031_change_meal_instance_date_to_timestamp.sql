-- Change meal_instance date column to timestamptz to capture time
-- This matches the pattern used for workout instances (migration 010)
ALTER TABLE fuel.meal_instance 
  ALTER COLUMN date TYPE timestamptz 
  USING date::timestamptz;

-- Remove NOT NULL constraint from meal_plan_instance_id to allow standalone meal instances
-- This matches the pattern where workout instances can exist without protocol instances
ALTER TABLE fuel.meal_instance 
  ALTER COLUMN meal_plan_instance_id DROP NOT NULL;


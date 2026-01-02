-- Remove legacy date column now that created_at is used for timing
ALTER TABLE train.workout_block_exercise_instance
DROP COLUMN IF EXISTS date;



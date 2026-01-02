-- Add created_at timestamp to workout_block_exercise_instance for ordering sets chronologically
-- Add column as nullable first
ALTER TABLE train.workout_block_exercise_instance 
ADD COLUMN created_at timestamptz;

-- Set created_at to date for existing records (best approximation we have)
UPDATE train.workout_block_exercise_instance 
SET created_at = date;

-- Now make it NOT NULL with default
ALTER TABLE train.workout_block_exercise_instance 
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN created_at SET DEFAULT now();

-- Create index for efficient ordering
CREATE INDEX idx_workout_block_exercise_instance_created_at 
ON train.workout_block_exercise_instance(created_at);


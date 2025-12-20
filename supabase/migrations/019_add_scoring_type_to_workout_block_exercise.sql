ALTER TABLE "train"."workout_block_exercise" 
ADD COLUMN "scoring_type" text NOT NULL DEFAULT 'reps';

ALTER TABLE "train"."workout_block_exercise" 
ADD CONSTRAINT "workout_block_exercise_scoring_type_check" 
CHECK ("scoring_type" IN ('reps', 'load', 'dist', 'cals', 'time'));

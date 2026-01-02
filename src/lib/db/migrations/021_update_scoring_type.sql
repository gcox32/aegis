ALTER TABLE "train"."workout_block_exercise" 
DROP CONSTRAINT "workout_block_exercise_scoring_type_check";

ALTER TABLE "train"."workout_block_exercise" 
ALTER COLUMN "scoring_type" DROP NOT NULL;

ALTER TABLE "train"."workout_block_exercise" 
ALTER COLUMN "scoring_type" DROP DEFAULT;

ALTER TABLE "train"."workout_block_exercise" 
ADD CONSTRAINT "workout_block_exercise_scoring_type_check" 
CHECK ("scoring_type" IN ('reps', 'load', 'dist', 'cals', 'time', 'height', 'pace'));

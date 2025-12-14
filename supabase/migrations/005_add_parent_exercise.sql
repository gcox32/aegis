ALTER TABLE "train"."exercise" ADD COLUMN IF NOT EXISTS "parent_exercise_id" uuid REFERENCES "train"."exercise"("id");


-- Add 'hip band' to exercise equipment check constraint
ALTER TABLE "train"."exercise" DROP CONSTRAINT IF EXISTS "exercise_equipment_check";

ALTER TABLE "train"."exercise" ADD CONSTRAINT "exercise_equipment_check" 
CHECK (equipment <@ ARRAY[
    'barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'variable',
    'cable', 'band', 'medicine ball', 'sled', 'sandbag', 'wheel', 'jump rope',
    'pullup bar', 'rack', 'box', 'swiss ball', 'foam roller', 'bench', 'landmine',
    'hip band', 'other'
]::text[]);

-- Add 'recovery' and 'mobility' to workout type check constraint
ALTER TABLE "train"."workout" DROP CONSTRAINT IF EXISTS "workout_workout_type_check";

ALTER TABLE "train"."workout" ADD CONSTRAINT "workout_workout_type_check" 
CHECK (workout_type IN ('strength', 'hypertrophy', 'endurance', 'power', 'skill', 'recovery', 'mobility', 'other'));

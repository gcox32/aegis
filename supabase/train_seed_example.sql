-- Seed example train data:
-- - 1 Protocol
-- - 1 Workout
-- - 2 Workout Blocks
-- - 4 Exercises
-- - Each block has 2 Workout Block Exercises
--
-- HOW TO USE:
-- - Adjust the user selection in the "u" CTE if needed
-- - Run this whole script in the Supabase SQL editor
-- - It will create one cohesive, linked set of training records

WITH u AS (
  -- Pick a user for the workout to belong to.
  -- You can change this to filter by your own email, e.g.:
  -- SELECT id AS user_id FROM public.user WHERE email = 'you@example.com' LIMIT 1;
  SELECT id AS user_id
  FROM public."user"
  ORDER BY created_at
  LIMIT 1
),

-- 1) Protocol
p AS (
  INSERT INTO train.protocol (
    name,
    objectives,
    description,
    duration,
    days_per_week,
    includes_2a_days,
    notes
  )
  VALUES (
    'Demo Strength Protocol',
    ARRAY['Build full-body strength', 'Practice main barbell lifts'],
    'Example protocol seeded for UI development.',
    '{"value": 4, "unit": "weeks"}'::jsonb,
    3,
    FALSE,
    'Seeded via supabase/train_seed_example.sql'
  )
  RETURNING id AS protocol_id
),

-- 2) Workout belonging to that user
w AS (
  INSERT INTO train.workout (
    user_id,
    workout_type,
    name,
    objectives,
    description,
    estimated_duration
  )
  SELECT
    u.user_id,
    'strength',
    'Demo Full-Body Session',
    ARRAY['Squat', 'Push', 'Pull'],
    'A simple full-body strength workout for testing the Train UI.',
    50
  FROM u
  RETURNING id AS workout_id
),

-- 3) Junction: tie protocol -> workout
pw AS (
  INSERT INTO train.protocol_workout (protocol_id, workout_id, "order")
  SELECT p.protocol_id, w.workout_id, 1
  FROM p
  CROSS JOIN w
  RETURNING protocol_id, workout_id
),

-- 4) Exercises (4 total, generic muscle_groups and work_power_constants)
ex AS (
  INSERT INTO train.exercise (
    name,
    description,
    movement_pattern,
    muscle_groups,
    plane_of_motion,
    bilateral,
    equipment,
    image_url,
    video_url,
    work_power_constants,
    difficulty
  )
  VALUES
    (
      'Back Squat',
      'Barbell back squat',
      'squat',
      '{"primary": "quadriceps", "secondary": "glutes", "tertiary": null}'::jsonb,
      'sagittal',
      TRUE,
      'barbell',
      NULL,
      NULL,
      '{
        "useCalories": false,
        "defaultDistance": { "value": 0, "unit": "meters" },
        "armLengthFactor": 0,
        "legLengthFactor": 1,
        "bodyweightFactor": 0.7
      }'::jsonb,
      'intermediate'
    ),
    (
      'Bench Press',
      'Flat barbell bench press',
      'upper push',
      '{"primary": "chest", "secondary": "anterior delts", "tertiary": "triceps"}'::jsonb,
      'transverse',
      TRUE,
      'barbell',
      NULL,
      NULL,
      '{
        "useCalories": false,
        "defaultDistance": { "value": 0, "unit": "meters" },
        "armLengthFactor": 1,
        "legLengthFactor": 0,
        "bodyweightFactor": 0
      }'::jsonb,
      'intermediate'
    ),
    (
      'Deadlift',
      'Conventional barbell deadlift',
      'hinge',
      '{"primary": "hamstrings", "secondary": "lower back", "tertiary": "glutes"}'::jsonb,
      'sagittal',
      TRUE,
      'barbell',
      NULL,
      NULL,
      '{
        "useCalories": false,
        "defaultDistance": { "value": 0, "unit": "meters" },
        "armLengthFactor": 0,
        "legLengthFactor": 1,
        "bodyweightFactor": 0.5
      }'::jsonb,
      'intermediate'
    ),
    (
      'Pull-Up',
      'Bodyweight pull-up on a bar.',
      'upper pull',
      '{"primary": null, "secondary": null, "tertiary": null}'::jsonb,
      'frontal',
      TRUE,
      'bodyweight',
      NULL,
      NULL,
      '{
        "useCalories": false,
        "defaultDistance": { "value": 0, "unit": "meters" },
        "armLengthFactor": 0,
        "legLengthFactor": 0,
        "bodyweightFactor": 1
      }'::jsonb,
      'intermediate'
    )
  RETURNING id, name
),

-- 5) Two workout blocks under the workout
block_warmup AS (
  INSERT INTO train.workout_block (
    workout_id,
    workout_block_type,
    name,
    description,
    "order",
    circuit,
    estimated_duration
  )
  SELECT
    w.workout_id,
    'warm-up',
    'Warm-Up',
    'Light preparation for main work.',
    1,
    FALSE,
    10
  FROM w
  RETURNING id AS block_id
),

block_main AS (
  INSERT INTO train.workout_block (
    workout_id,
    workout_block_type,
    name,
    description,
    "order",
    circuit,
    estimated_duration
  )
  SELECT
    w.workout_id,
    'main',
    'Main Work',
    'Primary strength work',
    2,
    FALSE,
    40
  FROM w
  RETURNING id AS block_id
),

-- 6) Two workout block exercises per block (4 total)
wb_ex AS (
  -- Warm-up block: Back Squat + Bench Press
  INSERT INTO train.workout_block_exercise (
    workout_block_id,
    exercise_id,
    "order",
    sets,
    measures,
    tempo,
    rest_time,
    rpe,
    notes
  )
  SELECT
    bw.block_id,
    e.id,
    CASE e.name
      WHEN 'Back Squat' THEN 1
      WHEN 'Bench Press' THEN 2
    END AS "order",
    2 AS sets,
    CASE e.name
      WHEN 'Back Squat' THEN '{"reps": 5, "externalLoad": {"value": 60, "unit": "kg"}}'::jsonb
      WHEN 'Bench Press' THEN '{"reps": 8, "externalLoad": {"value": 40, "unit": "kg"}}'::jsonb
    END AS measures,
    NULL::jsonb AS tempo,
    60 AS rest_time,
    6 AS rpe,
    'Warm-up set' AS notes
  FROM block_warmup bw
  JOIN ex e ON e.name IN ('Back Squat', 'Bench Press')

  UNION ALL

  -- Main block: Deadlift + Pull-Up
  SELECT
    bm.block_id,
    e.id,
    CASE e.name
      WHEN 'Deadlift' THEN 1
      WHEN 'Pull-Up' THEN 2
    END AS "order",
    3 AS sets,
    CASE e.name
      WHEN 'Deadlift' THEN '{"reps": 5, "externalLoad": {"value": 80, "unit": "kg"}}'::jsonb
      WHEN 'Pull-Up' THEN '{"reps": 6, "includeBodyweight": true}'::jsonb
    END AS measures,
    NULL::jsonb AS tempo,
    90 AS rest_time,
    8 AS rpe,
    'Main work set' AS notes
  FROM block_main bm
  JOIN ex e ON e.name IN ('Deadlift', 'Pull-Up')
)

SELECT
  'Seeded demo protocol/workout with 2 blocks and 4 exercises' AS message,
  (SELECT COUNT(*) FROM train.protocol_workout WHERE protocol_id = (SELECT id FROM train.protocol ORDER BY created_at DESC LIMIT 1)) AS workouts_linked_to_protocol;



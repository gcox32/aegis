-- Quick fix: Link existing workout to existing protocol
-- Run this if you already have a protocol and workout but they're not linked

-- First, let's see what we have
SELECT 
  'Protocols:' AS info,
  COUNT(*) AS count
FROM train.protocol;

SELECT 
  'Workouts:' AS info,
  COUNT(*) AS count
FROM train.workout;

SELECT 
  'Protocol-Workout Links:' AS info,
  COUNT(*) AS count
FROM train.protocol_workout;

-- Link the most recent protocol to the most recent workout
-- (Adjust the WHERE clauses if you need to target specific records)
INSERT INTO train.protocol_workout (protocol_id, workout_id, "order")
SELECT 
  p.id AS protocol_id,
  w.id AS workout_id,
  1 AS "order"
FROM train.protocol p
CROSS JOIN train.workout w
WHERE NOT EXISTS (
  SELECT 1 
  FROM train.protocol_workout pw 
  WHERE pw.protocol_id = p.id AND pw.workout_id = w.id
)
ORDER BY p.created_at DESC, w.created_at DESC
LIMIT 1
ON CONFLICT (protocol_id, workout_id) DO NOTHING;

-- Verify the link was created
SELECT 
  'After fix - Protocol-Workout Links:' AS info,
  COUNT(*) AS count
FROM train.protocol_workout;

-- Show the linked data
SELECT 
  p.name AS protocol_name,
  w.name AS workout_name,
  pw."order"
FROM train.protocol_workout pw
JOIN train.protocol p ON p.id = pw.protocol_id
JOIN train.workout w ON w.id = pw.workout_id;


-- Add components JSONB field to user_goal table
-- This stores an array of UserGoalComponent objects that track quantifiable and trackable elements
-- of a goal, allowing better progress tracking

ALTER TABLE public.user_goal
ADD COLUMN IF NOT EXISTS components JSONB;

-- Add index for better query performance on components field
CREATE INDEX IF NOT EXISTS idx_user_goal_components ON public.user_goal USING GIN(components);


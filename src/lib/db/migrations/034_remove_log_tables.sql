-- Migration: Remove redundant *-log tables
-- This migration removes 5 log tables that serve no purpose beyond linking records to users

-- ============================================================================
-- 1. PERFORMANCE (Complete deletion - unused tables)
-- ============================================================================
DROP TABLE IF EXISTS train.performance;
DROP TABLE IF EXISTS train.performance_log;

-- ============================================================================
-- 2. WATER_INTAKE_LOG (Remove log, already has user_id)
-- ============================================================================

-- Drop FK and column
ALTER TABLE fuel.water_intake
  DROP CONSTRAINT IF EXISTS water_intake_water_intake_log_id_fkey,
  DROP COLUMN IF EXISTS water_intake_log_id;

-- Drop log table
DROP TABLE IF EXISTS fuel.water_intake_log;

-- ============================================================================
-- 3. SLEEP_LOG (Remove log, already has user_id)
-- ============================================================================

-- Drop FK and column
ALTER TABLE fuel.sleep_instance
  DROP CONSTRAINT IF EXISTS sleep_instance_sleep_log_id_fkey,
  DROP COLUMN IF EXISTS sleep_log_id;

-- Drop log table
DROP TABLE IF EXISTS fuel.sleep_log;

-- ============================================================================
-- 4. USER_IMAGE_LOG (Add user_id to user_image, remove log)
-- ============================================================================

-- Add user_id column
ALTER TABLE public.user_image
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Populate from log table (if there's data)
UPDATE public.user_image ui
  SET user_id = (
    SELECT uil.user_id
    FROM public.user_image_log uil
    WHERE uil.id = ui.image_log_id
  )
  WHERE ui.user_id IS NULL AND ui.image_log_id IS NOT NULL;

-- Make NOT NULL and add FK (if column exists and has data)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_image'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.user_image
      ALTER COLUMN user_id SET NOT NULL;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'user_image_user_id_fk'
    ) THEN
      ALTER TABLE public.user_image
        ADD CONSTRAINT user_image_user_id_fk
        FOREIGN KEY (user_id) REFERENCES public.user(id);
    END IF;
  END IF;
END $$;

-- Drop old column and log table
ALTER TABLE public.user_image DROP COLUMN IF EXISTS image_log_id;
DROP TABLE IF EXISTS public.user_image_log;

-- ============================================================================
-- 5. USER_STATS_LOG (Add user_id to user_stats, remove log)
-- ============================================================================

-- Add user_id column
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Populate with the single known user ID
UPDATE public.user_stats
  SET user_id = '41c7a93f-1d1c-4330-9067-12d64b06d2de'
  WHERE user_id IS NULL;

-- Make NOT NULL and add FK
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_stats'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.user_stats
      ALTER COLUMN user_id SET NOT NULL;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'user_stats_user_id_fk'
    ) THEN
      ALTER TABLE public.user_stats
        ADD CONSTRAINT user_stats_user_id_fk
        FOREIGN KEY (user_id) REFERENCES public.user(id);
    END IF;
  END IF;
END $$;

-- Drop old column and log table
ALTER TABLE public.user_stats DROP COLUMN IF EXISTS stats_log_id;
DROP TABLE IF EXISTS public.user_stats_log;

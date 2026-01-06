-- Add fuel_recommendations table
CREATE TABLE IF NOT EXISTS fuel.fuel_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    bmr NUMERIC,
    tdee NUMERIC,
    calorie_target NUMERIC,
    macros JSONB,
    micros JSONB,
    sleep_hours NUMERIC,
    water_intake JSONB,
    supplements JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fuel_recommendations_user_id ON fuel.fuel_recommendations(user_id);
CREATE UNIQUE INDEX idx_fuel_recommendations_user_id_unique ON fuel.fuel_recommendations(user_id);


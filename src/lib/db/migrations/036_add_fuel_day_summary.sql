-- Add fuel_day_summary table
CREATE TABLE IF NOT EXISTS fuel.fuel_day_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    fuel_recommendations_id UUID NOT NULL REFERENCES fuel.fuel_recommendations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories NUMERIC,
    macros JSONB,
    micros JSONB,
    sleep_hours NUMERIC,
    water_intake JSONB,
    supplements JSONB,
    notes TEXT
);

CREATE INDEX idx_fuel_day_summary_user_id ON fuel.fuel_day_summary(user_id);
CREATE INDEX idx_fuel_day_summary_date ON fuel.fuel_day_summary(date);
CREATE INDEX idx_fuel_day_summary_fuel_recommendations_id ON fuel.fuel_day_summary(fuel_recommendations_id);
CREATE UNIQUE INDEX idx_fuel_day_summary_user_date_unique ON fuel.fuel_day_summary(user_id, date);


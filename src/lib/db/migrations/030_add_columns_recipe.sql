ALTER TABLE fuel.recipe ADD COLUMN meal_id UUID REFERENCES fuel.meal(id) ON DELETE SET NULL;
ALTER TABLE fuel.recipe ADD COLUMN ingredients JSONB;
ALTER TABLE fuel.recipe ADD COLUMN calories NUMERIC;
ALTER TABLE fuel.recipe ADD COLUMN macros JSONB;
ALTER TABLE fuel.recipe ADD COLUMN micros JSONB;
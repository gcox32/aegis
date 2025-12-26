-- Drop existing food/fuel tables
DROP TABLE IF EXISTS fuel.portioned_food_instance CASCADE;
DROP TABLE IF EXISTS fuel.meal_instance CASCADE;
DROP TABLE IF EXISTS fuel.meal_plan_instance CASCADE;

DROP TABLE IF EXISTS fuel.grocery_list_item CASCADE;
DROP TABLE IF EXISTS fuel.grocery_list CASCADE;

DROP TABLE IF EXISTS fuel.recipe_ingredient CASCADE;
DROP TABLE IF EXISTS fuel.meal_recipe CASCADE;
DROP TABLE IF EXISTS fuel.recipe CASCADE;

DROP TABLE IF EXISTS fuel.meal_portion CASCADE;
DROP TABLE IF EXISTS fuel.portioned_food CASCADE;
DROP TABLE IF EXISTS fuel.meal CASCADE;
DROP TABLE IF EXISTS fuel.meal_plan CASCADE;
DROP TABLE IF EXISTS fuel.food CASCADE;

-- Recreate tables based on new schema

-- Food
CREATE TABLE fuel.food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    serving_size JSONB NOT NULL,
    calories NUMERIC,
    macros JSONB,
    micros JSONB,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_name ON fuel.food(name);

-- Meal Plan
CREATE TABLE fuel.meal_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_plan_user_id ON fuel.meal_plan(user_id);

-- Meal Week
CREATE TABLE fuel.meal_week (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES fuel.meal_plan(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    meal_ids TEXT[], -- Array of Meal UUIDs
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_week_meal_plan_id ON fuel.meal_week(meal_plan_id);

-- Meal
CREATE TABLE fuel.meal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES fuel.meal_plan(id) ON DELETE CASCADE, -- Can be null if standalone
    name TEXT NOT NULL,
    description TEXT,
    recipe_ids TEXT[], -- Array of Recipe UUIDs
    calories NUMERIC,
    macros JSONB,
    micros JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_meal_plan_id ON fuel.meal(meal_plan_id);

-- Recipe
CREATE TABLE fuel.recipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grocery List
CREATE TABLE fuel.grocery_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    meal_week_id UUID REFERENCES fuel.meal_week(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grocery_list_user_id ON fuel.grocery_list(user_id);
CREATE INDEX idx_grocery_list_meal_week_id ON fuel.grocery_list(meal_week_id);

-- Portioned Food (Unified table for ingredients in Meals, Recipes, and GroceryLists)
CREATE TABLE fuel.portioned_food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES fuel.food(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES fuel.meal(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES fuel.recipe(id) ON DELETE CASCADE,
    grocery_list_id UUID REFERENCES fuel.grocery_list(id) ON DELETE CASCADE,
    portion JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT portioned_food_parent_check CHECK (
        (meal_id IS NOT NULL AND recipe_id IS NULL AND grocery_list_id IS NULL) OR
        (meal_id IS NULL AND recipe_id IS NOT NULL AND grocery_list_id IS NULL) OR
        (meal_id IS NULL AND recipe_id IS NULL AND grocery_list_id IS NOT NULL)
    )
);

CREATE INDEX idx_portioned_food_food_id ON fuel.portioned_food(food_id);
CREATE INDEX idx_portioned_food_meal_id ON fuel.portioned_food(meal_id);
CREATE INDEX idx_portioned_food_recipe_id ON fuel.portioned_food(recipe_id);
CREATE INDEX idx_portioned_food_grocery_list_id ON fuel.portioned_food(grocery_list_id);

-- Instances

-- Meal Plan Instance
CREATE TABLE fuel.meal_plan_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_plan_id UUID NOT NULL REFERENCES fuel.meal_plan(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_meal_plan_instance_user_id ON fuel.meal_plan_instance(user_id);
CREATE INDEX idx_meal_plan_instance_meal_plan_id ON fuel.meal_plan_instance(meal_plan_id);

-- Meal Instance
CREATE TABLE fuel.meal_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_plan_instance_id UUID NOT NULL REFERENCES fuel.meal_plan_instance(id) ON DELETE CASCADE,
    meal_id UUID NOT NULL REFERENCES fuel.meal(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    timestamp TIMESTAMPTZ,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    calories NUMERIC,
    macros JSONB,
    micros JSONB,
    notes TEXT
);

CREATE INDEX idx_meal_instance_user_id ON fuel.meal_instance(user_id);
CREATE INDEX idx_meal_instance_meal_plan_instance_id ON fuel.meal_instance(meal_plan_instance_id);
CREATE INDEX idx_meal_instance_meal_id ON fuel.meal_instance(meal_id);
CREATE INDEX idx_meal_instance_date ON fuel.meal_instance(user_id, date);

-- Portioned Food Instance
CREATE TABLE fuel.portioned_food_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    meal_instance_id UUID NOT NULL REFERENCES fuel.meal_instance(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES fuel.food(id) ON DELETE CASCADE,
    portion JSONB NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX idx_portioned_food_instance_user_id ON fuel.portioned_food_instance(user_id);
CREATE INDEX idx_portioned_food_instance_meal_instance_id ON fuel.portioned_food_instance(meal_instance_id);
CREATE INDEX idx_portioned_food_instance_food_id ON fuel.portioned_food_instance(food_id);


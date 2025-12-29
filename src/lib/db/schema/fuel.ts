import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  jsonb,
  timestamp,
  pgSchema,
  unique,
  numeric,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';

export const fuelSchema = pgSchema('fuel');

// Prescribed Elements
export const mealPlan = fuelSchema.table('meal_plan', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mealWeek = fuelSchema.table('meal_week', {
  id: uuid('id').defaultRandom().primaryKey(),
  mealPlanId: uuid('meal_plan_id').notNull().references(() => mealPlan.id),
  weekNumber: integer('week_number').notNull(),
  mealIds: text('meal_ids').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const meal = fuelSchema.table('meal', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  mealPlanId: uuid('meal_plan_id').references(() => mealPlan.id),
  name: text('name').notNull(),
  description: text('description'),
  calories: numeric('calories'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const food = fuelSchema.table('food', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  servingSize: jsonb('serving_size').notNull(),
  calories: numeric('calories'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const recipe = fuelSchema.table('recipe', {
  id: uuid('id').defaultRandom().primaryKey(),
  mealId: uuid('meal_id').references(() => meal.id),
  name: text('name').notNull(),
  text: text('text').notNull(),
  imageUrl: text('image_url'),
  ingredients: jsonb('ingredients'),
  calories: numeric('calories'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const groceryList = fuelSchema.table('grocery_list', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  description: text('description'),
  mealWeekId: uuid('meal_week_id').references(() => mealWeek.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const portionedFood = fuelSchema.table('portioned_food', {
  id: uuid('id').defaultRandom().primaryKey(),
  foodId: uuid('food_id').notNull().references(() => food.id),
  mealId: uuid('meal_id').references(() => meal.id),
  recipeId: uuid('recipe_id').references(() => recipe.id),
  groceryListId: uuid('grocery_list_id').references(() => groceryList.id),
  portion: jsonb('portion').notNull(),
  calories: numeric('calories'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Instances
export const mealPlanInstance = fuelSchema.table('meal_plan_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  mealPlanId: uuid('meal_plan_id').notNull().references(() => mealPlan.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  complete: boolean('complete').notNull().default(false),
  notes: text('notes'),
});

export const mealInstance = fuelSchema.table('meal_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  mealPlanInstanceId: uuid('meal_plan_instance_id')
    .references(() => mealPlanInstance.id),
  mealId: uuid('meal_id').notNull().references(() => meal.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }),
  complete: boolean('complete').notNull().default(false),
  calories: numeric('calories'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  notes: text('notes'),
});

export const portionedFoodInstance = fuelSchema.table('portioned_food_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  mealInstanceId: uuid('meal_instance_id')
    .notNull()
    .references(() => mealInstance.id, { onDelete: 'cascade' }),
  foodId: uuid('food_id').notNull().references(() => food.id),
  portion: jsonb('portion').notNull(),
  calories: numeric('calories'),
  macros: jsonb('macros'),
  micros: jsonb('micros'),
  complete: boolean('complete').notNull().default(false),
  notes: text('notes'),
});

// Supplements
export const supplement = fuelSchema.table('supplement', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const supplementSchedule = fuelSchema.table('supplement_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  name: text('name').notNull(),
  scheduleType: text('schedule_type', {
    enum: [
      'hourly',
      'twice-daily',
      'every-other-day',
      'daily',
      'weekly',
      'bi-weekly',
      'monthly',
      'once',
      'other',
    ],
  }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const supplementInstance = fuelSchema.table('supplement_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  supplementScheduleId: uuid('supplement_schedule_id')
    .notNull()
    .references(() => supplementSchedule.id),
  supplementId: uuid('supplement_id').notNull().references(() => supplement.id),
  dosage: jsonb('dosage').notNull(),
  date: date('date').notNull(),
  complete: boolean('complete'),
  notes: text('notes'),
});

// Water & Sleep
export const waterIntakeLog = fuelSchema.table('water_intake_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const waterIntake = fuelSchema.table('water_intake', {
  id: uuid('id').defaultRandom().primaryKey(),
  waterIntakeLogId: uuid('water_intake_log_id').notNull().references(() => waterIntakeLog.id),
  userId: uuid('user_id').notNull().references(() => user.id),
  date: date('date').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }),
  amount: jsonb('amount').notNull(),
  notes: text('notes'),
});

export const sleepLog = fuelSchema.table('sleep_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => user.id),
});

export const sleepInstance = fuelSchema.table('sleep_instance', {
  id: uuid('id').defaultRandom().primaryKey(),
  sleepLogId: uuid('sleep_log_id').notNull().references(() => sleepLog.id),
  userId: uuid('user_id').notNull().references(() => user.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  timeAsleep: jsonb('time_asleep'),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  sleepScore: numeric('sleep_score'),
  wakeCount: integer('wake_count'),
  timeAwake: jsonb('time_awake'),
  notes: text('notes'),
});

// Relations
export const mealPlanRelations = relations(mealPlan, ({ one, many }) => ({
  user: one(user, {
    fields: [mealPlan.userId],
    references: [user.id],
  }),
  weeks: many(mealWeek),
  meals: many(meal), // If meals have mealPlanId
  instances: many(mealPlanInstance),
}));

export const mealWeekRelations = relations(mealWeek, ({ one, many }) => ({
  mealPlan: one(mealPlan, {
    fields: [mealWeek.mealPlanId],
    references: [mealPlan.id],
  }),
  groceryList: one(groceryList), // 1:1 or 1:M? GroceryList has mealWeekId.
}));

export const mealRelations = relations(meal, ({ one, many }) => ({
  mealPlan: one(mealPlan, {
    fields: [meal.mealPlanId],
    references: [mealPlan.id],
  }),
  foods: many(portionedFood), // foods that have mealId
  instances: many(mealInstance),
}));

export const foodRelations = relations(food, ({ many }) => ({
  portionedFoods: many(portionedFood),
  portionedFoodInstances: many(portionedFoodInstance),
}));

export const recipeRelations = relations(recipe, ({ many }) => ({
  ingredients: many(portionedFood), // foods that have recipeId
}));

export const groceryListRelations = relations(groceryList, ({ one, many }) => ({
  user: one(user, {
    fields: [groceryList.userId],
    references: [user.id],
  }),
  mealWeek: one(mealWeek, {
    fields: [groceryList.mealWeekId],
    references: [mealWeek.id],
  }),
  foods: many(portionedFood), // foods that have groceryListId
}));

export const portionedFoodRelations = relations(portionedFood, ({ one }) => ({
  food: one(food, {
    fields: [portionedFood.foodId],
    references: [food.id],
  }),
  meal: one(meal, {
    fields: [portionedFood.mealId],
    references: [meal.id],
  }),
  recipe: one(recipe, {
    fields: [portionedFood.recipeId],
    references: [recipe.id],
  }),
  groceryList: one(groceryList, {
    fields: [portionedFood.groceryListId],
    references: [groceryList.id],
  }),
}));

export const mealPlanInstanceRelations = relations(mealPlanInstance, ({ one, many }) => ({
  user: one(user, {
    fields: [mealPlanInstance.userId],
    references: [user.id],
  }),
  mealPlan: one(mealPlan, {
    fields: [mealPlanInstance.mealPlanId],
    references: [mealPlan.id],
  }),
  mealInstances: many(mealInstance),
}));

export const mealInstanceRelations = relations(mealInstance, ({ one, many }) => ({
  user: one(user, {
    fields: [mealInstance.userId],
    references: [user.id],
  }),
  mealPlanInstance: one(mealPlanInstance, {
    fields: [mealInstance.mealPlanInstanceId],
    references: [mealPlanInstance.id],
  }),
  meal: one(meal, {
    fields: [mealInstance.mealId],
    references: [meal.id],
  }),
  portionedFoodInstances: many(portionedFoodInstance),
}));

export const portionedFoodInstanceRelations = relations(portionedFoodInstance, ({ one }) => ({
  user: one(user, {
    fields: [portionedFoodInstance.userId],
    references: [user.id],
  }),
  mealInstance: one(mealInstance, {
    fields: [portionedFoodInstance.mealInstanceId],
    references: [mealInstance.id],
  }),
  food: one(food, {
    fields: [portionedFoodInstance.foodId],
    references: [food.id],
  }),
}));

export const supplementRelations = relations(supplement, ({ many }) => ({
  instances: many(supplementInstance),
}));

export const supplementScheduleRelations = relations(supplementSchedule, ({ one, many }) => ({
  user: one(user, {
    fields: [supplementSchedule.userId],
    references: [user.id],
  }),
  instances: many(supplementInstance),
}));

export const supplementInstanceRelations = relations(supplementInstance, ({ one }) => ({
  user: one(user, {
    fields: [supplementInstance.userId],
    references: [user.id],
  }),
  supplementSchedule: one(supplementSchedule, {
    fields: [supplementInstance.supplementScheduleId],
    references: [supplementSchedule.id],
  }),
  supplement: one(supplement, {
    fields: [supplementInstance.supplementId],
    references: [supplement.id],
  }),
}));

export const waterIntakeLogRelations = relations(waterIntakeLog, ({ one, many }) => ({
  user: one(user, {
    fields: [waterIntakeLog.userId],
    references: [user.id],
  }),
  waterIntakes: many(waterIntake),
}));

export const waterIntakeRelations = relations(waterIntake, ({ one }) => ({
  waterIntakeLog: one(waterIntakeLog, {
    fields: [waterIntake.waterIntakeLogId],
    references: [waterIntakeLog.id],
  }),
  user: one(user, {
    fields: [waterIntake.userId],
    references: [user.id],
  }),
}));

export const sleepLogRelations = relations(sleepLog, ({ one, many }) => ({
  user: one(user, {
    fields: [sleepLog.userId],
    references: [user.id],
  }),
  sleepInstances: many(sleepInstance),
}));

export const sleepInstanceRelations = relations(sleepInstance, ({ one }) => ({
  sleepLog: one(sleepLog, {
    fields: [sleepInstance.sleepLogId],
    references: [sleepLog.id],
  }),
  user: one(user, {
    fields: [sleepInstance.userId],
    references: [user.id],
  }),
}));

import { eq, and, desc, sql, ilike, isNull, gte, lte } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '../index';
import {
  mealPlan,
  mealWeek,
  meal,
  food,
  portionedFood,
  recipe,
  groceryList,
  mealPlanInstance,
  mealInstance,
  portionedFoodInstance,
  supplement,
  supplementSchedule,
  supplementInstance,
  waterIntake,
  sleepInstance,
  fuelRecommendations,
  fuelDaySummary,
} from '../schema';
import type {
  MealPlan,
  MealWeek,
  Meal,
  Food,
  PortionedFood,
  Recipe,
  GroceryList,
  MealPlanInstance,
  MealInstance,
  PortionedFoodInstance,
  Supplement,
  SupplementSchedule,
  SupplementInstance,
  WaterIntake,
  SleepInstance,
  FuelRecommendations,
  FuelDaySummary,
} from '@/types/fuel';

// Helper to convert null to undefined for optional fields
function nullToUndefined<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === null && key !== 'id') {
      (result as any)[key] = undefined;
    }
  }
  return result;
}

// ============================================================================
// MEAL PLAN CRUD
// ============================================================================

export async function createMealPlan(
  userId: string,
  mealPlanData: Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'weeks' | 'meals'>
): Promise<MealPlan> {
  const [newMealPlan] = await db
    .insert(mealPlan)
    .values({
      userId,
      name: mealPlanData.name,
      description: mealPlanData.description,
    })
    .returning();

  return newMealPlan as MealPlan;
}

export async function getUserMealPlans(userId: string): Promise<MealPlan[]> {
  const results = await db
    .select()
    .from(mealPlan)
    .where(eq(mealPlan.userId, userId))
    .orderBy(desc(mealPlan.createdAt));
  
  return results.map(nullToUndefined) as MealPlan[];
}

export async function getMealPlanById(
  mealPlanId: string,
  userId: string
): Promise<MealPlan | null> {
  const [found] = await db
    .select()
    .from(mealPlan)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)))
    .limit(1);

  return (found as MealPlan) || null;
}

export async function updateMealPlan(
  mealPlanId: string,
  userId: string,
  updates: Partial<Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'weeks' | 'meals'>>
): Promise<MealPlan | null> {
  const [updated] = await db
    .update(mealPlan)
    .set(updates)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)))
    .returning();

  return (updated as MealPlan) || null;
}

export async function deleteMealPlan(mealPlanId: string, userId: string): Promise<boolean> {
  // CASCADE will handle meals and weeks
  const result = await db
    .delete(mealPlan)
    .where(and(eq(mealPlan.id, mealPlanId), eq(mealPlan.userId, userId)));
  
  return true;
}

// ============================================================================
// MEAL WEEK CRUD
// ============================================================================

export async function createMealWeek(
  mealPlanId: string,
  weekData: Omit<MealWeek, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'meals' | 'groceryList'>
): Promise<MealWeek> {
  const [newWeek] = await db
    .insert(mealWeek)
    .values({
      mealPlanId,
      weekNumber: weekData.weekNumber,
    })
    .returning();

  return {
    ...newWeek,
    meals: [], // Hydrated separately
  } as MealWeek;
}

export async function getMealWeeks(mealPlanId: string): Promise<MealWeek[]> {
  const results = await db
    .select()
    .from(mealWeek)
    .where(eq(mealWeek.mealPlanId, mealPlanId))
    .orderBy(mealWeek.weekNumber);
  
  return results.map(r => ({
    ...nullToUndefined(r),
    meals: [], // Hydrated separately
  })) as MealWeek[];
}

// ============================================================================
// MEAL CRUD
// ============================================================================

export async function createMeal(
  userId: string,
  mealData: Omit<Meal, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'foods' | 'recipes'>
): Promise<Meal> {
  const [newMeal] = await db
    .insert(meal)
    .values({
      userId,
      name: mealData.name,
      description: mealData.description,
      calories: mealData.calories?.toString() || null,
      macros: mealData.macros,
      micros: mealData.micros,
    })
    .returning();

  return {
    ...newMeal,
    userId: userId,
    calories: newMeal.calories ? Number(newMeal.calories) : undefined,
  } as Meal;
}

export async function getMeals(
  userId: string,
  mealPlanId?: string | null,
  page: number = 1,
  limit: number = 20
): Promise<{ meals: Meal[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  let whereClause = eq(meal.userId, userId);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(meal)
    .where(whereClause);

  if (mealPlanId) {
    whereClause = and(whereClause, eq(meal.mealPlanId, mealPlanId)) as any as SQL<unknown>;
  } else {
    whereClause = and(whereClause, isNull(meal.mealPlanId)) as any as SQL<unknown>;
  }

  const results = await db
    .select()
    .from(meal)
    .where(whereClause)
    .orderBy(desc(meal.createdAt))
    .limit(limit)
    .offset(offset);
  
  return {
    meals: results.map((r) => ({
      ...nullToUndefined(r),
      calories: r.calories ? Number(r.calories) : undefined,
      userId: r.userId,
    })) as Meal[],
    total: Number(count),
    page,
    limit,
  };
}

export async function getMealById(mealId: string): Promise<Meal | null> {
  const [found] = await db
    .select()
    .from(meal)
    .where(eq(meal.id, mealId))
    .limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    calories: found.calories ? Number(found.calories) : undefined,
  } as Meal;
}

export async function searchMeals(query: string, page: number = 1, limit: number = 20): Promise<{ meals: Meal[]; total: number; page: number; limit: number }> {
  // Use simple ILIKE search for now
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(meal)
    .where(ilike(meal.name, `%${query}%`));

  const results = await db
    .select()
    .from(meal)
    .where(ilike(meal.name, `%${query}%`))
    .orderBy(meal.name)
    .limit(limit)
    .offset(offset);
  
  return {
    meals: results.map((r) => ({
      ...nullToUndefined(r),
      calories: r.calories ? Number(r.calories) : undefined,
    })) as Meal[],
    total: Number(count),
    page,
    limit,
  };
}

export async function updateMeal(
  mealId: string,
  updates: Partial<Omit<Meal, 'id' | 'mealPlanId' | 'createdAt' | 'updatedAt' | 'foods' | 'recipes'>>
): Promise<Meal | null> {
  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(meal)
    .set(dbUpdates)
    .where(eq(meal.id, mealId))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as Meal;
}

export async function deleteMeal(mealId: string): Promise<boolean> {
  await db.delete(meal).where(eq(meal.id, mealId));
  return true;
}

// ============================================================================
// FOOD CRUD
// ============================================================================

export async function createFood(
  foodData: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Food> {
  const [newFood] = await db
    .insert(food)
    .values({
      name: foodData.name,
      description: foodData.description,
      servingSize: foodData.servingSize,
      calories: foodData.calories?.toString() || null,
      macros: foodData.macros,
      micros: foodData.micros,
      imageUrl: foodData.imageUrl,
    })
    .returning();

  return {
    ...newFood,
    calories: newFood.calories ? Number(newFood.calories) : undefined,
  } as Food;
}

export async function getFoods(
  page: number = 1, 
  limit: number = 20
): Promise<{ foods: Food[]; total: number; page: number; limit: number }> {
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(food);

  const results = await db.select().from(food).orderBy(food.name).limit(limit).offset(offset);
  return {
    foods: results.map((r) => ({
      ...nullToUndefined(r),
      calories: r.calories ? Number(r.calories) : undefined,
    })) as Food[],
    total: Number(count),
    page,
    limit,
  };
}

export async function getFoodById(foodId: string): Promise<Food | null> {
  const [found] = await db.select().from(food).where(eq(food.id, foodId)).limit(1);

  if (!found) return null;

  return {
    ...nullToUndefined(found),
    calories: found.calories ? Number(found.calories) : undefined,
  } as Food;
}

export async function searchFoods(
  query: string, 
  page: number = 1, 
  limit: number = 20
): Promise<{ foods: Food[]; total: number; page: number; limit: number }> {
  // Use simple ILIKE search for now
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(food)
    .where(ilike(food.name, `%${query}%`));

  const results = await db
    .select()
    .from(food)
    // .where(ilike(food.name, `%${query}%`)) // Using simple eq for now as Drizzle might not have ilike imported
    // Actually, let's assume we can filter in JS if not using ilike helper
    .orderBy(food.name);

  return {
    foods: results
      .filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
      .map((r) => ({
        ...nullToUndefined(r),
        calories: r.calories ? Number(r.calories) : undefined,
      })) as Food[],
    total: Number(count),
    page,
    limit,
  };
}

export async function updateFood(
  foodId: string,
  updates: Partial<Omit<Food, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Food | null> {
  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(food)
    .set(dbUpdates)
    .where(eq(food.id, foodId))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as Food;
}

export async function deleteFood(foodId: string): Promise<boolean> {
  await db.delete(food).where(eq(food.id, foodId));
  return true;
}

// ============================================================================
// PORTIONED FOOD CRUD (Unified for Meal, Recipe, GroceryList)
// ============================================================================

export async function createPortionedFood(
  parentId: { mealId?: string; },
  portionedFoodData: PortionedFood
): Promise<PortionedFood> {
  const [newPortionedFood] = await db
    .insert(portionedFood)
    .values({
      foodId: portionedFoodData.foodId,
      mealId: parentId.mealId,
      portion: portionedFoodData.portion,
      calories: portionedFoodData.calories?.toString() || null,
      macros: portionedFoodData.macros,
      micros: portionedFoodData.micros,
    })
    .returning();

  return {
    ...newPortionedFood,
    calories: newPortionedFood.calories ? Number(newPortionedFood.calories) : undefined,
  } as PortionedFood;
}

export async function getPortionedFoods(
  parentId: { mealId?: string; recipeId?: string; groceryListId?: string }
): Promise<PortionedFood[]> {
  let whereClause;
  if (parentId.mealId) whereClause = eq(portionedFood.mealId, parentId.mealId);
  else if (parentId.recipeId) whereClause = eq(portionedFood.recipeId, parentId.recipeId);
  else if (parentId.groceryListId) whereClause = eq(portionedFood.groceryListId, parentId.groceryListId);
  else return [];

  const results = await db
    .select()
    .from(portionedFood)
    .where(whereClause);

  return results.map((r) => ({
    ...nullToUndefined(r),
    calories: r.calories ? Number(r.calories) : undefined,
  })) as PortionedFood[];
}

export async function updatePortionedFood(
  portionedFoodId: string,
  updates: Partial<Omit<PortionedFood, 'id' | 'foodId' | 'createdAt' | 'updatedAt'>>
): Promise<PortionedFood | null> {
  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(portionedFood)
    .set(dbUpdates)
    .where(eq(portionedFood.id, portionedFoodId))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as PortionedFood;
}

export async function deletePortionedFood(portionedFoodId: string): Promise<boolean> {
  await db.delete(portionedFood).where(eq(portionedFood.id, portionedFoodId));
  return true;
}

// ============================================================================
// RECIPE CRUD
// ============================================================================

export async function createRecipe(
  recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'ingredients'>
): Promise<Recipe> {
  const [newRecipe] = await db
    .insert(recipe)
    .values({
      name: recipeData.name,
      text: recipeData.text,
      imageUrl: recipeData.imageUrl,
    })
    .returning();

  return {
    ...newRecipe,
    calories: newRecipe.calories ? Number(newRecipe.calories) : undefined,
  } as Recipe;
}

export async function getRecipes(): Promise<Recipe[]> {
  const results = await db.select().from(recipe).orderBy(recipe.name);
  return results.map(r => ({
    ...nullToUndefined(r),
    ingredients: r.ingredients ? (r.ingredients as PortionedFood[]) : [],
    calories: r.calories ? Number(r.calories) : undefined,
  })) as Recipe[];
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const [found] = await db.select().from(recipe).where(eq(recipe.id, recipeId)).limit(1);
  if (!found) return null;
  return {
    ...nullToUndefined(found),
    ingredients: found.ingredients ? (found.ingredients as PortionedFood[]) : [],
    calories: found.calories ? Number(found.calories) : undefined,
  } as Recipe;
}

export async function updateRecipe(
  recipeId: string,
  updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'ingredients'>>
): Promise<Recipe | null> {
  const [updated] = await db
    .update(recipe)
    .set({
      ...updates,
      calories: updates.calories?.toString() || null,
      macros: updates.macros,
      micros: updates.micros,
    })
    .where(eq(recipe.id, recipeId))
    .returning();

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as Recipe;
}

// ============================================================================
// GROCERY LIST CRUD
// ============================================================================

export async function createGroceryList(
  userId: string,
  groceryListData: Omit<GroceryList, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'foods'>
): Promise<GroceryList> {
  const [newList] = await db
    .insert(groceryList)
    .values({
      userId,
      name: groceryListData.name,
      description: groceryListData.description,
      mealWeekId: groceryListData.mealWeekId,
    })
    .returning();

  return newList as GroceryList;
}

export async function getUserGroceryLists(userId: string): Promise<GroceryList[]> {
  const results = await db
    .select()
    .from(groceryList)
    .where(eq(groceryList.userId, userId))
    .orderBy(desc(groceryList.createdAt));
  
  return results.map(r => ({ ...nullToUndefined(r), foods: [] })) as GroceryList[];
}

export async function getGroceryListById(
  listId: string,
  userId: string
): Promise<GroceryList | null> {
  const [found] = await db
    .select()
    .from(groceryList)
    .where(and(eq(groceryList.id, listId), eq(groceryList.userId, userId)))
    .limit(1);

  return (found as GroceryList) || null;
}

export async function deleteGroceryList(listId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(groceryList)
    .where(and(eq(groceryList.id, listId), eq(groceryList.userId, userId)));
  
  return true;
}

// ============================================================================
// MEAL PLAN INSTANCE CRUD
// ============================================================================

export async function createMealPlanInstance(
  userId: string,
  instanceData: Omit<MealPlanInstance, 'id' | 'userId'>
): Promise<MealPlanInstance> {
  const [newInstance] = await db
    .insert(mealPlanInstance)
    .values({
      userId,
      mealPlanId: instanceData.mealPlanId,
      startDate: instanceData.startDate,
      endDate: instanceData.endDate ?? null,
      complete: instanceData.complete ?? false,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newInstance,
    startDate: new Date(newInstance.startDate),
    endDate: newInstance.endDate ? new Date(newInstance.endDate) : null,
  } as MealPlanInstance;
}

export async function getUserMealPlanInstances(userId: string): Promise<MealPlanInstance[]> {
  const results = await db
    .select()
    .from(mealPlanInstance)
    .where(eq(mealPlanInstance.userId, userId))
    .orderBy(desc(mealPlanInstance.startDate));
  
  return results.map((r) => ({
    ...r,
    startDate: new Date(r.startDate),
    endDate: r.endDate ? new Date(r.endDate) : null,
  })) as MealPlanInstance[];
}

export async function updateMealPlanInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<MealPlanInstance, 'id' | 'userId' | 'mealPlanId'>>
): Promise<MealPlanInstance | null> {
  const dbUpdates: any = { ...updates };
  
  const [updated] = await db
    .update(mealPlanInstance)
    .set(dbUpdates)
    .where(and(eq(mealPlanInstance.id, instanceId), eq(mealPlanInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    startDate: new Date(updated.startDate),
    endDate: updated.endDate ? new Date(updated.endDate) : null,
  } as MealPlanInstance;
}

export async function deleteMealPlanInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(mealPlanInstance)
    .where(and(eq(mealPlanInstance.id, instanceId), eq(mealPlanInstance.userId, userId)));

  return true;
}

// ============================================================================
// MEAL INSTANCE CRUD
// ============================================================================

export async function createMealInstance(
  userId: string,
  instanceData: Omit<MealInstance, 'id' | 'userId'>
): Promise<MealInstance> {
  // Convert date strings to Date objects if needed (from JSON parsing)
  // When Date objects are JSON.stringify'd, they become ISO strings (UTC)
  // We need to extract the date components to preserve the intended local date
  let dateValue: Date;
  if (instanceData.date instanceof Date) {
    dateValue = instanceData.date;
  } else if (typeof instanceData.date === 'string') {
    // Parse ISO string or date string
    // Extract YYYY-MM-DD part to avoid timezone shifts
    const dateStr = (instanceData.date as string).split('T')[0]; // Get YYYY-MM-DD part
    const [year, month, day] = dateStr.split('-').map(Number);
    // Create Date at midnight in local timezone to preserve the intended date
    dateValue = new Date(year, month - 1, day, 0, 0, 0, 0);
  } else {
    dateValue = instanceData.date;
  }
  
  // Convert timestamp to Date object if needed
  // When Date objects are JSON.stringify'd, they become ISO strings (UTC)
  // The ISO string represents the local time converted to UTC
  // We need to parse it and use it directly, as the database will handle timezone conversion
  let timestampValue: Date | null = null;
  if (instanceData.timestamp) {
    if (instanceData.timestamp instanceof Date) {
      timestampValue = instanceData.timestamp;
    } else if (typeof instanceData.timestamp === 'string') {
      // Parse ISO string - this will correctly represent the time
      // The database (timestamptz) will store it correctly
      const parsed = new Date(instanceData.timestamp);
      if (!isNaN(parsed.getTime())) {
        timestampValue = parsed;
      }
    }
  }

  const [newInstance] = await db
    .insert(mealInstance)
    .values({
      userId,
      mealPlanInstanceId: instanceData.mealPlanInstanceId ?? null,
      mealId: instanceData.mealId,
      date: dateValue,
      timestamp: timestampValue,
      complete: instanceData.complete ?? false,
      calories: instanceData.calories?.toString() || null,
      macros: instanceData.macros,
      micros: instanceData.micros,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return { 
    ...newInstance, 
    date: new Date(newInstance.date), 
    timestamp: newInstance.timestamp ? new Date(newInstance.timestamp) : null,
    calories: newInstance.calories ? Number(newInstance.calories) : undefined,
  } as MealInstance;
}

export async function getUserMealInstances(
  userId: string,
  options?: { mealPlanInstanceId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<MealInstance[]> {
  let whereClause = eq(mealInstance.userId, userId);
  
  if (options?.mealPlanInstanceId) {
    whereClause = and(
      eq(mealInstance.userId, userId),
      eq(mealInstance.mealPlanInstanceId, options.mealPlanInstanceId)
    ) as any;
  }

  const results = await db
    .select()
    .from(mealInstance)
    .where(whereClause)
    .orderBy(desc(mealInstance.date));

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    timestamp: r.timestamp ? new Date(r.timestamp) : null,
    calories: r.calories ? Number(r.calories) : undefined,
  })) as MealInstance[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((instance) => {
      const instanceDate = instance.date;
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function getUserMealInstanceById(
  instanceId: string,
  userId: string
): Promise<MealInstance | null> {
  const [found] = await db
    .select()
    .from(mealInstance)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    date: new Date(found.date),
    timestamp: found.timestamp ? new Date(found.timestamp) : null,
    calories: found.calories ? Number(found.calories) : undefined,
  } as MealInstance;
}

export async function updateMealInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<MealInstance, 'id' | 'userId' | 'mealPlanInstanceId' | 'mealId'>>
): Promise<MealInstance | null> {
  const dbUpdates: any = { ...updates };
  
  // Convert date to Date object (timestamptz) if provided
  // Date should be at midnight in local timezone
  // When Date objects are JSON.stringify'd, they become ISO strings (UTC)
  // We need to extract the date components to preserve the intended local date
  if (updates.date) {
    const dateInput = updates.date;
    let dateValue: Date;
    
    if (dateInput instanceof Date) {
      // If it's already a Date, use it directly
      dateValue = dateInput;
    } else if (typeof dateInput === 'string') {
      // Parse ISO string or date string
      // Extract YYYY-MM-DD part to avoid timezone shifts
      const dateStr = (dateInput as string).split('T')[0]; // Get YYYY-MM-DD part
      const [year, month, day] = dateStr.split('-').map(Number);
      // Create Date at midnight in local timezone to preserve the intended date
      dateValue = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      // Fallback: try to create Date from whatever it is
      try {
        const tempDate = new Date(dateInput);
        if (isNaN(tempDate.getTime())) {
          throw new Error('Invalid date');
        }
        // Extract date components to avoid timezone issues
        const year = tempDate.getFullYear();
        const month = tempDate.getMonth();
        const day = tempDate.getDate();
        dateValue = new Date(year, month, day, 0, 0, 0, 0);
      } catch {
        throw new Error(`Invalid date value: ${dateInput}`);
      }
    }
    
    dbUpdates.date = dateValue;
  }
  
  // Convert timestamp to Date if provided
  // When Date objects are JSON.stringify'd, they become ISO strings (UTC)
  // The ISO string represents the local time converted to UTC
  // We need to parse it and use it directly, as the database will handle timezone conversion
  if (updates.timestamp !== undefined) {
    if (updates.timestamp === null) {
      dbUpdates.timestamp = null;
    } else if (updates.timestamp instanceof Date) {
      dbUpdates.timestamp = updates.timestamp;
    } else if (typeof updates.timestamp === 'string') {
      // Parse ISO string - this will correctly represent the time
      // The database (timestamptz) will store it correctly
      const parsed = new Date(updates.timestamp);
      if (isNaN(parsed.getTime())) {
        dbUpdates.timestamp = null;
      } else {
        dbUpdates.timestamp = parsed;
      }
    } else {
      // Fallback: try to create Date from whatever it is
      try {
        const tempDate = new Date(updates.timestamp);
        if (isNaN(tempDate.getTime())) {
          dbUpdates.timestamp = null;
        } else {
          dbUpdates.timestamp = tempDate;
        }
      } catch {
        dbUpdates.timestamp = null;
      }
    }
  }
  
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }

  const [updated] = await db
    .update(mealInstance)
    .set(dbUpdates)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    date: updated.date instanceof Date ? updated.date : new Date(updated.date),
    timestamp: updated.timestamp ? (updated.timestamp instanceof Date ? updated.timestamp : new Date(updated.timestamp)) : null,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as MealInstance;
}

export async function deleteMealInstance(instanceId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(mealInstance)
    .where(and(eq(mealInstance.id, instanceId), eq(mealInstance.userId, userId)));

  return true;
}

// ============================================================================
// PORTIONED FOOD INSTANCE CRUD
// ============================================================================

export async function createPortionedFoodInstance(
  userId: string,
  instanceData: Omit<PortionedFoodInstance, 'id' | 'userId'>
): Promise<PortionedFoodInstance> {
  const [newInstance] = await db
    .insert(portionedFoodInstance)
    .values({
      userId,
      mealInstanceId: instanceData.mealInstanceId,
      foodId: instanceData.foodId,
      portion: instanceData.portion,
      calories: instanceData.calories?.toString() || null,
      macros: instanceData.macros,
      micros: instanceData.micros,
      complete: instanceData.complete ?? false,
      notes: instanceData.notes,
    })
    .returning();

  return {
    ...newInstance,
    calories: newInstance.calories ? Number(newInstance.calories) : undefined,
  } as PortionedFoodInstance;
}

export async function getPortionedFoodInstances(
  mealInstanceId: string
): Promise<PortionedFoodInstance[]> {
  const results = await db
    .select()
    .from(portionedFoodInstance)
    .where(eq(portionedFoodInstance.mealInstanceId, mealInstanceId));
  
  return results.map((r) => ({
    ...r,
    calories: r.calories ? Number(r.calories) : undefined,
  })) as PortionedFoodInstance[];
}

export async function updatePortionedFoodInstance(
  instanceId: string,
  userId: string,
  updates: Partial<
    Omit<PortionedFoodInstance, 'id' | 'userId' | 'mealInstanceId'>
  >
): Promise<PortionedFoodInstance | null> {
  const dbUpdates: any = { ...updates };
  
  // Convert calories to string if provided (database stores as numeric)
  if (dbUpdates.calories !== undefined) {
    dbUpdates.calories = dbUpdates.calories?.toString() || null;
  }
  
  const [updated] = await db
    .update(portionedFoodInstance)
    .set(dbUpdates)
    .where(
      and(eq(portionedFoodInstance.id, instanceId), eq(portionedFoodInstance.userId, userId))
    )
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    calories: updated.calories ? Number(updated.calories) : undefined,
  } as PortionedFoodInstance;
}

export async function deletePortionedFoodInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(portionedFoodInstance)
    .where(
      and(eq(portionedFoodInstance.id, instanceId), eq(portionedFoodInstance.userId, userId))
    );

  return true;
}

// ============================================================================
// SUPPLEMENT CRUD
// ============================================================================

export async function createSupplement(
  supplementData: Omit<Supplement, 'id'>
): Promise<Supplement> {
  const [newSupplement] = await db
    .insert(supplement)
    .values({
      name: supplementData.name,
      description: supplementData.description,
      imageUrl: supplementData.imageUrl,
    })
    .returning();

  return newSupplement as Supplement;
}

export async function getSupplements(): Promise<Supplement[]> {
  const results = await db.select().from(supplement).orderBy(supplement.name);
  return results.map(nullToUndefined) as Supplement[];
}

// ============================================================================
// SUPPLEMENT SCHEDULE CRUD
// ============================================================================

export async function createSupplementSchedule(
  userId: string,
  scheduleData: SupplementSchedule
): Promise<SupplementSchedule> {
  const [newSchedule] = await db
    .insert(supplementSchedule)
    .values({
      userId,
      name: scheduleData.name,
      scheduleType: scheduleData.scheduleType,
      description: scheduleData.description,
    })
    .returning();

  return {
    ...newSchedule,
    supplements: scheduleData.supplements,
  } as SupplementSchedule;
}

export async function getUserSupplementSchedules(userId: string): Promise<SupplementSchedule[]> {
  const results = await db
    .select()
    .from(supplementSchedule)
    .where(eq(supplementSchedule.userId, userId))
    .orderBy(desc(supplementSchedule.createdAt));
  
  return results.map((r) => ({
    ...nullToUndefined(r),
    supplements: [], // Supplements are loaded separately via supplement_instance junction table
  })) as SupplementSchedule[];
}

export async function createSupplementInstance(
  userId: string,
  instanceData: Omit<SupplementInstance, 'id' | 'userId'>
): Promise<SupplementInstance> {
  const [newInstance] = await db
    .insert(supplementInstance)
    .values({
      userId,
      supplementScheduleId: instanceData.supplementScheduleId,
      supplementId: instanceData.supplementId,
      dosage: instanceData.dosage,
      date: instanceData.date,
      complete: instanceData.complete ?? null,
      notes: instanceData.notes ?? null,
    } as any)
    .returning();

  return { ...newInstance, date: new Date(newInstance.date) } as SupplementInstance;
}

export async function getUserSupplementInstances(
  userId: string,
  options?: { supplementScheduleId?: string; dateFrom?: Date; dateTo?: Date }
): Promise<SupplementInstance[]> {
  let whereClause = eq(supplementInstance.userId, userId);
  
  if (options?.supplementScheduleId) {
    whereClause = and(
      eq(supplementInstance.userId, userId),
      eq(supplementInstance.supplementScheduleId, options.supplementScheduleId)
    ) as any;
  }

  const results = await db
    .select()
    .from(supplementInstance)
    .where(whereClause)
    .orderBy(desc(supplementInstance.date));

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
  })) as SupplementInstance[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((instance) => {
      const instanceDate = instance.date;
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function getSupplementInstanceById(
  instanceId: string,
  userId: string
): Promise<SupplementInstance | null> {
  const [found] = await db
    .select()
    .from(supplementInstance)
    .where(and(eq(supplementInstance.id, instanceId), eq(supplementInstance.userId, userId)))
    .limit(1);

  if (!found) return null;

  return { ...found, date: new Date(found.date) } as SupplementInstance;
}

export async function updateSupplementInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<SupplementInstance, 'id' | 'userId' | 'supplementScheduleId' | 'supplementId' | 'date'>>
): Promise<SupplementInstance | null> {
  const [updated] = await db
    .update(supplementInstance)
    .set(updates)
    .where(and(eq(supplementInstance.id, instanceId), eq(supplementInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return { ...updated, date: new Date(updated.date) } as SupplementInstance;
}

export async function deleteSupplementInstance(
  instanceId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(supplementInstance)
    .where(and(eq(supplementInstance.id, instanceId), eq(supplementInstance.userId, userId)));

  return true;
}

// ============================================================================
// WATER INTAKE CRUD
// ============================================================================

export async function createWaterIntake(
  userId: string,
  intakeData: Omit<WaterIntake, 'id' | 'userId'>
): Promise<WaterIntake> {
  const [newIntake] = await db
    .insert(waterIntake)
    .values({
      userId,
      date: intakeData.date,
      timestamp: intakeData.timestamp ?? null,
      amount: intakeData.amount,
      notes: intakeData.notes ?? null,
    } as any)
    .returning();

  return { ...newIntake, date: new Date(newIntake.date), timestamp: newIntake.timestamp ? new Date(newIntake.timestamp) : null } as WaterIntake;
}

export async function getUserWaterIntakes(
  userId: string,
  options?: { dateFrom?: Date; dateTo?: Date }
): Promise<WaterIntake[]> {
  const results = await db
    .select()
    .from(waterIntake)
    .where(eq(waterIntake.userId, userId))
    .orderBy(desc(waterIntake.date));

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    timestamp: r.timestamp ? new Date(r.timestamp) : null,
  })) as WaterIntake[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((intake) => {
      const intakeDate = intake.date;
      if (options.dateFrom && intakeDate < options.dateFrom) return false;
      if (options.dateTo && intakeDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function getWaterIntakeById(
  intakeId: string,
  userId: string
): Promise<WaterIntake | null> {
  const [found] = await db
    .select()
    .from(waterIntake)
    .where(and(eq(waterIntake.id, intakeId), eq(waterIntake.userId, userId)))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    date: new Date(found.date),
    timestamp: found.timestamp ? new Date(found.timestamp) : null,
  } as WaterIntake;
}

export async function updateWaterIntake(
  intakeId: string,
  userId: string,
  updates: Partial<Omit<WaterIntake, 'id' | 'userId' | 'date'>>
): Promise<WaterIntake | null> {
  const [updated] = await db
    .update(waterIntake)
    .set(updates)
    .where(and(eq(waterIntake.id, intakeId), eq(waterIntake.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    date: new Date(updated.date),
    timestamp: updated.timestamp ? new Date(updated.timestamp) : null,
  } as WaterIntake;
}

export async function deleteWaterIntake(
  intakeId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(waterIntake)
    .where(and(eq(waterIntake.id, intakeId), eq(waterIntake.userId, userId)));

  return true;
}

// ============================================================================
// SLEEP CRUD
// ============================================================================

export async function createSleepInstance(
  userId: string,
  sleepData: Omit<SleepInstance, 'id' | 'userId'>
): Promise<SleepInstance> {
  const [newSleep] = await db
    .insert(sleepInstance)
    .values({
      userId,
      date: sleepData.date,
      timeAsleep: sleepData.timeAsleep ?? null,
      startTime: sleepData.startTime ?? null,
      endTime: sleepData.endTime ?? null,
      sleepScore: sleepData.sleepScore?.toString() ?? null,
      wakeCount: sleepData.wakeCount ?? null,
      timeAwake: sleepData.timeAwake ?? null,
      notes: sleepData.notes ?? null,
    } as any)
    .returning();

  return {
    ...newSleep,
    date: new Date(newSleep.date),
    sleepScore: newSleep.sleepScore ? Number(newSleep.sleepScore) : undefined,
  } as unknown as SleepInstance;
}

export async function getUserSleepInstances(
  userId: string,
  options?: { dateFrom?: Date; dateTo?: Date }
): Promise<SleepInstance[]> {
  const results = await db
    .select()
    .from(sleepInstance)
    .where(eq(sleepInstance.userId, userId))
    .orderBy(desc(sleepInstance.date));

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    sleepScore: r.sleepScore ? Number(r.sleepScore) : undefined,
  })) as unknown as SleepInstance[];

  if (options?.dateFrom || options?.dateTo) {
    return converted.filter((instance) => {
      const instanceDate = instance.date;
      if (options.dateFrom && instanceDate < options.dateFrom) return false;
      if (options.dateTo && instanceDate > options.dateTo) return false;
      return true;
    });
  }

  return converted;
}

export async function getSleepInstanceById(
  instanceId: string,
  userId: string
): Promise<SleepInstance | null> {
  const [found] = await db
    .select()
    .from(sleepInstance)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    date: new Date(found.date),
    sleepScore: found.sleepScore ? Number(found.sleepScore) : undefined,
  } as unknown as SleepInstance;
}

export async function updateSleepInstance(
  instanceId: string,
  userId: string,
  updates: Partial<Omit<SleepInstance, 'id' | 'userId' | 'sleepLogId'>>
): Promise<SleepInstance | null> {
  const dbUpdates: any = { ...updates };
  if (updates.date) {
    dbUpdates.date = updates.date;
  }
  if (updates.sleepScore !== undefined) {
    dbUpdates.sleepScore = updates.sleepScore?.toString() ?? null;
  }
  
  const [updated] = await db
    .update(sleepInstance)
    .set(dbUpdates)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)))
    .returning();

  if (!updated) return null;

  return {
    ...updated,
    date: new Date(updated.date),
    sleepScore: updated.sleepScore ? Number(updated.sleepScore) : undefined,
  } as unknown as SleepInstance;
}

export async function deleteSleepInstance(instanceId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(sleepInstance)
    .where(and(eq(sleepInstance.id, instanceId), eq(sleepInstance.userId, userId)));

  return true;
}

// ============================================================================
// FUEL RECOMMENDATIONS CRUD
// ============================================================================

export async function getFuelRecommendations(userId: string): Promise<FuelRecommendations | null> {
  const [found] = await db
    .select()
    .from(fuelRecommendations)
    .where(eq(fuelRecommendations.userId, userId))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    bmr: found.bmr ? Number(found.bmr) : undefined,
    tdee: found.tdee ? Number(found.tdee) : undefined,
    calorieTarget: found.calorieTarget ? Number(found.calorieTarget) : undefined,
    sleepHours: found.sleepHours ? Number(found.sleepHours) : undefined,
    createdAt: new Date(found.createdAt),
    updatedAt: new Date(found.updatedAt),
  } as FuelRecommendations;
}

export async function createOrUpdateFuelRecommendations(
  userId: string,
  recommendationsData: Omit<FuelRecommendations, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<FuelRecommendations> {
  // Check if recommendations already exist
  const existing = await getFuelRecommendations(userId);

  const dbData: any = {
    bmr: recommendationsData.bmr?.toString() || null,
    tdee: recommendationsData.tdee?.toString() || null,
    calorieTarget: recommendationsData.calorieTarget?.toString() || null,
    macros: recommendationsData.macros || null,
    micros: recommendationsData.micros || null,
    sleepHours: recommendationsData.sleepHours?.toString() || null,
    waterIntake: recommendationsData.waterIntake || null,
    supplements: recommendationsData.supplements || null,
    notes: recommendationsData.notes || null,
  };

  if (existing) {
    // Update existing
    const [updated] = await db
      .update(fuelRecommendations)
      .set({
        ...dbData,
        updatedAt: new Date(),
      })
      .where(eq(fuelRecommendations.userId, userId))
      .returning();

    return {
      ...updated,
      bmr: updated.bmr ? Number(updated.bmr) : undefined,
      tdee: updated.tdee ? Number(updated.tdee) : undefined,
      calorieTarget: updated.calorieTarget ? Number(updated.calorieTarget) : undefined,
      sleepHours: updated.sleepHours ? Number(updated.sleepHours) : undefined,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    } as FuelRecommendations;
  } else {
    // Create new
    const [created] = await db
      .insert(fuelRecommendations)
      .values({
        userId,
        ...dbData,
      })
      .returning();

    return {
      ...created,
      bmr: created.bmr ? Number(created.bmr) : undefined,
      tdee: created.tdee ? Number(created.tdee) : undefined,
      calorieTarget: created.calorieTarget ? Number(created.calorieTarget) : undefined,
      sleepHours: created.sleepHours ? Number(created.sleepHours) : undefined,
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt),
    } as FuelRecommendations;
  }
}

// ============================================================================
// FUEL DAY SUMMARY CRUD
// ============================================================================

const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function getFuelDaySummary(
  userId: string,
  date: Date
): Promise<FuelDaySummary | null> {
  const dateStr = formatDateForDB(date);

  const [found] = await db
    .select()
    .from(fuelDaySummary)
    .where(and(eq(fuelDaySummary.userId, userId), eq(fuelDaySummary.date, dateStr)))
    .limit(1);

  if (!found) return null;

  return {
    ...found,
    date: new Date(found.date),
    calories: found.calories ? Number(found.calories) : undefined,
    sleepHours: found.sleepHours ? Number(found.sleepHours) : undefined,
  } as FuelDaySummary;
}

export async function getUserFuelDaySummaries(
  userId: string,
  options?: { dateFrom?: Date; dateTo?: Date }
): Promise<FuelDaySummary[]> {
  let whereClause: any = eq(fuelDaySummary.userId, userId);

  // Build date range filter at database level
  // Since date is stored as DATE type (YYYY-MM-DD string), we can use string comparison
  if (options?.dateFrom) {
    const dateFromStr = formatDateForDB(options.dateFrom);
    whereClause = and(whereClause, gte(fuelDaySummary.date, dateFromStr));
  }
  if (options?.dateTo) {
    const dateToStr = formatDateForDB(options.dateTo);
    whereClause = and(whereClause, lte(fuelDaySummary.date, dateToStr));
  }

  const results = await db
    .select()
    .from(fuelDaySummary)
    .where(whereClause)
    .orderBy(desc(fuelDaySummary.date));

  const converted = results.map((r) => ({
    ...r,
    date: new Date(r.date),
    calories: r.calories ? Number(r.calories) : undefined,
    sleepHours: r.sleepHours ? Number(r.sleepHours) : undefined,
  })) as FuelDaySummary[];

  return converted;
}

export async function getOrCreateFuelDaySummary(
  userId: string,
  date: Date
): Promise<FuelDaySummary> {
  const dateStr = formatDateForDB(date);

  // Get current fuel recommendations for the user
  const recommendations = await getFuelRecommendations(userId);
  if (!recommendations) {
    throw new Error('Fuel recommendations not found. Please update your stats or goals first.');
  }

  // Try to get existing summary
  const existing = await getFuelDaySummary(userId, date);

  if (existing) {
    return existing;
  }

  // Create new summary
  const [created] = await db
    .insert(fuelDaySummary)
    .values({
      userId,
      fuelRecommendationsId: recommendations.id,
      date: dateStr,
    } as any)
    .returning();

  return {
    ...created,
    date: new Date(created.date),
    calories: created.calories ? Number(created.calories) : undefined,
    sleepHours: created.sleepHours ? Number(created.sleepHours) : undefined,
  } as FuelDaySummary;
}

export async function updateFuelDaySummary(
  userId: string,
  date: Date,
  updates: Partial<Omit<FuelDaySummary, 'id' | 'userId' | 'fuelRecommendationsId' | 'date'>>
): Promise<FuelDaySummary> {
  const dateStr = formatDateForDB(date);

  const dbUpdates: any = { ...updates };
  if (updates.calories !== undefined) {
    dbUpdates.calories = updates.calories?.toString() || null;
  }
  if (updates.sleepHours !== undefined) {
    dbUpdates.sleepHours = updates.sleepHours?.toString() || null;
  }

  const [updated] = await db
    .update(fuelDaySummary)
    .set(dbUpdates)
    .where(and(eq(fuelDaySummary.userId, userId), eq(fuelDaySummary.date, dateStr)))
    .returning();

  if (!updated) {
    throw new Error('Fuel day summary not found');
  }

  return {
    ...updated,
    date: new Date(updated.date),
    calories: updated.calories ? Number(updated.calories) : undefined,
    sleepHours: updated.sleepHours ? Number(updated.sleepHours) : undefined,
  } as FuelDaySummary;
}

export async function createOrUpdateFuelDaySummary(
  userId: string,
  date: Date,
  updates: Partial<Omit<FuelDaySummary, 'id' | 'userId' | 'fuelRecommendationsId' | 'date'>>
): Promise<FuelDaySummary> {
  // Get or create the summary first
  await getOrCreateFuelDaySummary(userId, date);
  
  // Then update it
  return updateFuelDaySummary(userId, date, updates);
}

/**
 * Update fuel day summary from meal instances for a given date
 * This function sums up all calories and macros from meal instances for the date
 */
export async function updateFuelDaySummaryFromMealInstances(
  userId: string,
  date: Date
): Promise<FuelDaySummary> {
  // Get all meal instances for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const instances = await getUserMealInstances(userId, {
    dateFrom: startOfDay,
    dateTo: endOfDay,
  });

  // Sum up calories and macros
  let totalCalories = 0;
  let totalMacros: { protein?: number; carbs?: number; fat?: number } = {
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  let totalMicros: any = {};

  for (const instance of instances) {
    if (instance.calories) {
      totalCalories += instance.calories;
    }
    if (instance.macros) {
      totalMacros.protein = (totalMacros.protein || 0) + (instance.macros.protein || 0);
      totalMacros.carbs = (totalMacros.carbs || 0) + (instance.macros.carbs || 0);
      totalMacros.fat = (totalMacros.fat || 0) + (instance.macros.fat || 0);
    }
    if (instance.micros) {
      for (const key in instance.micros) {
        const k = key as keyof typeof instance.micros;
        if (instance.micros[k]) {
          totalMicros[k] = (totalMicros[k] || 0) + (instance.micros[k] || 0);
        }
      }
    }
  }

  // Round values
  totalCalories = Math.round(totalCalories);
  totalMacros.protein = Math.round(totalMacros.protein || 0);
  totalMacros.carbs = Math.round(totalMacros.carbs || 0);
  totalMacros.fat = Math.round(totalMacros.fat || 0);

  // Update the fuel day summary
  return createOrUpdateFuelDaySummary(userId, date, {
    calories: totalCalories || undefined,
    macros: totalMacros.protein || totalMacros.carbs || totalMacros.fat ? totalMacros : undefined,
    micros: Object.keys(totalMicros).length > 0 ? totalMicros : undefined,
  });
}

/**
 * Update fuel day summary sleep hours from sleep instances for a given date
 */
export async function updateFuelDaySummaryFromSleepInstances(
  userId: string,
  date: Date
): Promise<FuelDaySummary> {
  // Get all sleep instances for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const instances = await getUserSleepInstances(userId, {
    dateFrom: startOfDay,
    dateTo: endOfDay,
  });

  // Sum sleep hours from timeAsleep field
  let totalSleepHours = 0;
  for (const instance of instances) {
    if (instance.timeAsleep && typeof instance.timeAsleep === 'object' && 'value' in instance.timeAsleep) {
      const timeAsleep = instance.timeAsleep as { value: number; unit: string };
      if (timeAsleep.unit === 'hr' || timeAsleep.unit === 'hour' || timeAsleep.unit === 'hours') {
        totalSleepHours += timeAsleep.value;
      } else if (timeAsleep.unit === 'min' || timeAsleep.unit === 'minute' || timeAsleep.unit === 'minutes') {
        totalSleepHours += timeAsleep.value / 60;
      }
    }
  }

  // Round to 2 decimal places
  totalSleepHours = Math.round(totalSleepHours * 100) / 100;

  // Update the fuel day summary
  return createOrUpdateFuelDaySummary(userId, date, {
    sleepHours: totalSleepHours || undefined,
  });
}

/**
 * Update fuel day summary water intake from water intake instances for a given date
 */
export async function updateFuelDaySummaryFromWaterIntake(
  userId: string,
  date: Date
): Promise<FuelDaySummary> {
  // Get all water intake instances for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const intakes = await getUserWaterIntakes(userId, {
    dateFrom: startOfDay,
    dateTo: endOfDay,
  });

  // Sum water intake - convert all to a common unit (liters)
  let totalWaterLiters = 0;
  for (const intake of intakes) {
    if (intake.amount && typeof intake.amount === 'object' && 'value' in intake.amount && 'unit' in intake.amount) {
      const amount = intake.amount as { value: number; unit: string };
      const unit = amount.unit.toLowerCase();
      let liters = 0;
      
      if (unit === 'l' || unit === 'liter' || unit === 'liters') {
        liters = amount.value;
      } else if (unit === 'ml' || unit === 'milliliter' || unit === 'milliliters') {
        liters = amount.value / 1000;
      } else if (unit === 'fl oz' || unit === 'floz' || unit === 'fluid ounce' || unit === 'fluid ounces') {
        liters = amount.value * 0.0295735; // 1 fl oz = 0.0295735 L
      } else if (unit === 'cup' || unit === 'cups') {
        liters = amount.value * 0.236588; // 1 cup = 0.236588 L
      }
      
      totalWaterLiters += liters;
    }
  }

  // Round to 2 decimal places and convert back to liters
  totalWaterLiters = Math.round(totalWaterLiters * 100) / 100;

  // Update the fuel day summary with water intake in liters
  return createOrUpdateFuelDaySummary(userId, date, {
    waterIntake: totalWaterLiters > 0 ? { value: totalWaterLiters, unit: 'L' } : undefined,
  });
}

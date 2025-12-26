import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createMeal, getMeals } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params; // MEAL PLAN ID
    const meals = await getMeals(id);
    return meals;
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params; // MEAL PLAN ID
    const body = await parseBody(request);
    // Use the ID from the URL as the mealPlanId
    const newMeal = await createMeal(id, body);
    return newMeal;
  });
}


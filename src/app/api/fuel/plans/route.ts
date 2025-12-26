import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createMealPlan, getUserMealPlans } from '@/lib/db/crud/fuel';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const mealPlans = await getUserMealPlans(userId);
    return mealPlans;
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newMealPlan = await createMealPlan(userId, body);
    return newMealPlan;
  });
}


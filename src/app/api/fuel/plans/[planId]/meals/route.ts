import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody, getQueryParam  } from '@/lib/api/helpers';
import { createMeal, getMeals } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  return withAuth(async (userId) => {
    const { planId } = await params; // MEAL PLAN ID
    const pageParam = getQueryParam(request.url, 'page');
    const limitParam = getQueryParam(request.url, 'limit');
    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 20;
    const { meals, total } = await getMeals(userId, planId, page, limit);
    return NextResponse.json({ meals, total, page, limit });
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  return withAuth(async (userId) => {
    const { planId } = await params; // MEAL PLAN ID
    const body = await parseBody(request);
    // Use the ID from the URL as the mealPlanId
    const newMeal = await createMeal(planId, body);
    return newMeal;
  });
}


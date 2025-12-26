import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getMealPlanById, updateMealPlan, deleteMealPlan } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  return withAuth(async (userId) => {
    const { planId } = await params;
    const mealPlan = await getMealPlanById(planId, userId);
    if (!mealPlan) {
      throw { status: 404, message: 'Meal plan not found' };
    }
    return mealPlan;
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  return withAuth(async (userId) => {
    const { planId } = await params;
    const body = await parseBody(request);
    const updatedMealPlan = await updateMealPlan(planId, userId, body);

    if (!updatedMealPlan) {
      throw { status: 404, message: 'Meal plan not found' };
    }

    return updatedMealPlan;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  return withAuth(async (userId) => {
    const { planId } = await params;
    const success = await deleteMealPlan(planId, userId);

    if (!success) {
      throw { status: 404, message: 'Meal plan not found' };
    }

    return { success: true };
  });
}


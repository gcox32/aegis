import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateMealPlanInstance, deleteMealPlanInstance } from '@/lib/db/crud';

// PATCH /api/fuel/meal-plans/instances/[instanceId] - Update a meal plan instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const updates = await parseBody(request);
    const mealPlanInstance = await updateMealPlanInstance(instanceId, userId, updates);
    if (!mealPlanInstance) {
      return { error: 'Meal plan instance not found' };
    }
    return { mealPlanInstance };
  });
}

// DELETE /api/fuel/meal-plan-instances/[id] - Delete a meal plan instance (CASCADE deletes meal instances)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const deleted = await deleteMealPlanInstance(instanceId, userId);
    if (!deleted) {
      return { error: 'Meal plan instance not found' };
    }
    return { success: true };
  });
}


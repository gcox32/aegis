import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserGoalById, updateUserGoal, deleteUserGoal } from '@/lib/db/crud';
import { recalculateAndSaveFuelRecommendations } from '@/lib/fuel/recommendations';
import type { UserGoal } from '@/types/user';

// GET /api/user/goals/[id] - Get a specific goal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const goal = await getUserGoalById(id, userId);
    if (!goal) {
      return { error: 'Goal not found' };
    }
    return { goal };
  });
}

// Helper function to check if a goal has bodycomposition or bodyweight components
function hasFuelRelevantComponents(goal: UserGoal): boolean {
  if (!goal.components || goal.components.length === 0) return false;
  return goal.components.some(
    (component) => component.type === 'bodycomposition' || component.type === 'bodyweight'
  );
}

// PATCH /api/user/goals/[id] - Update a goal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);
    
    // Get the goal before update to check if it had fuel-relevant components
    const oldGoal = await getUserGoalById(id, userId);
    const goal = await updateUserGoal(id, userId, updates);
    
    if (!goal) {
      return { error: 'Goal not found' };
    }
    
    // Recalculate fuel recommendations if:
    // 1. The goal has fuel-relevant components now, OR
    // 2. The old goal had fuel-relevant components (in case components were removed)
    const shouldRecalculate = 
      hasFuelRelevantComponents(goal) || 
      (oldGoal && hasFuelRelevantComponents(oldGoal));
    
    if (shouldRecalculate) {
      recalculateAndSaveFuelRecommendations(userId).catch((error) => {
        console.error('Failed to recalculate fuel recommendations:', error);
      });
    }
    
    return { goal };
  });
}

// DELETE /api/user/goals/[id] - Delete a goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    // Get the goal before deletion to check if it had fuel-relevant components
    const goal = await getUserGoalById(id, userId);
    const deleted = await deleteUserGoal(id, userId);
    
    if (!deleted) {
      return { error: 'Goal not found' };
    }
    
    // Recalculate fuel recommendations if the deleted goal had fuel-relevant components
    if (goal && hasFuelRelevantComponents(goal)) {
      recalculateAndSaveFuelRecommendations(userId).catch((error) => {
        console.error('Failed to recalculate fuel recommendations:', error);
      });
    }
    
    return { success: true };
  });
}


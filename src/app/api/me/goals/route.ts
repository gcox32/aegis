import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import {
  getUserGoals,
  createUserGoal,

} from '@/lib/db/crud';
import { recalculateAndSaveFuelRecommendations } from '@/lib/fuel/recommendations';
import type { UserGoal } from '@/types/user';

// GET /api/user/goals - Get all user goals
export async function GET() {
  return withAuth(async (userId) => {
    const goals = await getUserGoals(userId);
    return { goals };
  });
}

// Helper function to check if a goal has bodycomposition or bodyweight components
function hasFuelRelevantComponents(goal: UserGoal): boolean {
  if (!goal.components || goal.components.length === 0) return false;
  return goal.components.some(
    (component) => component.type === 'bodycomposition' || component.type === 'bodyweight'
  );
}

// POST /api/user/goals - Create a new goal
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const goalData = await parseBody(request);
    const goal = await createUserGoal(userId, goalData);
    
    // Recalculate fuel recommendations if this goal has bodycomposition or bodyweight components
    if (goal && hasFuelRelevantComponents(goal)) {
      recalculateAndSaveFuelRecommendations(userId).catch((error) => {
        console.error('Failed to recalculate fuel recommendations:', error);
      });
    }
    
    return { goal };
  });
}


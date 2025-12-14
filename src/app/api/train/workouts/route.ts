import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getUserWorkouts, createFullWorkout } from '@/lib/db/crud/train';

// GET /api/train/workouts - Get user's workouts
export async function GET() {
  return withAuth(async (userId) => {
    const workouts = await getUserWorkouts(userId);
    return { workouts };
  });
}

// POST /api/train/workouts - Create a new workout with blocks and exercises
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const workoutData = await parseBody(request);
    // Ideally we would validate workoutData against CreateWorkoutInput schema here
    const workout = await createFullWorkout(userId, workoutData);
    return { workout };
  });
}

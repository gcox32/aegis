import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserWorkouts, createFullWorkout, searchWorkouts } from '@/lib/db/crud/train';

// GET /api/train/workouts - Get user's workouts
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const query = getQueryParam(request.url, 'q');
    const pageParam = getQueryParam(request.url, 'page');
    const limitParam = getQueryParam(request.url, 'limit');

    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 20;

    if (query) {
      const { workouts, total } = await searchWorkouts(userId, query, page, limit);
      return { workouts, total, page, limit };
    }

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

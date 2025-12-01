import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import {
  getWorkoutBlockExerciseInstances,
  createWorkoutBlockExerciseInstance,
} from '@/lib/db/crud';
import type { WorkoutBlockExerciseInstance } from '@/types/train';

// GET /api/train/workout-block-exercise-instances?workoutBlockInstanceId=...
export async function GET(request: NextRequest) {
  return withAuth(async () => {
    const workoutBlockInstanceId = getQueryParam(
      request.url,
      'workoutBlockInstanceId'
    );
    if (!workoutBlockInstanceId) {
      throw new Error('workoutBlockInstanceId is required');
    }

    const instances = await getWorkoutBlockExerciseInstances(
      workoutBlockInstanceId
    );
    return { instances };
  });
}

// POST /api/train/workout-block-exercise-instances
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const instanceData = await parseBody<
      Omit<WorkoutBlockExerciseInstance, 'id' | 'userId'>
    >(request);
    const instance = await createWorkoutBlockExerciseInstance(
      userId,
      instanceData
    );
    return { instance };
  });
}



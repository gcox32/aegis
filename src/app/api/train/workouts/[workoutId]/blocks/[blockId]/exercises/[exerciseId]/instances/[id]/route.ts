import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import {
  updateWorkoutBlockExerciseInstance,
  deleteWorkoutBlockExerciseInstance,
  isPersonalBest,
} from '@/lib/db/crud';
import type { WorkoutBlockExerciseInstance } from '@/types/train';
import { calculateProjected1RMFromMeasures } from '@/lib/stats/performance/projected-max';

// PATCH /api/train/workouts/[workoutId]/blocks/[blockId]/exercises/[exerciseId]/instances/[id] - Update an exercise instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; exerciseId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id, exerciseId } = await params;
    const updates = await parseBody<
      Partial<
        Omit<
          WorkoutBlockExerciseInstance,
          'id' | 'userId' | 'workoutBlockInstanceId' | 'workoutBlockExerciseId' | 'date'
        >
      >
    >(request);

    // Get the existing instance to retrieve workoutBlockExerciseId
    // The exerciseId param is actually the workoutBlockExerciseId
    const workoutBlockExerciseId = exerciseId;

    // If measures are being updated, recalculate projected 1RM
    let finalProjected1RM = updates.projected1RM;
    if (updates.measures) {
      const projected1RM = calculateProjected1RMFromMeasures(updates.measures);
      if (projected1RM) {
        finalProjected1RM = projected1RM;
        updates.projected1RM = projected1RM;
      } else {
        // If we can't calculate (missing reps/weight), clear the projected1RM
        // Use null to explicitly clear the value in the database
        finalProjected1RM = null as any;
        updates.projected1RM = null as any;
      }
    } else if (updates.projected1RM !== undefined) {
      // If projected1RM is being directly updated
      finalProjected1RM = updates.projected1RM;
    }

    // Recalculate personal best if measures or projected1RM are being updated
    if ((updates.measures || updates.projected1RM !== undefined) && finalProjected1RM) {
      const personalBest = await isPersonalBest(
        userId,
        workoutBlockExerciseId,
        finalProjected1RM,
        id // Exclude the current instance from comparison
      );
      updates.personalBest = personalBest;
    } else if (updates.measures && !finalProjected1RM) {
      // If measures are updated but we can't calculate projected1RM, clear personalBest
      updates.personalBest = false;
    }

    const updated = await updateWorkoutBlockExerciseInstance(id, userId, updates);
    if (!updated) {
      return { error: 'Workout block exercise instance not found' };
    }
    return { instance: updated };
  });
}

// DELETE /api/train/workouts/[workoutId]/blocks/[blockId]/exercises/[exerciseId]/instances/[id] - Delete an exercise instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string; blockId: string; exerciseId: string; id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const deleted = await deleteWorkoutBlockExerciseInstance(id, userId);
    if (!deleted) {
      return { error: 'Workout block exercise instance not found' };
    }
    return { success: true };
  });
}



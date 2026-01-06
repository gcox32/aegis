'use server';

import { getCurrentUser } from '@/lib/db/auth';
import { db } from '@/lib/db';
import {
  workoutInstance,
  workoutBlockInstance,
  workoutBlockExerciseInstance,
  workoutBlockExercise,
  exercise,
  protocolInstance,
  protocol,
  phase,
  phaseInstance,
  workout,
  userProfile,
  userProfileKeyExercise,
} from '@/lib/db/schema';
import { eq, and, desc, gte, sql, inArray } from 'drizzle-orm';
import { startOfWeek, subWeeks, subDays } from 'date-fns';
import type {
  WorkoutInstance,
  ProtocolInstance,
  Protocol,
  Phase,
  PhaseInstance,
  Workout,
  Exercise,
} from '@/types/train';
import type { MuscleGroupName } from '@/types/anatomy';

export interface WeekSummary {
  workoutsCompleted: number;
  totalVolume: number;
  volumeUnit: string;
}

export interface TrainingStreak {
  currentWeeks: number;
  isActiveThisWeek: boolean;
}

export interface RecentPR {
  exerciseId: string;
  exerciseName: string;
  reps: number;
  weight: { value: number; unit: string } | null;
  date: Date;
}

export interface MuscleGroupWork {
  name: MuscleGroupName;
  score: number; // Weighted score: primary=3, secondary=2, tertiary=1
  setCount: number;
}

export interface TrainPageData {
  inProgressInstance: (WorkoutInstance & { workout?: Workout }) | null;
  activeProtocolInstance: ProtocolInstance | null;
  activeProtocol: Protocol | null;
  activePhase: Phase | null;
  activePhaseInstance: PhaseInstance | null;
  phaseWorkouts: Workout[];
  weekSummary: WeekSummary;
  streak: TrainingStreak;
  recentPRs: RecentPR[];
  keyExercises: { id: string; name: string }[];
  muscleGroupWork: MuscleGroupWork[];
  lastWorkout: Workout | null;
  allWorkouts: Workout[];
}

export async function getTrainPageData(): Promise<TrainPageData | { error: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const thirtyDaysAgo = subDays(now, 30);

    // Parallel fetch all the data we need
    const [
      inProgressResult,
      activeProtocolResult,
      weekWorkoutsResult,
      allWorkoutsResult,
      streakData,
      userProfileResult,
      recentExerciseInstances,
    ] = await Promise.all([
      // 1. In-progress workout (incomplete, most recent)
      db.query.workoutInstance.findFirst({
        where: and(
          eq(workoutInstance.userId, user.id),
          eq(workoutInstance.complete, false)
        ),
        orderBy: desc(workoutInstance.date),
        with: { workout: true },
      }),

      // 2. Active protocol instance
      db.query.protocolInstance.findFirst({
        where: and(
          eq(protocolInstance.userId, user.id),
          eq(protocolInstance.active, true),
          eq(protocolInstance.complete, false)
        ),
        orderBy: desc(protocolInstance.startDate),
      }),

      // 3. This week's completed workouts for summary
      db.query.workoutInstance.findMany({
        where: and(
          eq(workoutInstance.userId, user.id),
          eq(workoutInstance.complete, true),
          gte(workoutInstance.date, weekStart)
        ),
      }),

      // 4. All user workouts (for autocomplete/repeat)
      db.query.workout.findMany({
        where: eq(workout.userId, user.id),
        orderBy: desc(workout.updatedAt),
      }),

      // 5. Streak calculation
      getStreakData(user.id),

      // 6. User profile
      db.query.userProfile.findFirst({
        where: eq(userProfile.userId, user.id),
        with: {
          keyExercises: true,
        },
      }),

      // 7. Recent exercise instances (last 30 days) for muscle group analysis
      db.query.workoutBlockExerciseInstance.findMany({
        where: and(
          eq(workoutBlockExerciseInstance.userId, user.id),
          gte(workoutBlockExerciseInstance.created_at, thirtyDaysAgo)
        ),
        with: {
          workoutBlockExercise: {
            with: {
              exercise: true,
            },
          },
        },
      }),
    ]);

    // Get key exercises details from the join table
    const keyExerciseJoins = userProfileResult?.keyExercises || [];
    const keyExerciseIds = keyExerciseJoins.map(ke => ke.exerciseId);
    let keyExercises: { id: string; name: string }[] = [];

    if (keyExerciseIds.length > 0) {
      const keyExerciseData = await db.query.exercise.findMany({
        where: inArray(exercise.id, keyExerciseIds),
      });
      keyExercises = keyExerciseData.map(e => ({ id: e.id, name: e.name }));
    }

    // Get PRs for key exercises only
    let recentPRs: RecentPR[] = [];
    if (keyExerciseIds.length > 0) {
      const keyExercisePRs = await db.query.workoutBlockExerciseInstance.findMany({
        where: and(
          eq(workoutBlockExerciseInstance.userId, user.id),
          eq(workoutBlockExerciseInstance.personalBest, true)
        ),
        orderBy: desc(workoutBlockExerciseInstance.created_at),
        limit: 50, // Fetch more to filter
        with: {
          workoutBlockExercise: {
            with: {
              exercise: true,
            },
          },
        },
      });

      recentPRs = keyExercisePRs
        .filter(pr => {
          const exerciseId = pr.workoutBlockExercise?.exercise?.id;
          return exerciseId && keyExerciseIds.includes(exerciseId) && pr.measures;
        })
        .map(pr => {
          const p1rm = pr.measures as { 
            externalLoad: { value: number; unit: string };
            reps: number;
          } | null;
          return {
            exerciseId: pr.workoutBlockExercise!.exercise!.id,
            exerciseName: pr.workoutBlockExercise!.exercise!.name,
            reps: p1rm?.reps || 0,
            weight: p1rm ? { value: p1rm.externalLoad.value, unit: p1rm.externalLoad.unit } : null,
            date: new Date(pr.created_at),
          };
        })
        .slice(0, 3);
    }

    // Calculate muscle group work from recent exercise instances
    const muscleGroupScores = new Map<MuscleGroupName, { score: number; sets: number }>();

    for (const inst of recentExerciseInstances) {
      const exerciseData = inst.workoutBlockExercise?.exercise;
      if (!exerciseData) continue;

      const muscleGroups = exerciseData.muscleGroups as {
        primary: string;
        secondary?: string;
        tertiary?: string
      } | null;

      if (!muscleGroups) continue;

      // Weight: primary=3, secondary=2, tertiary=1
      if (muscleGroups.primary) {
        const name = muscleGroups.primary as MuscleGroupName;
        const current = muscleGroupScores.get(name) || { score: 0, sets: 0 };
        muscleGroupScores.set(name, { score: current.score + 3, sets: current.sets + 1 });
      }
      if (muscleGroups.secondary) {
        const name = muscleGroups.secondary as MuscleGroupName;
        const current = muscleGroupScores.get(name) || { score: 0, sets: 0 };
        muscleGroupScores.set(name, { score: current.score + 2, sets: current.sets + 1 });
      }
      if (muscleGroups.tertiary) {
        const name = muscleGroups.tertiary as MuscleGroupName;
        const current = muscleGroupScores.get(name) || { score: 0, sets: 0 };
        muscleGroupScores.set(name, { score: current.score + 1, sets: current.sets + 1 });
      }
    }

    const muscleGroupWork: MuscleGroupWork[] = Array.from(muscleGroupScores.entries())
      .map(([name, data]) => ({ name, score: data.score, setCount: data.sets }))
      .sort((a, b) => b.score - a.score);

    // Process protocol data if active
    let activeProtocol: Protocol | null = null;
    let activePhase: Phase | null = null;
    let activePhaseInstance: PhaseInstance | null = null;
    let phaseWorkouts: Workout[] = [];

    if (activeProtocolResult) {
      // Get protocol details
      const protocolData = await db.query.protocol.findFirst({
        where: eq(protocol.id, activeProtocolResult.protocolId),
      });
      activeProtocol = protocolData ? formatProtocol(protocolData) : null;

      // Get phases and phase instances
      const [phases, phaseInstances] = await Promise.all([
        db.query.phase.findMany({
          where: eq(phase.protocolId, activeProtocolResult.protocolId),
          orderBy: phase.order,
        }),
        db.query.phaseInstance.findMany({
          where: eq(phaseInstance.protocolInstanceId, activeProtocolResult.id),
        }),
      ]);

      // Find active phase instance
      const formattedPhaseInstances = phaseInstances.map(formatPhaseInstance);
      activePhaseInstance = formattedPhaseInstances.find(pi => pi.active && !pi.complete)
        || formattedPhaseInstances[0]
        || null;

      if (activePhaseInstance) {
        const phaseData = phases.find(p => p.id === activePhaseInstance!.phaseId);
        activePhase = phaseData ? formatPhase(phaseData) : null;

        // Get workouts for the phase
        if (activePhase?.workoutIds?.length) {
          const workoutsData = await db.query.workout.findMany({
            where: sql`${workout.id} = ANY(${activePhase.workoutIds})`,
          });
          // Maintain order from workoutIds
          phaseWorkouts = activePhase.workoutIds
            .map(id => workoutsData.find(w => w.id === id))
            .filter((w): w is typeof workoutsData[0] => !!w)
            .map(formatWorkout);
        }
      }
    }

    // Calculate week summary
    const weekSummary: WeekSummary = {
      workoutsCompleted: weekWorkoutsResult.length,
      totalVolume: weekWorkoutsResult.reduce((sum, w) => {
        const vol = w.volume as { value: number; unit: string } | null;
        return sum + (vol?.value || 0);
      }, 0),
      volumeUnit: 'kg', // Default, could read from preferences
    };

    // Get last completed workout
    const lastCompletedInstance = await db.query.workoutInstance.findFirst({
      where: and(
        eq(workoutInstance.userId, user.id),
        eq(workoutInstance.complete, true)
      ),
      orderBy: desc(workoutInstance.date),
      with: { workout: true },
    });

    return {
      inProgressInstance: inProgressResult ? {
        ...formatWorkoutInstance(inProgressResult),
        workout: inProgressResult.workout ? formatWorkout(inProgressResult.workout) : undefined,
      } : null,
      activeProtocolInstance: activeProtocolResult ? formatProtocolInstance(activeProtocolResult) : null,
      activeProtocol,
      activePhase,
      activePhaseInstance: activePhaseInstance ? formatPhaseInstance(activePhaseInstance) : null,
      phaseWorkouts,
      weekSummary,
      streak: streakData,
      recentPRs,
      keyExercises,
      muscleGroupWork,
      lastWorkout: lastCompletedInstance?.workout ? formatWorkout(lastCompletedInstance.workout) : null,
      allWorkouts: allWorkoutsResult.map(formatWorkout),
    };
  } catch (error) {
    console.error('Error fetching train page data:', error);
    return { error: 'Failed to fetch training data' };
  }
}

async function getStreakData(userId: string): Promise<TrainingStreak> {
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });

  // Get all workout instances from the last 52 weeks
  const fiftyTwoWeeksAgo = subWeeks(currentWeekStart, 52);

  const instances = await db.query.workoutInstance.findMany({
    where: and(
      eq(workoutInstance.userId, userId),
      eq(workoutInstance.complete, true),
      gte(workoutInstance.date, fiftyTwoWeeksAgo)
    ),
    columns: { date: true },
  });

  // Group by week (using Monday as start)
  const weekSet = new Set<string>();
  instances.forEach(inst => {
    const weekStart = startOfWeek(new Date(inst.date), { weekStartsOn: 1 });
    weekSet.add(weekStart.toISOString().split('T')[0]);
  });

  // Check if trained this week
  const currentWeekKey = currentWeekStart.toISOString().split('T')[0];
  const isActiveThisWeek = weekSet.has(currentWeekKey);

  // Count consecutive weeks going backwards
  let streak = 0;
  let checkWeek = isActiveThisWeek ? currentWeekStart : subWeeks(currentWeekStart, 1);

  while (true) {
    const weekKey = checkWeek.toISOString().split('T')[0];
    if (weekSet.has(weekKey)) {
      streak++;
      checkWeek = subWeeks(checkWeek, 1);
    } else {
      break;
    }
    // Safety limit
    if (streak > 52) break;
  }

  return {
    currentWeeks: streak,
    isActiveThisWeek,
  };
}

// Format helpers
function formatProtocol(p: any): Protocol {
  return {
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

function formatPhase(p: any): Phase {
  return {
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

function formatWorkout(w: any): Workout {
  return {
    ...w,
    createdAt: new Date(w.createdAt),
    updatedAt: new Date(w.updatedAt),
  };
}

function formatWorkoutInstance(wi: any): WorkoutInstance {
  return {
    ...wi,
    date: new Date(wi.date),
  };
}

function formatProtocolInstance(pi: any): ProtocolInstance {
  return {
    ...pi,
    startDate: new Date(pi.startDate),
    endDate: pi.endDate ? new Date(pi.endDate) : null,
  };
}

function formatPhaseInstance(pi: any): PhaseInstance {
  return {
    ...pi,
    startDate: new Date(pi.startDate),
    endDate: pi.endDate ? new Date(pi.endDate) : null,
  };
}

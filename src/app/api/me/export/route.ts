import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { 
  userProfile, userPreferences, userSettings, userGoal, userStatsLog, userImageLog,
} from '@/lib/db/schema/user';
import { 
  workout, workoutInstance, protocolInstance,
} from '@/lib/db/schema/train';
import { 
  mealPlan, mealInstance, groceryList, waterIntakeLog, sleepLog,
  supplementSchedule,
} from '@/lib/db/schema/fuel';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = user.id;

  try {
    // Fetch all user data in parallel
    const [
      profile,
      preferences,
      settings,
      goals,
      stats,
      images,
      workouts,
      workoutHistory,
      protocolHistory,
      nutritionPlans,
      nutritionHistory,
      groceryLists,
      supplements,
      waterLog,
      sleepHistory,
    ] = await Promise.all([
      // 1. Profile & Settings
      db.query.userProfile.findFirst({ 
        where: eq(userProfile.userId, userId) 
      }),
      db.query.userPreferences.findFirst({ 
        where: eq(userPreferences.userId, userId) 
      }),
      db.query.userSettings.findFirst({ 
        where: eq(userSettings.userId, userId) 
      }),

      // 2. Goals
      db.query.userGoal.findMany({ 
        where: eq(userGoal.userId, userId),
        with: {
          components: {
            with: { criteria: true }
          }
        }
      }),

      // 3. Body Stats
      db.query.userStatsLog.findFirst({
        where: eq(userStatsLog.userId, userId),
        with: {
          stats: {
            with: { tapeMeasurement: true },
            orderBy: (stats, { desc }) => [desc(stats.date)]
          }
        }
      }),
      db.query.userImageLog.findFirst({
        where: eq(userImageLog.userId, userId),
        with: {
          images: {
            orderBy: (img, { desc }) => [desc(img.date)]
          }
        }
      }),

      // 4. Training - Created Content
      db.query.workout.findMany({
        where: eq(workout.userId, userId),
        with: {
          blocks: {
            with: { exercises: true }
          }
        }
      }),

      // 5. Training - History
      db.query.workoutInstance.findMany({
        where: eq(workoutInstance.userId, userId),
        with: {
          blockInstances: {
            with: { exerciseInstances: true }
          }
        },
        orderBy: (wi, { desc }) => [desc(wi.date)]
      }),
      db.query.protocolInstance.findMany({
        where: eq(protocolInstance.userId, userId),
        with: {
          phaseInstances: true
        }
      }),

      // 6. Nutrition - Plans
      db.query.mealPlan.findMany({
        where: eq(mealPlan.userId, userId),
        with: {
          meals: {
            with: {
              foods: true,
            }
          }
        }
      }),

      // 7. Nutrition - History
      db.query.mealInstance.findMany({
        where: eq(mealInstance.userId, userId),
        with: {
          portionedFoodInstances: true
        },
        orderBy: (mi, { desc }) => [desc(mi.date)]
      }),

      // 8. Grocery Lists
      db.query.groceryList.findMany({
        where: eq(groceryList.userId, userId),
        with: {
          foods: true
        }
      }),

      // 9. Supplements
      db.query.supplementSchedule.findMany({
        where: eq(supplementSchedule.userId, userId),
        with: {
          instances: true
        }
      }),

      // 10. Water & Sleep
      db.query.waterIntakeLog.findFirst({
        where: eq(waterIntakeLog.userId, userId),
        with: {
          waterIntakes: {
            orderBy: (wi, { desc }) => [desc(wi.date)]
          }
        }
      }),
      db.query.sleepLog.findFirst({
        where: eq(sleepLog.userId, userId),
        with: {
          sleepInstances: {
            orderBy: (si, { desc }) => [desc(si.date)]
          }
        }
      }),
    ]);

    const exportData = {
      meta: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        userId: userId,
      },
      profile,
      preferences,
      settings,
      goals,
      bodyStats: stats?.stats || [],
      bodyImages: images?.images || [],
      training: {
        workouts,
        history: workoutHistory,
        protocols: protocolHistory,
      },
      nutrition: {
        plans: nutritionPlans,
        history: nutritionHistory,
        groceryLists,
        supplements,
        water: waterLog?.waterIntakes || [],
        sleep: sleepHistory?.sleepInstances || [],
      }
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="aegis-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


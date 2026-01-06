import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getUserWaterIntakes, createWaterIntake } from '@/lib/db/crud';
import { updateFuelDaySummaryFromWaterIntake } from '@/lib/db/crud/fuel';

// GET /api/fuel/water-intake - Get user's water intake log
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const dateFrom = getQueryParam(request.url, 'dateFrom');
    const dateTo = getQueryParam(request.url, 'dateTo');

    const options: any = {};
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const waterIntakes = await getUserWaterIntakes(userId, options);
    return { waterIntakes };
  });
}

// POST /api/fuel/water-intake - Create a water intake entry
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const intakeData = await parseBody(request);
    const waterIntake = await createWaterIntake(userId, intakeData);
    
    // Update fuel day summary for the intake date
    const intakeDate = waterIntake.date instanceof Date 
      ? waterIntake.date 
      : new Date(waterIntake.date);
    
    updateFuelDaySummaryFromWaterIntake(userId, intakeDate).catch((error) => {
      console.error('Failed to update fuel day summary:', error);
    });
    
    return { waterIntake };
  });
}


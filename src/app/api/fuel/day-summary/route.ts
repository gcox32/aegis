import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam, parseDateParam } from '@/lib/api/helpers';
import { getFuelDaySummary, getUserFuelDaySummaries, createOrUpdateFuelDaySummary } from '@/lib/db/crud/fuel';
import { LiquidMeasurement } from '@/types/measures';

// GET /api/fuel/day-summary - Get fuel day summary(ies)
// Supports:
//   - Single date: ?date=YYYY-MM-DD
//   - Date range: ?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const dateParam = getQueryParam(request.url, 'date');
    const dateFromStr = getQueryParam(request.url, 'dateFrom');
    const dateToStr = getQueryParam(request.url, 'dateTo');

    // If date parameter is provided, return single summary
    if (dateParam) {
      const date = new Date(dateParam);
      const summary = await getFuelDaySummary(userId, date);
      return { summary };
    }

    // If dateFrom/dateTo are provided, return list of summaries
    if (dateFromStr || dateToStr) {
      const dateFrom = parseDateParam(dateFromStr);
      const dateTo = parseDateParam(dateToStr);
      
      const summaries = await getUserFuelDaySummaries(userId, {
        dateFrom,
        dateTo,
      });
      return { summaries };
    }

    // If no parameters, return error
    return { error: 'Either date parameter or dateFrom/dateTo parameters are required' };
  });
}

// POST /api/fuel/day-summary - Create or update fuel day summary
export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody<{
      date: string;
      calories?: number;
      macros?: { protein?: number; carbs?: number; fat?: number };
      micros?: any;
      sleepHours?: number;
      waterIntake?: { value: number; unit: string };
      supplements?: any[];
      notes?: string;
    }>(request);

    if (!body.date) {
      return { error: 'Date is required' };
    }

    const date = new Date(body.date);
    const summary = await createOrUpdateFuelDaySummary(userId, date, {
      calories: body.calories,
      macros: body.macros,
      micros: body.micros,
      sleepHours: body.sleepHours,
      waterIntake: body.waterIntake as LiquidMeasurement,
      supplements: body.supplements,
      notes: body.notes,
    });

    return { summary };
  });
}


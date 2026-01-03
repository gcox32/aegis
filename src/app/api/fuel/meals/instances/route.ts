import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam, parseDateParam } from '@/lib/api/helpers';
import { createMealInstance, getUserMealInstances } from '@/lib/db/crud/fuel';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const mealPlanInstanceId = getQueryParam(request.url, 'mealPlanInstanceId');
    const dateFromStr = getQueryParam(request.url, 'dateFrom');
    const dateToStr = getQueryParam(request.url, 'dateTo');
    
    // Parse and normalize dates to UTC midnight to avoid timezone conversion issues
    // When client sends midnight local time, it may arrive as 5am UTC, but we want to
    // compare against the actual date at UTC midnight
    const dateFrom = parseDateParam(dateFromStr);
    const dateTo = parseDateParam(dateToStr);
    
    const instances = await getUserMealInstances(userId, {
      mealPlanInstanceId: mealPlanInstanceId || undefined,
      dateFrom,
      dateTo,
    });
    return instances;
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newInstance = await createMealInstance(userId, body);
    return newInstance;
  });
}


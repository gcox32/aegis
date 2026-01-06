import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam, parseDateParam } from '@/lib/api/helpers';
import { createMealInstance, getUserMealInstances, updateFuelDaySummaryFromMealInstances } from '@/lib/db/crud/fuel';

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
    
    // Update fuel day summary for the instance date
    // Extract date from instance (handle both Date and string)
    const instanceDate = newInstance.date instanceof Date 
      ? newInstance.date 
      : new Date(newInstance.date);
    
    updateFuelDaySummaryFromMealInstances(userId, instanceDate).catch((error) => {
      console.error('Failed to update fuel day summary:', error);
    });
    
    return newInstance;
  });
}


import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { createMealInstance, getUserMealInstances } from '@/lib/db/crud/fuel';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const mealPlanInstanceId = getQueryParam(request.url, 'mealPlanInstanceId');
    const dateFromStr = getQueryParam(request.url, 'dateFrom');
    const dateToStr = getQueryParam(request.url, 'dateTo');
    const dateFrom = dateFromStr ? new Date(dateFromStr) : undefined;
    const dateTo = dateToStr ? new Date(dateToStr) : undefined;

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


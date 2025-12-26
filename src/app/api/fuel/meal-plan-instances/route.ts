import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createMealPlanInstance, getUserMealPlanInstances } from '@/lib/db/crud/fuel';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const instances = await getUserMealPlanInstances(userId);
    return instances;
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newInstance = await createMealPlanInstance(userId, body);
    return newInstance;
  });
}

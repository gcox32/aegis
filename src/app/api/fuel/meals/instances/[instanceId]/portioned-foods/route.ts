import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createPortionedFoodInstance, getPortionedFoodInstances } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const instances = await getPortionedFoodInstances(instanceId);
    return { portionedFoodInstances: instances };
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const body = await parseBody(request);
    
    const newInstance = await createPortionedFoodInstance(userId, {
      mealInstanceId: instanceId,
      foodId: body.foodId,
      portion: body.portion,
      calories: body.calories,
      macros: body.macros,
      micros: body.micros,
      complete: body.complete ?? false,
      notes: body.notes,
    });
    
    return newInstance;
  });
}


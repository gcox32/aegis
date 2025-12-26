import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateMealInstance, deleteMealInstance } from '@/lib/db/crud/fuel';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const body = await parseBody(request);
    const updatedInstance = await updateMealInstance(instanceId, userId, body);

    if (!updatedInstance) {
      throw { status: 404, message: 'Meal instance not found' };
    }

    return updatedInstance;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const success = await deleteMealInstance(instanceId, userId);

    if (!success) {
      throw { status: 404, message: 'Meal instance not found' };
    }

    return { success: true };
  });
}


import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updatePortionedFoodInstance, deletePortionedFoodInstance } from '@/lib/db/crud/fuel';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string; foodInstanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { foodInstanceId } = await params;
    const body = await parseBody(request);
    
    // Allow updating foodId, portion, and other fields for editing
    const updates: any = {};
    if (body.foodId !== undefined) updates.foodId = body.foodId;
    if (body.portion !== undefined) updates.portion = body.portion;
    if (body.calories !== undefined) updates.calories = body.calories;
    if (body.macros !== undefined) updates.macros = body.macros;
    if (body.micros !== undefined) updates.micros = body.micros;
    if (body.complete !== undefined) updates.complete = body.complete;
    if (body.notes !== undefined) updates.notes = body.notes;
    
    const updated = await updatePortionedFoodInstance(foodInstanceId, userId, updates);
    
    if (!updated) {
      throw { status: 404, message: 'Portioned food instance not found' };
    }
    
    return updated;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string; foodInstanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { foodInstanceId } = await params;
    const success = await deletePortionedFoodInstance(foodInstanceId, userId);
    
    if (!success) {
      throw { status: 404, message: 'Portioned food instance not found' };
    }
    
    return { success: true };
  });
}


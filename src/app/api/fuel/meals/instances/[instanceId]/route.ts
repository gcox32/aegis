import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateMealInstance, deleteMealInstance, getUserMealInstanceById, updateFuelDaySummaryFromMealInstances } from '@/lib/db/crud/fuel';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  return withAuth(async (userId) => {
    const { instanceId } = await params;
    const body = await parseBody(request);
    
    // Get the instance before update to know the old date
    const oldInstance = await getUserMealInstanceById(instanceId, userId);
    const updatedInstance = await updateMealInstance(instanceId, userId, body);

    if (!updatedInstance) {
      throw { status: 404, message: 'Meal instance not found' };
    }

    // Update fuel day summary for both old and new dates (in case date changed)
    const updateDate = (date: Date) => {
      updateFuelDaySummaryFromMealInstances(userId, date).catch((error) => {
        console.error('Failed to update fuel day summary:', error);
      });
    };

    const newDate = updatedInstance.date instanceof Date 
      ? updatedInstance.date 
      : new Date(updatedInstance.date);
    updateDate(newDate);

    if (oldInstance && oldInstance.date) {
      const oldDate = oldInstance.date instanceof Date 
        ? oldInstance.date 
        : new Date(oldInstance.date);
      // Only update old date if it's different from new date
      if (oldDate.getTime() !== newDate.getTime()) {
        updateDate(oldDate);
      }
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
    
    // Get the instance before deletion to know the date
    const instance = await getUserMealInstanceById(instanceId, userId);
    const success = await deleteMealInstance(instanceId, userId);

    if (!success) {
      throw { status: 404, message: 'Meal instance not found' };
    }

    // Update fuel day summary for the instance date
    if (instance && instance.date) {
      const instanceDate = instance.date instanceof Date 
        ? instance.date 
        : new Date(instance.date);
      updateFuelDaySummaryFromMealInstances(userId, instanceDate).catch((error) => {
        console.error('Failed to update fuel day summary:', error);
      });
    }

    return { success: true };
  });
}


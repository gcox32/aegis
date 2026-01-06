import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updateSleepInstance, deleteSleepInstance, getSleepInstanceById } from '@/lib/db/crud';
import { updateFuelDaySummaryFromSleepInstances } from '@/lib/db/crud/fuel';

// GET /api/fuel/sleep/[id] - Get a sleep instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const sleepInstance = await getSleepInstanceById(id, userId);
    if (!sleepInstance) {
      return { error: 'Sleep instance not found', status: 404 };
    }
    return { sleepInstance };
  });
}

// PATCH /api/fuel/sleep/[id] - Update a sleep instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const updates = await parseBody(request);

    // Get the instance before update to know the old date
    const oldInstance = await getSleepInstanceById(id, userId);

    // Convert strings to Date objects
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.startTime) updates.startTime = new Date(updates.startTime);
    if (updates.endTime) updates.endTime = new Date(updates.endTime);

    const sleepInstance = await updateSleepInstance(id, userId, updates);
    if (!sleepInstance) {
      return { error: 'Sleep instance not found' };
    }

    // Update fuel day summary for both old and new dates (in case date changed)
    const updateDate = (date: Date) => {
      updateFuelDaySummaryFromSleepInstances(userId, date).catch((error) => {
        console.error('Failed to update fuel day summary:', error);
      });
    };

    const newDate = sleepInstance.date instanceof Date 
      ? sleepInstance.date 
      : new Date(sleepInstance.date);
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

    return { sleepInstance };
  });
}

// DELETE /api/fuel/sleep/[id] - Delete a sleep instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    // Get the instance before deletion to know the date
    const instance = await getSleepInstanceById(id, userId);
    const deleted = await deleteSleepInstance(id, userId);
    
    if (!deleted) {
      return { error: 'Sleep instance not found' };
    }

    // Update fuel day summary for the instance date
    if (instance && instance.date) {
      const instanceDate = instance.date instanceof Date 
        ? instance.date 
        : new Date(instance.date);
      updateFuelDaySummaryFromSleepInstances(userId, instanceDate).catch((error) => {
        console.error('Failed to update fuel day summary:', error);
      });
    }

    return { success: true };
  });
}

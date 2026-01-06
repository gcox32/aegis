import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getWaterIntakeById, updateWaterIntake, deleteWaterIntake } from '@/lib/db/crud';
import { updateFuelDaySummaryFromWaterIntake } from '@/lib/db/crud/fuel';
import type { WaterIntake } from '@/types/fuel';

// PATCH /api/fuel/water-intake/[id] - Update a water intake entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const intake = await getWaterIntakeById(id, userId);
    if (!intake) {
      return { error: 'Water intake not found' };
    }

    const updates = await parseBody<Partial<Omit<WaterIntake, 'id' | 'userId' | 'date'>>>(request);
    const updated = await updateWaterIntake(id, userId, updates);
    if (!updated) {
      return { error: 'Failed to update water intake' };
    }

    // Update fuel day summary for the intake date
    const intakeDate = updated.date instanceof Date 
      ? updated.date 
      : new Date(updated.date);
    
    updateFuelDaySummaryFromWaterIntake(userId, intakeDate).catch((error) => {
      console.error('Failed to update fuel day summary:', error);
    });

    return { intake: updated };
  });
}

// DELETE /api/fuel/water-intake/[id] - Delete a water intake entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    
    const intake = await getWaterIntakeById(id, userId);
    if (!intake) {
      return { error: 'Water intake not found' };
    }

    // Get the date before deletion
    const intakeDate = intake.date instanceof Date 
      ? intake.date 
      : new Date(intake.date);

    await deleteWaterIntake(id, userId);
    
    // Update fuel day summary for the intake date
    updateFuelDaySummaryFromWaterIntake(userId, intakeDate).catch((error) => {
      console.error('Failed to update fuel day summary:', error);
    });

    return { success: true };
  });
}


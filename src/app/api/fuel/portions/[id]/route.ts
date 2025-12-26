import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { updatePortionedFood, deletePortionedFood } from '@/lib/db/crud/fuel';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const body = await parseBody(request);
    const updatedPortion = await updatePortionedFood(id, body);

    if (!updatedPortion) {
      throw { status: 404, message: 'Portion not found' };
    }

    return updatedPortion;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const success = await deletePortionedFood(id);

    if (!success) {
      throw { status: 404, message: 'Portion not found' };
    }

    return { success: true };
  });
}


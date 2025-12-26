import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getMealById, updateMeal, deleteMeal } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const meal = await getMealById(id);
    if (!meal) {
      throw { status: 404, message: 'Meal not found' };
    }
    return meal;
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const body = await parseBody(request);
    const updatedMeal = await updateMeal(id, body);

    if (!updatedMeal) {
      throw { status: 404, message: 'Meal not found' };
    }

    return updatedMeal;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const success = await deleteMeal(id);

    if (!success) {
      throw { status: 404, message: 'Meal not found' };
    }

    return { success: true };
  });
}


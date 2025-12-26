import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/helpers';
import { getGroceryListById, deleteGroceryList } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const list = await getGroceryListById(id, userId);
    if (!list) {
      throw { status: 404, message: 'Grocery list not found' };
    }
    return list;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const success = await deleteGroceryList(id, userId);

    if (!success) {
      throw { status: 404, message: 'Grocery list not found' };
    }

    return { success: true };
  });
}


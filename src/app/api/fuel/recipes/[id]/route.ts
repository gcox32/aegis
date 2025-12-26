import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getRecipeById, updateRecipe } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const recipe = await getRecipeById(id);
    if (!recipe) {
      throw { status: 404, message: 'Recipe not found' };
    }
    return recipe;
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const body = await parseBody(request);
    const updatedRecipe = await updateRecipe(id, body);

    if (!updatedRecipe) {
      throw { status: 404, message: 'Recipe not found' };
    }

    return updatedRecipe;
  });
}


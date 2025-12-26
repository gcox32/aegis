import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createRecipe, getRecipes } from '@/lib/db/crud/fuel';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const recipes = await getRecipes();
    return recipes;
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newRecipe = await createRecipe(body);
    return newRecipe;
  });
}


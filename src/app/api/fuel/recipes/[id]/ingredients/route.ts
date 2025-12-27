import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { 
  createPortionedFood, 
  getPortionedFoods, 
} from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params; // RECIPE ID
    const ingredients = await getPortionedFoods({ recipeId: id });
    return ingredients;
  });
}

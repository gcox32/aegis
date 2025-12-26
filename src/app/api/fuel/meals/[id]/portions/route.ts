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
    const { id } = await params; // MEAL ID
    const portions = await getPortionedFoods({ mealId: id });
    return portions;
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params; // MEAL ID
    const body = await parseBody(request);
    const newPortion = await createPortionedFood({ mealId: id }, body);
    return newPortion;
  });
}


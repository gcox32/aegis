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
    const { id } = await params; // GROCERY LIST ID
    const items = await getPortionedFoods({ groceryListId: id });
    return items;
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params; // GROCERY LIST ID
    const body = await parseBody(request);
    const newItem = await createPortionedFood({ groceryListId: id }, body);
    return newItem;
  });
}


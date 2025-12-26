import { NextRequest } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { createFood, getFoods, searchFoods } from '@/lib/db/crud/fuel';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const query = getQueryParam(request.url, 'q');

    if (query) {
      const foods = await searchFoods(query);
      return foods;
    }

    const foods = await getFoods();
    return foods;
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newFood = await createFood(body);
    return newFood;
  });
}


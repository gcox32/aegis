import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createGroceryList, getUserGroceryLists } from '@/lib/db/crud/fuel';

export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const lists = await getUserGroceryLists(userId);
    return lists;
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody(request);
    const newList = await createGroceryList(userId, body);
    return newList;
  });
}


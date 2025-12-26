import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createMealWeek, getMealWeeks } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params; // MEAL PLAN ID
    const weeks = await getMealWeeks(id);
    return weeks;
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params; // MEAL PLAN ID
    const body = await parseBody(request);
    const newWeek = await createMealWeek(id, body);
    return newWeek;
  });
}


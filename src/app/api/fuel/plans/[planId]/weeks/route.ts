import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { createMealWeek, getMealWeeks } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  return withAuth(async (userId) => {
    const { planId } = await params; // MEAL PLAN ID
    const weeks = await getMealWeeks(planId);
    return NextResponse.json(weeks);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  return withAuth(async (userId) => {
    const { planId } = await params; // MEAL PLAN ID
    const body = await parseBody(request);
    const newWeek = await createMealWeek(planId, body);
    return NextResponse.json(newWeek);
  });
}


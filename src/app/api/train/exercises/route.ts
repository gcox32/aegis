import { NextRequest, NextResponse } from 'next/server';
import { withAuth, parseBody, getQueryParam } from '@/lib/api/helpers';
import { getExercises, createExercise, searchExercises } from '@/lib/db/crud';

// GET /api/train/exercises - Get all exercises (public, no auth required for read)
export async function GET(request: NextRequest) {
  try {
    const query = getQueryParam(request.url, 'q');
    const pageParam = getQueryParam(request.url, 'page');
    const limitParam = getQueryParam(request.url, 'limit');

    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 20;

    if (query) {
      const { exercises, total } = await searchExercises(query, page, limit);
      return NextResponse.json({ exercises, total, page, limit });
    }
    const { exercises, total } = await getExercises(page, limit);
    return NextResponse.json({ exercises, total, page, limit });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/train/exercises - Create an exercise (requires auth)
export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const exerciseData = await parseBody(request);
    const exercise = await createExercise(exerciseData);
    return { exercise };
  });
}


import { NextRequest, NextResponse } from 'next/server';
import { getProtocolWorkouts, setProtocolWorkouts } from '@/lib/db/crud/train';
import { parseBody } from '@/lib/api/helpers';

// GET /api/train/protocols/[id]/workouts - Get workouts for a protocol
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workouts = await getProtocolWorkouts(id);
    return NextResponse.json({ workouts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/train/protocols/[id]/workouts - Set workouts for a protocol
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workoutIds } = await parseBody(request);
    
    if (!Array.isArray(workoutIds)) {
      return NextResponse.json(
        { error: 'workoutIds must be an array' },
        { status: 400 }
      );
    }

    await setProtocolWorkouts(id, workoutIds);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

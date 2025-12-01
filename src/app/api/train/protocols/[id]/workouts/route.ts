import { NextRequest, NextResponse } from 'next/server';
import { getProtocolWorkouts } from '@/lib/db/crud';

// GET /api/train/protocols/[id]/workouts - Get workouts for a protocol
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('id', id);
    const workouts = await getProtocolWorkouts(id);
    return NextResponse.json({ workouts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


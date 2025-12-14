import { NextResponse } from 'next/server';
import { getMuscleGroups } from '@/lib/db/crud/anatomy';

export async function GET() {
  try {
    const muscleGroups = await getMuscleGroups();
    return NextResponse.json({ muscleGroups });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


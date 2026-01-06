import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/helpers';
import { getFuelRecommendations } from '@/lib/db/crud/fuel';

// GET /api/fuel/recommendations - Get fuel recommendations for the current user
export async function GET(request: NextRequest) {
  return withAuth(async (userId) => {
    const recommendations = await getFuelRecommendations(userId);
    return { recommendations };
  });
}


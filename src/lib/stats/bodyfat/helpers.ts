import type { UserStats, TapeMeasurement } from '@/types/user';
import type { HeightMeasurement, WeightMeasurement, DistanceMeasurement } from '@/types/measures';
import { getUserStats } from '@/lib/db/crud/user';
import { db } from '@/lib/db';
import { tapeMeasurement } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get the latest height value (ignores staleness - height rarely changes)
 */
export async function getLatestHeight(userId: string): Promise<HeightMeasurement | undefined> {
  const stats = await getUserStats(userId);
  if (stats.length === 0) {
    return undefined;
  }

  // Sort by date (newest first) and find first height
  const sortedStats = stats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  for (const stat of sortedStats) {
    if (stat.height) {
      return stat.height;
    }
  }

  return undefined;
}

/**
 * Get the latest arm length value (ignores staleness - arm length rarely changes)
 */
export async function getLatestArmLength(userId: string): Promise<HeightMeasurement | undefined> {
  const stats = await getUserStats(userId);
  if (stats.length === 0) {
    return undefined;
  }

  // Sort by date (newest first) and find first arm length
  const sortedStats = stats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  for (const stat of sortedStats) {
    if (stat.armLength) {
      return stat.armLength;
    }
  }

  return undefined;
}

/**
 * Get the latest leg length value (ignores staleness - leg length rarely changes)
 */
export async function getLatestLegLength(userId: string): Promise<HeightMeasurement | undefined> {
  const stats = await getUserStats(userId);
  if (stats.length === 0) {
    return undefined;
  }

  // Sort by date (newest first) and find first leg length
  const sortedStats = stats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  for (const stat of sortedStats) {
    if (stat.legLength) {
      return stat.legLength;
    }
  }

  return undefined;
}

/**
 * Get the latest stats values within the last N days
 * Returns the most recent value for each field across all stats entries
 * Note: Height is fetched separately without staleness constraints
 */
export async function getLatestStatsValues(
  userId: string,
  maxDaysOld: number = 30 // Default to 30 days if not specified
): Promise<{
  weight?: WeightMeasurement;
  tapeMeasurements?: Partial<TapeMeasurement>;
}> {
  const stats = await getUserStats(userId);
  if (stats.length === 0) {
    return {};
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);

  // Filter stats within the date range and sort by date (newest first)
  const recentStats = stats
    .filter((stat) => new Date(stat.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (recentStats.length === 0) {
    return {};
  }

  // Find the most recent value for each field (excluding height)
  let latestWeight: WeightMeasurement | undefined;
  let latestTapeMeasurements: Partial<TapeMeasurement> | undefined;

  for (const stat of recentStats) {
    if (!latestWeight && stat.weight) {
      latestWeight = stat.weight;
    }
    
    // Fetch tape measurements from the separate table if we don't have them yet
    if (!latestTapeMeasurements) {
      const [tape] = await db
        .select()
        .from(tapeMeasurement)
        .where(eq(tapeMeasurement.userStatsId, stat.id))
        .limit(1);
      
      if (tape) {
        // Convert tape measurement to the expected format
        latestTapeMeasurements = {
          neck: tape.neck as DistanceMeasurement | undefined,
          shoulders: tape.shoulders as DistanceMeasurement | undefined,
          chest: tape.chest as DistanceMeasurement | undefined,
          waist: tape.waist as DistanceMeasurement | undefined,
          hips: tape.hips as DistanceMeasurement | undefined,
          leftArm: tape.leftArm as DistanceMeasurement | undefined,
          rightArm: tape.rightArm as DistanceMeasurement | undefined,
          leftLeg: tape.leftLeg as DistanceMeasurement | undefined,
          rightLeg: tape.rightLeg as DistanceMeasurement | undefined,
          leftForearm: tape.leftForearm as DistanceMeasurement | undefined,
          rightForearm: tape.rightForearm as DistanceMeasurement | undefined,
          leftCalf: tape.leftCalf as DistanceMeasurement | undefined,
          rightCalf: tape.rightCalf as DistanceMeasurement | undefined,
        };
      }
    }

    // If we have all values, we can stop
    if (latestWeight && latestTapeMeasurements) {
      break;
    }
  }

  const result: {
    weight?: WeightMeasurement;
    tapeMeasurements?: Partial<TapeMeasurement>;
  } = {};

  if (latestWeight) result.weight = latestWeight;
  if (latestTapeMeasurements) result.tapeMeasurements = latestTapeMeasurements;

  return result;
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


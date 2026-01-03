import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/db/auth';

/**
 * Wrapper for API routes that require authentication
 */
export async function withAuth<T>(
  handler: (userId: string) => Promise<T>
): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    const result = await handler(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Handle errors with status codes (like 404)
    if (error.status) {
      return NextResponse.json(
        { error: error.message || 'Not found' },
        { status: error.status }
      );
    }
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Parse JSON body from request
 */
export async function parseBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(url: string, param: string): string | null {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(param);
}

/**
 * Parse a date string and normalize it to UTC midnight for date-only comparisons.
 * This handles the case where a client sends midnight local time, which gets converted
 * to a different UTC time (e.g., midnight EST becomes 5am UTC).
 * 
 * The function extracts the date components from the UTC representation of the parsed date,
 * ensuring that "2024-01-01T05:00:00.000Z" (midnight EST) becomes "2024-01-01T00:00:00.000Z" (midnight UTC).
 * 
 * @param dateStr - ISO date string or date-only string (YYYY-MM-DD)
 * @returns Date object at UTC midnight for the given date, or undefined if input is null/undefined
 */
export function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  
  // Handle date-only strings (YYYY-MM-DD) - parse directly as UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }
  
  // Parse the date string to get the date components
  const date = new Date(dateStr);
  
  // If the date is invalid, return undefined
  if (isNaN(date.getTime())) return undefined;
  
  // Normalize to UTC midnight for the date
  // Extract year, month, day from the UTC representation of the parsed date
  // This ensures that regardless of what timezone the client sent, we extract
  // the date components from the UTC representation and create a new date at UTC midnight
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Create a new date at UTC midnight
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}


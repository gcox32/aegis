import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// this sucks but only because JS refuses to acknowledge local timezones
export function getLocalDateString(date = new Date()): string {
  const pad = (n: number, l = 2) => String(n).padStart(l, '0');

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hh = pad(Math.floor(Math.abs(offset) / 60));
  const mm = pad(Math.abs(offset) % 60);

  const fullDate = 
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` + // YYYY-MM-DD
  `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` + // HH:mm:ss.sss
  `${pad(date.getMilliseconds(), 3)}${sign}${hh}:${mm}`; // YYYY-MM-DDTHH:mm:ss.sss

  return fullDate;
}

/**
 * Normalize a date to local midnight for consistent date grouping.
 * 
 * IMPORTANT: This function extracts the date components from the UTC representation
 * of the date, not the local timezone. This ensures that dates stored in the database
 * (which may be in UTC) are correctly interpreted as calendar dates.
 * 
 * For example, if a date is stored as "2024-01-01T05:00:00.000Z" (midnight EST = 5am UTC),
 * we extract "2024-01-01" from the UTC representation and create a date at local midnight
 * for that calendar date.
 * 
 * @param date - The date to normalize (can be a Date object or ISO string)
 * @returns A new Date object at midnight in the local timezone for the calendar date
 */
export function normalizeToLocalMidnight(date: Date | string): Date {
  // If it's a string, parse it first
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Extract UTC date components to get the calendar date as stored
  // This ensures we get the correct date regardless of timezone conversions
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth();
  const day = dateObj.getUTCDate();
  
  // Create a date at local midnight for this calendar date
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Get a date key string for grouping dates by day.
 * Returns a formatted string like "Monday, Jan 1, 2024" for consistent grouping.
 * 
 * IMPORTANT: This extracts the calendar date from the UTC representation to ensure
 * correct grouping regardless of timezone.
 * 
 * @param date - The date to get a key for (can be a Date object or ISO string)
 * @returns A formatted date string for grouping
 */
export function getLocalDateKey(date: Date | string): string {
  const normalized = normalizeToLocalMidnight(date);
  return normalized.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get a date key string (YYYY-MM-DD) for grouping dates by day.
 * This is useful for creating consistent keys for date-based grouping.
 * 
 * IMPORTANT: This extracts the calendar date from the UTC representation to ensure
 * correct grouping regardless of timezone.
 * 
 * @param date - The date to get a key for (can be a Date object or ISO string)
 * @returns A date string in YYYY-MM-DD format
 */
export function getLocalDateKeyISO(date: Date | string): string {
  // If it's a string (ISO format), extract the date part directly
  if (typeof date === 'string') {
    const datePart = date.split('T')[0]; // Get YYYY-MM-DD part
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
  }
  
  // Otherwise, normalize and extract
  const normalized = normalizeToLocalMidnight(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

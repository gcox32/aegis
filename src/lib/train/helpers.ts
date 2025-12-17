import { TimeMeasurement } from "@/types/measures";

export function timeToSeconds(duration?: TimeMeasurement | null): number {
  if (!duration) return 0;
  const { value, unit } = duration;
  if (unit === 's') return value;
  if (unit === 'min') return value * 60;
  if (unit === 'hr') return value * 3600;
  return 0;
}

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function timeToMinutes(duration?: TimeMeasurement | null): number {
  if (!duration) return 0;
  const { value, unit } = duration;
  if (unit === 'min') return value;
  if (unit === 'hr') return value * 60;
  if (unit === 's') return value / 60;
  return 0;
}

export function formatMinutesAsHours(minutes: number) {
  if (minutes <= 0) return '0m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  return `${hours.toFixed(hours >= 3 ? 0 : 1)}h`;
}
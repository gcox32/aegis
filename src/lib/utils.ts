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

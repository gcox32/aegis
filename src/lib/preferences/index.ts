import type { CompositeStrategy } from '@/types/stats';
import type { LengthUnit, WeightUnit } from '@/types/stats';

export interface UserPreferences {
  bodyFatStrategy: CompositeStrategy;
  preferredWeightUnit: WeightUnit;
  preferredLengthUnit: LengthUnit;
  bodyFatMaxDaysOld: number; // Maximum age (in days) of stats values to use for body fat calculation
}

const DEFAULT_PREFERENCES: UserPreferences = {
  bodyFatStrategy: 'median',
  preferredWeightUnit: 'lb',
  preferredLengthUnit: 'in',
  bodyFatMaxDaysOld: 30,
};

const STORAGE_KEY = 'super.userPreferences';

/**
 * Get user preferences from localStorage, with defaults
 */
export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<UserPreferences>;
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
      };
    }
  } catch {
    // If parsing fails, return defaults
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save user preferences to localStorage
 */
export function saveUserPreferences(prefs: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getUserPreferences();
    const updated = { ...current, ...prefs };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Get a specific preference value
 */
export function getPreference<K extends keyof UserPreferences>(
  key: K
): UserPreferences[K] {
  return getUserPreferences()[key];
}


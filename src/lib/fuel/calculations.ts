import { Food, Macros, Micros } from "@/types/fuel";
import { ServingSizeMeasurement } from "@/types/measures";

// Conversion constants
const WEIGHT_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  lbs: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  'fl oz': 29.5735,
  cup: 236.588,
  tbsp: 14.7868,
  tsp: 4.92892,
};

/**
 * Checks if two units are compatible for conversion
 */
export function areUnitsCompatible(unitA: string, unitB: string): boolean {
  if (unitA === unitB) return true;
  
  const isAWeight = unitA in WEIGHT_TO_GRAMS;
  const isBWeight = unitB in WEIGHT_TO_GRAMS;
  if (isAWeight && isBWeight) return true;

  const isAVolume = unitA in VOLUME_TO_ML;
  const isBVolume = unitB in VOLUME_TO_ML;
  if (isAVolume && isBVolume) return true;

  return false;
}

/**
 * Calculates the ratio between a portion size and a base serving size.
 * Returns null if units are incompatible (e.g. weight vs volume without density).
 */
export function getPortionRatio(
  portion: ServingSizeMeasurement,
  base: ServingSizeMeasurement
): number | null {
  // If units match exactly
  if (portion.unit === base.unit) {
    return portion.value / base.value;
  }

  // Weight conversion
  if (portion.unit in WEIGHT_TO_GRAMS && base.unit in WEIGHT_TO_GRAMS) {
    const portionGrams = portion.value * WEIGHT_TO_GRAMS[portion.unit];
    const baseGrams = base.value * WEIGHT_TO_GRAMS[base.unit];
    return portionGrams / baseGrams;
  }

  // Volume conversion
  if (portion.unit in VOLUME_TO_ML && base.unit in VOLUME_TO_ML) {
    const portionMl = portion.value * VOLUME_TO_ML[portion.unit];
    const baseMl = base.value * VOLUME_TO_ML[base.unit];
    return portionMl / baseMl;
  }

  // Incompatible units (e.g. pieces vs grams, or volume vs weight without density)
  console.warn(`Cannot convert between incompatible units: ${portion.unit} and ${base.unit}`);
  return null;
}

/**
 * Scales a numeric value by a ratio.
 */
function scaleValue(value: number | undefined, ratio: number): number | undefined {
  if (typeof value !== 'number') return undefined;
  return Number((value * ratio).toFixed(2));
}

/**
 * Scales a Macros object by a ratio.
 */
export function scaleMacros(macros: Macros | undefined, ratio: number): Macros | undefined {
  if (!macros) return undefined;
  
  const scaled: Macros = {};
  if (macros.protein !== undefined) scaled.protein = scaleValue(macros.protein, ratio);
  if (macros.carbs !== undefined) scaled.carbs = scaleValue(macros.carbs, ratio);
  if (macros.fat !== undefined) scaled.fat = scaleValue(macros.fat, ratio);
  
  return Object.keys(scaled).length > 0 ? scaled : undefined;
}

/**
 * Scales a Micros object by a ratio.
 */
export function scaleMicros(micros: Micros | undefined, ratio: number): Micros | undefined {
  if (!micros) return undefined;

  const scaled: Micros = {};
  // Iterate over all keys in micros
  for (const key in micros) {
    const k = key as keyof Micros;
    if (micros[k] !== undefined) {
      scaled[k] = scaleValue(micros[k], ratio);
    }
  }

  return Object.keys(scaled).length > 0 ? scaled : undefined;
}

/**
 * Calculates the nutritional values for a specific portion of food.
 */
export function calculateNutrients(
  food: Food,
  portion: ServingSizeMeasurement
): { calories?: number; macros?: Macros; micros?: Micros } {
  const ratio = getPortionRatio(portion, food.servingSize);

  if (ratio === null) {
    return {
      calories: undefined,
      macros: undefined,
      micros: undefined,
    };
  }

  return {
    calories: scaleValue(food.calories, ratio),
    macros: scaleMacros(food.macros, ratio),
    micros: scaleMicros(food.micros, ratio),
  };
}

/**
 * Interface for any object that holds nutritional data
 */
export interface NutrientHolder {
  calories?: number;
  macros?: Macros;
  micros?: Micros;
}

/**
 * Aggregates (sums) nutrients from multiple sources.
 * Useful for calculating Meal totals from PortionedFoods, or Day totals from Meals.
 */
export function aggregateNutrients(items: NutrientHolder[]): NutrientHolder {
  const total: NutrientHolder = {
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
    micros: {},
  };

  for (const item of items) {
    // Sum Calories
    if (item.calories) {
      total.calories = (total.calories || 0) + item.calories;
    }

    // Sum Macros
    if (item.macros) {
      if (!total.macros) total.macros = {};
      if (item.macros.protein) total.macros.protein = (total.macros.protein || 0) + item.macros.protein;
      if (item.macros.carbs) total.macros.carbs = (total.macros.carbs || 0) + item.macros.carbs;
      if (item.macros.fat) total.macros.fat = (total.macros.fat || 0) + item.macros.fat;
    }

    // Sum Micros
    if (item.micros) {
      if (!total.micros) total.micros = {};
      for (const key in item.micros) {
        const k = key as keyof Micros;
        if (item.micros[k]) {
          total.micros[k] = (total.micros[k] || 0) + (item.micros[k] || 0);
        }
      }
    }
  }

  // Cleanup: Round values to 2 decimals
  if (total.calories) total.calories = Number(total.calories.toFixed(2));
  
  if (total.macros) {
    if (total.macros.protein) total.macros.protein = Number(total.macros.protein.toFixed(2));
    if (total.macros.carbs) total.macros.carbs = Number(total.macros.carbs.toFixed(2));
    if (total.macros.fat) total.macros.fat = Number(total.macros.fat.toFixed(2));
    // Remove if 0 to keep it clean, or keep 0? Keeping 0 is fine for aggregates.
  }

  if (total.micros) {
    for (const key in total.micros) {
      const k = key as keyof Micros;
      if (total.micros[k]) {
        total.micros[k] = Number(total.micros[k]!.toFixed(2));
      }
    }
  }

  return total;
}


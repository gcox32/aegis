import { Food, Meal } from '@/types/fuel';
import { searchFoods, getFoods } from '@/lib/db/crud/fuel';
import { searchMeals, getMeals } from '@/lib/db/crud/fuel';

interface MatchResult<T> {
  item: T;
  similarity: number; // 0-1, where 1 is exact match
  distance: number; // Levenshtein distance
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix: number[][] = [];

  // Initialize first row and column
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[s2.length][s1.length];
}

/**
 * Calculate similarity score (0-1) between two strings
 * 1.0 = exact match, 0.0 = completely different
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 1.0;
  
  // Normalize by max length and convert to similarity (higher is better)
  return 1 - (distance / maxLength);
}

/**
 * Find the best matching food by name using fuzzy matching
 * @param foodName The food name to search for
 * @param userId Optional user ID to filter by user's foods (if foods are user-specific)
 * @param threshold Minimum similarity score (0-1) to consider a match. Default: 0.7
 * @returns The best matching food and its similarity score, or null if no match above threshold
 */
export async function findSimilarFood(
  foodName: string,
  threshold: number = 0.7
): Promise<MatchResult<Food> | null> {
  if (!foodName || !foodName.trim()) {
    return null;
  }

  // First, try a direct search to get candidates
  const searchResults = await searchFoods(foodName, 1, 50);
  
  // If no results from search, get a broader set to check
  let candidates: Food[] = searchResults.foods;
  if (candidates.length < 10) {
    // Get more foods to check if search didn't return many results
    const allFoods = await getFoods(1, 100);
    candidates = [...candidates, ...allFoods.foods];
    // Remove duplicates
    const seen = new Set(candidates.map(f => f.id));
    candidates = candidates.filter(f => {
      if (seen.has(f.id)) {
        seen.delete(f.id);
        return true;
      }
      return false;
    });
  }

  // Calculate similarity for each candidate
  const matches: MatchResult<Food>[] = candidates.map(food => {
    const similarity = calculateSimilarity(foodName, food.name);
    const distance = levenshteinDistance(foodName, food.name);
    return {
      item: food,
      similarity,
      distance,
    };
  });

  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);

  // Return the best match if it's above threshold
  const bestMatch = matches[0];
  if (bestMatch && bestMatch.similarity >= threshold) {
    return bestMatch;
  }

  return null;
}

/**
 * Find the best matching meal by name using fuzzy matching
 * @param mealName The meal name to search for
 * @param userId User ID to filter by user's meals
 * @param threshold Minimum similarity score (0-1) to consider a match. Default: 0.7
 * @returns The best matching meal and its similarity score, or null if no match above threshold
 */
export async function findSimilarMeal(
  mealName: string,
  userId: string,
  threshold: number = 0.7
): Promise<MatchResult<Meal> | null> {
  if (!mealName || !mealName.trim()) {
    return null;
  }

  // First, try a direct search to get candidates
  const searchResults = await searchMeals(mealName, 1, 50);
  
  // Filter by userId and get more if needed
  let candidates: Meal[] = searchResults.meals.filter(m => m.userId === userId);
  
  if (candidates.length < 10) {
    // Get more meals to check if search didn't return many results
    const allMeals = await getMeals(userId, undefined, 1, 100);
    candidates = [...candidates, ...allMeals.meals];
    // Remove duplicates
    const seen = new Set(candidates.map(m => m.id));
    candidates = candidates.filter(m => {
      if (seen.has(m.id)) {
        seen.delete(m.id);
        return true;
      }
      return false;
    });
  }

  // Calculate similarity for each candidate
  const matches: MatchResult<Meal>[] = candidates.map(meal => {
    const similarity = calculateSimilarity(mealName, meal.name);
    const distance = levenshteinDistance(mealName, meal.name);
    return {
      item: meal,
      similarity,
      distance,
    };
  });

  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);

  // Return the best match if it's above threshold
  const bestMatch = matches[0];
  if (bestMatch && bestMatch.similarity >= threshold) {
    return bestMatch;
  }

  return null;
}

/**
 * Normalize food name for better matching
 * Removes common variations and normalizes case/spacing
 */
export function normalizeFoodName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s]/g, '') // Remove special characters
    .trim();
}

/**
 * Check if two food names are likely the same (quick check)
 */
export function areFoodNamesSimilar(name1: string, name2: string, threshold: number = 0.8): boolean {
  const normalized1 = normalizeFoodName(name1);
  const normalized2 = normalizeFoodName(name2);
  
  // Exact match after normalization
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (for cases like "chicken" vs "chicken breast")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  // Use similarity score
  return calculateSimilarity(normalized1, normalized2) >= threshold;
}


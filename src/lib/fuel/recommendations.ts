import type { UserProfile, UserGoal, UserStats } from '@/types/user';
import type { HeightMeasurement, WeightMeasurement } from '@/types/measures';
import type { Macros } from '@/types/fuel';

// Conversion constants
const IN_TO_CM = 2.54;
const LB_TO_KG = 0.45359237;

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  'sedentary': 1.2,           // Little to no exercise
  'lightly active': 1.375,    // Light exercise 1-3 days/week
  'moderately active': 1.55,  // Moderate exercise 3-5 days/week
  'very active': 1.725,       // Hard exercise 6-7 days/week
  'extra active': 1.9,        // Very hard exercise, physical job
};

// Calorie deficit/surplus per pound per week
const CALORIES_PER_LB_PER_WEEK = 3500;
const CALORIES_PER_KG_PER_WEEK = 7700;

export interface FuelRecommendations {
  bmr?: number;              // Basal Metabolic Rate (calories/day)
  tdee?: number;             // Total Daily Energy Expenditure (calories/day)
  calorieTarget?: number;    // Target calories based on goals (calories/day)
  macros?: {
    protein?: number;        // grams
    carbs?: number;          // grams
    fat?: number;            // grams
  };
}

/**
 * Convert height to centimeters
 */
function heightToCm(height: HeightMeasurement): number {
  const { value, unit } = height;
  switch (unit) {
    case 'cm':
      return value;
    case 'm':
      return value * 100;
    case 'in':
      return value * IN_TO_CM;
    case 'ft':
      return value * IN_TO_CM * 12;
    default:
      throw new Error(`Unsupported height unit: ${unit}`);
  }
}

/**
 * Convert weight to kilograms
 */
function weightToKg(weight: WeightMeasurement): number {
  const { value, unit } = weight;
  switch (unit) {
    case 'kg':
      return value;
    case 'lbs':
      return value * LB_TO_KG;
    default:
      throw new Error(`Unsupported weight unit: ${unit}`);
  }
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation
 * This is the most accurate and widely used formula
 */
function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  // Mifflin-St Jeor equation:
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS['sedentary'];
  return bmr * multiplier;
}

/**
 * Extract body weight goal from user goals
 * Returns target weight in kg and whether it's a gain or loss goal
 */
function extractBodyWeightGoal(
  goals: UserGoal[] | undefined,
  currentWeightKg: number
): { targetWeightKg?: number; isWeightLoss?: boolean } | null {
  if (!goals || goals.length === 0) return null;

  // Find active bodyweight goals
  const bodyweightGoals = goals.filter(
    goal => !goal.complete && 
    goal.components?.some(component => component.type === 'bodyweight')
  );

  if (bodyweightGoals.length === 0) return null;

  // Get the highest priority bodyweight goal
  const sortedGoals = bodyweightGoals.sort((a, b) => {
    const aPriority = Math.min(...(a.components?.map(c => c.priority || 0) || [0]));
    const bPriority = Math.min(...(b.components?.map(c => c.priority || 0) || [0]));
    return aPriority - bPriority;
  });

  const goal = sortedGoals[0];
  const bodyweightComponent = goal.components?.find(c => c.type === 'bodyweight');
  
  if (!bodyweightComponent?.criteria || bodyweightComponent.criteria.length === 0) {
    return null;
  }

  // Find the target weight from criteria
  for (const criteria of bodyweightComponent.criteria) {
    if (criteria.value && typeof criteria.value === 'object' && 'value' in criteria.value && 'unit' in criteria.value) {
      const weightValue = criteria.value as WeightMeasurement;
      const targetWeightKg = weightToKg(weightValue);
      const isWeightLoss = targetWeightKg < currentWeightKg;
      
      return { targetWeightKg, isWeightLoss };
    }
  }

  return null;
}

/**
 * Calculate calorie target based on body weight goal
 * Assumes a safe rate of 0.5-1 lb (0.23-0.45 kg) per week
 */
function calculateCalorieTarget(
  tdee: number,
  bmr: number,
  currentWeightKg: number,
  targetWeightKg?: number,
  isWeightLoss?: boolean
): number {
  if (!targetWeightKg) {
    return tdee; // Maintenance calories
  }

  const weightDifference = Math.abs(targetWeightKg - currentWeightKg);
  
  // If already at or very close to target (within 0.5 kg), use maintenance
  if (weightDifference < 0.5) {
    return tdee;
  }

  // Calculate safe weekly rate: 0.5-1 lb per week (0.23-0.45 kg per week)
  // Use 0.75 lb/week (0.34 kg/week) as a moderate rate
  const weeklyWeightChangeKg = 0.34;
  const weeklyCalorieAdjustment = weeklyWeightChangeKg * CALORIES_PER_KG_PER_WEEK;
  const dailyCalorieAdjustment = weeklyCalorieAdjustment / 7;

  if (isWeightLoss) {
    return Math.max(tdee - dailyCalorieAdjustment, bmr * 1.1); // Don't go below 110% of BMR
  } else {
    return tdee + dailyCalorieAdjustment;
  }
}

/**
 * Calculate protein target
 * Recommendations:
 * - General: 0.8-1.0 g/kg body weight
 * - Active individuals: 1.2-2.2 g/kg body weight
 * - For body composition goals: 1.6-2.2 g/kg body weight
 * - Or 20-30% of total calories
 */
function calculateProteinTarget(
  weightKg: number,
  calorieTarget: number,
  hasBodyCompositionGoal: boolean
): number {
  // Use higher protein for body composition goals
  const proteinPerKg = hasBodyCompositionGoal ? 2.0 : 1.6;
  const proteinFromWeight = weightKg * proteinPerKg;
  
  // Also calculate as percentage of calories (25% is a good middle ground)
  const caloriesFromProtein = calorieTarget * 0.25;
  const proteinFromCalories = caloriesFromProtein / 4; // 4 calories per gram of protein
  
  // Use the higher of the two to ensure adequate protein
  return Math.max(proteinFromWeight, proteinFromCalories);
}

/**
 * Calculate fat target
 * Recommendations:
 * - Minimum: 0.5-1.0 g/kg body weight for essential fat
 * - Optimal: 20-35% of total calories
 * - For active individuals: 0.8-1.0 g/kg body weight minimum
 */
function calculateFatTarget(
  weightKg: number,
  calorieTarget: number
): number {
  // Minimum fat requirement: 0.8 g/kg body weight
  const minFatFromWeight = weightKg * 0.8;
  
  // Optimal: 25% of total calories
  const caloriesFromFat = calorieTarget * 0.25;
  const fatFromCalories = caloriesFromFat / 9; // 9 calories per gram of fat
  
  // Use the higher of the two to ensure adequate fat intake
  return Math.max(minFatFromWeight, fatFromCalories);
}

/**
 * Calculate carbohydrate target
 * Carbs = remaining calories after protein and fat
 */
function calculateCarbTarget(
  calorieTarget: number,
  proteinGrams: number,
  fatGrams: number
): number {
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const remainingCalories = calorieTarget - proteinCalories - fatCalories;
  
  // Carbs have 4 calories per gram
  return Math.max(0, remainingCalories / 4);
}

/**
 * Main function to calculate fuel recommendations
 */
export function calculateFuelRecommendations(
  profile: UserProfile
): FuelRecommendations {
  const { latestStats, gender, birthDate, activityLevel, goals } = profile;

  // Check if we have the minimum required data
  if (!latestStats?.weight || !latestStats?.height || !gender || !birthDate) {
    return {};
  }

  // Convert measurements to standard units
  const weightKg = weightToKg(latestStats.weight);
  const heightCm = heightToCm(latestStats.height);
  const age = calculateAge(birthDate);

  // Calculate BMR
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  
  // Calculate TDEE
  const defaultActivityLevel = activityLevel || 'sedentary';
  const tdee = calculateTDEE(bmr, defaultActivityLevel);

  // Extract body weight goal if available
  const weightGoal = extractBodyWeightGoal(goals, weightKg);
  
  // Calculate calorie target
  const calorieTarget = calculateCalorieTarget(
    tdee,
    bmr,
    weightKg,
    weightGoal?.targetWeightKg,
    weightGoal?.isWeightLoss
  );

  // Check if user has body composition goals
  const hasBodyCompositionGoal = goals?.some(
    goal => !goal.complete && 
    goal.components?.some(component => component.type === 'bodycomposition')
  ) || false;

  // Calculate macro targets
  const protein = calculateProteinTarget(weightKg, calorieTarget, hasBodyCompositionGoal);
  const fat = calculateFatTarget(weightKg, calorieTarget);
  const carbs = calculateCarbTarget(calorieTarget, protein, fat);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: Math.round(calorieTarget),
    macros: {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    },
  };
}
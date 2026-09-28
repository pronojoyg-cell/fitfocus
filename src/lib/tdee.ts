/**
 * Mifflin-St. Jeor Total Daily Energy Expenditure (TDEE) & Nutrient Engine
 * Clinically referenced nutritional algorithms with rigorous boundary protection.
 */

import { ActivityLevel, Gender, Goal, HealthMetrics, SubGoal, UserBiometrics } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { multiplier: number; label: string; description: string }> = {
  sedentary: {
    multiplier: 1.2,
    label: 'Sedentary',
    description: 'Desk job, minimal daily movement, <5,000 steps',
  },
  lightly_active: {
    multiplier: 1.375,
    label: 'Lightly Active',
    description: 'Light workouts or sports 1–3 days/wk, 6,000–8,000 steps',
  },
  moderately_active: {
    multiplier: 1.55,
    label: 'Moderately Active',
    description: 'Moderate workouts 3–5 days/wk, 9,000–12,000 steps',
  },
  very_active: {
    multiplier: 1.725,
    label: 'Very Active',
    description: 'Heavy training 6–7 days/wk or strenuous physical work',
  },
  extra_active: {
    multiplier: 1.9,
    label: 'Extra Active',
    description: 'Elite competitive athlete or heavy construction labor',
  },
};

/**
 * Calculates accurate chronological age from year, month, day.
 */
export function calculateAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }
  return Math.max(14, Math.min(100, age));
}

/**
 * Computes Basal Metabolic Rate (BMR) via Mifflin-St. Jeor Equation
 * P = (10 * m) + (6.25 * h) - (5 * a) + s
 * where s is +5 for males, -161 for females, -78 for neutral.
 */
export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  }
  // Rather not say: statistical midpoint
  return Math.round(base - 78);
}

/**
 * Computes comprehensive TDEE, Caloric Targets, and Macro splits
 */
export function calculateHealthMetrics(
  gender: Gender,
  age: number,
  goal: Goal,
  subGoal: SubGoal | undefined,
  biometrics: UserBiometrics
): HealthMetrics {
  const bmr = calculateBMR(gender, biometrics.weight_kg, biometrics.height_cm, age);
  const activity = ACTIVITY_MULTIPLIERS[biometrics.activity_level] || ACTIVITY_MULTIPLIERS.moderately_active;
  const tdee = Math.round(bmr * activity.multiplier);

  let targetCalories = tdee;

  if (goal === 'manage_weight') {
    if (subGoal === 'lose_weight') {
      // 500 kcal deficit (standard safe 0.5kg/week fat loss)
      targetCalories = Math.max(gender === 'female' ? 1200 : 1500, tdee - 500);
    } else if (subGoal === 'gain_weight') {
      // Clean 350 kcal surplus for lean hypertrophy
      targetCalories = tdee + 350;
    } else {
      targetCalories = tdee;
    }
  } else if (goal === 'manage_health_problem') {
    // Metabolic baseline maintenance with balanced nutrient density
    targetCalories = tdee;
  } else if (goal === 'stay_fit') {
    // Slight conditioning surplus
    targetCalories = tdee + 100;
  }

  // Protein targets: 2.0g per kg for weight loss (muscle retention) or hypertrophy; 1.8g for maintenance
  const proteinMultiplier = (subGoal === 'lose_weight' || subGoal === 'gain_weight') ? 2.0 : 1.8;
  const protein_g = Math.round(biometrics.weight_kg * proteinMultiplier);
  const proteinCalories = protein_g * 4;

  // Fat targets: 28% of total daily energy
  const fatCalories = targetCalories * 0.28;
  const fats_g = Math.round(fatCalories / 9);

  // Carbohydrates: remaining calories
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fats_g * 9));
  const carbs_g = Math.round(remainingCalories / 4);

  // Target daily water intake: 35ml per kg
  const water_ml_target = Math.round(biometrics.weight_kg * 35);

  return {
    bmr,
    tdee,
    target_calories: targetCalories,
    protein_g,
    carbs_g,
    fats_g,
    weekly_target_calories: targetCalories * 7,
    water_ml_target,
  };
}

/**
 * Standard Daily Reference Micronutrient Targets
 */
export const MICRONUTRIENT_TARGETS = {
  fiber_g: { target: 30, unit: 'g', label: 'Dietary Fiber', benefit: 'Gut microbiome & satiety' },
  potassium_mg: { target: 3400, unit: 'mg', label: 'Potassium', benefit: 'Electrolyte balance & BP' },
  sodium_mg: { target: 2000, unit: 'mg', label: 'Sodium', benefit: 'Hydration & neuromuscular signaling' },
  iron_mg: { target: 18, unit: 'mg', label: 'Iron', benefit: 'Oxygen transport & hemoglobin' },
  calcium_mg: { target: 1000, unit: 'mg', label: 'Calcium', benefit: 'Bone density & muscle contraction' },
  vit_c_mg: { target: 90, unit: 'mg', label: 'Vitamin C', benefit: 'Collagen synthesis & immunity' },
  vit_d_mcg: { target: 20, unit: 'mcg', label: 'Vitamin D3', benefit: 'Immune & endocrine function' },
  magnesium_mg: { target: 400, unit: 'mg', label: 'Magnesium', benefit: 'ATP synthesis & muscle relaxation' },
};

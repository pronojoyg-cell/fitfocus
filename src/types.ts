/**
 * FitnessWellnessApp - Domain Types & TypeScript Contract
 * Clinical Precision Architecture adhering to Apple & Google Design Principles.
 */

export type Gender = 'male' | 'female' | 'rather_not_say';

export type Goal = 'manage_weight' | 'manage_health_problem' | 'stay_fit';

export type SubGoal = 'lose_weight' | 'gain_weight' | 'maintain';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export type HealthCondition =
  | 'diabetes'
  | 'high_bp'
  | 'low_bp'
  | 'arthritis'
  | 'joint_pain'
  | 'cholesterol';

export interface MedicinePhoto {
  id: string;
  url: string;
  photo_url?: string;
  extracted_name?: string;
  detected_name?: string;
  active_ingredient?: string;
  dosage?: string;
  notes?: string;
  taken_at?: string;
  uploaded_at?: string;
}

export interface HealthConditionEvaluation {
  condition: HealthCondition;
  status: 'favorable' | 'caution' | 'unfavorable';
  detail: string;
}

export interface FoodHealthCompatibility {
  is_recommended: boolean;
  verdict: 'recommended' | 'caution' | 'not_recommended';
  verdict_title: string;
  summary_reason: string;
  condition_evaluations: HealthConditionEvaluation[];
  clinical_recommendation: string;
}

export interface KeyMicronutrients {
  fiber_g: number;
  sodium_mg: number;
  potassium_mg: number;
  iron_mg: number;
  calcium_mg: number;
  vit_c_mg: number;
  vit_d_mcg?: number;
  magnesium_mg?: number;
}

export interface FoodComponentItem {
  name: string;
  portion?: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  description?: string;
}

export interface NutritionalBackground {
  overview: string;
  glycemic_impact?: string;
  macronutrient_distribution?: string;
  micronutrient_highlights?: string[];
  electrolytes_summary?: string;
  anti_inflammatory_score?: 'High' | 'Moderate' | 'Low' | 'Neutral' | string;
  clinical_insights?: string;
}

export interface UserBiometrics {
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
}

export interface HealthMetrics {
  bmr: number;
  tdee: number;
  target_calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  weekly_target_calories: number;
  water_ml_target: number;
}

export interface UserProfile {
  id: string;
  auth_id: string;
  email?: string;
  phone?: string;
  name: string;
  avatar_url?: string;
  dob: string; // YYYY-MM-DD
  age: number;
  gender: Gender;
  goal: Goal;
  sub_goal?: SubGoal;
  health_conditions?: HealthCondition[];
  health_description?: string;
  medicines?: string[];
  medicine_photos?: MedicinePhoto[];
  biometrics: UserBiometrics;
  metrics: HealthMetrics;
  created_at: string;
  updated_at: string;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLogEntry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  food_name: string;
  image_url?: string;
  meal_type: MealCategory;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  key_micros: KeyMicronutrients;
  ai_confidence?: number;
  consumed_at: string;
  created_at?: string;
  serving_size?: string;
  dietary_notes?: string[];
  health_compatibility?: FoodHealthCompatibility;
  components?: FoodComponentItem[];
  nutritional_background?: NutritionalBackground;
  ai_engine_used?: string;
}

export interface DayNutritionSummary {
  date: string; // YYYY-MM-DD
  totalCalories: number;
  consumedMacros: {
    protein_g: number;
    carbs_g: number;
    fats_g: number;
  };
  consumedMicros: KeyMicronutrients;
  waterIntakeMl: number;
  foodLogs: FoodLogEntry[];
}

export interface DayHistorySnippet {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  waterIntakeMl: number;
  hasLogs: boolean;
}

export interface VisionAIAnalysisResult {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  key_micros: KeyMicronutrients;
  serving_size?: string;
  confidence_score?: number;
  dietary_notes?: string[];
  health_compatibility?: FoodHealthCompatibility;
  components?: FoodComponentItem[];
  nutritional_background?: NutritionalBackground;
  ai_engine_used?: string;
}

export type OnboardingStep =
  | 1 // Name
  | 2 // DOB wheel picker
  | 3 // Gender
  | 4 // Goal
  | 5 // Sub-goal (if manage_weight) OR Health Diseases selection (if manage_health_problem)
  | 6 // Biometrics (if manage_weight) OR Health Description (if manage_health_problem)
  | 7 // Auth sheet (for weight/fitness) OR Biometrics (for health problem)
  | 8; // Auth sheet (for health problem)

export interface OnboardingDraft {
  name: string;
  dob: {
    year: number;
    month: number;
    day: number;
  };
  gender: Gender | null;
  goal: Goal | null;
  sub_goal: SubGoal | null;
  health_conditions: HealthCondition[];
  health_description: string;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
}

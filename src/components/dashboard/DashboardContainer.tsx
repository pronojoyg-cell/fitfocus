import { useEffect, useMemo } from 'react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { DashboardHeader } from './DashboardHeader';
import { HorizontalDateReel } from './HorizontalDateReel';
import { CalorieProgressRings } from './CalorieProgressRings';
import { MacroNutrientGrid } from './MacroNutrientGrid';
import { MicroNutrientReel } from './MicroNutrientReel';
import { WaterTrackerCard } from './WaterTrackerCard';
import { FoodLogSection } from './FoodLogSection';
import { AIVisionFABModal } from './AIVisionFABModal';
import { RecalibrateModal } from './RecalibrateModal';
import { MedicalProfileModal } from './MedicalProfileModal';
import { AccountSwitcherModal } from './AccountSwitcherModal';
import { AvatarUploadModal } from './AvatarUploadModal';
import { FoodNutritionReportView } from './FoodNutritionReportView';
import { ClinicalHealthHeroBanner } from './ClinicalHealthHeroBanner';
import { KeyMicronutrients } from '../../types';

export function DashboardContainer() {
  const user = useFitnessStore((s) => s.user);
  const foodLogs = useFitnessStore((s) => s.foodLogs);
  const selectedDate = useFitnessStore((s) => s.selectedDate);
  const todayDate = useFitnessStore((s) => s.todayDate);
  const checkMidnightTransition = useFitnessStore((s) => s.checkMidnightTransition);
  const loadDayData = useFitnessStore((s) => s.loadDayData);
  const loadHistory = useFitnessStore((s) => s.loadHistory);
  const activeFoodReport = useFitnessStore((s) => s.activeFoodReport);
  const clearActiveFoodReport = useFitnessStore((s) => s.clearActiveFoodReport);

  // Set up midnight transition watcher & initial data fetch
  useEffect(() => {
    loadDayData(selectedDate);
    loadHistory();

    // Check every 30 seconds if calendar rolled past 12:00 AM midnight
    const timer = setInterval(() => {
      checkMidnightTransition();
    }, 30000);

    return () => clearInterval(timer);
  }, [selectedDate, checkMidnightTransition, loadDayData, loadHistory]);

  // Fallback defaults if user somehow null
  const metrics = user?.metrics || {
    bmr: 1720,
    tdee: 2350,
    target_calories: 2150,
    protein_g: 155,
    carbs_g: 225,
    fats_g: 68,
    weekly_target_calories: 15050,
    water_ml_target: 2500,
  };

  // STRICT DATE ISOLATION: Filter logs exclusively for the selectedDate
  const currentDayLogs = useMemo(() => {
    return foodLogs.filter((log) => log.date === selectedDate);
  }, [foodLogs, selectedDate]);

  // Compute live aggregates strictly for the active date
  const { totalCalories, consumedMacros, consumedMicros } = useMemo(() => {
    let calories = 0;
    let protein_g = 0;
    let carbs_g = 0;
    let fats_g = 0;
    const micros: KeyMicronutrients = {
      fiber_g: 0,
      sodium_mg: 0,
      potassium_mg: 0,
      iron_mg: 0,
      calcium_mg: 0,
      vit_c_mg: 0,
      vit_d_mcg: 0,
      magnesium_mg: 0,
    };

    currentDayLogs.forEach((log) => {
      calories += log.calories || 0;
      protein_g += log.protein_g || 0;
      carbs_g += log.carbs_g || 0;
      fats_g += log.fats_g || 0;

      if (log.key_micros) {
        micros.fiber_g += log.key_micros.fiber_g || 0;
        micros.sodium_mg += log.key_micros.sodium_mg || 0;
        micros.potassium_mg += log.key_micros.potassium_mg || 0;
        micros.iron_mg += log.key_micros.iron_mg || 0;
        micros.calcium_mg += log.key_micros.calcium_mg || 0;
        micros.vit_c_mg += log.key_micros.vit_c_mg || 0;
        micros.vit_d_mcg = (micros.vit_d_mcg || 0) + (log.key_micros.vit_d_mcg || 0);
        micros.magnesium_mg = (micros.magnesium_mg || 0) + (log.key_micros.magnesium_mg || 0);
      }
    });

    return {
      totalCalories: calories,
      consumedMacros: { protein_g, carbs_g, fats_g },
      consumedMicros: micros,
    };
  }, [currentDayLogs]);

  // Projected weekly intake
  const weeklyEstimate = Math.round(metrics.target_calories * 6 * 0.95 + totalCalories);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] pb-24">
      {/* Clinically precise top navigation */}
      <DashboardHeader user={user} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
        {activeFoodReport ? (
          <FoodNutritionReportView
            food={activeFoodReport}
            onBackHome={clearActiveFoodReport}
          />
        ) : (
          <>
            {/* Horizontal Date Scrolling Reel with Midnight Reset Engine */}
            <HorizontalDateReel />

            {/* Clinical Health Guardian Banner (when health conditions exist) */}
            <ClinicalHealthHeroBanner />

            {/* 1. Hero Section: SVG Concentric Progress Rings (Daily for this date & Weekly) */}
            <CalorieProgressRings
              metrics={metrics}
              consumedCalories={totalCalories}
              weeklyConsumedCalories={weeklyEstimate}
            />

            {/* 2. 3-Column Macronutrient Grid for active date */}
            <MacroNutrientGrid metrics={metrics} consumed={consumedMacros} />

            {/* 3. Horizontal Micronutrient Reel for active date */}
            <MicroNutrientReel consumedMicros={consumedMicros} />

            {/* 4. Hydration & Daily Activity telemetry for active date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="md:col-span-1">
                <WaterTrackerCard waterTargetMl={metrics.water_ml_target || 2500} />
              </div>
              <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Metabolic Strategy
                  </span>
                  <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Mifflin-St. Jeor Calibrated
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-2">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">BMR Baseline</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900">{metrics.bmr}</span>
                    <span className="text-[10px] text-slate-500 block">kcal resting</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">TDEE Expenditure</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900">{metrics.tdee}</span>
                    <span className="text-[10px] text-slate-500 block">kcal active burn</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Caloric Target</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-600">{metrics.target_calories}</span>
                    <span className="text-[10px] text-slate-500 block">kcal / day</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Protein Ratio</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {Math.round((metrics.protein_g * 4 / metrics.target_calories) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">{metrics.protein_g}g / day</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Physical profile: {user.gender} • {user.age} yrs • {user.biometrics.height_cm} cm • {user.biometrics.weight_kg} kg • {user.biometrics.activity_level.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* 5. Food Diary & AI Log History for active date */}
            <FoodLogSection />
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) for Camera / Gallery & Vision AI */}
      <AIVisionFABModal />

      {/* Update Biometrics Modal */}
      <RecalibrateModal />

      {/* Medical Profile Modal (Conditions, Medicines & Prescription Scans) */}
      <MedicalProfileModal />

      {/* Multi-Account Switcher & Session Management Modal */}
      <AccountSwitcherModal />

      {/* User Profile Avatar Camera & Upload Modal */}
      <AvatarUploadModal />
    </div>
  );
}

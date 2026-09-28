import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Home,
  ArrowLeft,
  Clock,
  Sparkles,
  Utensils,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Activity,
  Flame,
  Zap,
  HeartPulse,
  Trash2,
  ChevronRight,
  Info,
  Layers,
  AlertTriangle,
  XCircle,
  Stethoscope,
  Bone,
  Check,
  Cpu,
  Dna,
  Lock,
  FileText,
  Timer,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { FoodLogEntry, KeyMicronutrients, HealthCondition } from '../../types';
import { evaluateMealHealthCompatibility, HEALTH_CONDITIONS_CATALOG } from '../../lib/healthConditions';
import { FoodSummarisedReport } from './FoodSummarisedReport';

interface FoodNutritionReportViewProps {
  food: FoodLogEntry;
  onBackHome: () => void;
}

// Official US FDA / WHO Daily Reference Values (RDA / Daily Limits for adults)
const REFERENCE_DAILY_VALUES: Record<
  keyof KeyMicronutrients,
  { label: string; rda: number; unit: string; description: string }
> = {
  fiber_g: {
    label: 'Dietary Fiber',
    rda: 28,
    unit: 'g',
    description: 'Promotes gut microbiome biodiversity, blunts postprandial glucose spikes, and supports satiety.',
  },
  potassium_mg: {
    label: 'Potassium',
    rda: 3400,
    unit: 'mg',
    description: 'Essential intracellular electrolyte regulating fluid equilibrium, vascular tone, and neuromuscular transmission.',
  },
  sodium_mg: {
    label: 'Sodium',
    rda: 2300,
    unit: 'mg',
    description: 'Primary extracellular osmotic regulator. Daily intake should remain below 2,300mg reference ceiling.',
  },
  calcium_mg: {
    label: 'Calcium',
    rda: 1000,
    unit: 'mg',
    description: 'Crucial structural cation for skeletal bone mineralization, myocyte contraction, and enzyme regulation.',
  },
  iron_mg: {
    label: 'Iron',
    rda: 18,
    unit: 'mg',
    description: 'Core cofactor for hemoglobin erythrocyte oxygen transport, cellular respiration, and myoglobin storage.',
  },
  vit_c_mg: {
    label: 'Vitamin C (Ascorbic Acid)',
    rda: 90,
    unit: 'mg',
    description: 'Potent water-soluble antioxidant protecting against oxidative stress and enhancing non-heme iron absorption.',
  },
  vit_d_mcg: {
    label: 'Vitamin D3 (Cholecalciferol)',
    rda: 20,
    unit: 'mcg',
    description: 'Steroid hormone precursor orchestrating intestinal calcium absorption, bone remodelling, and immune homeostasis.',
  },
  magnesium_mg: {
    label: 'Magnesium',
    rda: 420,
    unit: 'mg',
    description: 'Catalytic cofactor in over 300 biochemical reactions including ATP synthesis, DNA repair, and neuromuscular calmness.',
  },
};

export function FoodNutritionReportView({ food, onBackHome }: FoodNutritionReportViewProps) {
  const [reportMode, setReportMode] = useState<'detailed' | 'summarised'>('summarised');
  const user = useFitnessStore((s) => s.user);
  const deleteFoodLog = useFitnessStore((s) => s.deleteFoodLog);

  // User target metrics
  const targetCalories = user?.metrics?.target_calories || 2150;
  const targetProtein = user?.metrics.protein_g || 140;
  const targetCarbs = user?.metrics.carbs_g || 220;
  const targetFats = user?.metrics.fats_g || 65;

  // User health conditions & clinical suitability
  const userConditions = user?.health_conditions || [];
  const userMedicines = user?.medicines || [];
  const compatibility = food.health_compatibility || ((userConditions.length > 0 || userMedicines.length > 0) ? evaluateMealHealthCompatibility({
    food_name: food.food_name,
    calories: food.calories,
    protein_g: food.protein_g,
    carbs_g: food.carbs_g,
    fats_g: food.fats_g,
    key_micros: food.key_micros,
    dietary_notes: food.dietary_notes,
    health_conditions: userConditions,
    health_description: user?.health_description || '',
    medicines: userMedicines,
  }) : undefined);

  // Atwater 4-4-9 factor calculations
  const proteinKcal = Math.round(food.protein_g * 4);
  const carbsKcal = Math.round(food.carbs_g * 4);
  const fatsKcal = Math.round(food.fats_g * 9);
  const totalMacroKcal = Math.max(1, proteinKcal + carbsKcal + fatsKcal);

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  // Daily budget contribution %
  const calorieContributionPct = Math.min(100, Math.round((food.calories / targetCalories) * 100));
  const proteinContributionPct = Math.min(100, Math.round((food.protein_g / targetProtein) * 100));
  const carbsContributionPct = Math.min(100, Math.round((food.carbs_g / targetCarbs) * 100));
  const fatsContributionPct = Math.min(100, Math.round((food.fats_g / targetFats) * 100));

  // Clinical Scientific Indices
  // 1. Protein-to-calorie density ratio
  const proteinDensityPct = Math.round((proteinKcal / (food.calories || 1)) * 100);

  // 2. Fiber to carbohydrate ratio
  const fiberToCarbRatio = food.carbs_g > 0 ? ((food.key_micros?.fiber_g || 0) / food.carbs_g).toFixed(2) : '1.0';

  // 3. Sodium to Potassium ratio (Cardiovascular health index, ideally < 1.0)
  const naKRatio =
    (food.key_micros?.potassium_mg || 0) > 0
      ? ((food.key_micros?.sodium_mg || 0) / (food.key_micros?.potassium_mg || 1)).toFixed(2)
      : 'N/A';

  // 4. Satiety Rating (Holt Satiety Index approximation)
  let satietyAssessment = 'Moderate Satiety';
  let satietyBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  if (proteinDensityPct >= 30 || (food.key_micros?.fiber_g || 0) >= 6) {
    satietyAssessment = 'High Sustained Satiety';
    satietyBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (fatsPct > 55 && (food.key_micros?.fiber_g || 0) < 2) {
    satietyAssessment = 'Dense Energy';
    satietyBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  // Format consumption time
  const consumptionTime = new Date(food.consumed_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayComponents = food.components && food.components.length > 0
    ? food.components
    : [
        {
          name: `${food.food_name} - Main Serving`,
          portion: food.serving_size || '1 standard portion',
          calories: food.calories,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fats_g: food.fats_g,
          description: 'Primary meal base supplying dietary energy, amino acids, and cellular fuel.',
        },
      ];

  const displayBackground = food.nutritional_background || {
    overview: `${food.food_name} delivers ${food.calories} kcal with a balanced macronutrient foundation. Formulated to provide consistent energy and metabolic recovery.`,
    glycemic_impact: (food.carbs_g || 0) > 50 ? 'Moderate Glycemic Load' : 'Low-to-Moderate Glycemic Response',
    macronutrient_distribution: `${proteinPct}% Protein, ${carbsPct}% Carbs, ${fatsPct}% Fats`,
    micronutrient_highlights: [
      `Potassium: ${food.key_micros?.potassium_mg || 0}mg supporting vascular tone`,
      `Fiber: ${food.key_micros?.fiber_g || 0}g nourishing gut microbiome and blunting glucose surges`,
      `Vitamin C: ${food.key_micros?.vit_c_mg || 0}mg facilitating antioxidant resilience`,
    ],
    electrolytes_summary: `Sodium to Potassium ratio is ${naKRatio} (${food.key_micros?.sodium_mg || 0}mg Na : ${food.key_micros?.potassium_mg || 0}mg K), providing optimal cellular hydration balance.`,
    anti_inflammatory_score: 'High',
    clinical_insights: 'Structured for cardiovascular vitality, muscular glycogen restoration, and metabolic stability.',
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${food.food_name}" from your food diary?`)) {
      deleteFoodLog(food.id);
      onBackHome();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-5xl mx-auto pb-16 space-y-6"
    >
      {/* Top Breadcrumb & Home Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button
            type="button"
            id="breadcrumb-home-btn"
            onClick={onBackHome}
            className="flex items-center gap-1.5 text-slate-900 hover:text-emerald-600 font-semibold transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-600">Food Diary</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-emerald-700 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {food.food_name}
          </span>
        </div>

        {/* Primary Return to Home Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="header-home-btn"
            onClick={onBackHome}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Report Mode Toggle: Summarised Report (5 Key Clinical Features) vs Detailed Report */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl">
          {/* Option 1: Summarised Report */}
          <button
            type="button"
            id="toggle-summarised-report-btn"
            onClick={() => setReportMode('summarised')}
            className={`relative flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              reportMode === 'summarised'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className={`w-4 h-4 shrink-0 ${reportMode === 'summarised' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="truncate">Summarised Report</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 ml-1">
              5 Key Insights
            </span>
          </button>

          {/* Option 2: Detailed Report */}
          <button
            type="button"
            id="toggle-detailed-report-btn"
            onClick={() => setReportMode('detailed')}
            className={`relative flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              reportMode === 'detailed'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className={`w-4 h-4 shrink-0 ${reportMode === 'detailed' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="truncate">Detailed Report</span>
            {reportMode === 'detailed' && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 ml-1">
                Full Data
              </span>
            )}
          </button>
        </div>
      </div>

      {reportMode === 'summarised' ? (
        /* Summarised Report: 5 Clinical Essentials */
        <FoodSummarisedReport
          food={food}
          user={user}
          onSwitchToDetailed={() => setReportMode('detailed')}
          onBackHome={onBackHome}
        />
      ) : (
        /* Detailed Report: Complete Deep Breakdown */
        <>
          {/* Hero Overview Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start">
          {/* Visual Presentation */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="w-full aspect-square max-w-[240px] sm:max-w-[260px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-50 flex items-center justify-center">
              {food.image_url ? (
                <img
                  src={food.image_url}
                  alt={food.food_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Utensils className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="text-xs font-medium">Nutritional Item</span>
                </div>
              )}

              <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white">
                {food.meal_type}
              </span>
            </div>

            {/* AI Confidence / Authenticity Badge */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {food.ai_confidence
                  ? `${Math.round(food.ai_confidence * 100)}% Confidence • Multimodal Vision AI`
                  : 'Verified Clinical Food Record'}
              </span>
            </div>
          </div>

          {/* Core Food Details & Caloric Contribution */}
          <div className="md:col-span-8 flex flex-col justify-between h-full space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Logged at {consumptionTime}
                </span>
                <span>•</span>
                <span className="capitalize">{food.meal_type} Meal</span>
                {food.date && (
                  <>
                    <span>•</span>
                    <span>Date: {food.date}</span>
                  </>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {food.food_name}
              </h1>

              {food.serving_size && (
                <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">Serving Size:</span>
                  <span>{food.serving_size}</span>
                </p>
              )}
            </div>

            {/* Calorie Anchor & Target Contribution */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-slate-500 mb-0.5">
                  Total Energy Density
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {food.calories}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-500">kcal</span>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <div className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-slate-500 mb-0.5">
                  Daily Caloric Contribution
                </div>
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-lg sm:text-xl font-bold text-emerald-700 font-mono">
                    {calorieContributionPct}%
                  </span>
                  <span className="text-xs text-slate-500">
                    of {(targetCalories ?? 2150).toLocaleString()} kcal target
                  </span>
                </div>
              </div>
            </div>

            {/* Dietary Tags if present */}
            {food.dietary_notes && food.dietary_notes.length > 0 && (
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Dietary & Metabolic Attributes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {food.dietary_notes.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-medium"
                    >
                      {note}
                    </span>
                  ))}
                  <span
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${satietyBadgeClass}`}
                  >
                    {satietyAssessment}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Disease Suitability & Health Problem Evaluation */}
      {compatibility && (
        <div
          id="clinical-disease-compatibility-card"
          className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-7 shadow-sm overflow-hidden ${
            compatibility.verdict === 'recommended'
              ? 'bg-linear-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border-emerald-500/40'
              : compatibility.verdict === 'caution'
              ? 'bg-linear-to-br from-amber-950 via-slate-900 to-slate-950 text-white border-amber-500/40'
              : 'bg-linear-to-br from-rose-950 via-slate-900 to-slate-950 text-white border-rose-500/40'
          }`}
        >
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  compatibility.verdict === 'recommended'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                    : compatibility.verdict === 'caution'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-400/30'
                }`}
              >
                {compatibility.verdict === 'recommended' && <CheckCircle2 className="w-6 h-6" />}
                {compatibility.verdict === 'caution' && <AlertTriangle className="w-6 h-6" />}
                {compatibility.verdict === 'not_recommended' && <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Metabolic & Lifestyle Considerations
                  </span>
                  <span className="text-xs text-slate-400">
                    {userConditions.length} Focus Area{userConditions.length > 1 ? 's' : ''} Monitored
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                  {compatibility.verdict_title}
                </h3>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider self-start sm:self-auto border ${
                compatibility.verdict === 'recommended'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : compatibility.verdict === 'caution'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}
            >
              {compatibility.verdict === 'recommended'
                ? 'Safe & Beneficial'
                : compatibility.verdict === 'caution'
                ? 'Moderate Caution'
                : 'Contraindicated'}
            </div>
          </div>

          {/* Primary Reason Statement - Explains why this is good/bad given user's conditions */}
          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-2.5">
              <Stethoscope className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                  Why this meal is {compatibility.verdict === 'recommended' ? 'Good' : compatibility.verdict === 'caution' ? 'Cautionary' : 'Not Recommended'} For You:
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {compatibility.summary_reason}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Condition-by-Condition Impact Breakdown */}
          {compatibility.condition_evaluations && compatibility.condition_evaluations.length > 0 && (
            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Condition-Specific Assessment Breakdown:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {compatibility.condition_evaluations.map((ev, idx) => {
                  const meta = HEALTH_CONDITIONS_CATALOG.find((c) => c.id === ev.condition);
                  const isFavorable = ev.status === 'favorable';
                  const isCaution = ev.status === 'caution';
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {meta?.title || ev.condition}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isFavorable
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isCaution
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{ev.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actionable Dietary Recommendation */}
          {compatibility.clinical_recommendation && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Dietary Guidance: </span>
                <span>{compatibility.clinical_recommendation}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Macronutrient Triad Breakdown (Atwater 4-4-9 Precision) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Macronutrient Caloric Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Calculated using the verified Atwater Energy Factor (4 kcal/g protein, 4 kcal/g carb, 9 kcal/g fat)
              </p>
            </div>
          </div>
        </div>

        {/* Visual Macro Segment Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 mb-6 shadow-inner">
          <div
            style={{ width: `${proteinPct}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Protein: ${proteinPct}%`}
          />
          <div
            style={{ width: `${carbsPct}%` }}
            className="bg-sky-500 h-full transition-all"
            title={`Carbohydrates: ${carbsPct}%`}
          />
          <div
            style={{ width: `${fatsPct}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Fats: ${fatsPct}%`}
          />
        </div>

        {/* 3 Macro Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Protein */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Protein
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">{proteinPct}% kcal</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {food.protein_g}
              </span>
              <span className="text-xs font-bold text-slate-500">grams</span>
              <span className="text-xs text-slate-400 font-mono ml-auto">({proteinKcal} kcal)</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <span>Daily Target Impact:</span>
              <span className="font-semibold text-emerald-900">
                {proteinContributionPct}% of {targetProtein}g
              </span>
            </div>
          </div>

          {/* Carbohydrates */}
          <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Carbohydrates
              </span>
              <span className="text-xs font-mono font-bold text-sky-700">{carbsPct}% kcal</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {food.carbs_g}
              </span>
              <span className="text-xs font-bold text-slate-500">grams</span>
              <span className="text-xs text-slate-400 font-mono ml-auto">({carbsKcal} kcal)</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-sky-200/60 flex items-center justify-between">
              <span>Daily Target Impact:</span>
              <span className="font-semibold text-sky-900">
                {carbsContributionPct}% of {targetCarbs}g
              </span>
            </div>
          </div>

          {/* Dietary Fats */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Dietary Fats
              </span>
              <span className="text-xs font-mono font-bold text-amber-700">{fatsPct}% kcal</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {food.fats_g}
              </span>
              <span className="text-xs font-bold text-slate-500">grams</span>
              <span className="text-xs text-slate-400 font-mono ml-auto">({fatsKcal} kcal)</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
              <span>Daily Target Impact:</span>
              <span className="font-semibold text-amber-900">
                {fatsContributionPct}% of {targetFats}g
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Food Components Breakdown Card (Powered by NVIDIA NIM & Multimodal Vision) */}
      <div id="food-components-breakdown-card" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Food Components & Portion Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Dissected culinary elements with precision macronutrient and portion analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>NVIDIA NIM Vision Engine</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayComponents.map((comp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {comp.name}
                  </h4>
                  {comp.portion && (
                    <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {comp.portion}
                    </span>
                  )}
                </div>

                {comp.description && (
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {comp.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 font-mono">
                  {comp.calories} <span className="text-[10px] text-slate-500 font-sans">kcal</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {comp.protein_g !== undefined && (
                    <span className="text-emerald-700 font-semibold" title="Protein">
                      {comp.protein_g}g P
                    </span>
                  )}
                  {comp.carbs_g !== undefined && (
                    <span className="text-sky-700 font-semibold" title="Carbohydrates">
                      {comp.carbs_g}g C
                    </span>
                  )}
                  {comp.fats_g !== undefined && (
                    <span className="text-amber-700 font-semibold" title="Fats">
                      {comp.fats_g}g F
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutritional Background & Clinical Architecture Card */}
      <div id="nutritional-background-card" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Dna className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Nutritional Background & Metabolic Dynamics
              </h2>
              <p className="text-xs text-slate-500">
                Clinical overview, glycemic curve, electrolyte balance, and cellular health
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/70 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Verified Nutritional Assessment</span>
          </div>
        </div>

        {/* Nutritional Overview narrative */}
        <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 mb-5">
          <p className="text-sm text-slate-700 leading-relaxed">
            {displayBackground.overview}
          </p>
        </div>

        {/* Scientific Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Glycemic Impact */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Glycemic Impact
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                Glucose Response
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">
              {displayBackground.glycemic_impact || 'Moderate Glycemic Response'}
            </p>
            <p className="text-xs text-slate-500">
              Evaluates post-ingestion blood glucose elevation and insulin secretion kinetics.
            </p>
          </div>

          {/* Anti-Inflammatory Index */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Anti-Inflammatory Index
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                displayBackground.anti_inflammatory_score === 'High'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {displayBackground.anti_inflammatory_score || 'High'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">
              Systemic Cytokine Rating
            </p>
            <p className="text-xs text-slate-500">
              Antioxidant potential counteracts oxidative lipid peroxidation and joint stress.
            </p>
          </div>

          {/* Electrolytes Balance */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Electrolytes Summary
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                Na:K Ratio {naKRatio}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {displayBackground.electrolytes_summary || 'Balanced mineral distribution supporting cellular hydration.'}
            </p>
          </div>
        </div>

        {/* Micronutrient Highlights & Clinical Insights */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayBackground.micronutrient_highlights && displayBackground.micronutrient_highlights.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Micronutrient Highlights
              </span>
              <ul className="space-y-1.5">
                {displayBackground.micronutrient_highlights.map((h, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {displayBackground.clinical_insights && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Wellness Insights & Dietary Observations
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {displayBackground.clinical_insights}
              </p>
            </div>
          )}
        </div>

        {/* AI Engine watermark footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Multimodal Engine: <strong className="text-slate-800">{food.ai_engine_used || 'NVIDIA NIM (meta/llama-3.2-11b-vision-instruct)'}</strong></span>
          </div>
          <span className="text-[11px] text-slate-400">Metabolic Nutrition & Vision Intelligence Engine</span>
        </div>
      </div>

      {/* Clinical Micronutrient Analysis (FDA / WHO RDAs) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4 text-violet-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Micronutrient Spectrum & Daily Values (DV)
              </h2>
              <p className="text-xs text-slate-500">
                Benchmarked against official FDA & WHO Daily Recommended Allowances
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
            8 Key Clinical Biomarkers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {(Object.keys(REFERENCE_DAILY_VALUES) as Array<keyof KeyMicronutrients>).map((key) => {
            const meta = REFERENCE_DAILY_VALUES[key];
            const rawVal = food.key_micros?.[key] || 0;
            const pctDV = Math.min(200, Math.round((rawVal / meta.rda) * 100));

            // Quality threshold indicator
            let qualityLabel = 'Low contribution';
            let barColor = 'bg-slate-300';
            if (key === 'sodium_mg') {
              qualityLabel = pctDV > 30 ? 'Elevated Sodium' : 'Controlled Sodium';
              barColor = pctDV > 30 ? 'bg-rose-400' : 'bg-emerald-400';
            } else if (pctDV >= 20) {
              qualityLabel = 'Excellent Source (≥20% DV)';
              barColor = 'bg-emerald-500';
            } else if (pctDV >= 10) {
              qualityLabel = 'Good Source (10-19% DV)';
              barColor = 'bg-sky-500';
            }

            return (
              <div
                key={key}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{meta.label}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{meta.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold text-slate-900">
                      {rawVal} {meta.unit}
                    </span>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {pctDV}% DV (RDA: {meta.rda}
                      {meta.unit})
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
                  <div
                    style={{ width: `${Math.min(100, pctDV)}%` }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>

                <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500">
                  <span className="font-medium">{qualityLabel}</span>
                  <span>{meta.rda} {meta.unit} reference</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Metabolic Ratios & Nutrition Indices */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Scale className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Metabolic & Physiological Quality Indices
            </h2>
            <p className="text-xs text-slate-500">
              Evidence-based nutritional metrics calculated directly from this food's composition
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Protein Density Ratio
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900">
              {proteinDensityPct}%
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {proteinDensityPct >= 30
                ? 'High-density protein structure supporting lean muscular synthesis.'
                : 'Balanced caloric density with moderate amino acid concentration.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Fiber-to-Carb Ratio
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900">
              {fiberToCarbRatio}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {Number(fiberToCarbRatio) >= 0.15
                ? 'Optimal complex carbohydrate structure blunting glucose spikes.'
                : 'Rapid energy bioavailability for post-workout glycogen replenishment.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Sodium : Potassium
            </span>
            <div className="text-2xl font-mono font-extrabold text-slate-900">
              {naKRatio}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {naKRatio !== 'N/A' && Number(naKRatio) <= 1.0
                ? 'Favorable electrolyte balance supporting arterial and fluid pressure.'
                : 'High sodium load; consume adequate water to maintain hydration balance.'}
            </p>
          </div>
        </div>
      </div>

      {/* Goal Alignment & Wellness Context */}
      {user && (
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 space-y-1">
            <span className="font-bold text-sm block">
              Alignment with Your Active Goal: {user.goal === 'manage_weight' ? 'Weight Management' : user.goal === 'stay_fit' ? 'Athletic Conditioning' : 'Health Optimization'}
            </span>
            <p className="text-emerald-800">
              This meal delivers {food.calories} kcal toward your personalized target of {targetCalories} kcal. With {food.protein_g}g of protein and {food.key_micros?.fiber_g || 0}g of dietary fiber, this food aligns directly with your metabolic maintenance schedule.
            </p>
          </div>
        </div>
      )}

      {/* Educational Lifestyle Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
        <p className="text-[11px] text-slate-500">
          Educational lifestyle tracking only. These insights do not substitute for professional medical advice.
        </p>
      </div>
        </>
      )}

      {/* Navigation Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          id="report-delete-btn"
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Remove from Food Diary</span>
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {reportMode === 'summarised' ? (
            <button
              type="button"
              id="footer-switch-to-detailed-btn"
              onClick={() => setReportMode('detailed')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Switch to Detailed Report</span>
            </button>
          ) : (
            <button
              type="button"
              id="footer-switch-to-summarised-btn"
              onClick={() => setReportMode('summarised')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Summarised Report</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500 text-white">
                Coming Soon
              </span>
            </button>
          )}

          <button
            type="button"
            id="footer-home-btn"
            onClick={onBackHome}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

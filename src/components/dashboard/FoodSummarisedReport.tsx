import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  PieChart as PieChartIcon,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  HeartPulse,
  Activity,
  Flame,
  Scale,
  Zap,
  Clock,
  ArrowRight,
  Info,
  ChevronRight,
  FileText,
  Utensils,
  Lightbulb,
  Droplet,
  Bone,
  Check,
} from 'lucide-react';
import { FoodLogEntry, HealthCondition, UserProfile } from '../../types';
import {
  evaluateMealHealthCompatibility,
  getConditionTitle,
  HEALTH_CONDITIONS_CATALOG,
} from '../../lib/healthConditions';

interface FoodSummarisedReportProps {
  food: FoodLogEntry;
  user: UserProfile | null;
  onSwitchToDetailed: () => void;
  onBackHome: () => void;
}

export function FoodSummarisedReport({
  food,
  user,
  onSwitchToDetailed,
  onBackHome,
}: FoodSummarisedReportProps) {
  // Selected macro slice for interactive hover inspection
  const [hoveredMacro, setHoveredMacro] = useState<'protein' | 'carbs' | 'fats' | null>(null);

  // User health conditions & clinical context
  const userConditions = user?.health_conditions || [];
  const userMedicines = user?.medicines || [];
  const healthDescription = user?.health_description || '';

  // Atwater 4-4-9 factor calculations
  const proteinKcal = Math.round((food.protein_g || 0) * 4);
  const carbsKcal = Math.round((food.carbs_g || 0) * 4);
  const fatsKcal = Math.round((food.fats_g || 0) * 9);
  const totalMacroKcal = Math.max(1, proteinKcal + carbsKcal + fatsKcal);

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  // Daily budget targets
  const targetCalories = user?.metrics.target_calories || 2150;
  const calorieContributionPct = Math.min(100, Math.round((food.calories / targetCalories) * 100));

  // Health evaluation
  const compatibility =
    food.health_compatibility ||
    (userConditions.length > 0 || userMedicines.length > 0 || healthDescription.length > 0
      ? evaluateMealHealthCompatibility({
          food_name: food.food_name,
          calories: food.calories,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fats_g: food.fats_g,
          key_micros: food.key_micros,
          dietary_notes: food.dietary_notes,
          health_conditions: userConditions,
          health_description: healthDescription,
          medicines: userMedicines,
        })
      : undefined);

  // Micronutrients
  const sodium = food.key_micros?.sodium_mg ?? 380;
  const potassium = food.key_micros?.potassium_mg ?? 420;
  const fiber = food.key_micros?.fiber_g ?? 3.2;
  const vitC = food.key_micros?.vit_c_mg ?? 14;
  const magnesium = food.key_micros?.magnesium_mg ?? 55;

  // Sodium to Potassium ratio
  const naKRatio = potassium > 0 ? (sodium / potassium).toFixed(2) : '1.0';

  // Satiety index
  const proteinDensity = Math.round((proteinKcal / (food.calories || 1)) * 100);
  const isHighSatiety = proteinDensity >= 28 || fiber >= 5;

  // -------------------------------------------------------------
  // 1. MACRO PIE CHART SVG CALCULATIONS
  // -------------------------------------------------------------
  // SVG donut geometry
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82

  const proteinStroke = (proteinPct / 100) * circumference;
  const carbsStroke = (carbsPct / 100) * circumference;
  const fatsStroke = (fatsPct / 100) * circumference;

  // Stroke offsets (starting at top = -90deg rotation in SVG)
  const proteinOffset = 0;
  const carbsOffset = -proteinStroke;
  const fatsOffset = -(proteinStroke + carbsStroke);

  // -------------------------------------------------------------
  // 2. HEALTH CONDITION DEVIATION CALCULATIONS
  // -------------------------------------------------------------
  // Derive clinical safe limits for a single meal based on active conditions:
  // Baseline DASH meal sodium limit: 500mg (or 400mg if severe hypertension)
  const isHypertension = userConditions.includes('high_bp');
  const isDiabetes = userConditions.includes('diabetes');
  const isCholesterol = userConditions.includes('cholesterol');
  const isArthritis = userConditions.includes('arthritis') || userConditions.includes('joint_pain');
  const isLowBP = userConditions.includes('low_bp');

  // Specific check in custom health description
  const descLower = healthDescription.toLowerCase();
  const mentionsKidney = descLower.includes('kidney') || descLower.includes('renal');
  const mentionsGerd = descLower.includes('gerd') || descLower.includes('acid reflux') || descLower.includes('heartburn');
  const mentionsGout = descLower.includes('gout') || descLower.includes('uric');

  const sodiumCeiling = isHypertension || mentionsKidney ? 500 : 700;
  const sodiumDeviationPct = Math.round(((sodium - sodiumCeiling) / sodiumCeiling) * 100);

  // Carbs / Glycemic ceiling: 40g net carbs for diabetes/prediabetes, 65g for standard
  const netCarbs = Math.max(0, food.carbs_g - fiber);
  const carbsCeiling = isDiabetes ? 40 : 65;
  const carbsDeviationPct = Math.round(((netCarbs - carbsCeiling) / carbsCeiling) * 100);

  // Fat ceiling: 16g for hypercholesterolemia, 25g for standard
  const fatCeiling = isCholesterol ? 16 : 26;
  const fatDeviationPct = Math.round(((food.fats_g - fatCeiling) / fatCeiling) * 100);

  // Fiber target: At least 6g per meal (optimal protective threshold)
  const fiberTarget = isDiabetes || isCholesterol ? 7.0 : 5.5;
  const fiberDeltaPct = Math.round(((fiber - fiberTarget) / fiberTarget) * 100);

  // Deviation parameters array for the graph
  const deviationMetrics = [
    {
      id: 'sodium',
      name: 'Sodium Electrolyte Load',
      conditionContext: isHypertension
        ? 'Hypertension / Arterial Pressure'
        : mentionsKidney
        ? 'Kidney Filtration Threshold'
        : 'Cardiovascular Baseline',
      unit: 'mg',
      currentValue: Math.round(sodium),
      clinicalLimit: sodiumCeiling,
      isCeiling: true, // Lower is better
      deviationPct: sodiumDeviationPct,
      isElevated: sodiumDeviationPct > 0,
      severity:
        sodiumDeviationPct > 30 ? 'high_alert' : sodiumDeviationPct > 0 ? 'caution' : 'optimal',
      detail:
        sodiumDeviationPct > 0
          ? `${sodiumDeviationPct}% above single-meal ceiling. May elevate arterial hydrostatic resistance.`
          : `${Math.abs(sodiumDeviationPct)}% below clinical limit. Heart-safe DASH range.`,
    },
    {
      id: 'carbs',
      name: 'Net Glycemic Carbohydrates',
      conditionContext: isDiabetes
        ? 'Type 2 Diabetes / Insulin Response'
        : 'Glycemic Stability',
      unit: 'g',
      currentValue: Math.round(netCarbs),
      clinicalLimit: carbsCeiling,
      isCeiling: true,
      deviationPct: carbsDeviationPct,
      isElevated: carbsDeviationPct > 0,
      severity:
        carbsDeviationPct > 25 ? 'high_alert' : carbsDeviationPct > 0 ? 'caution' : 'optimal',
      detail:
        carbsDeviationPct > 0
          ? `${carbsDeviationPct}% above low-glycemic allowance. Potential postprandial glucose excursion.`
          : `${Math.abs(carbsDeviationPct)}% within safe range. Sustained insulin sensitivity.`,
    },
    {
      id: 'fats',
      name: 'Lipid & Saturated Fat Density',
      conditionContext: isCholesterol
        ? 'LDL Clearance / ApoB Management'
        : 'Metabolic Balance',
      unit: 'g',
      currentValue: Math.round(food.fats_g),
      clinicalLimit: fatCeiling,
      isCeiling: true,
      deviationPct: fatDeviationPct,
      isElevated: fatDeviationPct > 0,
      severity:
        fatDeviationPct > 35 ? 'high_alert' : fatDeviationPct > 0 ? 'caution' : 'optimal',
      detail:
        fatDeviationPct > 0
          ? `${fatDeviationPct}% above target lipid threshold. High saturated loads suppress hepatic LDL receptors.`
          : `${Math.abs(fatDeviationPct)}% within safe boundaries. Vascular-friendly lipid density.`,
    },
    {
      id: 'fiber',
      name: 'Dietary Prebiotic Fiber',
      conditionContext: isDiabetes || isCholesterol
        ? 'Glucose Blunting & Bile Salt Binding'
        : 'Digestive & Metabolic Wellness',
      unit: 'g',
      currentValue: Number(fiber.toFixed(1)),
      clinicalLimit: fiberTarget,
      isCeiling: false, // Higher is better!
      deviationPct: fiberDeltaPct,
      isElevated: fiberDeltaPct < 0, // In this case, negative fiber is bad
      severity:
        fiberDeltaPct >= 0
          ? 'optimal'
          : fiberDeltaPct > -35
          ? 'caution'
          : 'high_alert',
      detail:
        fiberDeltaPct >= 0
          ? `+${fiberDeltaPct}% protective surplus! Excellent microbiome buffer and glycemic smoothing.`
          : `${Math.abs(fiberDeltaPct)}% below clinical target. Pair with leafy greens or chia/flax seeds.`,
    },
  ];

  // -------------------------------------------------------------
  // 3. RECOMMENDATIONS: WHAT TO AVOID ADDING (2-3 items tailored to disease)
  // -------------------------------------------------------------
  const getAvoidRecommendations = () => {
    const avoids: Array<{
      title: string;
      avoidItem: string;
      reason: string;
      riskLevel: 'high' | 'moderate';
      targetDisease: string;
    }> = [];

    // Check specific conditions
    if (isHypertension || mentionsKidney) {
      avoids.push({
        title: 'Table Salt, Soy Sauce & Bouillon Condiments',
        avoidItem: 'Extra table salt, soy sauce, fish sauce, or bouillon cubes',
        reason:
          'Adding just 1/2 teaspoon adds ~1,150mg sodium, expanding intravascular fluid volume and spiking systolic blood pressure by 8-15 mmHg.',
        riskLevel: 'high',
        targetDisease: isHypertension ? 'Hypertension' : 'Kidney Protection',
      });
      avoids.push({
        title: 'High-Sodium Cured Toppings & Brined Relishes',
        avoidItem: 'Processed bacon bits, salted butter drizzles, or pickled relish',
        reason:
          'Commercial cured toppings contain high concentrations of sodium nitrites and phosphates that impair endothelial vasodilation.',
        riskLevel: 'moderate',
        targetDisease: 'High BP & Vascular Health',
      });
    }

    if (isDiabetes || descLower.includes('prediabetes') || descLower.includes('sugar')) {
      avoids.push({
        title: 'Sweetened Glazes, Honey, Agave & Sugary Sauces',
        avoidItem: 'Honey drizzle, teriyaki glaze, sweet BBQ sauce, or sweet chili sauce',
        reason:
          'Contains 12-24g of isolated high-glycemic sucrose/fructose that enters circulation without cellular fiber, creating acute glucose spikes and beta-cell strain.',
        riskLevel: 'high',
        targetDisease: 'Type 2 Diabetes',
      });
      avoids.push({
        title: 'Refined Starch Crunch Additives',
        avoidItem: 'Fried croutons, white flour breadcrumbs, or sweet corn kernels',
        reason:
          'Rapidly hydrolyzes into simple maltose/glucose, accelerating digestive transit and worsening post-meal insulin resistance.',
        riskLevel: 'moderate',
        targetDisease: 'Glycemic Control',
      });
    }

    if (isCholesterol) {
      avoids.push({
        title: 'Full-Fat Dairy Melts, Heavy Cream & Palm Oil',
        avoidItem: 'Melted cheddar sauce, heavy whipping cream, or palm kernel cooking fat',
        reason:
          'Dense in palmitic and myristic saturated fatty acids that directly suppress hepatic LDL receptor expression, elevating circulating ApoB atherogenic particles.',
        riskLevel: 'high',
        targetDisease: 'Cholesterol & Lipid Profile',
      });
      avoids.push({
        title: 'Hydrogenated Shortening & Commercial Mayonnaise',
        avoidItem: 'Commercial margarine spreads or ultra-processed emulsified dressings',
        reason:
          'Contains oxidized trans-fatty acid isomers that increase vascular cell adhesion molecule (VCAM) synthesis.',
        riskLevel: 'moderate',
        targetDisease: 'Arterial Health',
      });
    }

    if (isArthritis) {
      avoids.push({
        title: 'Reheated Industrial Seed Oils & Deep-Fried Crisps',
        avoidItem: 'Deep-fried batter, commercial corn oil drizzles, or fried shallots',
        reason:
          'Rich in pro-inflammatory Omega-6 arachidonic acid precursors and Advanced Glycation End-products (AGEs) that trigger synovial joint inflammation and cytokine release.',
        riskLevel: 'high',
        targetDisease: 'Arthritis & Joint Stiffness',
      });
    }

    if (mentionsGerd) {
      avoids.push({
        title: 'Hot Chili Peppers, Raw Onions & Acidic Vinegars',
        avoidItem: 'Excess raw garlic/onion, cayenne pepper, or concentrated vinegar glazes',
        reason:
          'Relaxes the lower esophageal sphincter (LES) and stimulates gastric acid hypersecretion, triggering acute heartburn and mucosal irritation.',
        riskLevel: 'high',
        targetDisease: 'Acid Reflux / GERD',
      });
    }

    if (mentionsGout) {
      avoids.push({
        title: 'Yeast Extracts & Concentrated Meat Gravies',
        avoidItem: 'Brewer’s yeast seasonings, concentrated bone glazes, or organ meat broths',
        reason:
          'Extremely dense in purines that convert directly into serum uric acid, precipitating painful monosodium urate joint crystals.',
        riskLevel: 'high',
        targetDisease: 'Gout & Uric Acid',
      });
    }

    // Default fallback safeguards if user has general wellness profile
    if (avoids.length === 0) {
      avoids.push({
        title: 'Excess Added Table Salt & Sodium Enhancers',
        avoidItem: 'Table salt, MSG seasoning packets, or bottled salted condiments',
        reason:
          'Overconsumption beyond 500mg in one sitting prompts osmotic cellular dehydration and transient vascular tension.',
        riskLevel: 'moderate',
        targetDisease: 'Cardiometabolic Baseline',
      });
      avoids.push({
        title: 'Processed Sugary Syrups & High-Fructose Dressings',
        avoidItem: 'Sweet dressings, high-fructose corn syrup glazes, or candied toppings',
        reason:
          'Introduces empty caloric energy without micronutrients, promoting liver fat accumulation and energy crashes.',
        riskLevel: 'moderate',
        targetDisease: 'Metabolic Balance',
      });
    }

    // Return the top 2-3 most critical recommendations
    return avoids.slice(0, 3);
  };

  const avoidRecommendations = getAvoidRecommendations();

  // -------------------------------------------------------------
  // 4. SMART NUTRITIONAL SWAPS: "Add in place of the unnutritious thing"
  // -------------------------------------------------------------
  const getNutritionalSwaps = () => {
    const swaps = [
      {
        id: 'swap-1',
        title: 'Flavor & Electrolyte Upgrade',
        unnutritious: 'Table Salt, MSG Seasoning or Commercial Soy Sauce',
        unnutritiousIssue: 'High sodium load (+450mg), causes water retention and arterial tension',
        nutritiousReplacement: 'Fresh Squeezed Lemon Juice, Raw Minced Garlic & Cracked Black Pepper',
        nutritiousBenefits:
          'Supplies potassium, vitamin C bioflavonoids, and allicin to stimulate endothelial nitric oxide vasodilation with zero sodium.',
        clinicalROI: ['-450mg Sodium', '+12mg Vitamin C', 'Zero Vascular Tension'],
        tag: 'Cardiovascular Care',
      },
      {
        id: 'swap-2',
        title: 'Glycemic Carbohydrate Upgrade',
        unnutritious: 'Refined White Rice, White Bread, or Instant Noodles',
        unnutritiousIssue: 'High glycemic index (GI 75+), causes rapid blood sugar spikes and insulin surges',
        nutritiousReplacement: 'Steamed Tricolor Quinoa, Cauliflower Rice, or Sprouted Lentils',
        nutritiousBenefits:
          'Delivers slow-burning low-GI complex carbs, rich in soluble prebiotic fiber and magnesium that improves insulin receptor sensitivity.',
        clinicalROI: ['+4.5g Prebiotic Fiber', 'Glycemic Load Cut by 45%', '+55mg Magnesium'],
        tag: 'Insulin Sensitivity',
      },
      {
        id: 'swap-3',
        title: 'Lipid & Dressing Upgrade',
        unnutritious: 'Commercial Bottled Cream Dressing or Saturated Cheese Sauce',
        unnutritiousIssue: 'Loaded with saturated palmitic fats, refined seed oils, and artificial preservatives',
        nutritiousReplacement: 'Cold-Pressed Extra Virgin Olive Oil & Plain Greek Yogurt Dressing with Fresh Dill',
        nutritiousBenefits:
          'Replaces saturated fat with cardiac oleic acid (Omega-9), natural active probiotics for microbiome balance, and bone-building calcium.',
        clinicalROI: ['-6g Saturated Fat', '+6g Clean Protein', 'Heart-Healthy Omega-9'],
        tag: 'Lipid & Gut Health',
      },
      {
        id: 'swap-4',
        title: 'Sweetener & Crunch Upgrade',
        unnutritious: 'Refined Sugar Glazes, Croutons, or High-Fructose BBQ Sauce',
        unnutritiousIssue: 'Empty refined carbs, rapid fructose delivery to the liver, pro-inflammatory AGEs',
        nutritiousReplacement: 'Fresh Blueberries or Pomegranate Arils with Crushed Raw Walnuts & Ceylon Cinnamon',
        nutritiousBenefits:
          'Delivers neuroprotective anthocyanins, plant-based ALA Omega-3 fatty acids, and chromium to regulate insulin clearance.',
        clinicalROI: ['-18g Added Sugars', '+850mg Plant Omega-3', '+High Polyphenol Antioxidants'],
        tag: 'Anti-Inflammatory',
      },
    ];

    // Filter or reorder based on conditions
    if (isHypertension) {
      return [swaps[0], swaps[2], swaps[1]];
    }
    if (isDiabetes) {
      return [swaps[1], swaps[3], swaps[0]];
    }
    if (isCholesterol) {
      return [swaps[2], swaps[1], swaps[3]];
    }
    if (isArthritis) {
      return [swaps[3], swaps[2], swaps[0]];
    }
    return swaps.slice(0, 3);
  };

  const nutritionalSwaps = getNutritionalSwaps();

  return (
    <div id="summarised-report-container" className="space-y-6">
      {/* ========================================================================= */}
      {/* 5TH ELEMENT / HEADER: CLINICAL HEALTH & MACRO EXECUTIVE SUMMARY CARD     */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl sm:rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-sm relative overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs">
                <Sparkles className="w-3 h-3" />
                AI Clinical Summarised Report
              </span>

              {/* Compatibility Verdict Pill */}
              {compatibility && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    compatibility.verdict === 'recommended'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : compatibility.verdict === 'caution'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                  }`}
                >
                  {compatibility.verdict === 'recommended' ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ) : compatibility.verdict === 'caution' ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  ) : (
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                  )}
                  <span>{compatibility.verdict_title}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{food.food_name}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                {food.meal_type}
              </span>
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {compatibility?.summary_reason ||
                `${food.food_name} delivers ${food.calories} kcal with a balanced macronutrient distribution tailored to your health goals.`}
            </p>
          </div>

          {/* Caloric & Switch Mode CTA */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Single Meal Energy
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                  {food.calories}
                </span>
                <span className="text-xs font-bold text-slate-400">kcal</span>
                <span className="text-xs text-slate-400 ml-1">
                  ({calorieContributionPct}% of {targetCalories} target)
                </span>
              </div>
            </div>

            <button
              type="button"
              id="summarised-to-detailed-btn"
              onClick={onSwitchToDetailed}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Detailed Report</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Active Health Profile Indicators */}
        <div className="relative z-10 pt-4 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Profile Evaluated:
            </span>
            {userConditions.length > 0 ? (
              userConditions.map((cond) => {
                const meta = HEALTH_CONDITIONS_CATALOG.find((c) => c.id === cond);
                return (
                  <span
                    key={cond}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] text-white font-medium"
                  >
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>{meta ? meta.title : cond}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                Standard Cardiometabolic Health Protocol
              </span>
            )}
            {healthDescription && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/30 text-[11px] text-sky-200 font-medium">
                <span>Clinical Notes: &ldquo;{healthDescription}&rdquo;</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Holt Satiety: <strong className="text-white">{isHighSatiety ? 'High Sustained' : 'Moderate'}</strong></span>
            <span>•</span>
            <span>Na:K Ratio: <strong className="text-emerald-300 font-mono">{naKRatio}</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PIE CHART SHOWING THE MACRO NUTRITION DISTRIBUTION OF THAT FOOD        */}
      {/* ========================================================================= */}
      <div
        id="summarised-macro-piechart-card"
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Macro Nutrition Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Exact caloric energy contribution of Protein, Carbohydrates, and Fats via Atwater 4-4-9 Standard
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 self-start sm:self-auto">
            <span>Ratio:</span>
            <span className="font-mono text-emerald-700 font-bold">{proteinPct}%P</span>
            <span>:</span>
            <span className="font-mono text-sky-700 font-bold">{carbsPct}%C</span>
            <span>:</span>
            <span className="font-mono text-amber-700 font-bold">{fatsPct}%F</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Interactive SVG Donut / Pie Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-2">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center select-none">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="24"
                />

                {/* Protein Arc (Emerald) */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth={hoveredMacro === 'protein' ? '28' : '24'}
                  strokeDasharray={`${proteinStroke} ${circumference}`}
                  strokeDashoffset={proteinOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredMacro('protein')}
                  onMouseLeave={() => setHoveredMacro(null)}
                />

                {/* Carbohydrates Arc (Sky) */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="#0EA5E9"
                  strokeWidth={hoveredMacro === 'carbs' ? '28' : '24'}
                  strokeDasharray={`${carbsStroke} ${circumference}`}
                  strokeDashoffset={carbsOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredMacro('carbs')}
                  onMouseLeave={() => setHoveredMacro(null)}
                />

                {/* Healthy Fats Arc (Amber) */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth={hoveredMacro === 'fats' ? '28' : '24'}
                  strokeDasharray={`${fatsStroke} ${circumference}`}
                  strokeDashoffset={fatsOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredMacro('fats')}
                  onMouseLeave={() => setHoveredMacro(null)}
                />
              </svg>

              {/* Dynamic Center Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                {hoveredMacro === 'protein' ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                      Protein
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      {food.protein_g}g
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {proteinPct}% • {proteinKcal} kcal
                    </span>
                  </motion.div>
                ) : hoveredMacro === 'carbs' ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">
                      Carbohydrates
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      {food.carbs_g}g
                    </div>
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                      {carbsPct}% • {carbsKcal} kcal
                    </span>
                  </motion.div>
                ) : hoveredMacro === 'fats' ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                      Healthy Fats
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      {food.fats_g}g
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {fatsPct}% • {fatsKcal} kcal
                    </span>
                  </motion.div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Total Energy
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                      {food.calories}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">kcal</span>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[11px] text-slate-400 mt-2 text-center">
              Hover slices or cards to inspect macronutrient density
            </span>
          </div>

          {/* Macro Breakdown Cards */}
          <div className="md:col-span-7 space-y-3">
            {/* Protein Card */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                hoveredMacro === 'protein'
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70'
              }`}
              onMouseEnter={() => setHoveredMacro('protein')}
              onMouseLeave={() => setHoveredMacro(null)}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Protein</span>
                  <span className="text-[11px] text-slate-500">4 kcal / g</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {food.protein_g}g
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    {proteinPct}% ({proteinKcal} kcal)
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Sustains lean muscle protein synthesis, blunts postprandial ghrelin (hunger hormone), and supports immune cell repair.
              </p>
            </div>

            {/* Carbohydrates Card */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                hoveredMacro === 'carbs'
                  ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70'
              }`}
              onMouseEnter={() => setHoveredMacro('carbs')}
              onMouseLeave={() => setHoveredMacro(null)}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Carbohydrates</span>
                  <span className="text-[11px] text-slate-500">4 kcal / g</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {food.carbs_g}g
                  </span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full">
                    {carbsPct}% ({carbsKcal} kcal)
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${carbsPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Supplies cellular ATP for erythrocytes and cerebral glucose. Buffered by {fiber.toFixed(1)}g dietary fiber to manage glycemic release.
              </p>
            </div>

            {/* Fats Card */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                hoveredMacro === 'fats'
                  ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70'
              }`}
              onMouseEnter={() => setHoveredMacro('fats')}
              onMouseLeave={() => setHoveredMacro(null)}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Fats</span>
                  <span className="text-[11px] text-slate-500">9 kcal / g</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {food.fats_g}g
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    {fatsPct}% ({fatsKcal} kcal)
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${fatsPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Essential precursor for steroid hormone synthesis, fat-soluble vitamin (A, D, E, K) assimilation, and phospholipid cellular membranes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRAPH SHOWING THE DEVIATION OF THAT FOOD WITH THEIR HEALTH CONDITION  */}
      {/* ========================================================================= */}
      <div
        id="summarised-deviation-graph-card"
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Health Condition Deviation & Tolerance Graph
              </h3>
              <p className="text-xs text-slate-500">
                Nutrient tolerance variance plotted against clinical single-meal safety ceilings for your medical profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Safe Range</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-1" />
            <span>Borderline</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 ml-1" />
            <span>High Deviation</span>
          </div>
        </div>

        {/* Deviation Visual Bars */}
        <div className="space-y-4">
          {deviationMetrics.map((item) => {
            // Visual calculation for benchmark bar (normalized to 100% threshold)
            const ratioPct = Math.min(180, Math.max(10, Math.round((item.currentValue / (item.clinicalLimit || 1)) * 100)));
            const isSafe = item.severity === 'optimal';
            const isCaution = item.severity === 'caution';

            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-semibold">
                        {item.conditionContext}
                      </span>
                    </div>
                  </div>

                  {/* Values & Deviation Badge */}
                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <div className="text-xs text-slate-600 font-medium">
                      Food: <strong className="text-slate-900 font-mono">{item.currentValue}{item.unit}</strong>{' '}
                      <span className="text-slate-400">/ Limit: {item.clinicalLimit}{item.unit}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSafe
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCaution
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {isSafe ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : isCaution ? (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                      )}
                      <span>
                        {item.id === 'fiber'
                          ? item.deviationPct >= 0
                            ? `+${item.deviationPct}% Protective`
                            : `${item.deviationPct}% Deficit`
                          : item.deviationPct > 0
                          ? `+${item.deviationPct}% Deviation`
                          : `${item.deviationPct}% Safe Buffer`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Benchmark Bar with Target Reference Line at 100% */}
                <div className="relative pt-1 pb-1">
                  {/* Visual Reference Track (0% to 150%) */}
                  <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden relative">
                    {/* Fill */}
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isSafe
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : isCaution
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-rose-500 to-rose-600'
                      }`}
                      style={{ width: `${Math.min(100, ratioPct)}%` }}
                    />
                  </div>

                  {/* 100% Target Limit Reference Indicator Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10 flex flex-col items-center pointer-events-none"
                    style={{ left: '65%' }}
                  >
                    <span className="hidden sm:block absolute -top-4 text-[9px] font-extrabold uppercase tracking-wider text-slate-600 bg-white px-1 rounded shadow-2xs border border-slate-200">
                      Target Ceiling
                    </span>
                  </div>
                </div>

                {/* Clinical Context Footnote */}
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{item.detail}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. A BOX WITH 2-3 RECOMMENDATIONS OF WHAT TO AVOID ADDING ACCORDING TO DISEASE */}
      {/* ========================================================================= */}
      <div
        id="summarised-avoid-recommendations-box"
        className="rounded-2xl sm:rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 p-5 sm:p-7 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Clinical Safeguards: What to Avoid Adding
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">
                  2-3 Key Rules
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ingredients and toppings to strictly exclude to prevent disease flare-ups based on your medical profile
              </p>
            </div>
          </div>
        </div>

        {/* Avoid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {avoidRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-rose-200/90 shadow-2xs space-y-2.5 hover:border-rose-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                    Rule #{idx + 1} • {rec.targetDisease}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>

                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    Avoid {rec.avoidItem}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                  {rec.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-rose-700">
                <span>Clinical Hazard:</span>
                <span className="font-semibold text-slate-600">
                  {rec.riskLevel === 'high' ? 'Acute Biomarker Elevation' : 'Moderate Strain'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. NUTRITIONAL THINGS THEY CAN ADD IN PLACE BY REMOVING THE UNNUTRITIONED THING */}
      {/* ========================================================================= */}
      <div
        id="summarised-nutritional-swaps-box"
        className="rounded-2xl sm:rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/40 p-5 sm:p-7 shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Smart Nutritional Swaps: Replace & Upgrade
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                  Upgrade & Protect
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Clinically designed substitutions to eliminate unnutritious components and introduce disease-fighting micronutrients
              </p>
            </div>
          </div>
        </div>

        {/* Paired Swap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nutritionalSwaps.map((swap) => (
            <div
              key={swap.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-emerald-400 hover:shadow-xs transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {swap.tag}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{swap.title}</span>
                </div>

                {/* Step 1: Remove unnutritious */}
                <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="line-through">Remove / Avoid</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 line-through">
                    {swap.unnutritious}
                  </div>
                  <div className="text-[10px] text-rose-700 leading-tight">
                    {swap.unnutritiousIssue}
                  </div>
                </div>

                {/* Visual Arrow */}
                <div className="flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Step 2: Add nutritious replacement */}
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Add in its Place</span>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-900">
                    {swap.nutritiousReplacement}
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight">
                    {swap.nutritiousBenefits}
                  </div>
                </div>
              </div>

              {/* Clinical ROI Tags */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                {swap.clinicalROI.map((roi, rIdx) => (
                  <span
                    key={rIdx}
                    className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 border border-emerald-200/60"
                  >
                    ✓ {roi}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

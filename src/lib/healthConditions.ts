import { FoodHealthCompatibility, HealthCondition, HealthConditionEvaluation, KeyMicronutrients } from '../types';

export interface HealthConditionMeta {
  id: HealthCondition;
  title: string;
  badge: string;
  shortDesc: string;
  clinicalFocus: string;
  iconName: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    ring: string;
  };
  sampleChips: string[];
}

export const HEALTH_CONDITIONS_CATALOG: HealthConditionMeta[] = [
  {
    id: 'diabetes',
    title: 'Diabetes',
    badge: 'Glycemic Control',
    shortDesc: 'Blood glucose regulation, insulin sensitivity, and managing HbA1c spikes.',
    clinicalFocus: 'Low glycemic load, high soluble fiber (>30g/day), complex carbohydrates, low simple sugars.',
    iconName: 'Activity',
    color: {
      bg: 'bg-sky-50/70',
      border: 'border-sky-200',
      text: 'text-sky-900',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      ring: 'ring-sky-500/30',
    },
    sampleChips: [
      'Type 2, managing HbA1c',
      'Prediabetes, watching insulin spikes',
      'Doctor advised low-glycemic foods',
      'Monitoring post-meal carbohydrate surge',
    ],
  },
  {
    id: 'high_bp',
    title: 'High BP (Hypertension)',
    badge: 'Cardiovascular Care',
    shortDesc: 'Vascular pressure regulation, endothelial health, and sodium restriction.',
    clinicalFocus: 'Strict sodium restriction (<1,500mg/day), high potassium (>3,500mg), magnesium, DASH dietary protocol.',
    iconName: 'HeartPulse',
    color: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      text: 'text-rose-900',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      ring: 'ring-rose-500/30',
    },
    sampleChips: [
      'Hypertension Stage 1, watching sodium',
      'Taking blood pressure medication',
      'Strict DASH diet recommendation',
      'Aiming for sodium under 1,500mg daily',
    ],
  },
  {
    id: 'low_bp',
    title: 'Low BP (Hypotension)',
    badge: 'Hemodynamic Stability',
    shortDesc: 'Preventing orthostatic dizziness, maintaining healthy blood volume and fluid balance.',
    clinicalFocus: 'Adequate electrolyte balance, generous fluid hydration (3.0L+), steady sodium, frequent nutrient-dense meals.',
    iconName: 'Gauge',
    color: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      ring: 'ring-amber-500/30',
    },
    sampleChips: [
      'Postural dizziness when standing quickly',
      'Prone to fatigue & low blood volume',
      'Doctor advised adequate hydration & electrolytes',
      'Needs steady energy without prolonged fasting',
    ],
  },
  {
    id: 'arthritis',
    title: 'Arthritis',
    badge: 'Anti-Inflammatory',
    shortDesc: 'Reducing systemic joint inflammation, preventing stiffness and cytokine flares.',
    clinicalFocus: 'Rich in Omega-3 EPA/DHA, polyphenols, vitamin C, avoiding refined sugars, trans fats, and ultra-processed pro-inflammatory oils.',
    iconName: 'ShieldAlert',
    color: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      text: 'text-purple-900',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      ring: 'ring-purple-500/30',
    },
    sampleChips: [
      'Osteoarthritis knee & wrist discomfort',
      'Rheumatoid stiffness in mornings',
      'Focusing on anti-inflammatory Mediterranean foods',
      'Avoiding inflammatory refined sugars',
    ],
  },
  {
    id: 'joint_pain',
    title: 'Joint Pain',
    badge: 'Cartilage & Mobility',
    shortDesc: 'Cartilage support, connective tissue synthesis, and lubricating mobility.',
    clinicalFocus: 'Collagen-synthesizing Vitamin C, magnesium, anti-inflammatory antioxidants (turmeric/curcumin), healthy unsaturated fats.',
    iconName: 'Bone',
    color: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      ring: 'ring-emerald-500/30',
    },
    sampleChips: [
      'Recurrent knee ache after movement',
      'Lower back and hip joint stiffness',
      'Seeking joint protective nutrition & collagen',
      'Targeting anti-inflammatory nutrient density',
    ],
  },
  {
    id: 'cholesterol',
    title: 'Cholesterol',
    badge: 'Lipid Balance',
    shortDesc: 'Cardiovascular lipid management, LDL regulation, and arterial wellness.',
    clinicalFocus: 'Rich in soluble viscous fiber (oats, legumes, pectin), plant stanols, monounsaturated fats (EVOO, nuts), low saturated fat (<10g/day) & zero trans fats.',
    iconName: 'Droplet',
    color: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      ring: 'ring-amber-500/30',
    },
    sampleChips: [
      'Managing elevated LDL cholesterol',
      'Taking statin medication regularly',
      'Doctor advised low saturated fat (<10g/meal)',
      'Aiming to increase soluble fiber & HDL',
    ],
  },
];

/**
 * Metabolic & Lifestyle Evaluation Rules Engine
 * Evaluates whether a given food item aligns with a user's health focus areas and regular medicines.
 */
export function evaluateMealHealthCompatibility(params: {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  key_micros?: Partial<KeyMicronutrients>;
  dietary_notes?: string[];
  health_conditions: HealthCondition[];
  health_description?: string;
  medicines?: string[];
}): FoodHealthCompatibility {
  const {
    food_name,
    calories,
    protein_g,
    carbs_g,
    fats_g,
    key_micros = {},
    dietary_notes = [],
    health_conditions,
    health_description,
    medicines = [],
  } = params;

  if (!health_conditions || health_conditions.length === 0) {
    return {
      is_recommended: true,
      verdict: 'recommended',
      verdict_title: 'Nutrient-Dense Profile',
      summary_reason: 'This meal provides balanced energy and macronutrients for general athletic wellness.',
      condition_evaluations: [],
      clinical_recommendation: 'Maintain portion balance and pair with adequate hydration.',
    };
  }

  const sodium = key_micros.sodium_mg ?? 350;
  const potassium = key_micros.potassium_mg ?? 400;
  const fiber = key_micros.fiber_g ?? 3;
  const vitC = key_micros.vit_c_mg ?? 15;
  const magnesium = key_micros.magnesium_mg ?? 60;

  const evaluations: HealthConditionEvaluation[] = [];
  const reasons: string[] = [];
  let cautionCount = 0;
  let unfavorableCount = 0;

  // 1. Diabetes
  if (health_conditions.includes('diabetes')) {
    const netCarbs = Math.max(0, carbs_g - fiber);
    const isHighCarbLowFiber = carbs_g > 45 && fiber < 3;
    const isVeryHighCarb = carbs_g > 65;
    const hasGoodFiber = fiber >= 6 || (carbs_g <= 35 && protein_g >= 20);

    if (isVeryHighCarb || isHighCarbLowFiber) {
      unfavorableCount++;
      evaluations.push({
        condition: 'diabetes',
        status: 'unfavorable',
        detail: `High rapid carbohydrates (${Math.round(carbs_g)}g) with low fiber (${fiber.toFixed(1)}g) risks a sharp postprandial glucose spike.`,
      });
      reasons.push(`For your Diabetes: this dish contains ${Math.round(carbs_g)}g of carbs with only ${fiber.toFixed(1)}g of dietary fiber, which can cause a rapid surge in blood glucose.`);
    } else if (carbs_g > 40 && fiber < 5) {
      cautionCount++;
      evaluations.push({
        condition: 'diabetes',
        status: 'caution',
        detail: `Moderate carbohydrate load (${Math.round(carbs_g)}g); pair with leafy greens or lean protein to slow glucose absorption.`,
      });
      reasons.push(`For your Diabetes: the ${Math.round(carbs_g)}g carbohydrate load is manageable but should be eaten alongside high-fiber vegetables to buffer glycemic uptake.`);
    } else {
      evaluations.push({
        condition: 'diabetes',
        status: 'favorable',
        detail: `Excellent glycemic profile: rich in dietary fiber (${fiber.toFixed(1)}g) with ${Math.round(protein_g)}g protein, promoting stable insulin response.`,
      });
      reasons.push(`For your Diabetes: this meal is highly favorable because its ${fiber.toFixed(1)}g of fiber and ${Math.round(protein_g)}g of protein stabilize your post-meal blood sugar.`);
    }
  }

  // 2. High BP
  if (health_conditions.includes('high_bp')) {
    const isHighSodium = sodium > 750;
    const isModerateSodium = sodium > 500;
    const isGoodPotassiumRatio = potassium > sodium;

    if (isHighSodium) {
      unfavorableCount++;
      evaluations.push({
        condition: 'high_bp',
        status: 'unfavorable',
        detail: `Elevated sodium content (${Math.round(sodium)}mg) exceeds safe single-meal thresholds for hypertension management.`,
      });
      reasons.push(`For your High BP: it contains ${Math.round(sodium)}mg of sodium (over 50% of your daily clinical limit), which can elevate arterial vascular tension.`);
    } else if (isModerateSodium) {
      cautionCount++;
      evaluations.push({
        condition: 'high_bp',
        status: 'caution',
        detail: `Sodium is slightly elevated (${Math.round(sodium)}mg); keep other meals today low in added salt.`,
      });
      reasons.push(`For your High BP: the sodium level (${Math.round(sodium)}mg) is on the borderline, so avoid adding extra table salt.`);
    } else {
      evaluations.push({
        condition: 'high_bp',
        status: 'favorable',
        detail: `DASH-compliant: low sodium (${Math.round(sodium)}mg) accompanied by protective potassium (${Math.round(potassium)}mg) supporting healthy endothelial vasodilation.`,
      });
      reasons.push(`For your High BP: it is very heart-safe with only ${Math.round(sodium)}mg of sodium and a generous ${Math.round(potassium)}mg of potassium supporting vasodilation.`);
    }
  }

  // 3. Low BP
  if (health_conditions.includes('low_bp')) {
    const isVeryLowSodium = sodium < 120 && calories < 250;
    if (isVeryLowSodium) {
      cautionCount++;
      evaluations.push({
        condition: 'low_bp',
        status: 'caution',
        detail: `Very low sodium and light caloric volume; ensure you hydrate with mineral-rich fluids to prevent lightheadedness.`,
      });
      reasons.push(`For your Low BP: this meal is very light with minimal electrolytes, so be sure to drink mineral-rich water or add a pinch of sea salt to prevent postural dips.`);
    } else {
      evaluations.push({
        condition: 'low_bp',
        status: 'favorable',
        detail: `Provides steady metabolic nourishment and balanced electrolyte content (${Math.round(sodium)}mg sodium) to support healthy hemodynamic blood volume.`,
      });
      reasons.push(`For your Low BP: the steady energy and ${Math.round(sodium)}mg of natural electrolytes help sustain stable vascular tone and avoid fatigue.`);
    }
  }

  // 4. Arthritis
  if (health_conditions.includes('arthritis')) {
    const notesStr = dietary_notes.join(' ').toLowerCase();
    const hasAntiInflammatory =
      notesStr.includes('omega-3') ||
      notesStr.includes('antioxidant') ||
      food_name.toLowerCase().includes('salmon') ||
      food_name.toLowerCase().includes('olive') ||
      food_name.toLowerCase().includes('berry') ||
      food_name.toLowerCase().includes('spinach') ||
      vitC >= 25;

    const hasProInflammatory =
      (fats_g > 35 && protein_g < 15) ||
      (carbs_g > 50 && fiber < 2) ||
      food_name.toLowerCase().includes('fried') ||
      food_name.toLowerCase().includes('pastry');

    if (hasProInflammatory) {
      cautionCount++;
      evaluations.push({
        condition: 'arthritis',
        status: 'caution',
        detail: `Contains elevated refined fats or low-fiber carbs that may stimulate systemic pro-inflammatory cytokines and morning stiffness.`,
      });
      reasons.push(`For your Arthritis: this plate contains heavier processed fats/sugars which can trigger inflammatory pathways in sensitive joints.`);
    } else if (hasAntiInflammatory) {
      evaluations.push({
        condition: 'arthritis',
        status: 'favorable',
        detail: `Anti-inflammatory powerhouse: rich in joint-protective antioxidants and healthy fatty acids that help downregulate joint inflammation.`,
      });
      reasons.push(`For your Arthritis: this is wonderful because it delivers natural anti-inflammatory compounds and antioxidants that help soothe joint inflammation.`);
    } else {
      evaluations.push({
        condition: 'arthritis',
        status: 'favorable',
        detail: `Neutral, clean nutrient profile with decent micronutrient density supporting cartilage wellness.`,
      });
      reasons.push(`For your Arthritis: this meal provides clean, unprocessed fuel that won't irritate joint tissues.`);
    }
  }

  // 5. Joint Pain
  if (health_conditions.includes('joint_pain')) {
    const isProtective = vitC >= 20 || magnesium >= 70 || protein_g >= 25;
    if (isProtective) {
      evaluations.push({
        condition: 'joint_pain',
        status: 'favorable',
        detail: `Supplies vital amino acids (${Math.round(protein_g)}g protein) and micronutrients (Vit C & Magnesium) that aid cartilage repair and tendon health.`,
      });
      reasons.push(`For your Joint Pain: it provides ${Math.round(protein_g)}g of protein and essential micronutrients needed for tendon resilience and cartilage matrix repair.`);
    } else {
      evaluations.push({
        condition: 'joint_pain',
        status: 'favorable',
        detail: `Light and easily digestible, avoiding heavy pro-inflammatory loads that exacerbate joint ache.`,
      });
      reasons.push(`For your Joint Pain: this meal offers clean energy that supports daily mobility without triggering joint inflammation.`);
    }
  }

  // 6. Cholesterol & Lipid Balance
  if (health_conditions.includes('cholesterol')) {
    const lowerName = food_name.toLowerCase();
    const hasHighSaturatedFat = fats_g > 25 && !lowerName.includes('salmon') && !lowerName.includes('olive') && !lowerName.includes('nut') && !lowerName.includes('avocado');
    const isFriedOrPastry = lowerName.includes('fried') || lowerName.includes('butter') || lowerName.includes('bacon') || lowerName.includes('sausage') || lowerName.includes('pastry');
    const hasSolubleFiber = fiber >= 4 || lowerName.includes('oat') || lowerName.includes('lentil') || lowerName.includes('dal') || lowerName.includes('bean') || lowerName.includes('apple') || lowerName.includes('berry');
    const hasHeartHealthyFats = lowerName.includes('salmon') || lowerName.includes('olive') || lowerName.includes('flax') || lowerName.includes('chia') || lowerName.includes('walnut');

    if (isFriedOrPastry || (hasHighSaturatedFat && !hasSolubleFiber)) {
      cautionCount++;
      evaluations.push({
        condition: 'cholesterol',
        status: 'caution',
        detail: `Elevated lipid or saturated fat load (${Math.round(fats_g)}g fats); frequent intake may elevate circulating LDL and ApoB lipoproteins.`,
      });
      reasons.push(`For your Cholesterol: this dish carries heavier saturated fats which can impede LDL clearance.`);
    } else if (hasSolubleFiber || hasHeartHealthyFats) {
      evaluations.push({
        condition: 'cholesterol',
        status: 'favorable',
        detail: `Rich in soluble fiber (${Math.round(fiber)}g) or unsaturated fatty acids that bind intestinal bile salts and support healthy arterial lipid balance.`,
      });
      reasons.push(`For your Cholesterol: high soluble fiber and beneficial fats promote hepatic LDL clearance.`);
    } else {
      evaluations.push({
        condition: 'cholesterol',
        status: 'favorable',
        detail: `Moderate lipid density that fits smoothly within daily cardiovascular guidelines.`,
      });
      reasons.push(`For your Cholesterol: balanced fat profile that maintains cardiovascular harmony.`);
    }
  }

  // Cross-reference with regular medications
  const medicineNotes: string[] = [];
  if (medicines && medicines.length > 0) {
    const medLower = medicines.map((m) => m.toLowerCase()).join(' ');
    const foodLower = food_name.toLowerCase();

    // Check Statin interaction (Grapefruit)
    if ((medLower.includes('statin') || medLower.includes('atorvastatin') || medLower.includes('lipitor') || medLower.includes('rosuvastatin') || medLower.includes('simvastatin')) &&
        (foodLower.includes('grapefruit') || foodLower.includes('pomelo'))) {
      unfavorableCount++;
      medicineNotes.push('Warning: Grapefruit inhibits the CYP3A4 enzyme, drastically raising statin blood concentrations. Avoid this combination.');
    }

    // Check Metformin timing & GI considerations
    if (medLower.includes('metformin') || medLower.includes('glucophage')) {
      if (carbs_g > 50 && fiber < 3) {
        medicineNotes.push('Metformin guidance: Pair higher-carbohydrate foods with lean protein or fiber to prevent post-meal glycemic swings and digestive upset.');
      } else {
        medicineNotes.push('Metformin guidance: Balanced meal profile supports optimal insulin sensitivity.');
      }
    }

    // Check Blood Pressure meds (ACEi / ARBs) with extreme potassium
    if ((medLower.includes('lisinopril') || medLower.includes('losartan') || medLower.includes('enalapril') || medLower.includes('valsartan')) &&
        potassium > 1200) {
      medicineNotes.push('ACEi/ARB guidance: Meal is exceptionally high in potassium. Ensure total daily potassium remains within safe target limits.');
    }
  }

  // Aggregate verdict
  let verdict: 'recommended' | 'caution' | 'not_recommended' = 'recommended';
  let verdict_title = 'Safe & Recommended for Your Health Profile';
  let is_recommended = true;

  if (unfavorableCount > 0) {
    verdict = 'not_recommended';
    is_recommended = false;
    verdict_title = `Not Recommended: Consider Alternatives for ${health_conditions.map((c) => getConditionTitle(c)).join(' & ')}`;
  } else if (cautionCount > 0) {
    verdict = 'caution';
    is_recommended = true;
    verdict_title = `Consume with Caution for ${health_conditions.map((c) => getConditionTitle(c)).join(' & ')}`;
  } else {
    verdict = 'recommended';
    is_recommended = true;
    verdict_title = `Highly Recommended for ${health_conditions.map((c) => getConditionTitle(c)).join(' & ')}`;
  }

  const conditionsListReadable = health_conditions.map((c) => getConditionTitle(c)).join(', ');
  let summary_reason = `Considering your focus on ${conditionsListReadable}${health_description ? ` ("${health_description.trim()}")` : ''}: ${reasons.join(' ')}`;
  if (medicineNotes.length > 0) {
    summary_reason += ` [Medication Notes: ${medicineNotes.join(' ')}]`;
  }

  let clinical_recommendation = 'Enjoy as part of your calibrated daily nutrition protocol.';
  if (medicineNotes.length > 0) {
    clinical_recommendation = medicineNotes[0];
  } else if (unfavorableCount > 0) {
    clinical_recommendation = 'Consider a smaller portion size, substitute high-sodium or high-glycemic ingredients, or pair with fresh vegetables and water.';
  } else if (cautionCount > 0) {
    clinical_recommendation = 'Balance this meal with high-fiber sides and keep your remaining daily meals compliant with your nutrition thresholds.';
  }

  return {
    is_recommended,
    verdict,
    verdict_title,
    summary_reason,
    condition_evaluations: evaluations,
    clinical_recommendation,
  };
}

export function getConditionTitle(condition: HealthCondition): string {
  const meta = HEALTH_CONDITIONS_CATALOG.find((c) => c.id === condition);
  return meta ? meta.title : condition;
}

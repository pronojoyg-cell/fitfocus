import { ChevronRight, Sparkles } from 'lucide-react';
import { MICRONUTRIENT_TARGETS } from '../../lib/tdee';
import { KeyMicronutrients } from '../../types';

interface MicroNutrientReelProps {
  consumedMicros: KeyMicronutrients;
}

export function MicroNutrientReel({ consumedMicros }: MicroNutrientReelProps) {
  const items = [
    {
      key: 'fiber_g' as const,
      label: 'Fiber',
      value: consumedMicros.fiber_g || 0,
      target: MICRONUTRIENT_TARGETS.fiber_g.target,
      unit: 'g',
      benefit: 'Microbiome & Satiety',
      color: 'emerald',
    },
    {
      key: 'potassium_mg' as const,
      label: 'Potassium',
      value: consumedMicros.potassium_mg || 0,
      target: MICRONUTRIENT_TARGETS.potassium_mg.target,
      unit: 'mg',
      benefit: 'Electrolyte Equilibrium',
      color: 'teal',
    },
    {
      key: 'sodium_mg' as const,
      label: 'Sodium',
      value: consumedMicros.sodium_mg || 0,
      target: MICRONUTRIENT_TARGETS.sodium_mg.target,
      unit: 'mg',
      benefit: 'Hydration & Nerve Signal',
      color: 'blue',
    },
    {
      key: 'iron_mg' as const,
      label: 'Iron',
      value: consumedMicros.iron_mg || 0,
      target: MICRONUTRIENT_TARGETS.iron_mg.target,
      unit: 'mg',
      benefit: 'Hemoglobin & Oxygen',
      color: 'rose',
    },
    {
      key: 'calcium_mg' as const,
      label: 'Calcium',
      value: consumedMicros.calcium_mg || 0,
      target: MICRONUTRIENT_TARGETS.calcium_mg.target,
      unit: 'mg',
      benefit: 'Bone Matrix & Muscle',
      color: 'indigo',
    },
    {
      key: 'vit_c_mg' as const,
      label: 'Vitamin C',
      value: consumedMicros.vit_c_mg || 0,
      target: MICRONUTRIENT_TARGETS.vit_c_mg.target,
      unit: 'mg',
      benefit: 'Collagen & Antioxidant',
      color: 'amber',
    },
    {
      key: 'vit_d_mcg' as const,
      label: 'Vitamin D3',
      value: consumedMicros.vit_d_mcg || 0,
      target: MICRONUTRIENT_TARGETS.vit_d_mcg.target,
      unit: 'mcg',
      benefit: 'Endocrine & Immunity',
      color: 'yellow',
    },
    {
      key: 'magnesium_mg' as const,
      label: 'Magnesium',
      value: consumedMicros.magnesium_mg || 0,
      target: MICRONUTRIENT_TARGETS.magnesium_mg.target,
      unit: 'mg',
      benefit: 'ATP Synthesis & Sleep',
      color: 'purple',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            Key Micronutrients
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium flex items-center gap-0.5">
          <span>Daily Targets</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Horizontal Scroll List with no-scrollbar */}
      <div className="flex gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-1 px-1">
        {items.map((item) => {
          const percent = Math.min(100, Math.round((item.value / item.target) * 100));
          return (
            <div
              key={item.key}
              className="w-38 sm:w-48 shrink-0 bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-900">{item.label}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {percent}%
                  </span>
                </div>

                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-lg sm:text-xl font-bold text-slate-900">{item.value.toFixed(1)}</span>
                  <span className="text-[11px] sm:text-xs text-slate-400">/ {item.target}{item.unit}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden my-1.5 sm:my-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 leading-tight">
                {item.benefit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { Drumstick, Wheat, Droplets } from 'lucide-react';
import { HealthMetrics } from '../../types';

interface MacroNutrientGridProps {
  metrics: HealthMetrics;
  consumed: {
    protein_g: number;
    carbs_g: number;
    fats_g: number;
  };
}

export function MacroNutrientGrid({ metrics, consumed }: MacroNutrientGridProps) {
  const macros = [
    {
      id: 'protein',
      label: 'Protein',
      consumed: Math.round(consumed.protein_g),
      target: metrics.protein_g,
      unit: 'g',
      caloriesPerGram: 4,
      color: 'emerald',
      barColor: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      icon: Drumstick,
      role: 'Muscle synthesis & tissue repair',
    },
    {
      id: 'carbs',
      label: 'Carbohydrates',
      consumed: Math.round(consumed.carbs_g),
      target: metrics.carbs_g,
      unit: 'g',
      caloriesPerGram: 4,
      color: 'sky',
      barColor: 'bg-sky-500',
      bgLight: 'bg-sky-50',
      textColor: 'text-sky-700',
      icon: Wheat,
      role: 'Primary glycogen & CNS fuel',
    },
    {
      id: 'fats',
      label: 'Fats',
      consumed: Math.round(consumed.fats_g),
      target: metrics.fats_g,
      unit: 'g',
      caloriesPerGram: 9,
      color: 'amber',
      barColor: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
      icon: Droplets,
      role: 'Hormone & cellular membrane integrity',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          Macronutrient Split
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Daily gram targets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {macros.map((m) => {
          const percent = Math.min(100, Math.round((m.consumed / m.target) * 100));
          const remaining = Math.max(0, m.target - m.consumed);
          const Icon = m.icon;

          return (
            <div
              key={m.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${m.bgLight} ${m.textColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{m.label}</h4>
                    <span className="text-[11px] text-slate-400 block">{m.caloriesPerGram} kcal/g</span>
                  </div>
                </div>

                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${m.bgLight} ${m.textColor}`}>
                  {percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2.5 sm:mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${m.barColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex items-baseline justify-between mb-1.5 sm:mb-2">
                <div>
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {m.consumed}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-1">
                    / {m.target}{m.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">
                    {remaining}{m.unit} left
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 text-[10px] sm:text-[11px] text-slate-400">
                {m.role}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Minus, Target } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { SubGoal } from '../../types';

interface SubGoalOption {
  id: SubGoal;
  title: string;
  caloricDelta: string;
  description: string;
  icon: typeof ArrowDownRight;
  colorClass: string;
}

const SUB_GOAL_OPTIONS: SubGoalOption[] = [
  {
    id: 'lose_weight',
    title: 'Weight loss',
    caloricDelta: '-500 kcal / day',
    description: 'Safe, sustainable fat loss preserving lean skeletal muscle through elevated protein intake.',
    icon: ArrowDownRight,
    colorClass: 'text-rose-600 bg-rose-50',
  },
  {
    id: 'gain_weight',
    title: 'Weight gain',
    caloricDelta: '+350 kcal / day',
    description: 'Controlled progressive caloric surplus tailored for hypertrophy and muscular development.',
    icon: ArrowUpRight,
    colorClass: 'text-amber-600 bg-amber-50',
  },
  {
    id: 'maintain',
    title: 'Maintain weight',
    caloricDelta: '0 kcal offset (TDEE balance)',
    description: 'Energy balance equilibrium for body recomposition and metabolic stabilization.',
    icon: Minus,
    colorClass: 'text-emerald-600 bg-emerald-50',
  },
];

export function StepSubGoal() {
  const subGoal = useFitnessStore((s) => s.draft.sub_goal);
  const setSubGoal = useFitnessStore((s) => s.setSubGoal);
  const nextStep = useFitnessStore((s) => s.nextStep);

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  const handleSelect = (selectedSubGoal: SubGoal) => {
    setSubGoal(selectedSubGoal);
    setTimeout(() => {
      nextStep();
    }, 180);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={spring}
      className="w-full max-w-xl mx-auto flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm border border-emerald-100/60">
        <Target className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
        Weight Management Strategy
      </h1>
      <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8">
        Specify your direction so our clinical algorithm applies the exact caloric deficit or surplus.
      </p>

      {/* 3 Sub-Goal Cards */}
      <div className="w-full flex flex-col gap-3.5 mb-8">
        {SUB_GOAL_OPTIONS.map((opt) => {
          const isSelected = subGoal === opt.id;
          const Icon = opt.icon;

          return (
            <motion.button
              key={opt.id}
              type="button"
              id={`subgoal-option-${opt.id}`}
              onClick={() => handleSelect(opt.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-5 sm:p-6 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-emerald-500 text-white' : opt.colorClass
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      {opt.title}
                    </h3>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                      {opt.caloricDelta}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center pt-1 shrink-0 ml-3">
                {isSelected ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        id="subgoal-step-submit-btn"
        disabled={!subGoal}
        onClick={nextStep}
        className={`w-full py-4 px-8 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all ${
          subGoal
            ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] cursor-pointer'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <span>Continue to Biometrics</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

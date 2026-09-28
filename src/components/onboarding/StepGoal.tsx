import { motion } from 'motion/react';
import { Activity, ArrowRight, CheckCircle2, HeartPulse, Lock, Scale } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { Goal } from '../../types';

interface GoalOption {
  id: Goal;
  title: string;
  badge: string;
  description: string;
  icon: typeof Scale;
  isLocked?: boolean;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'manage_weight',
    title: 'Manage weight',
    badge: 'Body Composition',
    description: 'Calibrated caloric deficit or surplus targets tailored to body composition goals.',
    icon: Scale,
    isLocked: false,
  },
  {
    id: 'manage_health_problem',
    title: 'Manage health problem',
    badge: 'Clinical AI Guidance',
    description: 'Specialized dietary protocols for Diabetes, High BP, Low BP, Arthritis, and Joint Pain.',
    icon: HeartPulse,
    isLocked: false,
  },
  {
    id: 'stay_fit',
    title: 'Stay fit',
    badge: 'Coming Soon',
    description: 'Maintain functional vigor, endurance, lean muscle preservation, and daily vitality.',
    icon: Activity,
    isLocked: true,
  },
];

export function StepGoal() {
  const goal = useFitnessStore((s) => s.draft.goal);
  const setGoal = useFitnessStore((s) => s.setGoal);
  const nextStep = useFitnessStore((s) => s.nextStep);

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  const handleSelect = (selectedGoal: Goal, isLocked?: boolean) => {
    if (isLocked) return;
    setGoal(selectedGoal);
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
        <Scale className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
        What is your primary goal?
      </h1>
      <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8">
        We tailor your daily TDEE multipliers and macronutrient distribution ratios based on your focus.
      </p>

      {/* 3 Visual Goal Cards */}
      <div className="w-full flex flex-col gap-3.5 mb-8">
        {GOAL_OPTIONS.map((opt) => {
          const isSelected = goal === opt.id && !opt.isLocked;
          const Icon = opt.icon;

          return (
            <motion.button
              key={opt.id}
              type="button"
              id={`goal-option-${opt.id}`}
              disabled={opt.isLocked}
              onClick={() => handleSelect(opt.id, opt.isLocked)}
              whileHover={opt.isLocked ? {} : { scale: 1.01 }}
              whileTap={opt.isLocked ? {} : { scale: 0.98 }}
              className={`w-full p-5 sm:p-6 rounded-2xl border text-left transition-all flex items-start justify-between ${
                opt.isLocked
                  ? 'bg-slate-50/70 border-slate-200/70 opacity-70 cursor-not-allowed'
                  : isSelected
                  ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30 cursor-pointer'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    opt.isLocked
                      ? 'bg-slate-200/80 text-slate-400'
                      : isSelected
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3
                      className={`text-lg font-semibold tracking-tight ${
                        opt.isLocked ? 'text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {opt.title}
                    </h3>

                    {opt.isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Coming Soon</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center pt-1 shrink-0 ml-3">
                {opt.isLocked ? (
                  <div
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400"
                    title="Module locked - Coming Soon"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                ) : isSelected ? (
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
        id="goal-step-submit-btn"
        disabled={!goal || goal === 'manage_health_problem' || goal === 'stay_fit'}
        onClick={nextStep}
        className={`w-full py-4 px-8 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all ${
          goal && goal !== 'manage_health_problem' && goal !== 'stay_fit'
            ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] cursor-pointer'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <span>Continue</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

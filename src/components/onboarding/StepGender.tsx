import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, HeartHandshake, User, Users } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { Gender } from '../../types';

interface GenderOption {
  id: Gender;
  title: string;
  subtitle: string;
  formulaNote: string;
  icon: typeof User;
}

const GENDER_OPTIONS: GenderOption[] = [
  {
    id: 'male',
    title: 'Male',
    subtitle: 'Mifflin-St. Jeor biological BMR offset (+5 kcal)',
    formulaNote: 'Calibrated for average male lean tissue ratio',
    icon: User,
  },
  {
    id: 'female',
    title: 'Female',
    subtitle: 'Mifflin-St. Jeor biological BMR offset (-161 kcal)',
    formulaNote: 'Calibrated for essential female lipid storage & hormonal cycles',
    icon: Users,
  },
  {
    id: 'rather_not_say',
    title: 'Rather not say',
    subtitle: 'Population-normalized metabolic average (-78 kcal)',
    formulaNote: 'Equitable balanced metabolic rate calculation',
    icon: HeartHandshake,
  },
];

export function StepGender() {
  const gender = useFitnessStore((s) => s.draft.gender);
  const setGender = useFitnessStore((s) => s.setGender);
  const nextStep = useFitnessStore((s) => s.nextStep);

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  const handleSelect = (selectedGender: Gender) => {
    setGender(selectedGender);
    // Instant smooth advance after momentary tactile feedback
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
        <Users className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
        Biological Sex
      </h1>
      <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8">
        Used strictly by the Mifflin-St. Jeor algorithm to calculate baseline energy expenditure.
      </p>

      {/* Massive Segmented Control Cards */}
      <div className="w-full flex flex-col gap-3.5 mb-8">
        {GENDER_OPTIONS.map((opt) => {
          const isSelected = gender === opt.id;
          const Icon = opt.icon;

          return (
            <motion.button
              key={opt.id}
              type="button"
              id={`gender-option-${opt.id}`}
              onClick={() => handleSelect(opt.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-5 sm:p-6 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    {opt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {opt.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
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
        id="gender-step-submit-btn"
        disabled={!gender}
        onClick={nextStep}
        className={`w-full py-4 px-8 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all ${
          gender
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

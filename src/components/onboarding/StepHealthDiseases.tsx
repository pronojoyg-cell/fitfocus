import { motion } from 'motion/react';
import {
  Activity,
  HeartPulse,
  Gauge,
  ShieldAlert,
  Bone,
  Check,
  ArrowRight,
  ShieldCheck,
  Droplet,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { HEALTH_CONDITIONS_CATALOG } from '../../lib/healthConditions';
import { HealthCondition } from '../../types';

export function StepHealthDiseases() {
  const selectedConditions = useFitnessStore((s) => s.draft.health_conditions);
  const toggleCondition = useFitnessStore((s) => s.toggleHealthCondition);
  const nextStep = useFitnessStore((s) => s.nextStep);

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  const getIcon = (id: HealthCondition) => {
    switch (id) {
      case 'diabetes':
        return Activity;
      case 'high_bp':
        return HeartPulse;
      case 'low_bp':
        return Gauge;
      case 'arthritis':
        return ShieldAlert;
      case 'joint_pain':
        return Bone;
      case 'cholesterol':
        return Droplet;
      default:
        return Activity;
    }
  };

  const handleContinue = () => {
    if (selectedConditions.length === 0) return;
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={spring}
      className="w-full max-w-xl mx-auto flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 shadow-sm border border-rose-100">
        <HeartPulse className="w-7 h-7 stroke-[2.2]" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Metabolic & Lifestyle Profile
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-2">
        Select your lifestyle focus areas
      </h1>
      <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mb-6">
        Select any health and lifestyle parameters you currently manage. You can choose multiple options. Our nutrition engine will adapt specifically for you.
      </p>

      {/* 5 Disease Multi-Select Cards */}
      <div className="w-full flex flex-col gap-3 mb-7 text-left">
        {HEALTH_CONDITIONS_CATALOG.map((condition) => {
          const isSelected = selectedConditions.includes(condition.id);
          const Icon = getIcon(condition.id);

          return (
            <motion.button
              key={condition.id}
              type="button"
              id={`disease-select-${condition.id}`}
              onClick={() => toggleCondition(condition.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full p-4 sm:p-4.5 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5 pr-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-base tracking-tight">
                      {condition.title}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : `${condition.color.badgeBg} ${condition.color.badgeText}`
                      }`}
                    >
                      {condition.badge}
                    </span>
                  </div>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {condition.shortDesc}
                  </p>
                </div>
              </div>

              {/* Checkbox indicator */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-1 transition-all border ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 bg-slate-50'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected counter and Continue Button */}
      <div className="w-full flex flex-col gap-3">
        <button
          type="button"
          id="health-diseases-continue-btn"
          disabled={selectedConditions.length === 0}
          onClick={handleContinue}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
            selectedConditions.length > 0
              ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-98 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
          }`}
        >
          <span>
            {selectedConditions.length === 0
              ? 'Select at least one condition'
              : `Continue with ${selectedConditions.length} condition${selectedConditions.length > 1 ? 's' : ''}`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-slate-400">
          You can update or recalibrate these anytime in your health profile settings.
        </p>
      </div>
    </motion.div>
  );
}

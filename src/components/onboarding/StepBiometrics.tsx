import { motion } from 'motion/react';
import { Activity, ArrowRight, Gauge, Heart, Minus, Plus } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { ACTIVITY_MULTIPLIERS } from '../../lib/tdee';
import { ActivityLevel } from '../../types';

export function StepBiometrics() {
  const draft = useFitnessStore((s) => s.draft);
  const setBiometrics = useFitnessStore((s) => s.setBiometrics);
  const nextStep = useFitnessStore((s) => s.nextStep);

  const { height_cm, weight_kg, activity_level } = draft;

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  const handleHeightChange = (val: number) => {
    setBiometrics({
      height_cm: Math.max(120, Math.min(230, val)),
      weight_kg,
      activity_level,
    });
  };

  const handleWeightChange = (val: number) => {
    setBiometrics({
      height_cm,
      weight_kg: Math.max(35, Math.min(220, val)),
      activity_level,
    });
  };

  const handleActivityChange = (lvl: ActivityLevel) => {
    setBiometrics({
      height_cm,
      weight_kg,
      activity_level: lvl,
    });
  };

  // Convert to imperial for preview readability
  const totalInches = height_cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  const weightLbs = Math.round(weight_kg * 2.20462);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={spring}
      className="w-full max-w-xl mx-auto flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm border border-emerald-100/60">
        <Gauge className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
        Biometrics & Activity
      </h1>
      <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8">
        Precision physical metrics calibrate your daily caloric burn and metabolic rate.
      </p>

      <div className="w-full flex flex-col gap-6 mb-8 text-left">
        {/* Height & Weight Dual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Height Card */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Height</span>
              <span className="text-xs text-slate-500 font-medium">({feet}&apos;{inches}&quot;)</span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5 my-2">
              <span className="text-4xl font-bold tracking-tight text-slate-900">{height_cm}</span>
              <span className="text-base text-slate-500 font-medium">cm</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleHeightChange(height_cm - 1)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Decrease height"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="130"
                max="220"
                value={height_cm}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleHeightChange(height_cm + 1)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Increase height"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weight Card */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Weight</span>
              <span className="text-xs text-slate-500 font-medium">({weightLbs} lbs)</span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5 my-2">
              <span className="text-4xl font-bold tracking-tight text-slate-900">{weight_kg}</span>
              <span className="text-base text-slate-500 font-medium">kg</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleWeightChange(weight_kg - 0.5)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Decrease weight"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="40"
                max="160"
                step="0.5"
                value={weight_kg}
                onChange={(e) => handleWeightChange(Number(e.target.value))}
                className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleWeightChange(weight_kg + 0.5)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                aria-label="Increase weight"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Activity Level Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Daily Activity & Exercise Level
            </label>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              TDEE Multiplier
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => {
              const item = ACTIVITY_MULTIPLIERS[key];
              const isSelected = activity_level === key;

              return (
                <button
                  key={key}
                  type="button"
                  id={`activity-option-${key}`}
                  onClick={() => handleActivityChange(key)}
                  className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/30'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-slate-900">
                        {item.label}
                      </span>
                      <span className="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        ×{item.multiplier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                  <div className="shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        id="biometrics-step-submit-btn"
        onClick={nextStep}
        className="w-full py-4 px-8 rounded-2xl font-medium text-base flex items-center justify-center gap-2 bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Calculate My Macros</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

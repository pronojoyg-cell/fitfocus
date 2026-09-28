import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowRight, Sparkles, CheckCircle2, HeartPulse, Loader2 } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { HEALTH_CONDITIONS_CATALOG, getConditionTitle } from '../../lib/healthConditions';

export function StepHealthDescription() {
  const selectedConditions = useFitnessStore((s) => s.draft.health_conditions);
  const healthDescription = useFitnessStore((s) => s.draft.health_description);
  const setHealthDescription = useFitnessStore((s) => s.setHealthDescription);
  const nextStep = useFitnessStore((s) => s.nextStep);
  const isAuthLoading = useFitnessStore((s) => s.isAuthLoading);

  const [descriptionInput, setDescriptionInput] = useState(healthDescription);

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  // Collect relevant sample chips for the selected conditions
  const relevantChips = HEALTH_CONDITIONS_CATALOG
    .filter((c) => selectedConditions.includes(c.id))
    .flatMap((c) => c.sampleChips);

  const handleAddChip = (chip: string) => {
    setDescriptionInput((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chip;
      if (trimmed.includes(chip)) return prev;
      return `${trimmed}. ${chip}`;
    });
  };

  const handleContinue = async () => {
    setHealthDescription(descriptionInput.trim());
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
      <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 shadow-sm border border-sky-100">
        <FileText className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-2">
        Describe your health profile
      </h1>
      <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mb-5">
        Provide a brief description of your condition, doctor recommendations, or symptoms. Our AI will keep this in mind whenever you upload food pictures.
      </p>

      {/* Selected Conditions Pills */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-5">
        {selectedConditions.map((cond) => {
          const meta = HEALTH_CONDITIONS_CATALOG.find((c) => c.id === cond);
          return (
            <span
              key={cond}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                meta ? `${meta.color.badgeBg} ${meta.color.badgeText}` : 'bg-slate-100 text-slate-800'
              }`}
            >
              <HeartPulse className="w-3 h-3" />
              {getConditionTitle(cond)}
            </span>
          );
        })}
      </div>

      {/* Quick Suggestion Chips */}
      {relevantChips.length > 0 && (
        <div className="w-full text-left mb-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Quick Suggestions (Click to add)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {relevantChips.slice(0, 6).map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleAddChip(chip)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 transition-colors cursor-pointer text-left"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description Textarea */}
      <div className="w-full text-left mb-6">
        <div className="relative">
          <textarea
            id="health-description-textarea"
            rows={4}
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            placeholder="e.g. Diagnosed with Type 2 diabetes 2 years ago, doctor recommended watching carbohydrate intake and limiting sodium below 1,500mg. Experiencing mild morning knee stiffness."
            className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base leading-relaxed shadow-2xs resize-none transition-all"
          />
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              AI analyzes every meal photo against this description
            </span>
            <span>{descriptionInput.length} chars</span>
          </div>
        </div>
      </div>

      {/* Continue to Home Button */}
      <button
        type="button"
        id="health-description-continue-btn"
        disabled={isAuthLoading}
        onClick={handleContinue}
        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-60"
      >
        {isAuthLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Configuring Clinical Engine...</span>
          </>
        ) : (
          <>
            <span>Next: Biometrics & Target Macros</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </motion.div>
  );
}

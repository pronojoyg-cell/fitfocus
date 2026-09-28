import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, User } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';

export function StepName() {
  const name = useFitnessStore((s) => s.draft.name);
  const setName = useFitnessStore((s) => s.setName);
  const nextStep = useFitnessStore((s) => s.nextStep);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus immediately
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      nextStep();
    }
  };

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={spring}
      className="w-full max-w-xl mx-auto flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm border border-emerald-100/60">
        <User className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
        What should we call you?
      </h1>
      <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-8">
        Your name personalizes your clinical baseline, daily nutritional targets, and progress timeline.
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative mb-6">
          <input
            ref={inputRef}
            type="text"
            id="user-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maya Chen"
            autoComplete="name"
            className="w-full text-center text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 bg-white border-b-2 border-slate-200 focus:border-slate-900 focus:outline-none py-3 px-4 transition-colors placeholder:text-slate-300"
          />
        </div>

        <button
          type="submit"
          id="name-step-submit-btn"
          disabled={!name.trim()}
          className={`w-full py-4 px-8 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all ${
            name.trim()
              ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

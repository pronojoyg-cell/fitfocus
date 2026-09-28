import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { calculateAge } from '../../lib/tdee';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function StepDOBWheel() {
  const dob = useFitnessStore((s) => s.draft.dob);
  const setDOB = useFitnessStore((s) => s.setDOB);
  const nextStep = useFitnessStore((s) => s.nextStep);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - 14; y >= currentYear - 90; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // Days in selected month & year
  const daysInMonth = useMemo(() => {
    return new Date(dob.year, dob.month, 0).getDate();
  }, [dob.year, dob.month]);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const calculatedAge = useMemo(() => {
    return calculateAge(dob.year, dob.month, dob.day);
  }, [dob.year, dob.month, dob.day]);

  const handleMonthChange = (monthIdx: number) => {
    const newMonth = monthIdx + 1;
    const maxDays = new Date(dob.year, newMonth, 0).getDate();
    setDOB({
      ...dob,
      month: newMonth,
      day: Math.min(dob.day, maxDays),
    });
  };

  const handleDayChange = (day: number) => {
    setDOB({ ...dob, day });
  };

  const handleYearChange = (year: number) => {
    const maxDays = new Date(year, dob.month, 0).getDate();
    setDOB({
      ...dob,
      year,
      day: Math.min(dob.day, maxDays),
    });
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
        <Calendar className="w-7 h-7 stroke-[2.2]" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
        When were you born?
      </h1>
      <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md mb-6">
        Age is essential for calculating your Basal Metabolic Rate using the Mifflin-St. Jeor equation.
      </p>

      {/* Auto-calculated Age Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-medium mb-6">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <span>Calculated Age: <strong>{calculatedAge} years old</strong></span>
      </div>

      {/* Native-feeling Wheel Picker Card */}
      <div className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {/* Subtle horizontal highlight bar */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-11 bg-white border-y border-slate-200 pointer-events-none rounded-lg shadow-xs -z-0" />

          {/* Month Wheel Column */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Month</span>
            <div className="h-44 w-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-16 text-center space-y-1">
              {MONTHS.map((m, idx) => {
                const isSelected = dob.month === idx + 1;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMonthChange(idx)}
                    className={`w-full py-2 text-sm sm:text-base font-medium transition-all snap-center rounded-md cursor-pointer ${
                      isSelected
                        ? 'text-slate-950 font-semibold scale-105'
                        : 'text-slate-400 hover:text-slate-600 opacity-60'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Wheel Column */}
          <div className="relative z-10 flex flex-col items-center border-x border-slate-200/60 px-1 sm:px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Day</span>
            <div className="h-44 w-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-16 text-center space-y-1">
              {days.map((d) => {
                const isSelected = dob.day === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDayChange(d)}
                    className={`w-full py-2 text-base font-medium transition-all snap-center rounded-md cursor-pointer ${
                      isSelected
                        ? 'text-slate-950 font-semibold scale-105'
                        : 'text-slate-400 hover:text-slate-600 opacity-60'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year Wheel Column */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Year</span>
            <div className="h-44 w-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-16 text-center space-y-1">
              {years.map((y) => {
                const isSelected = dob.year === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleYearChange(y)}
                    className={`w-full py-2 text-base font-medium transition-all snap-center rounded-md cursor-pointer ${
                      isSelected
                        ? 'text-slate-950 font-semibold scale-105'
                        : 'text-slate-400 hover:text-slate-600 opacity-60'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          Scroll or click any column to adjust your birth date
        </div>
      </div>

      <button
        type="button"
        id="dob-step-submit-btn"
        onClick={nextStep}
        className="w-full py-4 px-8 rounded-2xl font-medium text-base flex items-center justify-center gap-2 bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Confirm & Continue</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plus, Trash2, Utensils, ChevronRight, FileText, CheckCircle2, AlertTriangle, XCircle, Stethoscope } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { MealCategory } from '../../types';
import { SkeletonFoodCard } from './SkeletonFoodCard';
import { evaluateMealHealthCompatibility } from '../../lib/healthConditions';

export function FoodLogSection() {
  const user = useFitnessStore((s) => s.user);
  const foodLogs = useFitnessStore((s) => s.foodLogs);
  const selectedDate = useFitnessStore((s) => s.selectedDate);
  const todayDate = useFitnessStore((s) => s.todayDate);
  const deleteFoodLog = useFitnessStore((s) => s.deleteFoodLog);
  const isAILoggingLoading = useFitnessStore((s) => s.isAILoggingLoading);
  const setActiveFoodReport = useFitnessStore((s) => s.setActiveFoodReport);

  const [activeFilter, setActiveFilter] = useState<MealCategory | 'all'>('all');

  // Strict date isolation: only include logs for the currently viewed date
  const dayLogs = foodLogs.filter((log) => log.date === selectedDate);

  const filteredLogs = dayLogs.filter((log) => {
    if (activeFilter === 'all') return true;
    return log.meal_type === activeFilter;
  });

  const isToday = selectedDate === todayDate;

  const filterTabs: { id: MealCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Meals' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snacks' },
  ];

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">
              Food Diary & AI Logs
            </h3>
            <span className="text-xs text-slate-500">
              {isToday
                ? `${dayLogs.length} verified item${dayLogs.length === 1 ? '' : 's'} today`
                : `${dayLogs.length} verified item${dayLogs.length === 1 ? '' : 's'} on ${selectedDate}`}
            </span>
          </div>
        </div>

        {/* Meal Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {/* Skeleton Card shown during active AI Vision scanning */}
        {isAILoggingLoading && <SkeletonFoodCard />}

        <AnimatePresence>
          {filteredLogs.map((log) => {
            const time = new Date(log.consumed_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            const userConditions = user?.health_conditions || [];
            const compatibility = log.health_compatibility || (userConditions.length > 0 ? evaluateMealHealthCompatibility({
              food_name: log.food_name,
              calories: log.calories,
              protein_g: log.protein_g,
              carbs_g: log.carbs_g,
              fats_g: log.fats_g,
              key_micros: log.key_micros,
              dietary_notes: log.dietary_notes,
              health_conditions: userConditions,
              health_description: user?.health_description || '',
            }) : undefined);

            const verdict = compatibility?.verdict;
            const verdictStyles = verdict === 'recommended'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : verdict === 'caution'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200';

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => setActiveFoodReport({ ...log, health_compatibility: compatibility })}
                className="group p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-emerald-300 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                title="Click to view detailed nutritional report and clinical analysis"
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {log.image_url ? (
                    <img
                      src={log.image_url}
                      alt={log.food_name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-102 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors truncate">
                        {log.food_name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {log.meal_type}
                      </span>

                      {/* Clinical Health Compatibility Pill */}
                      {compatibility && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${verdictStyles}`}
                        >
                          {verdict === 'recommended' && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                          {verdict === 'caution' && <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
                          {verdict === 'not_recommended' && <XCircle className="w-3 h-3 text-rose-600 shrink-0" />}
                          <span>{compatibility.verdict_title}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {time}
                      </span>
                      <span>•</span>
                      <span>Fiber: {log.key_micros?.fiber_g || 0}g</span>
                      <span>•</span>
                      <span>Sodium: {log.key_micros?.sodium_mg || 0}mg</span>
                      {log.components && log.components.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200/60">
                            {log.components.length} Components
                          </span>
                        </>
                      )}
                      {log.nutritional_background && (
                        <>
                          <span>•</span>
                          <span className="text-sky-700 font-semibold bg-sky-50 px-1.5 py-0.5 rounded text-[10px] border border-sky-200/60">
                            Metabolic Profile
                          </span>
                        </>
                      )}
                    </div>

                    {/* Short disease suitability reason snippet */}
                    {compatibility && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 group-hover:text-slate-900 transition-colors">
                        <span className="font-semibold text-slate-700">Health Impact: </span>
                        {compatibility.summary_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Macros & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-sm text-slate-900 font-mono">{log.calories} kcal</span>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium font-mono text-[11px]">
                        {log.protein_g}g P
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-medium font-mono text-[11px]">
                        {log.carbs_g}g C
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium font-mono text-[11px]">
                        {log.fats_g}g F
                      </span>
                    </div>
                  </div>

                  {/* Report prompt button */}
                  <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FileText className="w-3 h-3" />
                    <span>Report</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFoodLog(log.id);
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredLogs.length === 0 && !isAILoggingLoading && (
          <div className="text-center py-8 px-4 text-slate-400">
            <p className="text-sm">No meals logged for this category yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Tap the floating action button below to scan your food with AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

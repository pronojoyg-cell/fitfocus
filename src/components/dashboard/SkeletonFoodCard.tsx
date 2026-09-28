import { Loader2, Sparkles } from 'lucide-react';

export function SkeletonFoodCard() {
  return (
    <div className="w-full bg-white border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-sm animate-pulse relative overflow-hidden">
      {/* Top analyzing status indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="h-4 w-40 bg-slate-200 rounded-md mb-1" />
            <div className="h-3 w-24 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Analyzing culinary composition...</span>
        </div>
      </div>

      {/* Center macros placeholder */}
      <div className="grid grid-cols-4 gap-2 my-3">
        <div className="h-12 bg-slate-100 rounded-xl" />
        <div className="h-12 bg-slate-100 rounded-xl" />
        <div className="h-12 bg-slate-100 rounded-xl" />
        <div className="h-12 bg-slate-100 rounded-xl" />
      </div>

      <div className="h-3 w-3/4 bg-slate-100 rounded-md mt-2" />
    </div>
  );
}

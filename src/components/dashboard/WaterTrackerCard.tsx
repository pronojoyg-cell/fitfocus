import { Droplet, Plus, RotateCcw } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';

interface WaterTrackerCardProps {
  waterTargetMl: number;
}

export function WaterTrackerCard({ waterTargetMl }: WaterTrackerCardProps) {
  const selectedDate = useFitnessStore((s) => s.selectedDate);
  const waterByDate = useFitnessStore((s) => s.waterByDate);
  const logWater = useFitnessStore((s) => s.logWater);
  const resetWater = useFitnessStore((s) => s.resetWater);

  const waterIntakeMl = waterByDate[selectedDate] || 0;
  const percent = Math.min(100, Math.round((waterIntakeMl / waterTargetMl) * 100));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Droplet className="w-4 h-4 fill-cyan-500 text-cyan-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Hydration Baseline</h4>
            <span className="text-[11px] text-slate-400">Target 35ml / kg</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700">
            {percent}%
          </span>
          <button
            type="button"
            onClick={resetWater}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Reset water count"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-cyan-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {(waterIntakeMl / 1000).toFixed(1)}L
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">
            / {(waterTargetMl / 1000).toFixed(1)}L
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {Math.max(0, waterTargetMl - waterIntakeMl)} ml remaining
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => logWater(250)}
          className="py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>250ml</span>
        </button>
        <button
          type="button"
          onClick={() => logWater(500)}
          className="py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>500ml</span>
        </button>
        <button
          type="button"
          onClick={() => logWater(750)}
          className="py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>750ml</span>
        </button>
      </div>
    </div>
  );
}

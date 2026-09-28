import { Flame, Calendar, TrendingUp } from 'lucide-react';
import { HealthMetrics } from '../../types';

interface CalorieProgressRingsProps {
  metrics: HealthMetrics;
  consumedCalories: number;
  weeklyConsumedCalories: number;
}

export function CalorieProgressRings({
  metrics,
  consumedCalories,
  weeklyConsumedCalories,
}: CalorieProgressRingsProps) {
  const dailyTarget = metrics?.target_calories || 2000;
  const weeklyTarget = metrics?.weekly_target_calories || dailyTarget * 7;
  const safeConsumed = consumedCalories || 0;
  const safeWeeklyConsumed = weeklyConsumedCalories || 0;

  const dailyPercent = Math.min(100, Math.round((safeConsumed / dailyTarget) * 100));
  const weeklyPercent = Math.min(100, Math.round((safeWeeklyConsumed / weeklyTarget) * 100));

  const remainingDaily = Math.max(0, dailyTarget - safeConsumed);

  // SVG Circular Ring Dimensions
  const size = 260;
  const strokeWidth = 14;

  // Outer Ring (Daily Calories)
  const outerRadius = (size - strokeWidth) / 2;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerDashoffset = outerCircumference - (dailyPercent / 100) * outerCircumference;

  // Inner Ring (Weekly Calorie Target)
  const innerRadius = outerRadius - strokeWidth - 6;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerDashoffset = innerCircumference - (weeklyPercent / 100) * innerCircumference;

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 sm:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left / Center: SVG Concentric Progress Rings */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90"
          >
            {/* Outer Track (Daily) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={outerRadius}
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Outer Progress (Emerald 500) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={outerRadius}
              stroke="#10B981"
              strokeWidth={strokeWidth}
              strokeDasharray={outerCircumference}
              strokeDashoffset={outerDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />

            {/* Inner Track (Weekly) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              stroke="#F1F5F9"
              strokeWidth={strokeWidth - 2}
              fill="transparent"
            />
            {/* Inner Progress (Slate 900) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              stroke="#0F172A"
              strokeWidth={strokeWidth - 2}
              strokeDasharray={innerCircumference}
              strokeDashoffset={innerDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Central Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 sm:p-4">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Remaining
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-none my-0.5 sm:my-1">
              {(remainingDaily ?? 0).toLocaleString()}
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500">
              kcal left today
            </span>
            <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <Flame className="w-3 h-3 text-emerald-600" />
              <span>{dailyPercent}% consumed</span>
            </div>
          </div>
        </div>

        {/* Right Details & Telemetry */}
        <div className="flex-1 w-full flex flex-col justify-center space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
                Caloric Energy Engine
              </h2>
              <span className="text-[11px] sm:text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Mifflin-St. Jeor
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Clinical expenditure balanced against your metabolic rate and physical targets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* Daily Ring Legend Card */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Daily Intake
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 font-mono">
                  {dailyPercent}%
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg sm:text-xl font-bold text-slate-900">
                    {(consumedCalories ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">kcal logged</span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  Target: <strong className="text-slate-700">{(dailyTarget ?? 2000).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Weekly Ring Legend Card */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-900" />
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Weekly Budget
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {weeklyPercent}%
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg sm:text-xl font-bold text-slate-900">
                    {(weeklyConsumedCalories ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">kcal logged</span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  Target: <strong className="text-slate-700">{(weeklyTarget ?? 14000).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Basal Metabolism (BMR): <strong className="text-slate-800">{metrics.bmr} kcal</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>TDEE Burn: <strong className="text-slate-800">{metrics.tdee} kcal/day</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';

export function HorizontalDateReel() {
  const selectedDate = useFitnessStore((s) => s.selectedDate);
  const setSelectedDate = useFitnessStore((s) => s.setSelectedDate);
  const todayDate = useFitnessStore((s) => s.todayDate);
  const historySnippets = useFitnessStore((s) => s.historySnippets);
  const foodLogs = useFitnessStore((s) => s.foodLogs);
  const waterByDate = useFitnessStore((s) => s.waterByDate);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Generate range of dates: 14 days back up to 2 days ahead
  const dates = [];
  const baseDate = new Date();
  for (let i = 14; i >= -2; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // Scroll active date into view horizontally
  useEffect(() => {
    if (activeBtnRef.current && scrollContainerRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedDate]);

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(e.target.value);
    }
  };

  const isToday = selectedDate === todayDate;
  const isPast = selectedDate < todayDate;
  const isFuture = selectedDate > todayDate;

  // Formatted date string for header
  const selectedDateObj = new Date(`${selectedDate}T12:00:00`);
  const formattedSelected = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-2.5 sm:space-y-3">
      {/* Top Controls: Current Selected Date banner & Calendar picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                {formattedSelected}
              </h2>
              {isToday ? (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Today</span>
                </span>
              ) : isPast ? (
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  Historical
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                  Upcoming
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {isToday
                ? 'Every midnight at 12:00 AM, a complete reset opens a clean daily page.'
                : 'Historical records are preserved. All calories and macros reflect this date.'}
            </p>
          </div>
        </div>

        {/* Right buttons: Jump to Today & Manual Date Picker */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0">
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayDate)}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-700 transition-colors cursor-pointer"
              title="Jump to Today's clean slate"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          )}

          {/* Manual Date Input button */}
          <div className="relative">
            <label
              htmlFor="manual-date-picker-input"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Select custom date manually"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Pick Date</span>
            </label>
            <input
              type="date"
              id="manual-date-picker-input"
              value={selectedDate}
              onChange={handleManualDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Pick custom date"
            />
          </div>
        </div>
      </div>

      {/* Horizontal Date Scrolling Reel */}
      <div className="relative group">
        {/* Left scroll chevron */}
        <button
          type="button"
          onClick={scrollLeft}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Scroll days backward"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* The Horizontal Scrollable Reel */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 scroll-smooth no-scrollbar"
        >
          {dates.map((dateStr) => {
            const isCurrent = dateStr === selectedDate;
            const isThisToday = dateStr === todayDate;
            const d = new Date(`${dateStr}T12:00:00`);

            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();
            const monthName = d.toLocaleDateString('en-US', { month: 'short' });

            // Calculate if date has logged items
            const localHasLogs =
              foodLogs.some((l) => l.date === dateStr) ||
              (waterByDate[dateStr] || 0) > 0;
            const historyHasLogs = historySnippets[dateStr]?.hasLogs;
            const hasData = localHasLogs || historyHasLogs;

            return (
              <button
                key={dateStr}
                ref={isCurrent ? activeBtnRef : null}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`shrink-0 flex flex-col items-center justify-between w-15 sm:w-20 h-18 sm:h-22 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105 ring-2 ring-emerald-500/40'
                    : 'bg-slate-50/80 hover:bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Day name & relative badge */}
                <div className="flex flex-col items-center">
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                      isCurrent ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {isThisToday ? 'Today' : dayName}
                  </span>
                  <span
                    className={`text-base sm:text-xl font-extrabold leading-none mt-0.5 sm:mt-1 ${
                      isCurrent ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Month label and activity dot */}
                <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                  <span
                    className={`text-[9px] sm:text-[10px] font-medium ${
                      isCurrent ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {monthName}
                  </span>

                  {/* Indicator Dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasData
                        ? isCurrent
                          ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                          : 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-slate-700'
                        : 'bg-transparent'
                    }`}
                    title={hasData ? 'Data recorded on this date' : 'Clean day'}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right scroll chevron */}
        <button
          type="button"
          onClick={scrollRight}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Scroll days forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

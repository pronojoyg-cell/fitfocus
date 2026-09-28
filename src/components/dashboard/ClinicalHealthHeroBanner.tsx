import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  HeartPulse,
  Info,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Bone,
  Zap,
  X,
  Minimize2,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { HEALTH_CONDITIONS_CATALOG } from '../../lib/healthConditions';
import { HealthCondition } from '../../types';

export function ClinicalHealthHeroBanner() {
  const user = useFitnessStore((s) => s.user);
  const foodLogs = useFitnessStore((s) => s.foodLogs);
  const selectedDate = useFitnessStore((s) => s.selectedDate);
  const updateUserProfile = useFitnessStore((s) => s.updateUserProfile);
  const setMedicalProfileModalOpen = useFitnessStore((s) => s.setMedicalProfileModalOpen);

  // Default collapsed to stethoscope icon button as requested
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(user?.health_description || '');

  const conditions = user?.health_conditions || [];
  const medicines = user?.medicines || [];
  const medicinePhotos = user?.medicine_photos || [];

  if (!user) {
    return null;
  }

  // Count evaluated meals for the selected date
  const dayLogs = foodLogs.filter((l) => l.date === selectedDate);
  const evaluatedLogs = dayLogs.filter((l) => l.health_compatibility);
  const recommendedCount = evaluatedLogs.filter(
    (l) => l.health_compatibility?.verdict === 'recommended'
  ).length;
  const cautionCount = evaluatedLogs.filter(
    (l) => l.health_compatibility?.verdict === 'caution'
  ).length;
  const notRecommendedCount = evaluatedLogs.filter(
    (l) => l.health_compatibility?.verdict === 'not_recommended'
  ).length;

  const handleSaveNotes = async () => {
    await updateUserProfile({ health_description: notesDraft.trim() });
    setIsEditingNotes(false);
  };

  const getConditionIcon = (id: HealthCondition) => {
    switch (id) {
      case 'diabetes':
        return <Activity className="w-4 h-4 text-sky-400" />;
      case 'high_bp':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'low_bp':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'arthritis':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'joint_pain':
        return <Bone className="w-4 h-4 text-teal-400" />;
      case 'cholesterol':
        return <HeartPulse className="w-4 h-4 text-purple-400" />;
      default:
        return <Stethoscope className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full my-2 transition-all">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Stethoscope Icon Trigger Button (Collapsed View) */
          <motion.div
            key="stetho-icon-collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-between gap-3 p-1"
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                id="stetho-toggle-open-btn"
                onClick={() => setIsOpen(true)}
                title="Open Personalized Nutrition & Lifestyle Considerations"
                className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 shadow-md hover:shadow-emerald-900/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="View personalized medical and nutrition considerations"
              >
                <Stethoscope className="w-6 h-6 text-emerald-400 group-hover:rotate-6 transition-transform" />
                {conditions.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900" />
                  </span>
                )}
              </button>

              <div
                onClick={() => setIsOpen(true)}
                className="cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                    Personalized Health & Nutrition
                  </span>
                  {conditions.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40">
                      {conditions.length} Focus Area{conditions.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Tap stethoscope icon to view metabolic protocols, medication checks & guidance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <span>View Health Considerations</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          /* Full Personalized Nutrition & Lifestyle Considerations ("Black Box") */
          <motion.div
            key="stetho-box-expanded"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            id="clinical-health-hero-banner"
            className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 shadow-xl border border-emerald-500/40 overflow-hidden relative"
          >
            {/* Background clinical pulse wave styling */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-teal-500/10 blur-xl pointer-events-none" />

            {/* Top row: Status & Stethoscope Toggle & Disease Badges */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
              <div className="flex items-start sm:items-center gap-3">
                {/* Clicking stethoscope collapses the box back to icon as requested */}
                <button
                  type="button"
                  id="stetho-toggle-close-icon"
                  onClick={() => setIsOpen(false)}
                  title="Unpress to minimize back to stethoscope icon"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/50 text-emerald-300 hover:text-emerald-200 flex items-center justify-center shrink-0 shadow-inner cursor-pointer hover:scale-105 transition-all group"
                  aria-label="Collapse health panel"
                >
                  <Stethoscope className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      Metabolic & Lifestyle Mode Active
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {conditions.length} Focus Area{conditions.length > 1 ? 's' : ''} Monitored
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-white mt-0.5">
                    Personalized Nutrition & Lifestyle Considerations
                  </h2>
                </div>
              </div>

              {/* Right controls: Daily meal safety stats & Close button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">Today's Meals:</span>
                  <span className="font-semibold text-emerald-300">{recommendedCount} safe</span>
                  {cautionCount > 0 && <span className="font-semibold text-amber-300">• {cautionCount} caution</span>}
                  {notRecommendedCount > 0 && <span className="font-semibold text-rose-300">• {notRecommendedCount} unfavorable</span>}
                </div>

                <button
                  type="button"
                  id="stetho-toggle-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Minimize back to stethoscope icon"
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 px-2.5 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Minimize</span>
                  <X className="w-3.5 h-3.5 sm:hidden" />
                </button>
              </div>
            </div>

            {/* Active Diseases & Medication Pills */}
            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
              {conditions.length === 0 && (
                <div className="text-xs text-slate-400 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No health conditions selected. Open Medical Profile to customize metabolic safeguards.</span>
                </div>
              )}

              {conditions.map((cId) => {
                const meta = HEALTH_CONDITIONS_CATALOG.find((c) => c.id === cId);
                if (!meta) return null;
                return (
                  <div
                    key={cId}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 shadow-xs"
                  >
                    {getConditionIcon(cId as HealthCondition)}
                    <span className="font-semibold text-white">{meta.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700/80 text-slate-300 font-medium">
                      {meta.badge}
                    </span>
                  </div>
                );
              })}

              {medicines.map((med, idx) => (
                <div
                  key={`med_${idx}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-800/60 text-xs text-purple-200 shadow-xs"
                >
                  <Pill className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-semibold text-purple-100">{med}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-900/80 text-purple-300 font-medium">
                    Daily Med
                  </span>
                </div>
              ))}

              {medicinePhotos.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-xs text-rose-200 shadow-xs">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-medium text-rose-100">
                    {medicinePhotos.length} Scanned Rx Photo{medicinePhotos.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Medical Notes / Description Section */}
            <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
              <div className="flex-1">
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                      Update Lifestyle Notes & Focus Areas
                    </label>
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={2}
                      placeholder="E.g., taking Metformin, borderline morning hypertension, joint stiffness in morning..."
                      className="w-full bg-slate-800/90 text-white rounded-xl p-2.5 border border-slate-700 text-xs focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Save Notes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotesDraft(user?.health_description || '');
                          setIsEditingNotes(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-slate-300">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">Dietary Guidance: </span>
                      <span className="text-slate-300">
                        {user.health_description
                          ? `"${user.health_description}"`
                          : 'Every meal photo or log is analyzed for glycemic impact, sodium tension, and joint mobility markers.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!isEditingNotes && (
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    id="banner-manage-medical-profile-btn"
                    onClick={() => setMedicalProfileModalOpen(true)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 px-2.5 py-1 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <HeartPulse className="w-3 h-3 text-rose-400" />
                    <span>Medical Profile & Meds</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200 bg-emerald-500/20 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Notes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Protocols' : 'View Protocols'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Educational Lifestyle Disclaimer */}
            <div className="mt-3 pt-2 border-t border-slate-800/60 text-center relative z-10">
              <p className="text-[10px] text-slate-400">
                Educational lifestyle tracking only. These insights do not substitute for professional medical advice.
              </p>
            </div>

            {/* Expandable Protocol Guides */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3.5 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs"
                >
                  {conditions.map((cId) => {
                    const meta = HEALTH_CONDITIONS_CATALOG.find((c) => c.id === cId);
                    if (!meta) return null;
                    return (
                      <div
                        key={cId}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-300 mb-1">
                            {getConditionIcon(cId as HealthCondition)}
                            <span>{meta.title}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                            {meta.shortDesc}
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="font-semibold text-emerald-400">Nutritional Guardrail: </span>
                          {meta.clinicalFocus}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

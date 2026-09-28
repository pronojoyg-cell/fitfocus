import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, Target, Scale, Zap, Check, ShieldCheck, RefreshCw, Camera } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { ActivityLevel, Goal, SubGoal } from '../../types';
import { calculateHealthMetrics } from '../../lib/tdee';

export function RecalibrateModal() {
  const user = useFitnessStore((s) => s.user);
  const isRecalibrateModalOpen = useFitnessStore((s) => s.isRecalibrateModalOpen);
  const setRecalibrateModalOpen = useFitnessStore((s) => s.setRecalibrateModalOpen);
  const setAvatarModalOpen = useFitnessStore((s) => s.setAvatarModalOpen);
  const updateUserProfile = useFitnessStore((s) => s.updateUserProfile);
  const resetToOnboarding = useFitnessStore((s) => s.resetToOnboarding);

  const [weightKg, setWeightKg] = useState<number>(user?.biometrics.weight_kg || 70);
  const [heightCm, setHeightCm] = useState<number>(user?.biometrics.height_cm || 175);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user?.biometrics.activity_level || 'moderately_active');
  const [goal, setGoal] = useState<Goal>(user?.goal || 'manage_weight');
  const [subGoal, setSubGoal] = useState<SubGoal | null>(user?.sub_goal || 'lose_weight');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state whenever user changes or modal opens
  useEffect(() => {
    if (user && isRecalibrateModalOpen) {
      setWeightKg(user.biometrics.weight_kg);
      setHeightCm(user.biometrics.height_cm);
      setActivityLevel(user.biometrics.activity_level);
      setGoal(user.goal);
      setSubGoal(user.sub_goal || (user.goal === 'manage_weight' ? 'lose_weight' : null));
      setSaveSuccess(false);
    }
  }, [user, isRecalibrateModalOpen]);

  if (!isRecalibrateModalOpen || !user) return null;

  // Calculate live preview metrics
  const previewMetrics = calculateHealthMetrics(
    user.gender,
    user.age,
    goal,
    subGoal || undefined,
    {
      height_cm: heightCm,
      weight_kg: weightKg,
      activity_level: activityLevel,
    }
  );

  const handleSave = async () => {
    setIsSaving(true);
    await updateUserProfile({
      goal,
      sub_goal: goal === 'manage_weight' ? (subGoal ?? undefined) : undefined,
      biometrics: {
        height_cm: heightCm,
        weight_kg: weightKg,
        activity_level: activityLevel,
      },
      metrics: previewMetrics,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setRecalibrateModalOpen(false);
    }, 600);
  };

  const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise (desk job)' },
    { value: 'lightly_active', label: 'Lightly Active', desc: 'Exercise 1-3 days/week' },
    { value: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
    { value: 'very_active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 'extra_active', label: 'Extra Active', desc: 'Very hard exercise & physical job' },
  ];

  const goalOptions: { value: Goal; label: string; desc: string }[] = [
    { value: 'manage_weight', label: 'Manage Weight', desc: 'Calibrate caloric balance to loss, gain, or maintenance' },
    { value: 'stay_fit', label: 'Stay Fit & Conditioned', desc: 'Optimal athletic macro distribution & recovery' },
    { value: 'manage_health_problem', label: 'Glycemic & Health Balance', desc: 'Focus on micronutrient density & fiber' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="relative group shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden border border-slate-200 shadow-2xs">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button
                  type="button"
                  id="recalibrate-camera-badge-btn"
                  onClick={() => {
                    setRecalibrateModalOpen(false);
                    setAvatarModalOpen(true);
                  }}
                  title="Update profile photo with camera"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs border border-white transition-transform hover:scale-110 cursor-pointer"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Update Biometric Profile
                </h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Permanent Account • {user.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecalibrateModalOpen(false);
                      setAvatarModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{user.avatar_url ? 'Change Photo' : 'Add Photo'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRecalibrateModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
            {/* 1. Weight & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="recal-weight" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Body Weight</span>
                  </label>
                  <span className="text-base font-extrabold text-slate-900">{weightKg} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeightKg((w) => Math.max(30, Number((w - 0.5).toFixed(1))))}
                    className="w-9 h-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                  >
                    -
                  </button>
                  <input
                    id="recal-weight"
                    type="range"
                    min="35"
                    max="180"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setWeightKg((w) => Math.min(220, Number((w + 0.5).toFixed(1))))}
                    className="w-9 h-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="recal-height" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Height</span>
                  </label>
                  <span className="text-base font-extrabold text-slate-900">{heightCm} cm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHeightCm((h) => Math.max(100, h - 1))}
                    className="w-9 h-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                  >
                    -
                  </button>
                  <input
                    id="recal-height"
                    type="range"
                    min="120"
                    max="225"
                    step="1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setHeightCm((h) => Math.min(240, h + 1))}
                    className="w-9 h-9 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Goal Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Primary Goal
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGoal(opt.value)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      goal === opt.value
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight mt-0.5 block">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-goal if manage weight */}
            {goal === 'manage_weight' && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Weight Target Trajectory
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lose_weight', label: 'Lose Weight (-500 kcal)' },
                    { id: 'maintain_weight', label: 'Maintain Weight (0 deficit)' },
                    { id: 'gain_weight', label: 'Gain Muscle (+350 kcal)' },
                  ].map((sg) => (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => setSubGoal(sg.id as SubGoal)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                        subGoal === sg.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sg.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Activity Level */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Activity Level
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setActivityLevel(opt.value)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activityLevel === opt.value
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{opt.label}</span>
                      <span className="text-[10px] text-slate-500 block">{opt.desc}</span>
                    </div>
                    {activityLevel === opt.value && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Live Mifflin-St. Jeor Recalculation Preview Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mifflin-St. Jeor Recalibration Preview</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  Target: {previewMetrics.target_calories} kcal / day
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white/10">
                  <span className="text-[10px] text-emerald-300/80 block">BMR</span>
                  <span className="font-bold text-white text-sm">{previewMetrics.bmr}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10">
                  <span className="text-[10px] text-emerald-300/80 block">TDEE</span>
                  <span className="font-bold text-white text-sm">{previewMetrics.tdee}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10">
                  <span className="text-[10px] text-emerald-300/80 block">Protein</span>
                  <span className="font-bold text-emerald-300 text-sm">{previewMetrics.protein_g}g</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10">
                  <span className="text-[10px] text-emerald-300/80 block">Carbs</span>
                  <span className="font-bold text-white text-sm">{previewMetrics.carbs_g}g</span>
                </div>
                <div className="p-2 rounded-xl bg-white/10">
                  <span className="text-[10px] text-emerald-300/80 block">Fats</span>
                  <span className="font-bold text-white text-sm">{previewMetrics.fats_g}g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('Start fresh onboarding? Your previous values will be pre-filled so you can edit step by step.')) {
                  setRecalibrateModalOpen(false);
                  resetToOnboarding();
                }
              }}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
            >
              Step-by-step Onboarding
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecalibrateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                id="save-recalibrate-btn"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved Forever!</span>
                  </>
                ) : isSaving ? (
                  <span>Updating Biometrics...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>Update Biometrics</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

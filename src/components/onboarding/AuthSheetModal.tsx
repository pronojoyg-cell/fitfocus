import { useState, useMemo } from 'react';
import { calculateAge, calculateHealthMetrics } from '../../lib/tdee';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  HeartPulse,
  AlertCircle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFitnessStore } from '../../store/useFitnessStore';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthSheetModal() {
  const draft = useFitnessStore((s) => s.draft);
  const completeOnboardingWithGoogle = useFitnessStore((s) => s.completeOnboardingWithGoogle);
  const completeOnboardingWithEmailPassword = useFitnessStore((s) => s.completeOnboardingWithEmailPassword);
  const isAuthLoading = useFitnessStore((s) => s.isAuthLoading);

  const metrics = useMemo(() => {
    const age = calculateAge(draft.dob.year, draft.dob.month, draft.dob.day);
    return calculateHealthMetrics(
      draft.gender || 'rather_not_say',
      age,
      draft.goal || 'stay_fit',
      draft.sub_goal || undefined,
      {
        height_cm: draft.height_cm || 175,
        weight_kg: draft.weight_kg || 72,
        activity_level: draft.activity_level || 'moderately_active',
      }
    );
  }, [draft]);

  // Mode: Google Primary, with Email/Password fallback
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google Iframe Fallback Modal
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('pronojoyg@gmail.com');
  const [googleNameInput, setGoogleNameInput] = useState(draft.name || 'Pronojoy Ghosh');

  const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

  const fireCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#10B981', '#0F172A', '#38BDF8'],
    });
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      const res = await completeOnboardingWithGoogle();
      if (res.needsPrompt) {
        setShowGooglePrompt(true);
      } else if (res.success) {
        fireCelebration();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch {
      setShowGooglePrompt(true);
    }
  };

  const handleConfirmGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    setErrorMessage(null);
    try {
      const res = await completeOnboardingWithGoogle({
        email: googleEmailInput.trim(),
        name: googleNameInput.trim() || draft.name || 'Google User',
      });
      setShowGooglePrompt(false);
      if (res.success) {
        fireCelebration();
      } else {
        setErrorMessage(res.error || 'Failed to connect Google account.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to authenticate Google account.');
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    if (passwordInput.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    setErrorMessage(null);
    const res = await completeOnboardingWithEmailPassword(emailInput.trim(), passwordInput.trim());
    if (res.success) {
      fireCelebration();
    } else {
      setErrorMessage(res.error || 'Sign up failed.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={spring}
      className="w-full max-w-lg mx-auto flex flex-col items-center text-center"
    >
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
        <Sparkles className="w-8 h-8 text-slate-950" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
        Your Plan is Ready, {draft.name.split(' ')[0] || 'Athlete'}!
      </h1>
      <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mb-6">
        Sign in to save your biometric targets, unlock AI vision meal scanning, and enter your clinical dashboard.
      </p>

      {/* METRIC PREVIEW CARD */}
      <div className="w-full rounded-2xl bg-slate-900 text-white p-5 mb-6 text-left shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Mifflin-St. Jeor Calorie Target
            </span>
          </div>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">
            {(metrics?.target_calories ?? 2000).toLocaleString()} kcal/day
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-sky-400">Protein</div>
            <div className="text-sm font-bold text-white mt-0.5">{metrics?.protein_g ?? 0}g</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-amber-400">Carbs</div>
            <div className="text-sm font-bold text-white mt-0.5">{metrics?.carbs_g ?? 0}g</div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-rose-400">Fats</div>
            <div className="text-sm font-bold text-white mt-0.5">{metrics?.fats_g ?? 0}g</div>
          </div>
        </div>

        {draft.health_conditions && draft.health_conditions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-300">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {draft.health_conditions.length} Health Conditions Safeguarded by Vision AI
            </span>
          </div>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SIGN-IN CHOICES */}
      <div className="w-full space-y-3">
        {authMode === 'google' ? (
          <>
            {/* PRIMARY GOOGLE SIGN-IN BUTTON */}
            <button
              type="button"
              id="onboarding-google-signin-btn"
              disabled={isAuthLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:shadow-lg border-2 border-slate-200 active:scale-[0.99] disabled:opacity-60"
            >
              {isAuthLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
              ) : (
                <GoogleIcon className="w-6 h-6 shrink-0" />
              )}
              <span>Sign in with Google to Enter App</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setErrorMessage(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer py-1"
            >
              Or create account with Email & Password
            </button>
          </>
        ) : (
          <form onSubmit={handleEmailSignUp} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="•••••••• (at least 6 characters)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60"
            >
              {isAuthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>Create Account & Enter App</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer py-1"
            >
              ← Back to Google Sign-In
            </button>
          </form>
        )}
      </div>

      {/* Trust & Isolation Assurance */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Strict Multi-Tenant Isolation • Cloud Firestore & Google OAuth</span>
      </div>

      {/* GOOGLE QUICK-CONFIRMATION MODAL (IF POPUP RESTRICTED) */}
      <AnimatePresence>
        {showGooglePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-sm w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-left"
            >
              <button
                type="button"
                onClick={() => setShowGooglePrompt(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                  <GoogleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
                  <p className="text-xs text-slate-500">Confirm your Google Account identity</p>
                </div>
              </div>

              <form onSubmit={handleConfirmGoogle} className="space-y-4 mt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder="Your Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <GoogleIcon className="w-4 h-4" />
                    )}
                    <span>Continue with Google & Enter App</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

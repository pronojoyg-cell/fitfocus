import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  UserPlus,
  LogIn,
  CheckCircle2,
  Lock,
  Mail,
  ChevronRight,
  X,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { UserProfile } from '../../types';

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

export function AccountsSelectionView() {
  const signInWithGoogleAccount = useFitnessStore((s) => s.signInWithGoogleAccount);
  const savedAccounts = useFitnessStore((s) => s.savedAccounts);
  const loginWithAccount = useFitnessStore((s) => s.loginWithAccount);
  const setAuthViewMode = useFitnessStore((s) => s.setAuthViewMode);
  const resetToOnboarding = useFitnessStore((s) => s.resetToOnboarding);
  const loginWithCredentials = useFitnessStore((s) => s.loginWithCredentials);
  const isAuthLoading = useFitnessStore((s) => s.isAuthLoading);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  // Fallback Google prompt modal when popups are restricted in iframe
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('pronojoyg@gmail.com');
  const [googleName, setGoogleName] = useState('Pronojoy Ghosh');

  // Email login tab toggle
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleGoogleClick = async () => {
    setErrorMessage(null);
    try {
      const res = await signInWithGoogleAccount();
      if (res.needsPrompt) {
        setShowGooglePrompt(true);
      } else if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } catch {
      setShowGooglePrompt(true);
    }
  };

  const handleConfirmGooglePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    setErrorMessage(null);
    try {
      const res = await signInWithGoogleAccount({
        email: googleEmail.trim().toLowerCase(),
        name: googleName.trim() || undefined,
      });
      if (res.success) {
        setShowGooglePrompt(false);
      } else {
        setErrorMessage(res.error || 'Failed to authenticate Google account.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    }
  };

  const handleSelectAccount = async (account: UserProfile) => {
    setSwitchingId(account.id);
    setErrorMessage(null);
    try {
      await loginWithAccount(account.id);
    } catch {
      setErrorMessage('Could not sign into selected account.');
    } finally {
      setSwitchingId(null);
    }
  };

  const handleStartFreshOnboarding = () => {
    resetToOnboarding();
    setAuthViewMode('onboarding');
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setErrorMessage(null);
    const res = await loginWithCredentials(emailInput.trim());
    if (!res.success) {
      setErrorMessage(res.error || 'No matching account found with that email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top branding */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/20">
            FW
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              FitnessWellness
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Clinical Metabolic Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firestore Secured</span>
        </div>
      </header>

      {/* Main card */}
      <main className="max-w-md w-full mx-auto my-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Heading */}
          <div className="relative text-center mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tenant Authentication</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to Your Health Account
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Sign in with your Google Account to access your personal nutrition plan, biomarkers, and logs.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication Issue</span>
                {errorMessage}
              </div>
            </motion.div>
          )}

          {/* Primary Action: Google Sign In Button */}
          <div className="space-y-3 relative">
            <button
              type="button"
              id="google-signin-primary-btn"
              onClick={handleGoogleClick}
              disabled={isAuthLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                  <span>Verifying Google Account...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
                  <span>Sign in with Google Account</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Direct Google OAuth with Cloud Firestore user isolation
            </p>
          </div>

          {/* Saved Accounts section if user has previously logged in */}
          {savedAccounts && savedAccounts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">
                  Previously Signed In ({savedAccounts.length})
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {savedAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    disabled={switchingId === acc.id}
                    className="w-full p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition-all flex items-center justify-between text-left group cursor-pointer disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {acc.avatar_url ? (
                        <img
                          src={acc.avatar_url}
                          alt={acc.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-sm flex items-center justify-center border border-slate-700">
                          {acc.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                          {acc.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {acc.email || (acc.metrics ? `${acc.metrics.target_calories} kcal target` : 'Google Account')}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {switchingId === acc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
                Or
              </span>
            </div>
          </div>

          {/* New Profile / Custom Intake */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleStartFreshOnboarding}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer group"
            >
              <UserPlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Create New Clinical Profile (Onboarding)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Email login toggle for clinical testers / existing users */}
            {!showEmailLogin ? (
              <button
                type="button"
                onClick={() => setShowEmailLogin(true)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-300 transition-colors py-1 cursor-pointer"
              >
                Sign in with email or credentials instead
              </button>
            ) : (
              <form onSubmit={handleEmailLoginSubmit} className="pt-2 space-y-2.5">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailLogin(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer security badges */}
      <footer className="max-w-md w-full mx-auto text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            256-bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Isolated Secure Storage
          </span>
          <span>•</span>
          <span>Private & Confidential</span>
        </div>
      </footer>

      {/* Google Quick Connect Modal (for iframe environments where popups are blocked) */}
      <AnimatePresence>
        {showGooglePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowGooglePrompt(false)}
                className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
                  <GoogleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Google Identity Verification</h3>
                  <p className="text-xs text-slate-400">OAuth Client Confirmation</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Connect your verified Google account. This binds your metabolic metrics and nutrition logs exclusively to your Google UID in Cloud Firestore.
              </p>

              <form onSubmit={handleConfirmGooglePrompt} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Google Email
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                    placeholder="user@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                    placeholder="Pronojoy Ghosh"
                  />
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowGooglePrompt(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-md"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>Continue</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

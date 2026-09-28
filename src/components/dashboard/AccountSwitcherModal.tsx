import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UserCheck,
  UserPlus,
  LogOut,
  Trash2,
  Flame,
  Check,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { UserProfile } from '../../types';

export function AccountSwitcherModal() {
  const isOpen = useFitnessStore((s) => s.isAccountSwitcherOpen);
  const setIsOpen = useFitnessStore((s) => s.setAccountSwitcherOpen);
  const setAvatarModalOpen = useFitnessStore((s) => s.setAvatarModalOpen);
  const activeUser = useFitnessStore((s) => s.user);
  const savedAccounts = useFitnessStore((s) => s.savedAccounts);
  const loginWithAccount = useFitnessStore((s) => s.loginWithAccount);
  const deleteAccount = useFitnessStore((s) => s.deleteAccount);
  const signOut = useFitnessStore((s) => s.signOut);
  const setAuthViewMode = useFitnessStore((s) => s.setAuthViewMode);

  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSwitch = async (account: UserProfile) => {
    if (activeUser?.id === account.id) {
      setIsOpen(false);
      return;
    }
    setIsSwitching(account.id);
    await loginWithAccount(account.id);
    setIsSwitching(null);
    setIsOpen(false);
  };

  const handleAddNewAccount = () => {
    setIsOpen(false);
    signOut();
    setAuthViewMode('onboarding');
  };

  const handleConfirmSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Switch Account</h2>
                <p className="text-xs text-slate-400">Manage or switch active athlete profiles</p>
              </div>
            </div>

            <button
              type="button"
              id="close-account-switcher-btn"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Sign out confirmation banner if requested */}
            {showSignOutConfirm && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold">Sign Out Confirmation</div>
                    <div className="text-xs text-amber-700 mt-0.5">
                      Are you sure you want to sign out of <strong>{activeUser?.name}</strong>? Your nutrition history and daily logs will remain safely saved in the cloud.
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSignOutConfirm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="confirm-signout-modal-btn"
                    onClick={handleConfirmSignOut}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* List of Accounts */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Accounts on This Device ({savedAccounts.length || 1})
              </div>

              {savedAccounts.map((account) => {
                const isActive = activeUser?.id === account.id;
                const initials = account.name
                  ? account.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'FW';

                return (
                  <div
                    key={account.id}
                    id={`switcher-card-${account.id}`}
                    className={`relative rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleSwitch(account)}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm tracking-tight shrink-0 shadow-2xs ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {account.avatar_url ? (
                          <img
                            src={account.avatar_url}
                            alt={account.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {account.name}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              <Check className="w-2.5 h-2.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="inline-flex items-center gap-0.5 font-semibold text-slate-700">
                            <Flame className="w-3 h-3 text-amber-500" />
                            <span>{account.metrics?.target_calories || 2000} kcal</span>
                          </span>
                          <span>•</span>
                          <span className="truncate">{account.email || account.phone || 'Profile'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && (
                        <button
                          type="button"
                          id={`change-avatar-${account.id}-btn`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            setAvatarModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Take or update profile photo with camera"
                        >
                          <Camera className="w-3 h-3 text-emerald-600" />
                          <span>Photo</span>
                        </button>
                      )}

                      {!isActive && (
                        <button
                          type="button"
                          id={`switch-to-account-${account.id}`}
                          onClick={() => handleSwitch(account)}
                          disabled={isSwitching === account.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isSwitching === account.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <span>Switch</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}

                      {savedAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove account "${account.name}" from this device?`)) {
                              deleteAccount(account.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove saved account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                id="switcher-add-account-btn"
                onClick={handleAddNewAccount}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Add Another Account</span>
              </button>

              <button
                type="button"
                id="switcher-logout-btn"
                onClick={() => setShowSignOutConfirm(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of {activeUser?.name || 'App'}</span>
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All food logs and nutrition records are safely isolated per user</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

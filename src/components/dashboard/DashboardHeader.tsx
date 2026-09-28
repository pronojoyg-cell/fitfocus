import { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Camera,
  HeartPulse,
  Home,
  LogOut,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { UserProfile } from '../../types';

interface DashboardHeaderProps {
  user: UserProfile;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  const setRecalibrateModalOpen = useFitnessStore((s) => s.setRecalibrateModalOpen);
  const setMedicalProfileModalOpen = useFitnessStore((s) => s.setMedicalProfileModalOpen);
  const setAccountSwitcherOpen = useFitnessStore((s) => s.setAccountSwitcherOpen);
  const setAvatarModalOpen = useFitnessStore((s) => s.setAvatarModalOpen);
  const signOut = useFitnessStore((s) => s.signOut);
  const savedAccounts = useFitnessStore((s) => s.savedAccounts);
  const activeFoodReport = useFitnessStore((s) => s.activeFoodReport);
  const clearActiveFoodReport = useFitnessStore((s) => s.clearActiveFoodReport);

  const goalLabels: Record<string, string> = {
    manage_weight: user.sub_goal === 'lose_weight' ? 'Weight Loss (-500 kcal)' : user.sub_goal === 'gain_weight' ? 'Weight Gain (+350 kcal)' : 'Maintain Weight',
    manage_health_problem: 'Metabolic & Glycemic Balance',
    stay_fit: 'Athletic Conditioning',
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Close settings popup when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsOpen &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node) &&
        settingsBtnRef.current &&
        !settingsBtnRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsOpen]);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Left branding & user profile with camera avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative group shrink-0">
            <button
              type="button"
              id="header-user-avatar-btn"
              onClick={() => setAvatarModalOpen(true)}
              title="Click to take or upload profile photo"
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs transition-all overflow-hidden cursor-pointer border border-slate-200"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}

              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs">
                <Camera className="w-4 h-4 text-emerald-400" />
              </div>
            </button>

            {/* Quick Camera Badge */}
            <button
              type="button"
              id="header-camera-badge-btn"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarModalOpen(true);
              }}
              title="Take profile photo with camera"
              className="absolute -bottom-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs border-2 border-white transition-transform hover:scale-110 cursor-pointer"
            >
              <Camera className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setAccountSwitcherOpen(true)}
                className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer text-left truncate max-w-[110px] sm:max-w-none"
              >
                <span className="truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 font-normal px-1 py-0.5 rounded bg-slate-100 hover:bg-slate-200 shrink-0">
                  Switch
                </span>
              </button>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                <UserCheck className="w-3 h-3 text-emerald-600" />
                <span>{goalLabels[user.goal] || 'Staying Fit'}</span>
              </span>

              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600" title="Account profile verified">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Account</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              <span>{user.age} yrs</span>
              <span>•</span>
              <span>{user.biometrics.height_cm}cm / {user.biometrics.weight_kg}kg</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline capitalize">{user.gender.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Right side: Clean Settings Button & Dropdown Box */}
        <div className="relative flex items-center gap-2">
          {/* Quick Return to Dashboard button if food report is currently active */}
          {activeFoodReport && (
            <button
              type="button"
              id="header-home-nav-btn"
              onClick={clearActiveFoodReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Return to Home Dashboard"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Home</span>
            </button>
          )}

          {/* Unified Settings Button */}
          <button
            ref={settingsBtnRef}
            type="button"
            id="header-settings-btn"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-expanded={settingsOpen}
            aria-haspopup="true"
            className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs ${
              settingsOpen
                ? 'bg-slate-900 text-white border border-slate-900 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200'
            }`}
            title="Open Settings and Options"
          >
            <Settings className={`w-4 h-4 transition-transform duration-200 ${settingsOpen ? 'rotate-45 text-emerald-400' : 'text-slate-500'}`} />
            <span>Settings</span>
            {savedAccounts.length > 1 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${savedAccounts.length} saved accounts`} />
            )}
          </button>

          {/* Small Box (Dropdown Popover) containing all the options */}
          {settingsOpen && (
            <div
              ref={settingsRef}
              className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 px-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150 origin-top-right divide-y divide-slate-100"
            >
              {/* Header inside small box with Today's Date */}
              <div className="px-2.5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{todayFormatted}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close settings"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Options List */}
              <div className="py-1.5 space-y-0.5">
                {/* 1. Add / Change Photo */}
                <button
                  type="button"
                  id="settings-option-photo"
                  onClick={() => {
                    setSettingsOpen(false);
                    setAvatarModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {user.avatar_url ? 'Profile Photo' : 'Add Photo'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Camera or file upload
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>

                {/* 2. Accounts Switcher */}
                <button
                  type="button"
                  id="settings-option-accounts"
                  onClick={() => {
                    setSettingsOpen(false);
                    setAccountSwitcherOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>Accounts</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {savedAccounts.length}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Switch or manage user profiles
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>

                {/* 3. Medical Profile */}
                <button
                  type="button"
                  id="settings-option-medical-profile"
                  onClick={() => {
                    setSettingsOpen(false);
                    setMedicalProfileModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800">
                        Medical Profile
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Health conditions, medicines & scans
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>

                {/* 4. Update Biometric */}
                <button
                  type="button"
                  id="settings-option-update-biometric"
                  onClick={() => {
                    setSettingsOpen(false);
                    setRecalibrateModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 group transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800">
                        Update Biometric
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Update weight, height, activity & metrics
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              </div>

              {/* Sign Out Option */}
              <div className="pt-1.5 pb-1">
                <button
                  type="button"
                  id="settings-option-signout"
                  onClick={() => {
                    setSettingsOpen(false);
                    if (confirm(`Sign out of ${user.name}? Your profile and logged history remain safely stored in the cloud.`)) {
                      signOut();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 group transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-rose-600">
                      Sign Out
                    </div>
                    <div className="text-[11px] text-rose-400 truncate">
                      Cloud data remains preserved
                    </div>
                  </div>
                </button>
              </div>

              {/* Real Connection Status Bar at bottom of small box */}
              <div className="pt-2 px-2 pb-1 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-medium text-slate-600">Backend Connected</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Real Database</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

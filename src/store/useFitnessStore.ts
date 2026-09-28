/**
 * Zustand State Machine for Progressive Onboarding & Global Fitness State
 * Date-Centric Isolation: At 12 midnight, a new day begins with a complete clean reset.
 * All previous days' data are persistently stored with immutable historical accuracy.
 */

import { create } from 'zustand';
import {
  firestoreGetUserProfile,
  firestoreSaveUserProfile,
  firestoreSaveFoodLog,
  firestoreDeleteFoodLog,
  firestoreGetFoodLogsForDate,
  firestoreSaveWaterLog,
  firestoreGetWaterLog,
} from '../lib/firestoreService';
import {
  authSignIn,
  authSignUp,
  authSignInAsGuest,
  authSignOut,
  authSignInWithGoogle,
  authConfirmGoogleSignIn,
  parseGoogleJwt,
} from '../lib/authService';
import { auth } from '../lib/firebase';

import { persist } from 'zustand/middleware';
import { calculateAge, calculateHealthMetrics } from '../lib/tdee';
import {
  apiAddFoodLog,
  apiDeleteAccount,
  apiDeleteFoodLog,
  apiFetchAccounts,
  apiFetchProfile,
  apiLogWater,
  apiLogin,
  apiLogout,
  apiRecalibrateProfile,
  apiSyncProfile,
  apiUpdateAvatar,
  apiUpdateMedicalProfile,
  fetchNutritionForDay,
  fetchNutritionHistory,
} from '../lib/api';
import {
  ActivityLevel,
  DayHistorySnippet,
  FoodLogEntry,
  Gender,
  Goal,
  HealthCondition,
  HealthMetrics,
  MedicinePhoto,
  OnboardingDraft,
  OnboardingStep,
  SubGoal,
  UserProfile,
} from '../types';

export type AuthViewMode = 'accounts' | 'onboarding' | 'login';

interface FitnessState {
  // Session & Account Persistence
  isInitializingSession: boolean;
  initSession: () => Promise<void>;

  // Multi-Account Management
  savedAccounts: UserProfile[];
  authViewMode: AuthViewMode;
  setAuthViewMode: (mode: AuthViewMode) => void;
  loadSavedAccounts: () => Promise<void>;
  loginWithAccount: (userId: string) => Promise<boolean>;
  loginWithCredentials: (emailOrPhone: string) => Promise<{ success: boolean; error?: string }>
  // Firebase Authentication & Multi-Tenancy Isolation
  signUpWithCredentials: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmailPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInAsGuestMode: () => Promise<boolean>;
  signInWithGoogleAccount: (googleProfile?: { email: string; name?: string; photoURL?: string }) => Promise<{ success: boolean; needsPrompt?: boolean; error?: string }>;

  deleteAccount: (userId: string) => Promise<void>;
  isAccountSwitcherOpen: boolean;
  setAccountSwitcherOpen: (open: boolean) => void;

  // Onboarding Machine
  onboardingStep: OnboardingStep;
  draft: OnboardingDraft;
  calculatedMetricsPreview: HealthMetrics | null;

  // Onboarding Actions
  setName: (name: string) => void;
  setDOB: (dob: { year: number; month: number; day: number }) => void;
  setGender: (gender: Gender) => void;
  setGoal: (goal: Goal) => void;
  setSubGoal: (subGoal: SubGoal) => void;
  setHealthConditions: (conditions: HealthCondition[]) => void;
  toggleHealthCondition: (condition: HealthCondition) => void;
  setHealthDescription: (description: string) => void;
  completeHealthOnboarding: () => Promise<void>;
  setBiometrics: (params: { height_cm: number; weight_kg: number; activity_level: ActivityLevel }) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  computePreviewMetrics: () => HealthMetrics;

  // Auth & Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  completeOnboardingWithGoogle: (googleUser?: { email: string; name?: string; photoURL?: string }) => Promise<{ success: boolean; needsPrompt?: boolean; error?: string }>;
  completeOnboardingWithEmailPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboardingAndAuth: (method: 'google' | 'phone' | 'guest', credential?: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  resetToOnboarding: () => void;

  // Recalibrate / Update Biometrics Modal
  isRecalibrateModalOpen: boolean;
  setRecalibrateModalOpen: (open: boolean) => void;

  // Medical Profile Modal
  isMedicalProfileModalOpen: boolean;
  setMedicalProfileModalOpen: (open: boolean) => void;
  updateMedicalProfile: (data: {
    health_conditions?: HealthCondition[];
    health_description?: string;
    medicines?: string[];
    medicine_photos?: MedicinePhoto[];
  }) => Promise<void>;

  // Profile Avatar Camera & Photo Modal
  isAvatarModalOpen: boolean;
  setAvatarModalOpen: (open: boolean) => void;
  updateAvatar: (avatarUrl: string | null) => Promise<void>;

  // Date Tracking & Daily Reset
  selectedDate: string; // YYYY-MM-DD
  todayDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  checkMidnightTransition: () => boolean;

  // Daily Logging & Nutrition Engine
  activeFoodReport: FoodLogEntry | null;
  setActiveFoodReport: (log: FoodLogEntry | null) => void;
  clearActiveFoodReport: () => void;
  foodLogs: FoodLogEntry[];
  waterByDate: Record<string, number>; // date -> ml
  historySnippets: Record<string, DayHistorySnippet>;
  isLoadingDayData: boolean;
  isAILoggingLoading: boolean;
  setAILoggingLoading: (loading: boolean) => void;

  // Data Operations
  loadDayData: (date: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  addFoodLog: (log: Omit<FoodLogEntry, 'id' | 'user_id' | 'consumed_at' | 'date'>) => Promise<FoodLogEntry>;
  deleteFoodLog: (id: string) => Promise<void>;
  logWater: (amountMl: number) => Promise<void>;
  resetWater: () => Promise<void>;
}

const getTodayString = () => new Date().toISOString().split('T')[0];
const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const INITIAL_DRAFT: OnboardingDraft = {
  name: '',
  dob: { year: 1998, month: 6, day: 15 },
  gender: null,
  goal: null,
  sub_goal: null,
  health_conditions: [],
  health_description: '',
  height_cm: 175,
  weight_kg: 72,
  activity_level: 'moderately_active',
};

// Seed previous days' logs so historical horizontal scroll displays rich past data immediately
const SEED_YESTERDAY_LOGS: FoodLogEntry[] = [
  {
    id: 'seed-log-y1',
    user_id: 'user-default-1',
    date: getYesterdayString(),
    food_name: 'Steel-Cut Oatmeal with Wild Berries & Pumpkin Seeds',
    meal_type: 'breakfast',
    calories: 450,
    protein_g: 18,
    carbs_g: 72,
    fats_g: 11,
    key_micros: {
      fiber_g: 10.5,
      sodium_mg: 110,
      potassium_mg: 520,
      iron_mg: 3.6,
      calcium_mg: 160,
      vit_c_mg: 18,
      vit_d_mcg: 2.0,
      magnesium_mg: 115,
    },
    consumed_at: `${getYesterdayString()}T08:30:00.000Z`,
  },
  {
    id: 'seed-log-y2',
    user_id: 'user-default-1',
    date: getYesterdayString(),
    food_name: 'Grilled Salmon with Ancient Quinoa & Asparagus',
    meal_type: 'dinner',
    calories: 680,
    protein_g: 52,
    carbs_g: 48,
    fats_g: 26,
    key_micros: {
      fiber_g: 6.8,
      sodium_mg: 420,
      potassium_mg: 980,
      iron_mg: 4.8,
      calcium_mg: 120,
      vit_c_mg: 45,
      vit_d_mcg: 18.0,
      magnesium_mg: 140,
    },
    consumed_at: `${getYesterdayString()}T19:15:00.000Z`,
  },
];

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      onboardingStep: 1,
      draft: INITIAL_DRAFT,
      calculatedMetricsPreview: null,

      setName: (name: string) =>
        set((state) => ({ draft: { ...state.draft, name } })),

      setDOB: (dob) =>
        set((state) => ({ draft: { ...state.draft, dob } })),

      setGender: (gender: Gender) =>
        set((state) => ({ draft: { ...state.draft, gender } })),

      setGoal: (goal: Goal) =>
        set((state) => ({
          draft: {
            ...state.draft,
            goal,
            sub_goal: goal === 'manage_weight' ? state.draft.sub_goal : null,
          },
        })),

      setSubGoal: (sub_goal: SubGoal) =>
        set((state) => ({ draft: { ...state.draft, sub_goal } })),

      setHealthConditions: (health_conditions: HealthCondition[]) =>
        set((state) => ({ draft: { ...state.draft, health_conditions } })),

      toggleHealthCondition: (condition: HealthCondition) =>
        set((state) => {
          const current = state.draft.health_conditions || [];
          const exists = current.includes(condition);
          const updated = exists
            ? current.filter((c) => c !== condition)
            : [...current, condition];
          return { draft: { ...state.draft, health_conditions: updated } };
        }),

      setHealthDescription: (health_description: string) =>
        set((state) => ({ draft: { ...state.draft, health_description } })),

      setBiometrics: (biometrics) =>
        set((state) => ({
          draft: {
            ...state.draft,
            height_cm: biometrics.height_cm,
            weight_kg: biometrics.weight_kg,
            activity_level: biometrics.activity_level,
          },
        })),

      computePreviewMetrics: () => {
        const { draft } = get();
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
      },

      nextStep: () => {
        const { onboardingStep, draft } = get();
        if (onboardingStep === 1) {
          if (!draft.name.trim()) return;
          set({ onboardingStep: 2 });
        } else if (onboardingStep === 2) {
          set({ onboardingStep: 3 });
        } else if (onboardingStep === 3) {
          if (!draft.gender) return;
          set({ onboardingStep: 4 });
        } else if (onboardingStep === 4) {
          if (!draft.goal) return;
          // Step 5: either SubGoal (for manage_weight) or HealthDiseases (for manage_health_problem)
          set({ onboardingStep: 5 });
        } else if (onboardingStep === 5) {
          if (draft.goal === 'manage_health_problem') {
            if (!draft.health_conditions || draft.health_conditions.length === 0) return;
            set({ onboardingStep: 6 }); // StepHealthDescription
          } else if (draft.goal === 'manage_weight') {
            if (!draft.sub_goal) return;
            set({ onboardingStep: 6 }); // StepBiometrics
          } else {
            set({ onboardingStep: 6 });
          }
        } else if (onboardingStep === 6) {
          if (draft.goal === 'manage_health_problem') {
            set({ onboardingStep: 7 }); // StepBiometrics for health problem
          } else {
            set({ onboardingStep: 7 }); // AuthSheetModal for weight/fitness
          }
        } else if (onboardingStep === 7) {
          if (draft.goal === 'manage_health_problem') {
            set({ onboardingStep: 8 }); // AuthSheetModal for health problem
          }
        }
      },
      prevStep: () => {
        const { onboardingStep } = get();
        if (onboardingStep <= 1) return;
        set({ onboardingStep: (onboardingStep - 1) as OnboardingStep });
      },
      goToStep: (step: OnboardingStep) => set({ onboardingStep: step }),

      // Session & Account Persistence Engine
      isInitializingSession: true,
      savedAccounts: [],
      authViewMode: 'onboarding',
      setAuthViewMode: (mode: AuthViewMode) => set({ authViewMode: mode }),
      isAccountSwitcherOpen: false,
      setAccountSwitcherOpen: (open: boolean) => set({ isAccountSwitcherOpen: open }),
      isRecalibrateModalOpen: false,
      setRecalibrateModalOpen: (open: boolean) => set({ isRecalibrateModalOpen: open }),
      isMedicalProfileModalOpen: false,
      setMedicalProfileModalOpen: (open: boolean) => set({ isMedicalProfileModalOpen: open }),

      updateMedicalProfile: async (data: {
        health_conditions?: HealthCondition[];
        health_description?: string;
        medicines?: string[];
        medicine_photos?: MedicinePhoto[];
      }) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser: UserProfile = {
          ...currentUser,
          health_conditions: data.health_conditions !== undefined ? data.health_conditions : currentUser.health_conditions,
          health_description: data.health_description !== undefined ? data.health_description : currentUser.health_description,
          medicines: data.medicines !== undefined ? data.medicines : (currentUser.medicines || []),
          medicine_photos: data.medicine_photos !== undefined ? data.medicine_photos : (currentUser.medicine_photos || []),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          user: updatedUser,
          savedAccounts: state.savedAccounts.map((a) => (a.id === updatedUser.id ? updatedUser : a)),
        }));

        try {
          await apiUpdateMedicalProfile(data);
        } catch (err) {
          console.warn('Backend updateMedicalProfile error:', err);
        }
      },
      isAvatarModalOpen: false,
      setAvatarModalOpen: (open: boolean) => set({ isAvatarModalOpen: open }),

      updateAvatar: async (avatarUrl: string | null) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updatedUser: UserProfile = {
          ...currentUser,
          avatar_url: avatarUrl || undefined,
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          user: updatedUser,
          savedAccounts: state.savedAccounts.map((a) => (a.id === updatedUser.id ? updatedUser : a)),
        }));

        try {
          await apiUpdateAvatar(avatarUrl);
        } catch (err) {
          console.warn('Backend avatar update error:', err);
        }
      },

      loadSavedAccounts: async () => {
        try {
          const res = await apiFetchAccounts();
          if (res.accounts && Array.isArray(res.accounts)) {
            set({ savedAccounts: res.accounts });
          }
        } catch (err) {
          console.warn('Failed to load accounts list:', err);
        }
      },

      initSession: async () => {
        try {
          // Fetch any verified user accounts from backend
          const accountsData = await apiFetchAccounts();
          const serverAccounts = accountsData.accounts || [];
          const { user: localUser, isAuthenticated: localAuth, savedAccounts: localAccounts } = get();

          // Filter out dummy/stale accounts from previous mock states
          const cleanAccounts = [...serverAccounts, ...(localAccounts || [])]
            .filter((u, idx, arr) => u && u.id && u.id !== 'usr_default_permanent' && arr.findIndex(x => x.id === u.id) === idx);

          set({ savedAccounts: cleanAccounts });

          // Only auto-restore session if the user explicitly authenticated with a real account (e.g. Google)
          if (localAuth && localUser && localUser.id !== 'usr_default_permanent' && localUser.email) {
            set({
              user: localUser,
              isAuthenticated: true,
              authViewMode: 'onboarding',
              isInitializingSession: false,
            });

            // Synchronize day logs & history for this exact user
            const today = getTodayString();
            get().loadDayData(today);
            get().loadHistory();
            return;
          }

          // User is NOT authenticated: Start directly into onboarding intake
          set({
            user: null,
            isAuthenticated: false,
            authViewMode: 'onboarding',
            isInitializingSession: false,
          });
        } catch (err) {
          console.warn('Session init error:', err);
          set({
            user: null,
            isAuthenticated: false,
            authViewMode: 'onboarding',
            isInitializingSession: false,
          });
        }
      },

      loginWithAccount: async (userId: string) => {
        set({ isAuthLoading: true });
        try {
          const res = await apiLogin({ userId });
          if (res.success && res.user) {
            set({
              user: res.user,
              isAuthenticated: true,
              isAuthLoading: false,
              isAccountSwitcherOpen: false,
              onboardingStep: 1,
            });

            if (res.user.biometrics) {
              const [y, m, d] = (res.user.dob || '1998-06-15').split('-').map(Number);
              set({
                draft: {
                  name: res.user.name,
                  dob: { year: y || 1998, month: m || 6, day: d || 15 },
                  gender: res.user.gender,
                  goal: res.user.goal,
                  sub_goal: res.user.sub_goal || null,
                  health_conditions: res.user.health_conditions || [],
                  health_description: res.user.health_description || '',
                  height_cm: res.user.biometrics.height_cm,
                  weight_kg: res.user.biometrics.weight_kg,
                  activity_level: res.user.biometrics.activity_level,
                },
              });
            }

            const today = getTodayString();
            await get().loadDayData(today);
            await get().loadHistory();
            await get().loadSavedAccounts();
            return true;
          }
          set({ isAuthLoading: false });
          return false;
        } catch (err) {
          console.error('Login error:', err);
          set({ isAuthLoading: false });
          return false;
        }
      },

      
      signUpWithCredentials: async (email: string, pass: string, name: string) => {
        set({ isAuthLoading: true });
        try {
          const res = await authSignUp(email, pass, name);
          if (res.error || !res.user) {
            set({ isAuthLoading: false });
            return { success: false, error: res.error || 'Sign up failed' };
          }

          // Pre-fill draft with clean name and email
          set((state) => ({
            draft: { ...state.draft, name: name.trim() },
            isAuthLoading: false,
            onboardingStep: 2,
          }));

          return { success: true };
        } catch (err: any) {
          set({ isAuthLoading: false });
          return { success: false, error: err?.message || 'Failed to create account' };
        }
      },

      signInWithEmailPassword: async (email: string, pass: string) => {
        set({ isAuthLoading: true });
        try {
          const res = await authSignIn(email, pass);
          if (res.error || !res.user) {
            set({ isAuthLoading: false });
            return { success: false, error: res.error || 'Invalid email or password' };
          }

          // Fetch user profile from Firestore
          const profile = await firestoreGetUserProfile(res.user.uid);
          if (profile) {
            set({
              user: profile,
              isAuthenticated: true,
              isAuthLoading: false,
              isAccountSwitcherOpen: false,
              onboardingStep: 1,
            });
            const today = getTodayString();
            get().loadDayData(today);
            get().loadHistory();
            return { success: true };
          }

          // If no existing profile, start onboarding with their account
          set({
            isAuthLoading: false,
            onboardingStep: 1,
          });
          return { success: true };
        } catch (err: any) {
          set({ isAuthLoading: false });
          return { success: false, error: err?.message || 'Login failed' };
        }
      },

      signInWithGoogleAccount: async (googleProfile) => {
        set({ isAuthLoading: true });
        try {
          let userRes: { uid: string; email: string; displayName: string; photoURL?: string } | undefined;

          if (googleProfile && googleProfile.email) {
            const confirmed = await authConfirmGoogleSignIn(
              googleProfile.email,
              googleProfile.name,
              googleProfile.photoURL
            );
            userRes = confirmed.user;
          } else {
            const gResult = await authSignInWithGoogle();
            if (gResult.needsPrompt || !gResult.user) {
              set({ isAuthLoading: false });
              return { success: false, needsPrompt: true, error: gResult.error };
            }
            userRes = gResult.user;
          }

          if (!userRes) {
            set({ isAuthLoading: false });
            return { success: false, needsPrompt: true };
          }

          // 1. Check if user profile exists in Firestore
          const existingProfile = await firestoreGetUserProfile(userRes.uid);
          if (existingProfile) {
            set({
              user: existingProfile,
              isAuthenticated: true,
              isAuthLoading: false,
              isAccountSwitcherOpen: false,
              onboardingStep: 1,
            });
            const today = getTodayString();
            get().loadDayData(today);
            get().loadHistory();
            get().loadSavedAccounts();
            return { success: true };
          }

          // 2. Check in saved accounts
          const saved = get().savedAccounts.find(
            (a) => a.id === userRes!.uid || (a.email && a.email.toLowerCase() === userRes!.email.toLowerCase())
          );
          if (saved) {
            set({
              user: saved,
              isAuthenticated: true,
              isAuthLoading: false,
              isAccountSwitcherOpen: false,
              onboardingStep: 1,
            });
            const today = getTodayString();
            get().loadDayData(today);
            get().loadHistory();
            return { success: true };
          }

          // 3. New Google User -> Pre-fill draft with Google name and email
          set((state) => ({
            draft: {
              ...state.draft,
              name: userRes!.displayName || 'Google User',
            },
            isAuthLoading: false,
            authViewMode: 'onboarding',
            onboardingStep: 1,
          }));

          return { success: true };
        } catch (err: any) {
          console.error('[Google Sign-In Error]:', err);
          set({ isAuthLoading: false });
          return { success: false, error: err?.message || 'Google sign-in could not be completed' };
        }
      },

      signInAsGuestMode: async () => {
        set({ isAuthLoading: true });
        try {
          const res = await authSignInAsGuest();
          if (res.user) {
            set((state) => ({
              isAuthLoading: false,
              onboardingStep: 1,
              authViewMode: 'onboarding',
              draft: {
                ...state.draft,
                name: state.draft.name || 'Guest User',
              },
            }));
            return true;
          }
          set({ isAuthLoading: false });
          return false;
        } catch {
          set({ isAuthLoading: false });
          return false;
        }
      },

      loginWithCredentials: async (emailOrPhone: string) => {
        set({ isAuthLoading: true });
        try {
          const res = await apiLogin({ emailOrPhone });
          if (res.success && res.user) {
            set({
              user: res.user,
              isAuthenticated: true,
              isAuthLoading: false,
              isAccountSwitcherOpen: false,
              onboardingStep: 1,
            });

            if (res.user.biometrics) {
              const [y, m, d] = (res.user.dob || '1998-06-15').split('-').map(Number);
              set({
                draft: {
                  name: res.user.name,
                  dob: { year: y || 1998, month: m || 6, day: d || 15 },
                  gender: res.user.gender,
                  goal: res.user.goal,
                  sub_goal: res.user.sub_goal || null,
                  health_conditions: res.user.health_conditions || [],
                  health_description: res.user.health_description || '',
                  height_cm: res.user.biometrics.height_cm,
                  weight_kg: res.user.biometrics.weight_kg,
                  activity_level: res.user.biometrics.activity_level,
                },
              });
            }

            const today = getTodayString();
            await get().loadDayData(today);
            await get().loadHistory();
            await get().loadSavedAccounts();
            return { success: true };
          }
          set({ isAuthLoading: false });
          return { success: false, error: res.message || 'No account found with those credentials.' };
        } catch (err: any) {
          set({ isAuthLoading: false });
          return { success: false, error: err?.message || 'Login failed. Please try again.' };
        }
      },

      deleteAccount: async (userId: string) => {
        try {
          await apiDeleteAccount(userId);
          await get().loadSavedAccounts();
          const currentUser = get().user;
          if (currentUser && currentUser.id === userId) {
            await get().signOut();
          }
        } catch (err) {
          console.error('Failed to delete account:', err);
        }
      },

      // User Profile & Authentication
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,

      completeHealthOnboarding: async () => {
        set({ isAuthLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 350));

        const { draft } = get();
        const age = calculateAge(draft.dob.year, draft.dob.month, draft.dob.day);
        const metrics = calculateHealthMetrics(
          draft.gender || 'rather_not_say',
          age,
          'manage_health_problem',
          undefined,
          {
            height_cm: draft.height_cm || 175,
            weight_kg: draft.weight_kg || 70,
            activity_level: draft.activity_level || 'moderately_active',
          }
        );

        const dobString = `${draft.dob.year}-${String(draft.dob.month).padStart(2, '0')}-${String(draft.dob.day).padStart(2, '0')}`;
        const cleanName = draft.name.trim() || 'Health User';
        const fallbackEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'patient'}@wellness.clinical`;

        const newUser: UserProfile = {
          id: `usr_${Date.now().toString(36)}`,
          auth_id: `auth_${Math.random().toString(36).substring(2, 10)}`,
          name: cleanName,
          email: fallbackEmail,
          dob: dobString,
          age,
          gender: draft.gender || 'rather_not_say',
          goal: 'manage_health_problem',
          health_conditions: draft.health_conditions,
          health_description: draft.health_description,
          biometrics: {
            height_cm: draft.height_cm || 175,
            weight_kg: draft.weight_kg || 70,
            activity_level: draft.activity_level || 'moderately_active',
          },
          metrics,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Ensure real Firebase Auth session exists for this user
        try {
          if (!auth.currentUser) {
            const guest = await authSignInAsGuest();
            if (guest.user) {
              newUser.id = guest.user.uid;
            }
          } else {
            newUser.id = auth.currentUser.uid;
          }
        } catch (authErr) {
          console.warn('[Auth] Guest setup notice:', authErr);
        }

        // Persist to user-isolated Firestore document
        try {
          await firestoreSaveUserProfile(newUser.id, newUser);
        } catch (fsErr) {
          console.warn('[Firestore] Save user profile notice:', fsErr);
        }

        // Sync to backend permanently
        try {
          await apiSyncProfile(newUser);
        } catch (err) {
          console.warn('Backend profile sync error:', err);
        }

        set((state) => ({
          user: newUser,
          isAuthenticated: true,
          isAuthLoading: false,
          onboardingStep: 1,
          savedAccounts: state.savedAccounts.some((a) => a.id === newUser.id)
            ? state.savedAccounts.map((a) => (a.id === newUser.id ? newUser : a))
            : [...state.savedAccounts, newUser],
        }));

        // Load today's data and history
        get().loadDayData(getTodayString());
        get().loadHistory();
        get().loadSavedAccounts();
      },

      completeOnboardingWithGoogle: async (googleProfile) => {
        set({ isAuthLoading: true });
        try {
          let userRes: { uid: string; email: string; displayName: string; photoURL?: string } | undefined;

          if (googleProfile && googleProfile.email) {
            const confirmed = await authConfirmGoogleSignIn(
              googleProfile.email,
              googleProfile.name,
              googleProfile.photoURL
            );
            userRes = confirmed.user;
          } else {
            const gResult = await authSignInWithGoogle();
            if (gResult.needsPrompt || !gResult.user) {
              set({ isAuthLoading: false });
              return { success: false, needsPrompt: true, error: gResult.error };
            }
            userRes = gResult.user;
          }

          if (!userRes) {
            set({ isAuthLoading: false });
            return { success: false, needsPrompt: true };
          }

          // Check if returning user profile already exists in Firestore
          const existingProfile = await firestoreGetUserProfile(userRes.uid);
          if (existingProfile) {
            set({
              user: existingProfile,
              isAuthenticated: true,
              isAuthLoading: false,
              isAccountSwitcherOpen: false,
              onboardingStep: 1,
            });
            const today = getTodayString();
            get().loadDayData(today);
            get().loadHistory();
            get().loadSavedAccounts();
            return { success: true };
          }

          const { draft, computePreviewMetrics } = get();
          const age = calculateAge(draft.dob.year, draft.dob.month, draft.dob.day);
          const metrics = computePreviewMetrics();
          const dobString = `${draft.dob.year}-${String(draft.dob.month).padStart(2, '0')}-${String(draft.dob.day).padStart(2, '0')}`;

          const newUser: UserProfile = {
            id: userRes.uid,
            auth_id: userRes.uid,
            name: userRes.displayName || draft.name || 'Google User',
            email: userRes.email,
            avatar_url: userRes.photoURL || undefined,
            dob: dobString,
            age,
            gender: draft.gender || 'rather_not_say',
            goal: draft.goal || 'stay_fit',
            sub_goal: draft.sub_goal || undefined,
            health_conditions: draft.health_conditions || [],
            health_description: draft.health_description || '',
            biometrics: {
              height_cm: draft.height_cm || 175,
              weight_kg: draft.weight_kg || 72,
              activity_level: draft.activity_level || 'moderately_active',
            },
            metrics,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          try {
            await firestoreSaveUserProfile(newUser.id, newUser);
          } catch (fsErr) {
            console.warn('[Firestore] Profile save notice:', fsErr);
          }

          try {
            await apiSyncProfile(newUser);
          } catch (err) {
            console.warn('Backend sync notice:', err);
          }

          set((state) => ({
            user: newUser,
            isAuthenticated: true,
            isAuthLoading: false,
            onboardingStep: 1,
            savedAccounts: state.savedAccounts.some((a) => a.id === newUser.id)
              ? state.savedAccounts.map((a) => (a.id === newUser.id ? newUser : a))
              : [...state.savedAccounts, newUser],
          }));

          get().loadDayData(getTodayString());
          get().loadHistory();
          get().loadSavedAccounts();
          return { success: true };
        } catch (err: any) {
          console.error('[Google Onboarding Error]:', err);
          set({ isAuthLoading: false });
          return { success: false, error: err?.message || 'Google authentication failed' };
        }
      },

      completeOnboardingWithEmailPassword: async (email: string, pass: string) => {
        set({ isAuthLoading: true });
        try {
          const { draft, computePreviewMetrics } = get();
          const cleanEmail = email.trim().toLowerCase();
          const res = await authSignUp(cleanEmail, pass, draft.name || 'Health User');
          if (res.error || !res.user) {
            set({ isAuthLoading: false });
            return { success: false, error: res.error || 'Failed to create account' };
          }

          const age = calculateAge(draft.dob.year, draft.dob.month, draft.dob.day);
          const metrics = computePreviewMetrics();
          const dobString = `${draft.dob.year}-${String(draft.dob.month).padStart(2, '0')}-${String(draft.dob.day).padStart(2, '0')}`;

          const newUser: UserProfile = {
            id: res.user.uid,
            auth_id: res.user.uid,
            name: draft.name.trim() || res.user.displayName || 'Health User',
            email: cleanEmail,
            dob: dobString,
            age,
            gender: draft.gender || 'rather_not_say',
            goal: draft.goal || 'stay_fit',
            sub_goal: draft.sub_goal || undefined,
            health_conditions: draft.health_conditions || [],
            health_description: draft.health_description || '',
            biometrics: {
              height_cm: draft.height_cm || 175,
              weight_kg: draft.weight_kg || 72,
              activity_level: draft.activity_level || 'moderately_active',
            },
            metrics,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          try {
            await firestoreSaveUserProfile(newUser.id, newUser);
          } catch {}

          try {
            await apiSyncProfile(newUser);
          } catch {}

          set((state) => ({
            user: newUser,
            isAuthenticated: true,
            isAuthLoading: false,
            onboardingStep: 1,
            savedAccounts: state.savedAccounts.some((a) => a.id === newUser.id)
              ? state.savedAccounts.map((a) => (a.id === newUser.id ? newUser : a))
              : [...state.savedAccounts, newUser],
          }));

          get().loadDayData(getTodayString());
          get().loadHistory();
          get().loadSavedAccounts();
          return { success: true };
        } catch (err: any) {
          set({ isAuthLoading: false });
          return { success: false, error: err?.message || 'Failed to complete registration' };
        }
      },

      completeOnboardingAndAuth: async (method, credential) => {
        set({ isAuthLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 600));

        const { draft } = get();
        const age = calculateAge(draft.dob.year, draft.dob.month, draft.dob.day);
        const metrics = calculateHealthMetrics(
          draft.gender || 'rather_not_say',
          age,
          draft.goal || 'stay_fit',
          draft.sub_goal || undefined,
          {
            height_cm: draft.height_cm,
            weight_kg: draft.weight_kg,
            activity_level: draft.activity_level,
          }
        );

        const dobString = `${draft.dob.year}-${String(draft.dob.month).padStart(2, '0')}-${String(draft.dob.day).padStart(2, '0')}`;

        const newUser: UserProfile = {
          id: `usr_${Date.now().toString(36)}`,
          auth_id: `auth_${Math.random().toString(36).substring(2, 10)}`,
          name: draft.name.trim() || 'Alex Mercer',
          email: method === 'google' ? (credential || `${draft.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`) : (method === 'guest' ? `${draft.name.toLowerCase().replace(/\s+/g, '') || 'athlete'}@wellness.fit` : undefined),
          phone: method === 'phone' ? credential : undefined,
          dob: dobString,
          age,
          gender: draft.gender || 'rather_not_say',
          goal: draft.goal || 'stay_fit',
          sub_goal: draft.sub_goal || undefined,
          health_conditions: draft.health_conditions,
          health_description: draft.health_description,
          biometrics: {
            height_cm: draft.height_cm,
            weight_kg: draft.weight_kg,
            activity_level: draft.activity_level,
          },
          metrics,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Persist to user-isolated Firestore document
        try {
          firestoreSaveUserProfile(newUser.id, newUser).catch(() => {});
        } catch {}

        // Sync to backend permanently
        try {
          await apiSyncProfile(newUser);
        } catch (err) {
          console.warn('Backend profile sync error (offline fallback):', err);
        }

        set((state) => ({
          user: newUser,
          isAuthenticated: true,
          isAuthLoading: false,
          onboardingStep: 1,
          savedAccounts: state.savedAccounts.some((a) => a.id === newUser.id)
            ? state.savedAccounts.map((a) => (a.id === newUser.id ? newUser : a))
            : [...state.savedAccounts, newUser],
        }));

        // Load today's fresh data and history
        get().loadDayData(getTodayString());
        get().loadHistory();
        get().loadSavedAccounts();
      },

      updateUserProfile: async (updates: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser: UserProfile = {
          ...currentUser,
          ...updates,
          biometrics: updates.biometrics ? { ...currentUser.biometrics, ...updates.biometrics } : currentUser.biometrics,
          metrics: updates.metrics ? { ...currentUser.metrics, ...updates.metrics } : currentUser.metrics,
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          user: updatedUser,
          savedAccounts: state.savedAccounts.map((a) => (a.id === updatedUser.id ? updatedUser : a)),
        }));

        try {
          await apiRecalibrateProfile(updates);
          await apiSyncProfile(updatedUser);
        } catch (e) {
          console.error('Failed to sync profile update:', e);
        }
      },

      signOut: async () => {
        try {
          await apiLogout();
        } catch (err) {
          console.warn('Backend logout warning:', err);
        }

        const accountsData = await apiFetchAccounts();
        const currentAccounts = accountsData.accounts.length > 0 ? accountsData.accounts : (get().savedAccounts || []);

        set({
          user: null,
          isAuthenticated: false,
          authViewMode: 'onboarding',
          savedAccounts: currentAccounts,
          isAccountSwitcherOpen: false,
          onboardingStep: 1,
          draft: INITIAL_DRAFT,
          calculatedMetricsPreview: null,
        });
      },

      resetToOnboarding: () => {
        const { user } = get();
        if (user && user.biometrics) {
          const [y, m, d] = (user.dob || '1998-06-15').split('-').map(Number);
          set({
            draft: {
              name: user.name,
              dob: { year: y || 1998, month: m || 6, day: d || 15 },
              gender: user.gender,
              goal: user.goal,
              sub_goal: user.sub_goal || null,
              health_conditions: user.health_conditions || [],
              health_description: user.health_description || '',
              height_cm: user.biometrics.height_cm,
              weight_kg: user.biometrics.weight_kg,
              activity_level: user.biometrics.activity_level,
            },
          });
        }
        set({
          isAuthenticated: false,
          onboardingStep: 1,
        });
      },

      // Date Tracking & Midnight Reset
      selectedDate: getTodayString(),
      todayDate: getTodayString(),

      checkMidnightTransition: () => {
        const actualToday = getTodayString();
        const currentStoredToday = get().todayDate;

        if (actualToday !== currentStoredToday) {
          console.log(`[Midnight Engine] Calendar day rolled over from ${currentStoredToday} to ${actualToday}. Resetting daily view.`);
          set({
            todayDate: actualToday,
            selectedDate: actualToday, // Switch view to new clean day!
          });
          get().loadDayData(actualToday);
          get().loadHistory();
          return true;
        }
        return false;
      },

      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
        get().loadDayData(date);
      },

      // Daily Nutrition Engine
      activeFoodReport: null,
      setActiveFoodReport: (log) => set({ activeFoodReport: log }),
      clearActiveFoodReport: () => set({ activeFoodReport: null }),

      foodLogs: SEED_YESTERDAY_LOGS,
      waterByDate: {
        [getYesterdayString()]: 2250,
      },
      historySnippets: {},
      isLoadingDayData: false,
      isAILoggingLoading: false,

      setAILoggingLoading: (loading: boolean) => set({ isAILoggingLoading: loading }),

      loadDayData: async (date: string) => {
        set({ isLoadingDayData: true });
        try {
          const res = await fetchNutritionForDay(date);
          if (res && res.foodLogs) {
            // Merge backend day logs
            set((state) => {
              const otherDayLogs = state.foodLogs.filter((l) => l.date !== date);
              return {
                foodLogs: [...res.foodLogs, ...otherDayLogs],
                waterByDate: {
                  ...state.waterByDate,
                  [date]: res.waterIntakeMl || 0,
                },
                isLoadingDayData: false,
              };
            });
          }
        } catch (err) {
          // Keep local state if backend call fails
          set({ isLoadingDayData: false });
        }
      },

      loadHistory: async () => {
        try {
          const history = await fetchNutritionHistory(21);
          set({ historySnippets: history });
        } catch (err) {
          console.warn('Failed to load history snippets:', err);
        }
      },

      addFoodLog: async (entry) => {
        const { user, selectedDate, foodLogs } = get();
        const targetDate = selectedDate || getTodayString();

        const optimisticLog: FoodLogEntry = {
          ...entry,
          id: `log_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: user?.id || 'default-user',
          date: targetDate,
          consumed_at: `${targetDate}T${new Date().toISOString().split('T')[1]}`,
        };

        // 1. Optimistic update in client store
        set({ foodLogs: [optimisticLog, ...foodLogs] });

        // 1.1 Persist to User-Isolated Firestore Document
        if (user?.id) {
          firestoreSaveFoodLog(user.id, optimisticLog).catch((e) =>
            console.warn('[Firestore] Background save food log warning:', e)
          );
        }

        // 2. Persist to real backend
        try {
          const saved = await apiAddFoodLog({
            date: targetDate,
            food_name: entry.food_name,
            calories: entry.calories,
            protein_g: entry.protein_g,
            carbs_g: entry.carbs_g,
            fats_g: entry.fats_g,
            key_micros: entry.key_micros,
            meal_type: entry.meal_type,
            image_url: entry.image_url,
            ai_confidence: entry.ai_confidence,
            serving_size: entry.serving_size,
            dietary_notes: entry.dietary_notes,
            health_compatibility: entry.health_compatibility,
            components: entry.components,
            nutritional_background: entry.nutritional_background,
            ai_engine_used: entry.ai_engine_used,
          });
          // Replace optimistic ID with server-verified ID if available
          if (saved && saved.id) {
            set((state) => ({
              foodLogs: state.foodLogs.map((l) => (l.id === optimisticLog.id ? saved : l)),
            }));
            // Refresh historical snippets for calendar strip indicators
            get().loadHistory();
            return saved;
          }
          // Refresh historical snippets for calendar strip indicators
          get().loadHistory();
          return optimisticLog;
        } catch (err) {
          console.error('Backend save food log failed, retained locally:', err);
          return optimisticLog;
        }
      },

      deleteFoodLog: async (id: string) => {
        const { user } = get();
        // Optimistic removal
        set((state) => ({
          foodLogs: state.foodLogs.filter((log) => log.id !== id),
        }));
        if (user?.id) {
          firestoreDeleteFoodLog(user.id, id).catch((e) =>
            console.warn('[Firestore] Delete food log warning:', e)
          );
        }

        try {
          await apiDeleteFoodLog(id);
          get().loadHistory();
        } catch (err) {
          console.error('Backend delete food log failed:', err);
        }
      },

      logWater: async (amountMl: number) => {
        const { selectedDate, waterByDate } = get();
        const targetDate = selectedDate || getTodayString();
        const current = waterByDate[targetDate] || 0;
        const nextVal = Math.max(0, current + amountMl);

        // Optimistic
        set((state) => ({
          waterByDate: {
            ...state.waterByDate,
            [targetDate]: nextVal,
          },
        }));

        try {
          await apiLogWater(targetDate, amountMl, 'add');
          get().loadHistory();
        } catch (err) {
          console.error('Backend water update failed:', err);
        }
      },

      resetWater: async () => {
        const { selectedDate } = get();
        const targetDate = selectedDate || getTodayString();

        set((state) => ({
          waterByDate: {
            ...state.waterByDate,
            [targetDate]: 0,
          },
        }));

        try {
          await apiLogWater(targetDate, 0, 'reset');
          get().loadHistory();
        } catch (err) {
          console.error('Backend water reset failed:', err);
        }
      },
    }),
    {
      name: 'fitness_wellness_app_storage_v2',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        savedAccounts: state.savedAccounts,
        authViewMode: state.authViewMode,
        foodLogs: state.foodLogs,
        waterByDate: state.waterByDate,
        draft: state.draft,
        todayDate: state.todayDate,
        selectedDate: state.selectedDate,
      }),
    }
  )
);

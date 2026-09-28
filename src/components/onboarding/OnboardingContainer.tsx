import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Shield } from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { StepName } from './StepName';
import { StepDOBWheel } from './StepDOBWheel';
import { StepGender } from './StepGender';
import { StepGoal } from './StepGoal';
import { StepSubGoal } from './StepSubGoal';
import { StepBiometrics } from './StepBiometrics';
import { StepHealthDiseases } from './StepHealthDiseases';
import { StepHealthDescription } from './StepHealthDescription';
import { AuthSheetModal } from './AuthSheetModal';

export function OnboardingContainer() {
  const onboardingStep = useFitnessStore((s) => s.onboardingStep);
  const prevStep = useFitnessStore((s) => s.prevStep);
  const draft = useFitnessStore((s) => s.draft);

  const isHealthProblemGoal = draft.goal === 'manage_health_problem';
  const totalSteps = isHealthProblemGoal ? 7 : 6;
  const isAuthStep = isHealthProblemGoal ? onboardingStep >= 8 : onboardingStep >= 7;
  const currentDisplayStep = Math.min(totalSteps, onboardingStep);
  const progressPercent = isAuthStep ? 100 : Math.min(100, Math.round((currentDisplayStep / totalSteps) * 100));

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Header bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          {onboardingStep > 1 && !isAuthStep ? (
            <button
              type="button"
              id="onboarding-back-btn"
              onClick={prevStep}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-2xs"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              FW
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-base hidden sm:inline-block">
              FitnessWellness
            </span>
          </div>
        </div>

        {/* Right side: Progress indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-20 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(12, progressPercent)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            {isAuthStep ? '100%' : `${currentDisplayStep}/${totalSteps}`}
          </span>
        </div>
      </header>

      {/* Dynamic Step View */}
      <main className="flex-1 flex items-center justify-center my-6">
        <AnimatePresence mode="wait">
          {onboardingStep === 1 && <StepName key="step-1" />}
          {onboardingStep === 2 && <StepDOBWheel key="step-2" />}
          {onboardingStep === 3 && <StepGender key="step-3" />}
          {onboardingStep === 4 && <StepGoal key="step-4" />}
          {onboardingStep === 5 && (
            isHealthProblemGoal ? (
              <StepHealthDiseases key="step-5-health" />
            ) : (
              <StepSubGoal key="step-5-subgoal" />
            )
          )}
          {onboardingStep === 6 && (
            isHealthProblemGoal ? (
              <StepHealthDescription key="step-6-desc" />
            ) : (
              <StepBiometrics key="step-6-biometrics" />
            )
          )}
          {onboardingStep === 7 && (
            isHealthProblemGoal ? (
              <StepBiometrics key="step-7-biometrics" />
            ) : (
              <AuthSheetModal key="step-7-auth" />
            )
          )}
          {onboardingStep === 8 && isHealthProblemGoal && (
            <AuthSheetModal key="step-8-auth" />
          )}
        </AnimatePresence>
      </main>

      {/* Footer Trust Markers */}
      <footer className="max-w-md w-full mx-auto text-center py-2 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span>Apple HealthKit & Google Fit clinical biometric integration</span>
      </footer>
    </div>
  );
}

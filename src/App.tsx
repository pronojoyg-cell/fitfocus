import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFitnessStore } from './store/useFitnessStore';
import { OnboardingContainer } from './components/onboarding/OnboardingContainer';
import { DashboardContainer } from './components/dashboard/DashboardContainer';
import { ShieldCheck, Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const isAuthenticated = useFitnessStore((s) => s.isAuthenticated);
  const user = useFitnessStore((s) => s.user);
  const isInitializingSession = useFitnessStore((s) => s.isInitializingSession);
  const initSession = useFitnessStore((s) => s.initSession);

  // Initialize session on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {isInitializingSession ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg mb-6 tracking-tight shadow-emerald-500/20">
              FW
            </div>
            <div className="flex items-center gap-2 text-white font-semibold text-base mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Verifying Google Session...</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Firestore Multi-Tenant Security Rules</span>
            </div>
          </div>
        ) : isAuthenticated && user ? (
          <DashboardContainer />
        ) : (
          <OnboardingContainer />
        )}
      </div>
    </QueryClientProvider>
  );
}

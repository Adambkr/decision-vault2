import { type ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Layouts (lightweight, eager-load)
import Layout from './components/layout/Layout.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';

// Error Boundary
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

// Code-split pages
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const AuthPage = lazy(() => import('./pages/Auth.tsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.tsx'));
const Pricing = lazy(() => import('./pages/Pricing.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const NewDecision = lazy(() => import('./pages/NewDecision.tsx'));
const ReviewMode = lazy(() => import('./pages/ReviewMode.tsx'));
const Insights = lazy(() => import('./pages/Insights.tsx'));
const DecisionDetail = lazy(() => import('./pages/DecisionDetail.tsx'));
const AllDecisions = lazy(() => import('./pages/AllDecisions.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const ReviewsDue = lazy(() => import('./pages/ReviewsDue.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[100dvh] bg-void flex items-center justify-center">
      <div className="relative">
        <div className="w-10 h-10 border border-accent/20 border-t-accent rounded-full animate-spin" />
        <div className="absolute inset-0 w-10 h-10 border border-transparent border-t-white/5 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
      </div>
    </div>
  );
}

const IsAuth = ({ children, isInternal = false }: { children: ReactNode; isInternal?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (isInternal && !user) {
    return <Navigate to="/auth" replace />;
  }

  return isInternal ? <DashboardLayout>{children}</DashboardLayout> : <Layout>{children}</Layout>;
};

const pageTransition = {
  initial: { opacity: 0, y: 6, scale: 0.998 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.998 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransition} className="overflow-x-hidden">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<IsAuth><LandingPage /></IsAuth>} />
            <Route path="/auth" element={<IsAuth><AuthPage /></IsAuth>} />
            <Route path="/onboarding" element={<IsAuth><Onboarding /></IsAuth>} />
            <Route path="/pricing" element={<IsAuth><Pricing /></IsAuth>} />

            <Route path="/dashboard" element={<IsAuth isInternal><Dashboard /></IsAuth>} />
            <Route path="/new-decision" element={<IsAuth isInternal><NewDecision /></IsAuth>} />
            <Route path="/decisions" element={<IsAuth isInternal><AllDecisions /></IsAuth>} />
            <Route path="/decision/:id" element={<IsAuth isInternal><DecisionDetail /></IsAuth>} />
            <Route path="/review/:id" element={<IsAuth isInternal><ReviewMode /></IsAuth>} />
            <Route path="/insights" element={<IsAuth isInternal><Insights /></IsAuth>} />
            <Route path="/reviews" element={<IsAuth isInternal><ReviewsDue /></IsAuth>} />
            <Route path="/settings" element={<IsAuth isInternal><Settings /></IsAuth>} />

            <Route path="*" element={<IsAuth><NotFound /></IsAuth>} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AnimatedRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3800,
              style: {
                background: 'rgba(15,20,28,0.92)',
                backdropFilter: 'blur(20px)',
                color: '#f0f2f5',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                fontSize: '13px',
                letterSpacing: '-0.01em',
                padding: '12px 16px',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.4), 0 32px 80px rgba(0,0,0,0.5)',
              },
              success: { iconTheme: { primary: '#6b8afe', secondary: '#0a0e17' } },
              error: { iconTheme: { primary: '#fb7185', secondary: '#0a0e17' } },
            }}
          />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}


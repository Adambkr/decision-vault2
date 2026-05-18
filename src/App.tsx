/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import Layout from './components/layout/Layout.tsx';
import DashboardLayout from './components/layout/DashboardLayout.tsx';

// Public Pages
import LandingPage from './pages/LandingPage.tsx';
import AuthPage from './pages/Auth.tsx';
import Onboarding from './pages/Onboarding.tsx';
import Pricing from './pages/Pricing.tsx';

// Private Pages
import Dashboard from './pages/Dashboard.tsx';
import NewDecision from './pages/NewDecision.tsx';
import ReviewMode from './pages/ReviewMode.tsx';
import Insights from './pages/Insights.tsx';
import DecisionDetail from './pages/DecisionDetail.tsx';
import AllDecisions from './pages/AllDecisions.tsx';

import { AuthProvider, useAuth } from './context/AuthContext.tsx';

const IsAuth = ({ children, isInternal = false }: any) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (isInternal && !user) {
    return <Navigate to="/auth" replace />;
  }

  return isInternal ? <DashboardLayout>{children}</DashboardLayout> : <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
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
          <Route path="/settings" element={<IsAuth isInternal><Dashboard /></IsAuth>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


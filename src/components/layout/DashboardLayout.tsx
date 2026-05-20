import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import CursorGlow from './CursorGlow';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AtmosphericBackdrop } from '@/components/ui';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative bg-void text-ink selection:bg-accent/25">
      <CursorGlow />
      <AtmosphericBackdrop variant="dashboard" grid />
      <div className="noise-overlay" />
      <div className="vignette" />

      <Sidebar />

      <main className="dashboard-main lg:pl-60 min-h-[100dvh] relative z-10 touch-pan-y">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-32 sm:px-6 sm:pt-10 lg:px-12 lg:py-14 safe-bottom">
          {children}
        </div>
      </main>

      {/* Floating Action Button — depth-layered, refined */}
      <Link
        to="/new-decision"
        aria-label="Log a new decision"
        className="group fixed bottom-24 right-5 lg:bottom-12 lg:right-12 z-40 w-14 h-14 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-void btn-primary border border-accent/30 overflow-hidden"
        style={{ bottom: 'max(6rem, env(safe-area-inset-bottom) + 5rem)' }}
      >
        <Plus
          className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90"
          strokeWidth={2}
        />
        <span className="absolute right-full mr-3 bg-surface-elevated/90 backdrop-blur-xl text-ink px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hidden lg:flex items-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/[0.08]">
          Log a Decision
        </span>
      </Link>
    </div>
  );
}

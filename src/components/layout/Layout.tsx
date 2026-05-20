import type { ReactNode } from 'react';
import Navbar from './Navbar';
import CursorGlow from './CursorGlow';
import { Link } from 'react-router-dom';
import { Hexagon } from 'lucide-react';
import { AtmosphericBackdrop } from '@/components/ui';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-[100dvh] bg-void selection:bg-accent/25">
      <CursorGlow />
      <AtmosphericBackdrop variant="app" />
      <div className="noise-overlay" />
      <div className="vignette" />

      <div className="relative z-10 flex flex-col min-h-[100dvh]">
        <Navbar />
        <main className="flex-grow touch-pan-y">{children}</main>

        <footer className="relative border-t border-white/[0.045] py-12 sm:py-20 px-5 sm:px-8 lg:px-12 backdrop-blur-xl bg-white/[0.008] safe-bottom">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-10 sm:gap-16 mb-10 sm:mb-14">
              <div className="flex flex-col gap-4 max-w-sm">
                <Link
                  to="/"
                  className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-ink hover:text-accent transition-colors duration-500 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/[0.10] flex items-center justify-center border border-accent/[0.22] group-hover:bg-accent/[0.16] transition-colors duration-500">
                    <Hexagon className="w-3.5 h-3.5 text-accent" strokeWidth={1.6} />
                  </div>
                  DecisionVault
                </Link>
                <p className="text-sm text-ink-dim/75 leading-relaxed font-light">
                  A cinematic operating system for mastering judgment and decision intelligence.
                </p>
              </div>

              <div className="flex flex-wrap gap-12 sm:gap-16">
                <div className="space-y-4">
                  <span className="kicker text-ink-faint/55">Product</span>
                  <div className="flex flex-col gap-2.5">
                    <Link to="/" className="text-sm text-ink-dim/85 hover:text-accent transition-colors duration-400">
                      How it Works
                    </Link>
                    <Link to="/pricing" className="text-sm text-ink-dim/85 hover:text-accent transition-colors duration-400">
                      Pricing
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      className="text-sm text-ink-dim/85 hover:text-accent transition-colors duration-400"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="kicker text-ink-faint/55">Company</span>
                  <div className="flex flex-col gap-2.5">
                    <a href="#" className="text-sm text-ink-dim/85 hover:text-accent transition-colors duration-400">
                      Manifesto
                    </a>
                    <a href="#" className="text-sm text-ink-dim/85 hover:text-accent transition-colors duration-400">
                      Privacy
                    </a>
                    <a href="#" className="text-sm text-ink-dim/85 hover:text-accent transition-colors duration-400">
                      Terms
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-6 sm:mb-8" />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-ink-faint/55">
                &copy; {new Date().getFullYear()} DecisionVault &mdash; Built for deep thinkers.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald/70 shadow-[0_0_8px_rgba(52,211,153,0.45)] animate-pulse" />
                <span className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

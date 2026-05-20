import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = original;
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, [mobileMenuOpen]);

  const isAuthPage = location.pathname === '/auth';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,backdrop-filter,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isScrolled || isAuthPage
          ? 'bg-void/72 backdrop-blur-2xl border-b border-white/[0.055] py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7 rounded-lg bg-accent/[0.10] flex items-center justify-center border border-accent/[0.22] group-hover:bg-accent/[0.16] transition-colors duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Hexagon className="w-3.5 h-3.5 text-accent" strokeWidth={1.6} />
          </div>
          <span className="text-display text-[15px] font-semibold tracking-tight hidden sm:block text-ink">
            DecisionVault
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          {!user ? (
            <>
              <Link
                to="/pricing"
                className="text-[13px] font-medium text-ink-dim/85 hover:text-ink transition-colors duration-400"
              >
                Pricing
              </Link>
              <Link
                to="/auth?mode=login"
                className="text-[13px] font-medium text-ink-dim/85 hover:text-ink transition-colors duration-400"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="btn-primary inline-flex items-center justify-center h-9 px-5 rounded-lg text-[13px] font-semibold tracking-tight"
              >
                Start Free
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-[13px] font-medium text-ink-dim/85 hover:text-accent transition-colors duration-400 group"
            >
              Dashboard
              <ArrowUpRight
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-400"
                strokeWidth={1.6}
              />
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-ink p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Menu className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-void/60 backdrop-blur-xl z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-4 right-4 bg-surface/95 backdrop-blur-2xl border border-white/[0.08] p-6 md:hidden z-50 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
            >
            <div className="flex flex-col gap-1">
              {!user ? (
                <>
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-xl text-sm font-medium text-ink-dim hover:text-ink hover:bg-white/[0.04] transition-colors">Pricing</Link>
                  <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-xl text-sm font-medium text-ink-dim hover:text-ink hover:bg-white/[0.04] transition-colors">Sign In</Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="mt-2 text-center py-3 bg-accent text-void rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(107,138,254,0.15)]">Start Free</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-xl text-sm font-medium text-ink-dim hover:text-ink hover:bg-white/[0.04] transition-colors">Dashboard</Link>
                  <Link to="/decisions" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-xl text-sm font-medium text-ink-dim hover:text-ink hover:bg-white/[0.04] transition-colors">My Decisions</Link>
                  <Link to="/insights" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-xl text-sm font-medium text-ink-dim hover:text-ink hover:bg-white/[0.04] transition-colors">Insights</Link>
                  <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 rounded-xl text-sm font-medium text-ink-dim hover:text-ink hover:bg-white/[0.04] transition-colors">Settings</Link>
                </>
              )}
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </nav>
  );
}

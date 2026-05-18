import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
        isScrolled 
          ? "bg-white/5 backdrop-blur-xl border-b border-white/5 py-4" 
          : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-[#F5A623] flex items-center justify-center shadow-[0_0_20px_rgba(245,166,35,0.4)] group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-[#080C14]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span className="text-2xl font-display font-medium tracking-tight">
            DecisionVault
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-gold-accent transition-colors">How it Works</Link>
          <Link to="/insights" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-gold-accent transition-colors">Insights</Link>
          <Link to="/pricing" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-gold-accent transition-colors">Pricing</Link>
          <Link to="/" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-gold-accent transition-colors">Manifesto</Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/auth?mode=login" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/auth?mode=signup" className="bg-[#F5A623] text-[#080C14] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#FFD166] transition-all shadow-lg shadow-amber-500/10 active:scale-95">
            Start Free →
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-luxury-surface border-b border-white/10 p-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/70">How it Works</Link>
              <Link to="/insights" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/70">Insights</Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/70">Pricing</Link>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/70">Manifesto</Link>
              <hr className="border-white/5" />
              <div className="flex flex-col gap-4">
                <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="text-center py-3 text-white/70 font-medium">Sign In</Link>
                <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 bg-gold-accent text-luxury-bg rounded-xl font-bold">Start Free</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

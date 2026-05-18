import { ReactNode, useEffect } from 'react';
import Navbar from './Navbar';
import CustomCursor from './CustomCursor';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative min-h-screen bg-[#080C14] selection:bg-gold-accent/30 overflow-hidden">
      <CustomCursor />
      <div className="noise-overlay" />
      
      {/* Immersive Background Elements */}
      <div className="mesh-orb top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#F5A623] opacity-[0.08]" />
      <div className="mesh-orb bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#1A253A] opacity-[0.4] blur-[100px]" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20">
          {children}
        </main>

        <footer className="border-t border-white/5 py-12 px-6 backdrop-blur-xl bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-display font-bold">DecisionVault</span>
            <p className="text-sm text-white/40">Your mind. Recorded. Refined.</p>
          </div>
          
          <div className="flex gap-8 text-sm text-white/60">
            <a href="#" className="hover:text-gold-accent transition-colors">Manifesto</a>
            <a href="#" className="hover:text-gold-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-gold-accent transition-colors">Contact</a>
          </div>

          <p className="text-xs text-white/30 font-mono">
            BUILT BY HUMANS. FOR HUMANS.
          </p>
        </div>
      </footer>
    </div>
  </div>
);
}

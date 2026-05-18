import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import CustomCursor from './CustomCursor';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#080C14] text-white selection:bg-gold-accent/30 overflow-hidden">
      <CustomCursor />
      <div className="noise-overlay" />
      
      {/* Immersive Background Elements */}
      <div className="mesh-orb top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-accent opacity-[0.03]" />
      <div className="mesh-orb bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#1A253A] opacity-[0.2]" />
      
      <Sidebar />
      
      <main className="pl-64 min-h-screen relative z-10">
        <div className="max-w-6xl mx-auto p-12">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <Link 
        to="/new-decision"
        className="fixed bottom-12 right-12 w-16 h-16 bg-gold-accent text-luxury-bg rounded-full flex items-center justify-center gold-glow hover:scale-110 active:scale-95 transition-all group z-50 overflow-hidden"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
        <span className="absolute right-full mr-4 bg-gold-accent text-luxury-bg px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-xl">
          Log a Decision
        </span>
      </Link>
    </div>
  );
}

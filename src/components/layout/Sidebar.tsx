import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  PlusCircle,
  Gem
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [reviewsDueCount, setReviewsDueCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchReviewsDue = async () => {
      const now = new Date().toISOString();
      const { count, error } = await supabase
        .from('decisions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'Awaiting Review')
        .lte('review_due_at', now);

      if (!error && count !== null) {
        setReviewsDueCount(count);
      }
    };

    fetchReviewsDue();

    const channel = supabase
      .channel('sidebar-decisions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${profile.id}` }, fetchReviewsDue)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Decisions', icon: BookOpen, path: '/decisions' },
    { name: 'Reviews Due', icon: History, path: '/decisions?filter=reviews', badge: reviewsDueCount > 0 ? String(reviewsDueCount) : undefined },
    { name: 'Insights', icon: BarChart3, path: '/insights' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const planLabel = profile?.plan || 'Free';

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-luxury-surface border-r border-white/5 flex flex-col pt-8 z-40">
      <Link to="/" className="px-8 mb-12 flex items-center gap-2 group">
        <ShieldCheck className="w-8 h-8 text-gold-accent transition-transform duration-500 group-hover:rotate-[360deg]" />
        <span className="text-xl font-display font-bold tracking-tight">DecisionVault</span>
      </Link>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
              isActive
                ? "bg-gold-accent text-luxury-bg font-bold shadow-lg shadow-gold-accent/10"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-luxury-bg" : "text-gold-accent/60 group-hover:text-gold-accent")} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold",
                    isActive ? "bg-luxury-bg/20 text-luxury-bg" : "bg-gold-accent/20 text-gold-accent"
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 mb-6 relative overflow-hidden group hover:border-gold-accent/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-accent/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Gem className="w-4 h-4 text-gold-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-gold-accent font-bold">{planLabel} Plan</span>
            </div>
            <p className="text-xs text-white/40 mb-3 leading-relaxed">Unlock advanced insights and unlimited decisions.</p>
            <Link to="/pricing" className="text-xs font-bold text-white hover:text-gold-accent transition-colors flex items-center gap-1 group">
              Upgrade Now <PlusCircle className="w-3 h-3 transition-transform group-hover:rotate-90" />
            </Link>
          </div>
        </div>

        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm group">
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

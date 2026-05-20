import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  Settings,
  LogOut,
  Hexagon,
  PlusCircle,
  Gem,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { EASING } from '@/lib/constants';

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
  shortName: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', icon: Home, path: '/', shortName: 'Home' },
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', shortName: 'Dash' },
  { name: 'My Decisions', icon: BookOpen, path: '/decisions', shortName: 'Decisions' },
  { name: 'Reviews Due', icon: History, path: '/reviews', shortName: 'Reviews' },
  { name: 'Insights', icon: BarChart3, path: '/insights', shortName: 'Insights' },
  { name: 'Settings', icon: Settings, path: '/settings', shortName: 'Settings' },
];

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reviewsDueCount, setReviewsDueCount] = useState(0);
  const [badgeLoading, setBadgeLoading] = useState(true);

  const fetchReviewsDue = useCallback(async () => {
    if (!profile?.id) return;
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
    setBadgeLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    fetchReviewsDue();

    if (!profile?.id) return;
    const channel = supabase
      .channel('sidebar-decisions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${profile.id}` }, fetchReviewsDue)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, fetchReviewsDue]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const planLabel = profile?.plan || 'Free';

  const isNavItemActive = useCallback((path: string) => {
    const [pathname, queryString] = path.split('?');
    if (location.pathname !== pathname) return false;
    if (!queryString) return location.search === '';
    return location.search === `?${queryString}`;
  }, [location.pathname, location.search]);

  const navItems = useMemo(() =>
    NAV_ITEMS.map(item =>
      item.path === '/reviews'
        ? { ...item, badge: (!badgeLoading && reviewsDueCount > 0) ? String(reviewsDueCount) : undefined }
        : item
    ),
    [reviewsDueCount, badgeLoading]
  );

  return (
    <>
      {/* ───────────────── Mobile bottom tab nav ───────────────── */}
      <nav className="dashboard-bottom-nav fixed inset-x-0 bottom-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="relative mx-auto max-w-md px-3 pt-2 pb-2">
          {/* Floating glass surface */}
          <div className="relative grid grid-cols-6 rounded-2xl border border-white/[0.07] bg-surface/85 backdrop-blur-2xl shadow-[0_-1px_0_rgba(255,255,255,0.04)_inset,0_-8px_32px_rgba(0,0,0,0.35),0_-16px_48px_rgba(0,0,0,0.25)] px-1 pt-1.5 pb-1.5">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-medium soft-press',
                    'transition-colors duration-300',
                    isActive ? 'text-accent' : 'text-ink-dim/75 active:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-active"
                      className="absolute inset-x-1 inset-y-1 rounded-xl bg-accent/[0.14] border border-accent/[0.18]"
                      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    />
                  )}
                  <item.icon
                    className={cn('relative z-10 h-5 w-5', isActive ? 'text-accent' : 'text-ink-dim/70')}
                    strokeWidth={1.5}
                  />
                  <span className="relative z-10 max-w-full truncate leading-none">{item.shortName}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold z-20',
                        isActive ? 'bg-accent/25 text-accent' : 'bg-accent text-void'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ───────────────── Desktop sidebar ───────────────── */}
      <aside
        className={cn(
          'dashboard-sidebar fixed top-0 left-0 hidden h-full flex-col lg:flex',
          'w-60 z-40 py-8',
          'bg-surface/55 backdrop-blur-2xl border-r border-white/[0.045]'
        )}
      >
        {/* Soft inner highlight */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />

        {/* Logo */}
        <Link to="/" className="px-6 mb-10 flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-xl bg-accent/[0.10] flex items-center justify-center border border-accent/[0.22] group-hover:bg-accent/[0.16] transition-colors duration-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_rgba(107,138,254,0.10)]">
            <Hexagon className="w-4 h-4 text-accent" strokeWidth={1.6} />
          </div>
          <span className="text-display text-[15px] font-semibold tracking-tight text-ink">DecisionVault</span>
        </Link>

        {/* Section label */}
        <span className="px-7 kicker mb-3 text-ink-faint/45">Workspace</span>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 rounded-xl group',
                  'transition-colors duration-400',
                  isActive ? 'text-ink' : 'text-ink-dim hover:text-ink hover:bg-white/[0.025]'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="absolute inset-0 rounded-xl bg-accent/[0.07] border border-accent/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_24px_rgba(107,138,254,0.08)]"
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                  />
                )}
                {/* Active accent rail */}
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-rail"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2.5">
                  <item.icon
                    className={cn(
                      'w-[17px] h-[17px] transition-colors duration-400',
                      isActive ? 'text-accent' : 'text-ink-dim/45 group-hover:text-accent/70'
                    )}
                    strokeWidth={1.6}
                  />
                  <span className="text-[13px] font-medium tracking-tight">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'relative z-10 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-semibold tabular-nums',
                      isActive ? 'bg-accent/[0.18] text-accent' : 'bg-accent/[0.10] text-accent'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mt-auto space-y-3">
          {/* User mini profile */}
          <div className="relative px-4 py-3 rounded-xl bg-white/[0.025] border border-white/[0.055] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent" />
            <div className="relative">
              <p className="text-[13px] font-medium truncate text-ink">{profile?.display_name || 'Strategist'}</p>
              <p className="text-[9px] font-medium text-ink-faint uppercase tracking-[0.22em] mt-0.5">
                {profile?.role || 'Thinker'}
              </p>
            </div>
          </div>

          {/* Upgrade CTA */}
          {planLabel !== 'Strategist' && (
            <div className="bg-white/[0.018] border border-white/[0.055] rounded-2xl p-4 relative overflow-hidden group hover:border-accent/[0.18] transition-colors duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/[0.06] blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Gem className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                    {planLabel} Plan
                  </span>
                </div>
                <p className="text-[11px] text-ink-dim/85 mb-3 leading-relaxed">
                  Unlock advanced insights and unlimited decisions.
                </p>
                <Link
                  to="/pricing"
                  className="text-[11px] font-semibold text-ink-dim hover:text-accent transition-colors flex items-center gap-1 group/link"
                >
                  Upgrade Now
                  <PlusCircle
                    className="w-3 h-3 transition-transform duration-500 group-hover/link:rotate-90"
                    strokeWidth={1.6}
                  />
                </Link>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-ink-dim hover:text-rose/90 hover:bg-rose/[0.05] transition-colors duration-400 text-[13px] group"
            style={{ transitionTimingFunction: `cubic-bezier(${EASING.cinematic.join(',')})` }}
          >
            <LogOut
              className="w-4 h-4 group-hover:rotate-12 transition-transform duration-400"
              strokeWidth={1.6}
            />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

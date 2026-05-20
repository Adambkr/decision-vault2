import { Card, Badge, ConfidenceRing, Skeleton, SkeletonCard } from '@/components/ui';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Target,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Loader2,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { reveal, fadeUp, staggerContainer } from '@/lib/motion';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ data: dData, error: dErr }, { data: rData, error: rErr }] = await Promise.all([
        supabase.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').eq('user_id', user.id),
      ]);

      if (dErr) console.error('Fetch error:', dErr);
      if (rErr) console.error('Reviews error:', rErr);

      setDecisions(
        (dData || []).map((d: any) => ({
          ...d,
          userId: d.user_id,
          createdAt: d.created_at,
          reviewDueAt: d.review_due_at,
          predictedOutcome: d.predicted_outcome,
          createdAtDate: new Date(d.created_at),
        }))
      );
      setReviews(rData || []);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel('decisions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const ongoingDecisions = useMemo(() =>
    decisions.filter(d => d.status === 'Awaiting Review' || d.status === 'Ongoing'),
    [decisions]
  );

  const reviewsDue = useMemo(() => {
    const now = new Date();
    return ongoingDecisions.filter(d => d.reviewDueAt && new Date(d.reviewDueAt) <= now);
  }, [ongoingDecisions]);

  const accuracy = useMemo(() => {
    if (reviews.length === 0) return 0;
    const scored = reviews.filter((r: any) => r.outcome_match);
    if (scored.length === 0) return 0;
    const total = scored.reduce((acc: number, r: any) => {
      if (r.outcome_match === 'yes') return acc + 100;
      if (r.outcome_match === 'partial') return acc + 50;
      return acc;
    }, 0);
    return Math.round(total / scored.length);
  }, [reviews]);

  const stats = useMemo(() => {
    const total = decisions.length;
    const avgConfidence = total > 0
      ? Math.round(decisions.reduce((acc, d) => acc + (d.confidence || 0), 0) / total)
      : 0;

    return [
      { label: 'Total Decisions', value: total.toString(), sub: 'lifetime', icon: BookOpen, urgent: false },
      { label: 'Reviews Due', value: reviewsDue.length.toString(), sub: 'needs attention', icon: AlertCircle, urgent: reviewsDue.length > 0 },
      { label: 'Avg. Confidence', value: `${avgConfidence}%`, sub: 'self-reported', icon: Target, urgent: false },
      { label: 'Accuracy Rate', value: `${accuracy}%`, sub: 'post-mortem', icon: TrendingUp, urgent: false, success: accuracy > 0 },
    ];
  }, [decisions, reviewsDue, accuracy]);

  if (loading) {
    return (
      <div className="space-y-10 lg:space-y-14 animate-fade-in-up">
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" pulse />
          <Skeleton className="h-10 w-3/4 max-w-md" pulse />
          <Skeleton className="h-4 w-1/2 max-w-sm" pulse />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
        <SkeletonCard lines={3} />
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" pulse />
          ))}
        </div>
      </div>
    );
  }

  const firstName = profile?.display_name?.split(' ')[0] || profile?.displayName?.split(' ')[0] || 'Strategist';

  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial="hidden"
      animate="visible"
      className="space-y-10 lg:space-y-14"
    >
      {/* Header */}
      <motion.div
        variants={reveal}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5"
      >
        <div className="min-w-0">
          <span className="kicker mb-3 block text-ink-faint/75">Intelligence Workspace</span>
          <h1 className="text-display text-3xl sm:text-4xl lg:text-[44px] font-semibold mb-2.5 leading-[1.04] break-words">
            Welcome back,{' '}
            <span className="font-editorial text-accent/95">{firstName}</span>
          </h1>
          {reviewsDue.length > 0 ? (
            <p className="text-ink-dim/80 text-sm font-light">
              You have{' '}
              <span className="text-accent font-medium">
                {reviewsDue.length} review{reviewsDue.length > 1 ? 's' : ''}
              </span>{' '}
              awaiting your attention.
            </p>
          ) : (
            <p className="text-ink-dim/75 text-sm font-light">Your vault is clear. Ready for your next decision?</p>
          )}
        </div>
        <Link
          to="/new-decision"
          className="btn-primary hidden sm:inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold tracking-tight"
        >
          <PlusCircle className="w-4 h-4" strokeWidth={2} />
          New Decision
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={reveal}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              hover
              className={cn(
                'min-w-0 p-5 sm:p-6 flex flex-col gap-5',
                stat.urgent && 'border-accent/20 accent-glow'
              )}
            >
              <div className="flex justify-between items-start">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
                    stat.urgent
                      ? 'bg-accent/[0.10] border-accent/[0.22]'
                      : 'bg-white/[0.025] border-white/[0.06]'
                  )}
                >
                  <stat.icon
                    className={cn('w-4 h-4', stat.urgent ? 'text-accent' : 'text-ink-dim/55')}
                    strokeWidth={1.6}
                  />
                </div>
                {stat.urgent && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                )}
              </div>
              <div>
                <span
                  className={cn(
                    'text-display block text-3xl sm:text-[34px] font-semibold mb-1.5 tabular-nums tracking-tight',
                    stat.urgent && 'text-accent'
                  )}
                >
                  {stat.value}
                </span>
                <span className="text-[10px] font-medium text-ink-faint/75 uppercase tracking-[0.20em]">
                  {stat.label}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Reviews Due Section */}
      <motion.div variants={fadeUp} className="space-y-5">
        <div className="flex items-center gap-3">
          {reviewsDue.length > 0 ? (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald/65" strokeWidth={1.6} />
          )}
          <h2 className="text-display text-[17px] font-semibold tracking-tight">Reviews Due</h2>
        </div>

        <div className="grid gap-3">
          {reviewsDue.length > 0 ? (
            reviewsDue.map((review: any, idx: number) => {
              const dueDate = new Date(review.reviewDueAt);
              const diffTime = new Date().getTime() - dueDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isOverdue = diffTime > 0;

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -10, scale: 0.99 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card edge-light p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex min-w-0 gap-3.5 items-center">
                    <div className="relative w-10 h-10 rounded-full border border-accent/[0.22] flex items-center justify-center shrink-0 bg-accent/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_16px_rgba(107,138,254,0.08)]">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-display text-[15px] font-semibold break-words tracking-tight">{review.title}</h3>
                      <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                        <span className="text-[11px] text-ink-faint/75 flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={1.6} />
                          {review.createdAtDate.toLocaleDateString()}
                        </span>
                        <Badge variant="accent" dot>
                          {review.categories?.[0] || 'Uncategorized'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {isOverdue && <Badge variant="warning">{diffDays}d overdue</Badge>}
                    <Link
                      to={`/review/${review.id}`}
                      className="btn-primary ml-auto sm:ml-0 inline-flex items-center h-9 px-4 rounded-lg text-xs font-semibold tracking-tight"
                    >
                      Face Reality
                    </Link>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <Card hover className="p-10 sm:p-14 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald/[0.06] flex items-center justify-center mx-auto mb-5 border border-emerald/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(52,211,153,0.08)]">
                <Shield className="w-5 h-5 text-emerald/55" strokeWidth={1.5} />
              </div>
              <p className="text-ink-dim/85 text-sm font-medium tracking-tight">No reviews due today.</p>
              <p className="text-xs text-ink-faint/75 mt-1.5 font-light italic">You are caught up with reality.</p>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Quick Insight */}
      {decisions.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="glass-card edge-light p-5 sm:p-6 flex items-start gap-4"
        >
          <div className="w-8 h-8 rounded-xl bg-accent/[0.08] flex items-center justify-center shrink-0 border border-accent/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Lightbulb className="w-3.5 h-3.5 text-accent/75" strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ink-dim/85 leading-relaxed font-light">
              {decisions.length < 5
                ? `You have logged ${decisions.length} decision${decisions.length > 1 ? 's' : ''}. After 5+ decisions with reviews, your Decision DNA insights will unlock.`
                : accuracy > 0
                ? `Your accuracy rate is ${accuracy}%. Review more decisions to unlock deeper calibration insights.`
                : 'Complete your first review to unlock accuracy tracking and calibration insights.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent Decisions List */}
      <motion.div variants={fadeUp} className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-display text-[17px] font-semibold tracking-tight">Ongoing Decisions</h2>
          <Link
            to="/decisions"
            className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint/75 hover:text-accent transition-colors duration-400 flex items-center gap-1.5 group"
          >
            View All
            <ArrowUpRight
              className="w-3 h-3 transition-transform duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.8}
            />
          </Link>
        </div>

        <div className="md:hidden grid gap-3">
          {ongoingDecisions.length > 0 ? (
            ongoingDecisions.slice(0, 5).map((decision) => (
              <Card key={decision.id} hover className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-display font-semibold text-sm truncate tracking-tight">{decision.title}</p>
                    <p className="text-[10px] font-medium text-ink-faint/75 uppercase tracking-[0.22em]">
                      {decision.createdAtDate.toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/decision/${decision.id}`}
                    aria-label={`View decision: ${decision.title}`}
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.06] text-ink-faint/75 hover:text-accent hover:border-accent/25 hover:bg-accent/[0.04] transition-colors duration-400"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <Badge variant="outline">{decision.categories?.[0] || 'General'}</Badge>
                  <ConfidenceRing value={decision.confidence || 0} size={34} strokeWidth={2.5} />
                </div>
              </Card>
            ))
          ) : (
            <Card hover className="p-10 text-center">
              <div className="flex flex-col items-center gap-4 text-ink-faint/60">
                <BookOpen className="w-9 h-9" strokeWidth={1} />
                <p className="text-sm text-ink-dim/80 font-light">Your vault is currently empty.</p>
                <Link
                  to="/new-decision"
                  className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors tracking-tight"
                >
                  Log Your First Decision
                </Link>
              </div>
            </Card>
          )}
        </div>

        <Card className="hidden md:block p-0 overflow-hidden" hover>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.045] text-ink-faint/60 text-[10px] font-medium uppercase tracking-[0.28em]">
                  <th className="px-7 lg:px-8 py-5 font-medium">Decision</th>
                  <th className="px-7 lg:px-8 py-5 font-medium">Category</th>
                  <th className="px-7 lg:px-8 py-5 font-medium">Created</th>
                  <th className="px-7 lg:px-8 py-5 font-medium text-center">Confidence</th>
                  <th className="px-7 lg:px-8 py-5 font-medium text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.035]">
                {ongoingDecisions.length > 0 ? (
                  ongoingDecisions.slice(0, 5).map((decision) => (
                    <tr key={decision.id} className="group hover:bg-accent/[0.022] transition-colors duration-400">
                      <td className="px-7 lg:px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-display font-semibold text-sm text-ink group-hover:text-accent transition-colors duration-500 truncate max-w-[180px] lg:max-w-xs tracking-tight">
                              {decision.title}
                            </span>
                            <span className="text-[9px] font-medium text-ink-faint/60 uppercase tracking-[0.22em]">
                              {decision.id.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 lg:px-8 py-5">
                        <Badge variant="outline">{decision.categories?.[0] || 'General'}</Badge>
                      </td>
                      <td className="px-7 lg:px-8 py-5">
                        <span className="text-xs text-ink-dim/70 tabular-nums">{decision.createdAtDate.toLocaleDateString()}</span>
                      </td>
                      <td className="px-7 lg:px-8 py-5">
                        <div className="flex justify-center">
                          <ConfidenceRing value={decision.confidence || 0} size={38} strokeWidth={3} />
                        </div>
                      </td>
                      <td className="px-7 lg:px-8 py-5 text-right">
                        <Link
                          to={`/decision/${decision.id}`}
                          aria-label={`View decision: ${decision.title}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.06] hover:border-accent/30 hover:bg-accent/[0.06] transition-colors duration-400 text-ink-faint/75 hover:text-accent"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-ink-faint/60">
                        <BookOpen className="w-9 h-9" strokeWidth={1} />
                        <p className="text-sm text-ink-dim/65 font-light">Your vault is currently empty.</p>
                        <Link
                          to="/new-decision"
                          className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors tracking-tight"
                        >
                          Log Your First Decision
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

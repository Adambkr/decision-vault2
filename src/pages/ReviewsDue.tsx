import { motion } from 'motion/react';
import { Card, Badge } from '@/components/ui';
import {
  Clock,
  ArrowUpRight,
  Shield,
  BookOpen,
  AlertCircle,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDecisions } from '@/hooks/useDecisions';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function ReviewsDue() {
  const { user } = useAuth();
  const { reviewsDue, loading } = useDecisions(user);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-white/10 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm font-medium text-ink-faint/60 uppercase tracking-widest">Loading Reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 lg:space-y-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 mb-3">
          <History className="w-4 h-4 text-accent/60" strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-ink-faint/70">Attention Required</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-3">Reviews Due</h1>
        <p className="text-ink-dim/75 text-sm max-w-lg">
          {reviewsDue.length > 0
            ? `You have ${reviewsDue.length} decision${reviewsDue.length > 1 ? 's' : ''} waiting for a reality check. Facing your predictions is where the learning happens.`
            : "You're all caught up. No decisions need reviewing right now."}
        </p>
      </motion.div>

      {/* Reviews List */}
      {reviewsDue.length > 0 ? (
        <div className="grid gap-4">
          {reviewsDue.map((decision, i) => {
            const dueDate = new Date(decision.review_due_at);
            const diffTime = new Date().getTime() - dueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isOverdue = diffTime > 0;

            return (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group edge-light">
                  <div className="flex min-w-0 gap-4 items-start">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      isOverdue
                        ? "bg-rose/5 border-rose/15"
                        : "bg-accent/5 border-accent/15"
                    )}>
                      {isOverdue ? (
                        <AlertCircle className="w-4 h-4 text-rose/60" strokeWidth={1.5} />
                      ) : (
                        <Clock className="w-4 h-4 text-accent/60" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-ink truncate">{decision.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-ink-faint/60 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(decision.created_at).toLocaleDateString()}
                        </span>
                        <Badge variant="accent">{decision.categories?.[0] || 'Uncategorized'}</Badge>
                        {isOverdue && (
                          <Badge variant="warning">{diffDays}d overdue</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/review/${decision.id}`}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-void rounded-xl text-xs font-semibold hover:bg-[#7a96ff] transition-all active:scale-[0.97] shadow-[0_0_16px_rgba(107,138,254,0.15)] w-full sm:w-auto justify-center"
                  >
                    Face Reality <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-card p-12 sm:p-16 text-center edge-light">
            <div className="w-14 h-14 rounded-full bg-emerald/5 flex items-center justify-center mx-auto mb-5 border border-emerald/10">
              <Shield className="w-6 h-6 text-emerald/30" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">All Clear</h3>
            <p className="text-sm text-ink-dim/75 max-w-sm mx-auto leading-relaxed mb-6">
              No reviews are due right now. Your thinking is current and your vault is clean.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/decisions"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-semibold text-ink-dim hover:text-ink hover:bg-white/[0.06] transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                View Archive
              </Link>
              <Link
                to="/new-decision"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-void rounded-xl text-xs font-semibold hover:bg-[#7a96ff] transition-all shadow-[0_0_16px_rgba(107,138,254,0.15)]"
              >
                Log a Decision
              </Link>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

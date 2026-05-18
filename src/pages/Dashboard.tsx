import { Card, Badge, Button } from '@/components/ui';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDecisions = async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Fetch error:', error);
      } else {
        setDecisions(
          (data || []).map((d: any) => ({
            ...d,
            userId: d.user_id,
            createdAt: d.created_at,
            reviewDueAt: d.review_due_at,
            predictedOutcome: d.predicted_outcome,
            createdAtDate: new Date(d.created_at),
          }))
        );
      }
      setLoading(false);
    };

    fetchDecisions();

    const channel = supabase
      .channel('decisions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${user.id}` },
        () => fetchDecisions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const ongoingDecisions = useMemo(() => 
    decisions.filter(d => d.status === 'Awaiting Review' || d.status === 'Ongoing'),
    [decisions]
  );

  const reviewsDue = useMemo(() => {
    const now = new Date();
    return ongoingDecisions.filter(d => d.reviewDueAt && new Date(d.reviewDueAt) <= now);
  }, [ongoingDecisions]);

  const stats = useMemo(() => {
    const total = decisions.length;
    const avgConfidence = total > 0 
      ? Math.round(decisions.reduce((acc, d) => acc + (d.confidence || 0), 0) / total) 
      : 0;
    
    // In a real app with reviews, we'd calculate accuracy. For now, placeholder.
    const accuracy = profile?.accuracyRate || 0;

    return [
      { label: 'Total Decisions', value: total.toString(), trend: 'LIFETIME', icon: BookOpen },
      { label: 'Reviews Due', value: reviewsDue.length.toString(), trend: 'URGENT', icon: Clock, color: 'text-gold-accent' },
      { label: 'Avg. Confidence', value: `${avgConfidence}%`, trend: 'SELF-REPORTED', icon: Target },
      { label: 'Accuracy Rate', value: `${accuracy}%`, trend: 'POST-MORTUM', icon: TrendingUp },
    ];
  }, [decisions, reviewsDue, profile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold-accent" />
        <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Accessing Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Welcome, {profile?.displayName?.split(' ')[0] || 'Strategist'}</h1>
          <p className="text-white/40">You have <span className="text-gold-accent font-bold">{reviewsDue.length} reviews</span> that need your attention today.</p>
        </div>
        <Link to="/new-decision">
          <Button className="px-8">
            <PlusCircle className="w-5 h-5" />
            New Decision
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/5 group-hover:border-gold-accent transition-colors">
                <stat.icon className={cn("w-5 h-5", stat.color || "text-white/40")} />
              </div>
              <span className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded border",
                stat.trend.includes('+') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : (stat.trend.includes('-') ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-gold-accent/10 text-gold-accent border-gold-accent/20")
              )}>
                {stat.trend}
              </span>
            </div>
            <div>
              <span className="block text-4xl font-display font-medium mb-1">{stat.value}</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Reviews Due Section - High Highlight */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-gold-accent" />
          <h2 className="text-xl font-display font-bold">Reviews Due Now</h2>
        </div>
        
        <div className="grid gap-4">
          {reviewsDue.length > 0 ? reviewsDue.map((review: any) => {
            const dueDate = new Date(review.reviewDueAt);
            const diffTime = Math.abs(new Date().getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return (
              <div 
                key={review.id}
                className="bg-gold-accent/[0.02] border border-gold-accent/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 gold-glow transition-all hover:bg-gold-accent/[0.05]"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 rounded-full border border-gold-accent/30 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-gold-accent rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{review.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> Logged {review.createdAtDate.toLocaleDateString()}</span>
                      <Badge variant="gold">{review.categories?.[0] || 'Uncategorized'}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="warning">{diffDays} days overdue</Badge>
                  <Link to={`/review/${review.id}`}>
                    <Button variant="primary" size="md">Face Reality</Button>
                  </Link>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40">No reviews due today. You are caught up with reality.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Decisions List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-bold">Ongoing Decisions</h2>
          <Link to="/decisions" className="text-xs font-mono uppercase tracking-widest text-white/40 hover:text-gold-accent transition-colors">View All</Link>
        </div>

        <Card className="p-0 overflow-hidden glass-card !backdrop-blur-none">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-white/20 text-[10px] font-mono uppercase tracking-[0.4em]">
                <th className="px-10 py-6 font-medium">Decision</th>
                <th className="px-10 py-6 font-medium">Category</th>
                <th className="px-10 py-6 font-medium">Timeline</th>
                <th className="px-10 py-6 font-medium text-center">Confidence</th>
                <th className="px-10 py-6 font-medium text-right">Vault</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ongoingDecisions.length > 0 ? ongoingDecisions.slice(0, 5).map((decision) => (
                <tr key={decision.id} className="group hover:bg-gold-accent/[0.02] transition-colors cursor-pointer">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-accent opacity-0 group-hover:opacity-100 transition-all -ml-6 mr-4" />
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-white group-hover:text-gold-accent transition-colors">{decision.title}</span>
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{decision.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8"><Badge variant="outline" className="border-white/10">{decision.categories?.[0] || 'General'}</Badge></td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs text-white/60">{decision.createdAtDate.toLocaleDateString()}</span>
                       <span className="text-[10px] font-mono text-white/20 uppercase">Created</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col items-center gap-3">
                       <span className="text-xs font-mono font-bold text-gold-accent">{decision.confidence}%</span>
                       <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-gold-accent shadow-[0_0_10px_rgba(245,166,35,0.5)]" style={{ width: `${decision.confidence}%` }} />
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Link to={`/decision/${decision.id}`} className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/5 hover:border-gold-accent/40 hover:bg-gold-accent/5 transition-all text-white/40 hover:text-gold-accent">
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-white/10">
                      <BookOpen className="w-12 h-12" />
                      <p className="font-display italic text-lg">Your vault is currently empty of ongoing paths.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

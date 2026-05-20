import { Card, Badge, GlassPanel } from '@/components/ui';
import {
  Dna,
  Target,
  TrendingUp,
  ArrowUpRight,
  Zap,
  AlertTriangle,
  Loader2,
  BrainCircuit,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { reveal, fadeUp, staggerContainer } from '@/lib/motion';
import DecisionHeatmap from '@/components/insights/DecisionHeatmap';
import BehavioralPatternPanel from '@/components/insights/BehavioralPatternPanel';

const chartTooltipStyle = {
  backgroundColor: 'rgba(15,20,28,0.92)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  fontSize: '12px',
  padding: '10px 12px',
  letterSpacing: '-0.01em',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)',
};

const chartTickStyle = {
  fill: 'rgba(138,145,156,0.55)',
  fontSize: 10,
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.02em',
};

export default function Insights() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ data: decisionsData, error: dErr }, { data: reviewsData, error: rErr }] = await Promise.all([
        supabase.from('decisions').select('*').eq('user_id', user.id),
        supabase.from('reviews').select('*').eq('user_id', user.id),
      ]);
      if (dErr) console.error('Decisions error:', dErr);
      if (rErr) console.error('Reviews error:', rErr);
      setDecisions(
        (decisionsData || []).map((d: any) => ({
          ...d,
          userId: d.user_id,
          createdAt: d.created_at,
          reviewDueAt: d.review_due_at,
          predictedOutcome: d.predicted_outcome,
          createdAtDate: new Date(d.created_at),
        }))
      );
      setReviews(
        (reviewsData || []).map((r: any) => ({
          ...r,
          userId: r.user_id,
          decisionId: r.decision_id,
          outcomeMatch: r.outcome_match,
          whatHappened: r.what_happened,
          whatRight: r.what_right,
          whatWrong: r.what_wrong,
          updatedConfidence: r.updated_confidence,
          completedAt: r.completed_at,
        }))
      );
      setLoading(false);
    };

    fetchData();

    const channelDecisions = supabase
      .channel('insights_decisions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    const channelReviews = supabase
      .channel('insights_reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channelDecisions);
      supabase.removeChannel(channelReviews);
    };
  }, [user]);

  const accuracyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats: Record<string, { accuracy: number, count: number, confidence: number }> = {};

    reviews.forEach(review => {
      const date = review.completedAt ? new Date(review.completedAt) : new Date();
      const month = months[date.getMonth()];
      if (!monthlyStats[month]) monthlyStats[month] = { accuracy: 0, count: 0, confidence: 0 };
      let accVal = 0;
      if (review.outcomeMatch === 'yes') accVal = 100;
      else if (review.outcomeMatch === 'partial') accVal = 50;
      const decision = decisions.find(d => d.id === review.decisionId);
      monthlyStats[month].accuracy += accVal;
      monthlyStats[month].confidence += decision?.confidence || 0;
      monthlyStats[month].count += 1;
    });

    return Object.entries(monthlyStats)
      .filter(([, stats]) => stats.count > 0)
      .map(([name, stats]) => ({
        name,
        accuracy: Math.round(stats.accuracy / stats.count),
        confidence: Math.round(stats.confidence / stats.count)
      })).sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));
  }, [reviews, decisions]);

  const calibrationData = useMemo(() => {
    return reviews.map(review => {
      const decision = decisions.find(d => d.id === review.decisionId);
      let accVal = 0;
      if (review.outcomeMatch === 'yes') accVal = 100;
      else if (review.outcomeMatch === 'partial') accVal = 50;
      return { x: decision?.confidence || 0, y: accVal };
    });
  }, [reviews, decisions]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    decisions.forEach(d => {
      const cat = d.categories?.[0] || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const colors = ['#6b8afe', '#a78bfa', '#5eead4', '#c8cdd4', '#8a919c'];
    return Object.entries(counts).map(([name, val], i) => ({
      name,
      value: val,
      color: colors[i % colors.length]
    }));
  }, [decisions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <Loader2 className="w-8 h-8 animate-spin text-accent/50" strokeWidth={1.5} />
          <div className="absolute inset-0 w-8 h-8 border border-transparent border-t-white/5 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-xs font-medium text-ink-faint/30 uppercase tracking-[0.2em]">Analyzing Patterns...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial="hidden"
      animate="visible"
      className="space-y-12 lg:space-y-16"
    >
      {/* Header */}
      <motion.div
        variants={reveal}
        className="flex flex-col sm:flex-row sm:items-end gap-5 border-b border-white/[0.045] pb-9"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-4">
            <BrainCircuit className="w-3.5 h-3.5 text-accent/65" strokeWidth={1.6} />
            <span className="kicker-accent">Your Decision DNA</span>
          </div>
          <h1 className="text-display text-display-balanced text-3xl sm:text-4xl lg:text-[56px] font-semibold leading-[1.04]">
            <span className="font-editorial text-accent/95">Insights</span> into how you think.
          </h1>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="glass-card edge-light inline-flex items-center gap-3 py-2.5 px-4 rounded-xl">
            <Activity className="w-3.5 h-3.5 text-accent/65" strokeWidth={1.6} />
            <span className="text-[10px] font-medium text-ink-faint/65 uppercase tracking-[0.22em]">
              Last 90 Days
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Charts */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-2 gap-5">
        <GlassPanel elevation="raised" padding="md" edgeLight className="h-[400px]">
          <div className="flex justify-between items-center mb-7">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-accent/65" strokeWidth={1.6} />
              <h3 className="text-display text-[14px] font-semibold text-ink-dim/85 tracking-tight">
                Accuracy Over Time
              </h3>
            </div>
            {accuracyData.length >= 2 && (
              <Badge variant="success">
                {(() => {
                  const first =
                    accuracyData.slice(0, Math.ceil(accuracyData.length / 2)).reduce((s, d) => s + d.accuracy, 0) /
                    Math.ceil(accuracyData.length / 2);
                  const last =
                    accuracyData.slice(Math.floor(accuracyData.length / 2)).reduce((s, d) => s + d.accuracy, 0) /
                    Math.floor(accuracyData.length / 2 || 1);
                  const diff = Math.round(last - first);
                  return `${diff >= 0 ? '+' : ''}${diff}%`;
                })()}
              </Badge>
            )}
          </div>
          <ResponsiveContainer width="100%" height="78%">
            <AreaChart data={accuracyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b8afe" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#6b8afe" stopOpacity={0} />
                </linearGradient>
                <filter id="accGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.035)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={chartTickStyle} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={chartTickStyle} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                itemStyle={{ color: '#6b8afe', fontSize: '12px', letterSpacing: '-0.01em' }}
                labelStyle={{ color: '#8a919c', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em' }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#6b8afe"
                strokeWidth={2}
                fill="url(#accGrad)"
                filter="url(#accGlow)"
                dot={{ fill: '#6b8afe', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, stroke: '#6b8afe', strokeWidth: 2, fill: '#0a0e17' }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="rgba(138,145,156,0.65)"
                strokeWidth={1.2}
                strokeDasharray="4 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassPanel>

        <GlassPanel elevation="raised" padding="md" edgeLight className="h-[400px]">
          <div className="flex justify-between items-center mb-7">
            <div className="flex items-center gap-2.5">
              <Target className="w-4 h-4 text-violet/65" strokeWidth={1.6} />
              <h3 className="text-display text-[14px] font-semibold text-ink-dim/85 tracking-tight">
                Calibration Curve
              </h3>
            </div>
            <AlertTriangle className="w-3.5 h-3.5 text-ink-faint/30" strokeWidth={1.6} />
          </div>
          <ResponsiveContainer width="100%" height="74%">
            <ScatterChart margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.035)" strokeDasharray="3 6" />
              <XAxis
                type="number"
                dataKey="x"
                name="Confidence"
                unit="%"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={chartTickStyle}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Accuracy"
                unit="%"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={chartTickStyle}
              />
              <ZAxis type="number" range={[40, 200]} />
              <Tooltip cursor={{ strokeDasharray: '3 6' }} contentStyle={chartTooltipStyle} />
              <Scatter name="Decisions" data={calibrationData} fill="#a78bfa" fillOpacity={0.75} />
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 100, y: 100 },
                ]}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 5"
              />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-[9px] font-medium text-ink-faint/40 mt-3 text-center uppercase tracking-[0.32em]">
            Perfect Calibration Diagonal
          </p>
        </GlassPanel>
      </motion.div>

      {/* Decision Heatmap — density × accuracy over time */}
      <motion.div variants={fadeUp}>
        <GlassPanel elevation="raised" padding="lg" edgeLight className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-accent/[0.05] blur-[80px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-accent/65" strokeWidth={1.6} />
                <h3 className="text-display text-[14px] font-semibold text-ink-dim/85 tracking-tight">
                  Decision Activity
                </h3>
              </div>
              <span className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">
                26 weeks
              </span>
            </div>
            <DecisionHeatmap decisions={decisions} reviews={reviews} weeks={26} />
          </div>
        </GlassPanel>
      </motion.div>

      {/* Behavioral Patterns — AI-styled deterministic synthesis */}
      <motion.div variants={fadeUp}>
        <BehavioralPatternPanel decisions={decisions} reviews={reviews} />
      </motion.div>

      {/* Stats and Categories */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-5">
        <GlassPanel elevation="card" padding="md" edgeLight className="col-span-1">
          <div className="flex items-center gap-2.5 mb-7">
            <Dna className="w-4 h-4 text-cyan/65" strokeWidth={1.6} />
            <h3 className="text-display text-[14px] font-semibold text-ink-dim/85 tracking-tight">
              Category Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {categoryDistribution.map((cat, i) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]"
                      style={{ backgroundColor: cat.color, color: cat.color }}
                    />
                    <span className="text-xs font-medium text-ink-dim/85 tracking-tight">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-ink-dim/55 tabular-nums tracking-tight">
                    {Math.round((cat.value / (decisions.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-1 bg-white/[0.045] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(cat.value / (decisions.length || 1)) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color, opacity: 0.7, boxShadow: `0 0 8px ${cat.color}` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="col-span-2 space-y-5">
          {(() => {
            const categoryStats: Record<string, { totalConfidence: number, totalAccuracy: number, count: number }> = {};
            reviews.forEach(review => {
              const decision = decisions.find(d => d.id === review.decisionId);
              if (!decision) return;
              const cat = decision.categories?.[0] || 'Other';
              let accVal = 0;
              if (review.outcomeMatch === 'yes') accVal = 100;
              else if (review.outcomeMatch === 'partial') accVal = 50;
              if (!categoryStats[cat]) categoryStats[cat] = { totalConfidence: 0, totalAccuracy: 0, count: 0 };
              categoryStats[cat].totalConfidence += decision.confidence || 0;
              categoryStats[cat].totalAccuracy += accVal;
              categoryStats[cat].count += 1;
            });

            const entries = Object.entries(categoryStats).map(([name, s]) => ({
              name,
              avgConfidence: s.totalConfidence / s.count,
              avgAccuracy: s.totalAccuracy / s.count,
              gap: Math.abs((s.totalConfidence / s.count) - (s.totalAccuracy / s.count)),
              count: s.count
            })).filter(e => e.count >= 2);

            const best = entries.length > 0 ? entries.reduce((a, b) => a.gap < b.gap ? a : b) : null;
            const worst = entries.length > 0 ? entries.reduce((a, b) => a.gap > b.gap ? a : b) : null;

            const withAssumptions = reviews.filter(r => {
              const d = decisions.find(de => de.id === r.decisionId);
              return d && Array.isArray(d.assumptions) && d.assumptions.length >= 3;
            });
            const withoutAssumptions = reviews.filter(r => {
              const d = decisions.find(de => de.id === r.decisionId);
              return d && (!d.assumptions || d.assumptions.length < 3);
            });
            const avgWith = withAssumptions.length > 0 ? withAssumptions.reduce((s, r) => s + (r.outcomeMatch === 'yes' ? 100 : r.outcomeMatch === 'partial' ? 50 : 0), 0) / withAssumptions.length : 0;
            const avgWithout = withoutAssumptions.length > 0 ? withoutAssumptions.reduce((s, r) => s + (r.outcomeMatch === 'yes' ? 100 : r.outcomeMatch === 'partial' ? 50 : 0), 0) / withoutAssumptions.length : 0;
            const assumptionDelta = avgWithout > 0 ? Math.round(((avgWith - avgWithout) / avgWithout) * 100) : 0;

            return (
              <>
                <div className="grid md:grid-cols-2 gap-5">
                  {best && (
                    <GlassPanel elevation="card" padding="md" edgeLight className="flex flex-col gap-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald/[0.06] border border-emerald/[0.18] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(52,211,153,0.08)]">
                        <Target className="w-4 h-4 text-emerald/70" strokeWidth={1.6} />
                      </div>
                      <div>
                        <h4 className="text-display text-[15px] font-semibold mb-2 tracking-tight">Calibration Strength</h4>
                        <p className="text-[13px] text-ink-dim/85 leading-relaxed font-light">
                          You are <span className="text-emerald/90 font-medium">highly calibrated</span> in {best.name}{' '}
                          decisions. At {Math.round(best.avgConfidence)}% confidence, you are right{' '}
                          {Math.round(best.avgAccuracy)}% of the time.
                        </p>
                      </div>
                    </GlassPanel>
                  )}
                  {worst && (
                    <GlassPanel elevation="card" padding="md" edgeLight className="flex flex-col gap-5">
                      <div className="w-10 h-10 rounded-xl bg-rose/[0.06] border border-rose/[0.18] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(251,113,133,0.08)]">
                        <AlertTriangle className="w-4 h-4 text-rose/70" strokeWidth={1.6} />
                      </div>
                      <div>
                        <h4 className="text-display text-[15px] font-semibold mb-2 tracking-tight">Overconfidence Trap</h4>
                        <p className="text-[13px] text-ink-dim/85 leading-relaxed font-light">
                          You tend to be <span className="text-rose/90 font-medium">overconfident</span> in{' '}
                          {worst.name}. Your accuracy is{' '}
                          {Math.round(worst.avgConfidence - worst.avgAccuracy)}% lower than your predicted
                          confidence.
                        </p>
                      </div>
                    </GlassPanel>
                  )}
                  {!best && !worst && reviews.length === 0 && (
                    <GlassPanel padding="md" className="col-span-2 text-center">
                      <p className="text-xs text-ink-dim/65 font-light italic">
                        Complete some reviews to unlock calibration insights.
                      </p>
                    </GlassPanel>
                  )}
                </div>

                {assumptionDelta !== 0 && (
                  <GlassPanel elevation="raised" padding="lg" edgeLight className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.04]">
                      <Zap className="w-24 h-24 text-accent" strokeWidth={1} />
                    </div>
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/[0.06] rounded-full blur-[60px]" />
                    <div className="relative z-10 flex flex-col gap-5">
                      <span className="kicker-accent">The Golden Insight</span>
                      <p className="font-editorial italic text-[22px] sm:text-[28px] leading-[1.25] text-ink/95 max-w-3xl">
                        &ldquo;Your decisions are {Math.abs(assumptionDelta)}%{' '}
                        {assumptionDelta > 0 ? 'more' : 'less'} accurate when you list 3 or more assumptions during
                        the reasoning phase.&rdquo;
                      </p>
                      <div className="flex items-center gap-1.5 text-accent/85 group cursor-default">
                        <span className="text-xs font-semibold tracking-tight">Adopt this pattern</span>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 transition-transform duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          strokeWidth={1.8}
                        />
                      </div>
                    </div>
                  </GlassPanel>
                )}
              </>
            );
          })()}
        </div>
      </motion.div>
    </motion.div>
  );
}

import { Card, Badge } from '@/components/ui';
import { 
  Dna, 
  Target, 
  TrendingUp, 
  History, 
  ArrowUpRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  ScatterChart, 
  Scatter, 
  ZAxis,
  PieChart,
  Pie
} from 'recharts';

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

  // Transform data for charts
  const accuracyData = useMemo(() => {
    // Group reviews by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats: Record<string, { accuracy: number, count: number, confidence: number }> = {};
    
    reviews.forEach(review => {
      const date = review.completedAt ? new Date(review.completedAt) : new Date();
      const month = months[date.getMonth()];
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = { accuracy: 0, count: 0, confidence: 0 };
      }
      
      // Outcome Match: yes=100, partial=50, no=0
      let accVal = 0;
      if (review.outcomeMatch === 'yes') accVal = 100;
      else if (review.outcomeMatch === 'partial') accVal = 50;
      
      const decision = decisions.find(d => d.id === review.decisionId);
      
      monthlyStats[month].accuracy += accVal;
      monthlyStats[month].confidence += decision?.confidence || 0;
      monthlyStats[month].count += 1;
    });

    return Object.entries(monthlyStats).map(([name, stats]) => ({
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

      return {
        x: decision?.confidence || 0,
        y: accVal
      };
    });
  }, [reviews, decisions]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    decisions.forEach(d => {
      const cat = d.categories?.[0] || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    const colors = ['#F5A623', '#FFD166', '#ffffff', '#4a4a4a', '#E5E7EB'];
    return Object.entries(counts).map(([name, val], i) => ({
      name,
      value: val,
      color: colors[i % colors.length]
    }));
  }, [decisions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold-accent" />
        <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Analyzing Neural Patterns...</p>
      </div>
    );
  }
  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="flex border-b border-white/5 pb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
             <Dna className="w-6 h-6 text-gold-accent" />
             <span className="text-xs font-mono uppercase tracking-[0.4em] text-white/40">Your Decision DNA</span>
          </div>
          <h1 className="text-5xl font-display font-medium">Insights</h1>
        </div>
        <div className="flex gap-4">
           <Card className="flex items-center gap-4 py-3 px-6">
              <span className="text-xs font-mono text-white/40">Last 90 Days</span>
              <div className="w-px h-6 bg-white/10" />
              <button className="text-gold-accent text-xs font-bold font-mono">Filter</button>
           </Card>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-display text-xl">Accuracy Over Time</h3>
            {accuracyData.length >= 2 && (
              <Badge variant="success">
                {(() => {
                  const first = accuracyData.slice(0, Math.ceil(accuracyData.length / 2)).reduce((s, d) => s + d.accuracy, 0) / Math.ceil(accuracyData.length / 2);
                  const last = accuracyData.slice(Math.floor(accuracyData.length / 2)).reduce((s, d) => s + d.accuracy, 0) / Math.floor(accuracyData.length / 2 || 1);
                  const diff = Math.round(last - first);
                  return `${diff >= 0 ? '+' : ''}${diff}%`;
                })()}
              </Badge>
            )}
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0F1E', border: '1px solid #F5A62340', borderRadius: '12px' }}
                itemStyle={{ color: '#F5A623', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#F5A623" 
                strokeWidth={3} 
                dot={{ fill: '#F5A623', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#F5A623', strokeWidth: 2, fill: '#080C14' }}
              />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="#ffffff20" 
                strokeWidth={1} 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-8 h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-display text-xl">Calibration Curve</h3>
            <div className="group relative">
               <AlertTriangle className="w-4 h-4 text-white/20 hover:text-gold-accent transition-colors" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <ScatterChart>
              <CartesianGrid stroke="#ffffff05" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Confidence" 
                unit="%" 
                domain={[0, 100]}
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Accuracy" 
                unit="%" 
                domain={[0, 100]}
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              />
              <ZAxis type="number" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Decisions" data={calibrationData} fill="#F5A623" />
              <Line 
                type="linear" 
                data={[ {x: 0, y: 0}, {x: 100, y: 100} ]} 
                stroke="#ffffff10" 
                strokeDasharray="3 3"
                dot={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-[10px] font-mono text-white/30 mt-4 text-center">PERFECT CALIBRATION DIAGONAL</p>
        </Card>
      </div>

      {/* Stats and Categories */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="col-span-1 p-8">
          <h3 className="font-display text-xl mb-6">Category Distribution</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryDistribution.map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-mono text-white/60">{cat.name}</span>
                </div>
                <span className="text-xs font-mono font-bold">
                  {Math.round((cat.value / (decisions.length || 1)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="col-span-2 space-y-6">
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
                <div className="grid md:grid-cols-2 gap-6">
                  {best && (
                    <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-8 flex flex-col gap-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Target className="text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Calibration Strength</h4>
                        <p className="text-sm text-white/50 leading-relaxed">
                          You are <span className="text-emerald-400 font-bold">highly calibrated</span> in {best.name} decisions.
                          When you say {Math.round(best.avgConfidence)}% confidence, you are right {Math.round(best.avgAccuracy)}% of the time.
                        </p>
                      </div>
                    </div>
                  )}
                  {worst && (
                    <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-8 flex flex-col gap-6">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Overconfidence Trap</h4>
                        <p className="text-sm text-white/50 leading-relaxed">
                          You tend to be <span className="text-red-400 font-bold">overconfident</span> in {worst.name}.
                          Your accuracy is {Math.round(worst.avgConfidence - worst.avgAccuracy)}% lower than your predicted confidence.
                        </p>
                      </div>
                    </div>
                  )}
                  {!best && !worst && reviews.length === 0 && (
                    <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
                      <p className="text-sm text-white/40">Complete some reviews to unlock calibration insights.</p>
                    </div>
                  )}
                </div>

                {assumptionDelta !== 0 && (
                  <Card className="p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap className="w-24 h-24 text-gold-accent" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-6">
                      <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/20">The Golden Insight</span>
                      <p className="text-2xl font-display italic leading-tight">
                        "Your decisions are {Math.abs(assumptionDelta)}% {assumptionDelta > 0 ? 'more' : 'less'} accurate when you list 3 or more assumptions during the reasoning phase."
                      </p>
                      <div className="flex items-center gap-2 text-gold-accent">
                        <span className="text-xs font-bold">Adopt this pattern</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

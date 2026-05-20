import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { Button, Badge } from '@/components/ui';
import { ArrowLeft, Loader2, AlertCircle, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function ReviewMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decision, setDecision] = useState<any>(null);
  const [actualOutcome, setActualOutcome] = useState('');
  const [outcomeMatch, setOutcomeMatch] = useState<'yes' | 'no' | 'partial' | ''>('');
  const [gotRight, setGotRight] = useState('');
  const [missed, setMissed] = useState('');
  const [updatedConfidence, setUpdatedConfidence] = useState(50);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    async function fetchDecision() {
      if (!id) return;
      const { data, error } = await supabase.from('decisions').select('*').eq('id', id).single();
      if (error) console.error('Error fetching decision:', error);
      else {
        if (data.user_id !== user?.id) { navigate('/dashboard'); return; }
        setDecision({ ...data, userId: data.user_id, createdAt: data.created_at, reviewDueAt: data.review_due_at, predictedOutcome: data.predicted_outcome, createdAtDate: new Date(data.created_at) });
      }
      setLoading(false);
    }
    if (user) fetchDecision();
  }, [id, user, navigate]);

  const handleSubmit = async () => {
    if (!user || !decision || !actualOutcome.trim() || !outcomeMatch) {
      toast.error('Please fill in the required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        decision_id: decision.id,
        what_happened: actualOutcome,
        outcome_match: outcomeMatch,
        what_right: gotRight,
        what_wrong: missed,
        updated_confidence: updatedConfidence,
        completed_at: new Date().toISOString()
      });
      if (error) throw error;
      const { error: decisionError } = await supabase.from('decisions').update({ status: 'Reviewed' }).eq('id', decision.id).eq('user_id', user.id);
      if (decisionError) throw decisionError;

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#6b8afe', '#a78bfa', '#c8cdd4', '#10B981'],
      });

      toast.success('Review completed!');
      setShowCelebration(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save review');
      setIsSubmitting(false);
    }
  };

  if (showCelebration) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="text-center space-y-6 sm:space-y-8 py-16 sm:py-20 lg:py-24 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-accent rounded-full flex items-center justify-center mx-auto accent-glow">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-void" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold">Review Complete</h1>
          <p className="text-base sm:text-lg lg:text-xl text-ink-dim/60 max-w-lg mx-auto">You have faced reality. Your thinking is now sharper than it was.</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-6 px-4">
          <Link to="/dashboard" className="w-full sm:w-auto"><Button className="w-full sm:w-auto">Back to Dashboard</Button></Link>
          <Link to="/insights" className="w-full sm:w-auto"><Button variant="secondary" className="w-full sm:w-auto">View Insights</Button></Link>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-white/10 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm font-mono text-ink-dim/40 uppercase tracking-widest">Loading Review...</p>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-ink-faint/10 mx-auto" />
        <h2 className="text-2xl font-display font-medium">Decision Not Found</h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-12 lg:space-y-16">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-dim/60 hover:text-ink transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-mono uppercase tracking-widest">Return</span>
      </button>

      <div className="space-y-4">
        <Badge variant="accent">Review Mode</Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium">Face Reality</h1>
        <p className="text-base lg:text-lg text-ink-dim/60 max-w-xl">Comparing prediction to actual outcome for: <span className="text-ink font-bold">{decision.title}</span></p>
      </div>

      <div className="bg-accent/[0.02] border border-accent/10 rounded-2xl lg:rounded-3xl p-6 lg:p-8 space-y-3">
        <div className="text-[10px] font-mono text-ink-faint/40 uppercase tracking-widest">Your Prediction</div>
        <p className="text-lg lg:text-xl font-display italic text-ink/80">&ldquo;{decision.predictedOutcome || 'No specific outcome predicted.'}&rdquo;</p>
      </div>

      <div className="space-y-8 lg:space-y-10">
        <div className="space-y-3">
          <label className="text-xs font-mono text-ink-dim/60 uppercase tracking-widest">What Actually Happened?</label>
          <textarea
            placeholder="Describe the actual outcome with specificity..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 lg:p-8 min-h-[140px] lg:min-h-[160px] outline-none focus:border-accent/40 text-ink/80 leading-relaxed text-sm"
            value={actualOutcome}
            onChange={(e) => setActualOutcome(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono text-ink-dim/60 uppercase tracking-widest">Was Your Prediction Correct?</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { val: 'yes', label: 'Correct', color: 'border-emerald-500/30 text-emerald-400' },
              { val: 'partial', label: 'Partially', color: 'border-accent/30 text-accent' },
              { val: 'no', label: 'Wrong', color: 'border-red-500/30 text-red-400' }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setOutcomeMatch(opt.val as any)}
                className={`py-4 sm:py-5 lg:py-6 rounded-xl border text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all min-h-[52px] touch-manipulation ${
                  outcomeMatch === opt.val ? 'bg-white/5 ' + opt.color : 'bg-transparent border-white/10 text-ink-dim/40 hover:text-ink-dim/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          <div className="space-y-3">
            <label className="text-xs font-mono text-ink-dim/60 uppercase tracking-widest">What You Got Right</label>
            <textarea
              placeholder="Where was your thinking sharp?"
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 lg:p-6 min-h-[120px] lg:min-h-[140px] outline-none focus:border-emerald-500/40 text-ink/80 text-sm"
              value={gotRight}
              onChange={(e) => setGotRight(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-mono text-ink-dim/60 uppercase tracking-widest">What You Missed</label>
            <textarea
              placeholder="Where did your model break down?"
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 lg:p-6 min-h-[120px] lg:min-h-[140px] outline-none focus:border-red-500/40 text-ink/80 text-sm"
              value={missed}
              onChange={(e) => setMissed(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-ink-dim/60 uppercase tracking-widest">Updated Confidence</label>
              <p className="text-xs text-ink-faint/40 italic">How certain are you now, knowing what you know?</p>
            </div>
            <span className="text-2xl lg:text-3xl font-display text-accent">{updatedConfidence}%</span>
          </div>
          <input
            type="range" min="0" max="100" value={updatedConfidence}
            onChange={(e) => setUpdatedConfidence(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full accent-accent"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !actualOutcome.trim() || !outcomeMatch}
          className="w-full py-5 lg:py-6 bg-accent text-void rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl hover:bg-[#7a96ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isSubmitting ? 'Saving Review...' : 'Complete Review'}
        </button>
      </div>
    </motion.div>
  );
}

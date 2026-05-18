import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button, Card, Badge } from '@/components/ui';
import { Check, X, ShieldAlert, Sparkles, ArrowRight, Quote, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReviewMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [whatHappened, setWhatHappened] = useState('');
  const [outcome, setOutcome] = useState<string | null>(null);
  const [whatRight, setWhatRight] = useState('');
  const [whatWrong, setWhatWrong] = useState('');
  const [updatedConfidence, setUpdatedConfidence] = useState(50);

  useEffect(() => {
    async function fetchDecision() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('decisions')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data) {
          if (data.user_id !== user?.id) {
            navigate('/dashboard');
            return;
          }
          setDecision({
            id: data.id,
            ...data,
            userId: data.user_id,
            createdAt: data.created_at,
            reviewDueAt: data.review_due_at,
            predictedOutcome: data.predicted_outcome,
            createdAtDate: new Date(data.created_at)
          });
        }
      } catch (err) {
        console.error('Error fetching decision for review:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchDecision();
  }, [id, user, navigate]);

  const handleComplete = async () => {
    if (!user || !id || !outcome) return;
    setIsSaving(true);
    try {
      // Save Review
      await supabase.from('reviews').insert({
        decision_id: id,
        user_id: user.id,
        what_happened: whatHappened,
        outcome_match: outcome,
        what_right: whatRight,
        what_wrong: whatWrong,
        updated_confidence: updatedConfidence,
        completed_at: new Date().toISOString()
      });

      // Update Decision status
      await supabase.from('decisions').update({ status: 'Reviewed' }).eq('id', id);

      setIsCompleted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Failed to save review:', err);
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold-accent" />
        <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Recalling Past Thoughts...</p>
      </div>
    );
  }

  if (!decision) return <div>Not found.</div>;

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-[100] bg-luxury-bg flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="relative">
            <motion.div 
               animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-24 h-24 bg-gold-accent rounded-full mx-auto flex items-center justify-center gold-glow"
            >
              <Sparkles className="w-10 h-10 text-luxury-bg" />
            </motion.div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold-accent/20 blur-[100px] rounded-full -z-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-medium">Review Complete</h1>
            <p className="text-xl text-white/60 font-sans">Your thinking is getting sharper. Face reality. Refine the process.</p>
          </div>
          <div className="text-[10px] font-mono tracking-[0.5em] text-white/30 uppercase pt-12">
            Redirecting to your vault...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-mono uppercase tracking-[0.4em] text-gold-accent">Face the Truth</span>
        <h1 className="text-4xl md:text-5xl font-display font-bold">Time to face it.</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Past Entry */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-white/40 mb-4">
             <Quote className="w-4 h-4" />
             <span className="text-xs font-mono uppercase tracking-widest">This is what you thought then</span>
          </div>
          
          <Card className="bg-white/[0.02] border-white/5 opacity-60">
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-display font-medium mb-4">{decision.title}</h2>
                <div className="flex gap-4">
                   <Badge variant="gold">Logged {decision.createdAtDate.toLocaleDateString()}</Badge>
                   <Badge>{decision.confidence}% Confidence</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase text-white/30 tracking-widest">Original Reasoning</label>
                <p className="text-sm leading-relaxed text-white/60 italic">"{decision.reasoning || 'No reasoning'}"</p>
              </div>

              <div className="space-y-4 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                <label className="text-[10px] font-mono uppercase text-gold-accent/40 tracking-widest">Predicted Outcome</label>
                <p className="text-lg leading-relaxed font-display font-medium">"{decision.predictedOutcome || 'No prediction'}"</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Review Form */}
        <div className="space-y-10">
          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">What actually happened?</h3>
              <p className="text-xs text-white/30">Free form. Be brutally honest with the version of yourself from the past.</p>
            </div>
            <textarea 
              placeholder="Record the reality of the situation. Don't smooth over the edges..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-6 min-h-[120px] outline-none focus:border-gold-accent transition-colors"
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
            />
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Was your prediction correct?</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'yes', label: 'Yes', icon: Check, color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10 hover:border-emerald-500/30' },
                { id: 'partial', label: 'Partially', icon: Sparkles, color: 'text-gold-accent', bg: 'hover:bg-gold-accent/10 hover:border-gold-accent/30' },
                { id: 'no', label: 'No', icon: X, color: 'text-red-400', bg: 'hover:bg-red-500/10 hover:border-red-500/30' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setOutcome(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all duration-500",
                    outcome === item.id 
                      ? "bg-white/10 border-white/30 scale-105 gold-glow" 
                      : `bg-white/[0.02] border-white/5 text-white/30 ${item.bg}`
                  )}
                >
                  <item.icon className={cn("w-8 h-8", outcome === item.id ? item.color : "opacity-20")} />
                  <span className="text-xs font-mono uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <label className="text-[10px] font-mono uppercase text-white/30 tracking-[0.2em]">What did you get right?</label>
              <textarea 
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 text-xs min-h-[80px]" 
                value={whatRight}
                onChange={(e) => setWhatRight(e.target.value)}
              />
            </section>
            <section className="space-y-4">
              <label className="text-[10px] font-mono uppercase text-white/30 tracking-[0.2em]">What did you miss?</label>
              <textarea 
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 text-xs min-h-[80px]" 
                value={whatWrong}
                onChange={(e) => setWhatWrong(e.target.value)}
              />
            </section>
          </div>

          <section className="space-y-6 pt-6">
            <div className="flex justify-between items-end">
               <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Process Confidence</h3>
               <span className="text-2xl font-display font-medium text-gold-accent">{updatedConfidence}%</span>
            </div>
             <input 
              type="range" min="0" max="100"
              value={updatedConfidence}
              onChange={(e) => setUpdatedConfidence(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-accent" 
             />
          </section>

          <button 
            disabled={isSaving || !outcome || !whatHappened.trim()}
            onClick={handleComplete}
            className="w-full py-10 bg-luxury-surface border border-gold-accent/20 rounded-3xl flex flex-col items-center gap-4 gold-glow hover:bg-gold-accent hover:text-luxury-bg transition-all group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gold-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 -z-10" />
            {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldAlert className="w-8 h-8" />}
            <div className="text-center">
              <h4 className="text-xl font-display font-medium">{isSaving ? 'Locking in Review...' : 'Complete This Review'}</h4>
              <p className="text-[10px] font-mono tracking-widest opacity-60">Locked in history.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

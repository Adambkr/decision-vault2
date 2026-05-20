import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Card, Badge, Button, Input } from '@/components/ui';
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Share2,
  Edit3,
  Archive,
  AlertCircle,
  FileText,
  Target,
  List,
  Lock,
  Loader2,
  ArrowUpRight,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContext, setEditContext] = useState('');
  const [editReasoning, setEditReasoning] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
            ...data,
            userId: data.user_id,
            createdAt: data.created_at,
            reviewDueAt: data.review_due_at,
            predictedOutcome: data.predicted_outcome,
            createdAtDate: new Date(data.created_at)
          });
        }
      } catch (err) {
        console.error('Error fetching decision:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchDecision();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-white/10 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm font-mono text-ink-dim/75 uppercase tracking-widest">Opening Vault...</p>
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

  const dueDate = new Date(decision.reviewDueAt);
  const isReviewable = new Date() >= dueDate;
  const formattedDueDate = dueDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this decision? It will be hidden from your active list.')) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('decisions')
      .update({ status: 'Archived' })
      .eq('id', decision.id)
      .eq('user_id', user?.id);
    setActionLoading(false);
    if (error) {
      toast.error('Failed to archive: ' + error.message);
    } else {
      toast.success('Decision archived');
      navigate('/decisions');
    }
  };

  const startEditing = () => {
    setEditTitle(decision.title || '');
    setEditContext(decision.context || '');
    setEditReasoning(decision.reasoning || '');
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const saveEdits = async () => {
    setActionLoading(true);
    const { error } = await supabase
      .from('decisions')
      .update({ title: editTitle, context: editContext, reasoning: editReasoning })
      .eq('id', decision.id)
      .eq('user_id', user?.id);
    setActionLoading(false);
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      setDecision((prev: any) => ({ ...prev, title: editTitle, context: editContext, reasoning: editReasoning }));
      setIsEditing(false);
      toast.success('Changes saved');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-10 lg:space-y-12"
    >
      {/* Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface/50 p-3 lg:p-4 rounded-2xl border border-white/5 sticky top-20 z-10 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-dim/75 hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-widest">Dashboard</span>
        </button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleShare} disabled={copied}>
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
          </Button>
          {!isEditing ? (
            <Button variant="secondary" size="sm" onClick={startEditing}><Edit3 className="w-4 h-4" /> Edit</Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={saveEdits} disabled={actionLoading}><Check className="w-4 h-4" /> Save</Button>
              <Button variant="ghost" size="sm" onClick={cancelEditing}><X className="w-4 h-4" /> Cancel</Button>
            </>
          )}
          <Button variant="destructive" size="sm" onClick={handleArchive} disabled={actionLoading}><Archive className="w-4 h-4" /> Archive</Button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="accent">{decision.categories?.[0] || 'Uncategorized'}</Badge>
          <Badge>{decision.status}</Badge>
          <div className="flex items-center gap-1 text-xs text-ink-dim/75 font-mono">
            <Calendar className="w-3 h-3" /> {decision.createdAtDate.toLocaleDateString()}
          </div>
        </div>
        {isEditing ? (
          <Input value={editTitle} onChange={(e: any) => setEditTitle(e.target.value)} className="text-2xl lg:text-3xl font-display bg-transparent border-white/10" />
        ) : (
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium leading-tight">{decision.title}</h1>
        )}

        <div className="flex flex-wrap items-center gap-6 lg:gap-10 pt-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-ink-faint/70 uppercase tracking-[0.2em]">Confidence</span>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 lg:w-14 lg:h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6b8afe" strokeWidth="3"
                    strokeDasharray={`${decision.confidence * 0.975} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-display font-bold text-accent">
                  {decision.confidence}%
                </div>
              </div>
              <span className="text-sm text-ink-dim/70 font-medium">Certainty</span>
            </div>
          </div>
          <div className="h-10 lg:h-12 w-px bg-white/5" />
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-ink-faint/70 uppercase tracking-[0.2em]">Review Date</span>
            <div className="flex items-center gap-2 text-accent">
              <Clock className="w-4 h-4" />
              <span className="text-base lg:text-lg font-bold">{formattedDueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-10 lg:gap-12 pt-4">
        {decision.context && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-accent/40" />
              <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Context & Landscape</h3>
            </div>
            {isEditing ? (
              <textarea value={editContext} onChange={(e) => setEditContext(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-ink/70 leading-relaxed font-sans text-sm" rows={4} />
            ) : (
              <p className="text-base lg:text-lg text-ink/70 leading-relaxed font-sans">{decision.context}</p>
            )}
          </section>
        )}

        {decision.options && decision.options.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <List className="w-5 h-5 text-accent/40" />
              <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Options Logic</h3>
            </div>
            <div className="grid gap-3">
              {decision.options.map((opt: any, i: number) => (
                <Card key={i} className="bg-white/[0.02] p-5">
                  <h4 className="font-bold mb-3">{opt.title || `Option ${i + 1}`}</h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono uppercase">
                    {opt.pro && <div className="text-emerald-400/70 bg-emerald-500/[0.03] rounded-lg p-3">✓ {opt.pro}</div>}
                    {opt.con && <div className="text-red-400/70 bg-red-500/[0.03] rounded-lg p-3">✗ {opt.con}</div>}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-accent/40" />
              <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Reasoning</h3>
            </div>
            <div className="bg-white/[0.02] p-6 lg:p-8 rounded-2xl border border-white/5 italic text-ink/80 leading-relaxed font-sans text-sm lg:text-base">
              {isEditing ? (
                <textarea value={editReasoning} onChange={(e) => setEditReasoning(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-ink/80 leading-relaxed font-sans italic text-sm" rows={4} />
              ) : (
                <span className="italic">&ldquo;{decision.reasoning || 'No reasoning documented.'}&rdquo;</span>
              )}
            </div>
          </section>
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-accent/40" />
              <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Assumptions</h3>
            </div>
            <div className="space-y-2.5">
              {decision.assumptions && decision.assumptions.length > 0 ? decision.assumptions.map((a: string, i: number) => (
                <div key={i} className="flex gap-3 items-start text-sm text-ink-dim/70 bg-white/[0.01] rounded-xl p-3">
                  <span className="text-accent font-bold font-mono text-xs shrink-0">0{i + 1}</span>
                  {a}
                </div>
              )) : <p className="text-sm text-ink-faint/60 italic">No assumptions recorded.</p>}
            </div>
          </section>
        </div>

        <section className="bg-accent/[0.02] border border-accent/20 rounded-2xl lg:rounded-3xl p-8 lg:p-12 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-5">
            <Target className="w-16 h-16 lg:w-24 lg:h-24" />
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-accent/60">Prediction Locked</h3>
            <p className="text-xl lg:text-3xl font-display leading-tight italic">&ldquo;{decision.predictedOutcome || 'No specific outcome predicted.'}&rdquo;</p>
          </div>
        </section>

        {/* Outcome Review Section */}
        {isReviewable ? (
          <section className="bg-accent accent-glow rounded-2xl lg:rounded-3xl p-8 lg:p-12 flex flex-col items-center text-center gap-6 text-void">
            <div className="p-3 lg:p-4 bg-void/10 rounded-full">
              <CheckCircle2 className="w-8 h-8 lg:w-12 lg:h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl lg:text-3xl font-display font-bold">Review Window is Open</h3>
              <p className="text-sm opacity-80 max-w-md mx-auto">It's time to face reality. Compare what happened to what you predicted and update your mental models.</p>
            </div>
            <Link to={`/review/${decision.id}`}>
              <Button variant="luxury" size="lg" className="px-8 lg:px-12 py-6 lg:py-8 text-lg">
                Face Reality <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            </Link>
          </section>
        ) : (
          <section className="relative group">
            <div className="absolute inset-0 bg-void/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl lg:rounded-3xl border border-white/5 transition-opacity">
              <div className="text-center space-y-3">
                <Lock className="w-6 h-6 lg:w-8 lg:h-8 text-ink-faint/60 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-lg lg:text-xl font-display">Facing Reality</h4>
                  <p className="text-[10px] font-mono text-ink-faint/70 uppercase tracking-[0.4em]">Unlocks on {formattedDueDate}</p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 border border-white/5 rounded-2xl lg:rounded-3xl opacity-20">
              <h3 className="text-sm font-mono uppercase tracking-[0.2em] mb-6">Outcome Review</h3>
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
                <div className="h-4 w-2/3 bg-white/5 rounded" />
              </div>
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

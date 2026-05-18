import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
        <Loader2 className="w-10 h-10 animate-spin text-gold-accent" />
        <p className="text-sm font-mono text-white/40 uppercase tracking-widest">Opening Vault...</p>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-white/10 mx-auto" />
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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
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
      alert('Failed to archive: ' + error.message);
    } else {
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
      alert('Failed to save: ' + error.message);
    } else {
      setDecision((prev: any) => ({ ...prev, title: editTitle, context: editContext, reasoning: editReasoning }));
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
       {/* Actions Header */}
       <div className="flex justify-between items-center bg-luxury-surface/50 p-4 rounded-2xl border border-white/5 sticky top-24 z-10 backdrop-blur-md">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">Dashboard</span>
          </button>
          <div className="flex gap-3">
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
       <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
             <Badge variant="gold">{decision.categories?.[0] || 'Uncategorized'}</Badge>
             <Badge>{decision.status}</Badge>
             <div className="flex items-center gap-1 text-xs text-white/40 font-mono">
                <Calendar className="w-3 h-3" /> {decision.createdAtDate.toLocaleDateString()}
             </div>
          </div>
          {isEditing ? (
            <Input value={editTitle} onChange={(e: any) => setEditTitle(e.target.value)} className="text-3xl font-display bg-transparent border-white/10" />
          ) : (
            <h1 className="text-5xl md:text-6xl font-display font-medium leading-tight">{decision.title}</h1>
          )}
          
          <div className="flex items-center gap-12 pt-4">
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Confidence</span>
                <div className="flex items-center gap-4">
                   <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                      <div className="absolute inset-0 border-4 border-gold-accent rounded-full" style={{ clipPath: 'inset(0 0 0 0)', opacity: 0.2 }} />
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-display font-bold text-gold-accent">
                        {decision.confidence}%
                      </div>
                   </div>
                   <span className="text-sm font-medium">Certainty in process</span>
                </div>
             </div>
             <div className="h-12 w-px bg-white/5" />
             <div className="flex flex-col gap-2 text-gold-accent">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Review Date</span>
                <div className="flex items-center gap-2">
                   <Clock className="w-5 h-5" />
                   <span className="text-lg font-bold">{formattedDueDate}</span>
                </div>
             </div>
          </div>
       </div>

       {/* Content Grid */}
       <div className="grid gap-12 pt-8">
          {decision.context && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gold-accent/40" />
                  <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Context & Landscape</h3>
              </div>
              {isEditing ? (
                <textarea value={editContext} onChange={(e) => setEditContext(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white/70 leading-relaxed font-sans" rows={4} />
              ) : (
                <p className="text-lg text-white/70 leading-relaxed font-sans">{decision.context}</p>
              )}
            </section>
          )}

          {decision.options && decision.options.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <List className="w-5 h-5 text-gold-accent/40" />
                <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Options Logic</h3>
              </div>
              <div className="grid gap-4">
                {decision.options.map((opt: any, i: number) => (
                  <Card key={i} className="bg-white/[0.02]">
                      <h4 className="font-bold mb-4">{opt.title}</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-xs font-mono uppercase">
                        <div className="text-emerald-400 opacity-60">✓ {opt.pro}</div>
                        <div className="text-red-400 opacity-60">✗ {opt.con}</div>
                      </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <div className="grid md:grid-cols-2 gap-12">
             <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <Target className="w-5 h-5 text-gold-accent/40" />
                   <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Reasoning</h3>
                </div>
                <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 italic text-white/80 leading-relaxed font-sans">
                   {isEditing ? (
                     <textarea value={editReasoning} onChange={(e) => setEditReasoning(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white/80 leading-relaxed font-sans italic" rows={4} />
                   ) : (
                     <span className="italic">"{decision.reasoning || 'No reasoning documented.'}"</span>
                   )}
                </div>
             </section>
             <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 text-gold-accent/40" />
                   <h3 className="text-sm font-mono uppercase tracking-[0.2em]">Assumptions</h3>
                </div>
                <div className="space-y-3">
                   {decision.assumptions && decision.assumptions.length > 0 ? decision.assumptions.map((a: string, i: number) => (
                     <div key={i} className="flex gap-4 items-start text-sm text-white/50">
                        <span className="text-gold-accent font-bold font-mono">0{i+1}</span>
                        {a}
                     </div>
                   )) : <p className="text-sm text-white/20 italic">No assumptions recorded.</p>}
                </div>
             </section>
          </div>

          <section className="bg-gold-accent/[0.02] border border-gold-accent/20 rounded-3xl p-12 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target className="w-24 h-24" />
             </div>
             <div className="relative z-10 flex flex-col gap-4">
                <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-gold-accent/60">Prediction Locked</h3>
                <p className="text-3xl font-display leading-tight italic">"{decision.predictedOutcome || 'No specific outcome predicted.'}"</p>
             </div>
          </section>

          {/* Outcome Review Section */}
          {isReviewable ? (
            <section className="bg-gold-accent gold-glow rounded-3xl p-12 flex flex-col items-center text-center gap-8 text-luxury-bg">
               <div className="p-4 bg-luxury-bg/10 rounded-full">
                  <CheckCircle2 className="w-12 h-12" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-3xl font-display font-bold">Review Window is Open</h3>
                  <p className="text-sm opacity-80 max-w-md mx-auto">It's time to face reality. Compare what happened to what you predicted and update your mental models.</p>
               </div>
               <Link to={`/review/${decision.id}`}>
                 <Button variant="luxury" size="lg" className="px-12 py-8 text-xl">
                    Face Reality <ArrowUpRight className="w-6 h-6" />
                 </Button>
               </Link>
            </section>
          ) : (
            <section className="relative group">
              <div className="absolute inset-0 bg-luxury-bg/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl border border-white/5 transition-opacity">
                  <div className="text-center space-y-4">
                    <Lock className="w-8 h-8 text-white/20 mx-auto" />
                    <div className="space-y-1">
                        <h4 className="text-xl font-display">Facing Reality</h4>
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">Unlocks on {formattedDueDate}</p>
                    </div>
                  </div>
              </div>
              
              <div className="p-12 border border-white/5 rounded-3xl opacity-20">
                  <h3 className="text-sm font-mono uppercase tracking-[0.2em] mb-6">Outcome Review</h3>
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                    <div className="h-4 w-2/3 bg-white/5 rounded" />
                  </div>
              </div>
            </section>
          )}
       </div>
    </div>
  );
}

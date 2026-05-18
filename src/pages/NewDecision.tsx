import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { 
  ArrowLeft, 
  Lock, 
  Trash2, 
  Plus, 
  Search, 
  Cpu, 
  TrendingUp, 
  UserPlus, 
  Briefcase,
  Zap,
  Loader2,
  X,
  PlusCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NewDecision() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [predictedOutcome, setPredictedOutcome] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [options, setOptions] = useState([{ title: '', pro: '', con: '' }]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [currentAssumption, setCurrentAssumption] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addOption = () => setOptions([...options, { title: '', pro: '', con: '' }]);
  const updateOption = (i: number, field: string, val: string) => {
    const next = [...options];
    (next[i] as any)[field] = val;
    setOptions(next);
  };
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));

  const addAssumption = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentAssumption) {
      setAssumptions([...assumptions, currentAssumption]);
      setCurrentAssumption('');
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const getConfidenceLevel = (val: number) => {
    if (val < 25) return "Uncertain";
    if (val < 50) return "Skeptical";
    if (val < 75) return "Balanced";
    if (val < 90) return "Confident";
    return "Conviction";
  };

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setIsSaving(true);
    try {
      const cadenceDays = profile?.reviewDefaultCadence || 30;
      const reviewDueAt = new Date();
      reviewDueAt.setDate(reviewDueAt.getDate() + cadenceDays);

      await supabase.from('decisions').insert({
        user_id: user.id,
        title,
        context,
        options,
        reasoning,
        assumptions,
        predicted_outcome: predictedOutcome,
        confidence,
        categories,
        status: 'Awaiting Review',
        review_due_at: reviewDueAt.toISOString(),
        created_at: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to lock decision:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-mono uppercase tracking-widest">Discard & Return</span>
        </button>
        <Badge variant="gold">Private Draft</Badge>
      </div>

      {/* Header */}
      <div className="space-y-6">
        <textarea 
          placeholder="What are you deciding?"
          className="w-full bg-transparent text-5xl md:text-6xl font-display font-medium border-none outline-none resize-none placeholder:text-white/5 min-h-[120px] focus:ring-0 leading-tight"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="h-px w-full bg-white/5" />
      </div>

      <div className="grid gap-20">
        {/* Section: Context */}
        <section className="space-y-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Context & Background</h3>
            <p className="text-xs text-white/30 italic">What's the situation? What led to this decision point?</p>
          </div>
          <textarea 
            placeholder="Document the landscape, the pressure points, and any external constraints..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 min-h-[200px] outline-none focus:border-gold-accent/40 transition-colors text-white/80 leading-relaxed font-sans"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </section>

        {/* Section: Options */}
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Options Considered</h3>
              <p className="text-xs text-white/30 italic">Identify all paths, even the ones you plan to reject.</p>
            </div>
            <button onClick={addOption} className="text-xs font-mono uppercase tracking-widest text-white/40 hover:text-gold-accent flex items-center gap-2 transition-colors">
              <PlusCircle className="w-4 h-4" /> Add Path
            </button>
          </div>
          
          <div className="grid gap-6">
            {options.map((opt, i) => (
              <Card key={i} className="group relative">
                {options.length > 1 && (
                  <button onClick={() => removeOption(i)} className="absolute top-4 right-4 text-white/10 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="space-y-6">
                  <input 
                    placeholder={`Path ${i + 1}: e.g., Acquire competence vs Buy out`}
                    className="w-full bg-transparent text-xl font-bold border-none outline-none placeholder:text-white/10"
                    value={opt.title}
                    onChange={(e) => updateOption(i, 'title', e.target.value)}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <textarea 
                      placeholder="Pros..."
                      className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl p-4 text-sm outline-none focus:border-emerald-500/30 min-h-[80px]"
                      value={opt.pro}
                      onChange={(e) => updateOption(i, 'pro', e.target.value)}
                    />
                    <textarea 
                      placeholder="Cons..."
                      className="bg-red-500/[0.02] border border-red-500/10 rounded-xl p-4 text-sm outline-none focus:border-red-500/30 min-h-[80px]"
                      value={opt.con}
                      onChange={(e) => updateOption(i, 'con', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section: Reasoning & Predicted Outcome */}
        <div className="grid md:grid-cols-2 gap-12">
          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">My Reasoning</h3>
              <p className="text-xs text-white/30 italic">Why are you leaning toward this choice?</p>
            </div>
            <textarea 
              placeholder="State your internal logic clearly. No one else is watching."
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[150px] outline-none focus:border-gold-accent/40"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
            />
          </section>
          
          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Predicted Outcome</h3>
              <p className="text-xs text-white/30 italic">If you are right, what exactly will happen?</p>
            </div>
            <textarea 
              placeholder="Be specific. 'Revenue will grow' is lazy. 'NPS will hit 72 by August' is a prediction."
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[150px] outline-none focus:border-gold-accent/40"
              value={predictedOutcome}
              onChange={(e) => setPredictedOutcome(e.target.value)}
            />
          </section>
        </div>

        {/* Assumptions */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Key Assumptions</h3>
            <p className="text-xs text-white/30 italic">What must be true for this to succeed?</p>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            {assumptions.map((a, i) => (
              <Badge key={i} variant="gold" className="px-4 py-2 flex items-center gap-2">
                {a} 
                <button onClick={() => setAssumptions(assumptions.filter((_, idx) => idx !== i))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input 
            placeholder="Type an assumption and press Enter..." 
            value={currentAssumption}
            onChange={(e: any) => setCurrentAssumption(e.target.value)}
            onKeyDown={addAssumption}
          />
        </section>

        {/* Confidence & Category */}
        <div className="grid md:grid-cols-2 gap-12">
          <section className="space-y-8">
            <div className="flex justify-between items-end">
               <div className="flex flex-col gap-1">
                <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Confidence Level</h3>
                <p className="text-xs text-white/30 italic">Be honest with yourself.</p>
              </div>
              <span className="text-2xl font-display font-medium text-gold-accent">{confidence}%</span>
            </div>
            <div className="relative group p-4">
              <input 
                type="range" min="0" max="100" 
                value={confidence} 
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold-accent"
              />
              <div className="flex justify-between mt-4 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
                {['Uncertain', 'Skeptical', 'Balanced', 'Confident', 'Conviction'].map((lvl) => (
                  <span key={lvl} className={cn(getConfidenceLevel(confidence) === lvl && "text-gold-accent font-bold")}>{lvl}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
             <div className="flex flex-col gap-1">
              <h3 className="text-sm font-mono uppercase tracking-widest text-gold-accent">Category</h3>
              <p className="text-xs text-white/30 italic">Group your thinking.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Business', 'Hiring', 'Investment', 'Product', 'Personal', 'Other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-xs font-bold transition-all",
                    categories.includes(cat) ? "bg-gold-accent text-luxury-bg border-gold-accent" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Final Action */}
        <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-6">
           <button 
            disabled={isSaving || !title.trim()}
            onClick={handleSave}
            className="group relative w-full flex flex-col items-center gap-8 py-12 bg-gold-accent/[0.02] border border-gold-accent/20 rounded-3xl overflow-hidden hover:bg-gold-accent hover:text-luxury-bg transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              <div className="absolute inset-0 bg-gold-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                 <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
                    {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <Lock className="w-8 h-8" />}
                 </div>
                 <div className="text-center">
                    <h4 className="text-2xl font-display font-medium">{isSaving ? 'Locking in...' : 'Lock This Decision'}</h4>
                    <p className="text-xs font-mono uppercase tracking-widest opacity-60">Locked entries cannot be edited once committed.</p>
                 </div>
              </div>
           </button>
        </div>
      </div>
    </div>
  );
}

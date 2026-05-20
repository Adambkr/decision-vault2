import { useState, useMemo, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { Button, Input, Badge, GlassPanel } from '@/components/ui';
import {
  ArrowLeft,
  Lock,
  Trash2,
  PlusCircle,
  Loader2,
  X,
  Eye,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { reveal, fadeUp, staggerContainer } from '@/lib/motion';

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
  const updateOption = (i: number, field: 'title' | 'pro' | 'con', val: string) => {
    const next = [...options];
    next[i][field] = val;
    setOptions(next);
  };
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));

  const addAssumption = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && currentAssumption.trim()) {
      e.preventDefault();
      setAssumptions([...assumptions, currentAssumption.trim()]);
      setCurrentAssumption('');
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const getConfidenceLevel = (val: number) => {
    if (val < 25) return 'Uncertain';
    if (val < 50) return 'Skeptical';
    if (val < 75) return 'Balanced';
    if (val < 90) return 'Confident';
    return 'Conviction';
  };

  // Cinematic stepper — 5 movements through a decision
  const STEPS = [
    { id: 1, kicker: 'Movement One', label: 'Frame' },
    { id: 2, kicker: 'Movement Two', label: 'Paths' },
    { id: 3, kicker: 'Movement Three', label: 'Reasoning' },
    { id: 4, kicker: 'Movement Four', label: 'Conviction' },
    { id: 5, kicker: 'Movement Five', label: 'Seal' },
  ] as const;

  const [step, setStep] = useState(1);
  const progress = (step / STEPS.length) * 100;
  const canAdvance = useMemo(() => {
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return options.some((o) => o.title.trim());
    if (step === 3) return reasoning.trim().length > 0 || predictedOutcome.trim().length > 0;
    return true;
  }, [step, title, options, reasoning, predictedOutcome]);

  const handleSave = async () => {
    if (!user || !title.trim()) {
      toast.error('Please enter a decision title');
      return;
    }
    setIsSaving(true);
    try {
      const cadenceDays = profile?.review_default_cadence || 30;
      const reviewDueAt = new Date();
      reviewDueAt.setDate(reviewDueAt.getDate() + cadenceDays);

      const { error } = await supabase.from('decisions').insert({
        user_id: user.id,
        title: title.trim(),
        context,
        options: options.filter(o => o.title.trim()),
        reasoning,
        assumptions,
        predicted_outcome: predictedOutcome,
        confidence,
        categories,
        status: 'Awaiting Review',
        review_due_at: reviewDueAt.toISOString(),
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#6b8afe', '#a78bfa', '#c8cdd4', '#0f141c'],
      });

      toast.success('Decision locked in the vault');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: any) {
      console.error('Failed to lock decision:', err);
      toast.error(err.message || 'Failed to save decision');
      setIsSaving(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const confidenceLevel = getConfidenceLevel(confidence);

  return (
    <div className="max-w-6xl mx-auto pb-32 pt-6">
      {/* Top navigation strip */}
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-ink-dim/65 hover:text-ink transition-colors duration-400 group"
        >
          <ArrowLeft
            className="w-4 h-4 transition-transform duration-400 group-hover:-translate-x-0.5"
            strokeWidth={1.8}
          />
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] hidden sm:inline">
            Discard &amp; Return
          </span>
        </button>
        <Badge variant="accent" dot>
          Private Draft
        </Badge>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-12 lg:gap-16">
        {/* Step rail */}
        <StepRail steps={STEPS as any} current={step} onJump={setStep} progress={progress} />

        {/* Stage */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="step1"
                variants={staggerContainer(0.07)}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.35 } }}
                className="space-y-10"
              >
                <motion.div variants={reveal}>
                  <span className="kicker-accent mb-4 block">Movement One &middot; Frame</span>
                  <h1 className="text-display text-display-balanced text-3xl sm:text-5xl lg:text-[64px] font-semibold leading-[1.04] mb-5">
                    What are you <span className="font-editorial text-accent/95">deciding</span>?
                  </h1>
                  <p className="text-ink-dim/80 text-[15px] font-light leading-relaxed max-w-xl">
                    Give it a name. A single sentence that future-you will recognize when the vault returns it.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <textarea
                    placeholder="e.g., Should we acquire the team behind the Series A startup we&rsquo;ve been tracking?"
                    className="w-full bg-transparent text-2xl sm:text-3xl lg:text-[40px] font-display font-medium border-none outline-none resize-none placeholder:text-ink-faint/25 min-h-[120px] focus:ring-0 leading-[1.18] tracking-tight"
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div className="h-px w-full bg-gradient-to-r from-accent/30 via-white/[0.06] to-transparent" />
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-3">
                  <span className="kicker text-ink-dim/75">Context &amp; Background</span>
                  <textarea
                    placeholder="The landscape. The pressure points. What forced this decision into the open."
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 lg:p-6 min-h-[160px] outline-none focus:border-accent/40 focus:bg-white/[0.03] transition-colors duration-400 text-ink/85 leading-relaxed text-[15px] font-light placeholder:text-ink-faint/45"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </motion.div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="step2"
                variants={staggerContainer(0.06)}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.35 } }}
                className="space-y-8"
              >
                <motion.div variants={reveal}>
                  <span className="kicker-accent mb-4 block">Movement Two &middot; Paths</span>
                  <h2 className="text-display text-display-balanced text-2xl sm:text-4xl lg:text-[52px] font-semibold leading-[1.04] mb-4">
                    The <span className="font-editorial text-accent/95">paths</span> in front of you.
                  </h2>
                  <p className="text-ink-dim/80 text-[15px] font-light leading-relaxed max-w-xl">
                    Even the paths you reject deserve names. Naming what you don&rsquo;t choose sharpens what you do.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="flex justify-end">
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-dim/75 hover:text-accent flex items-center gap-2 transition-colors duration-400"
                  >
                    <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.8} /> Add path
                  </button>
                </motion.div>

                <motion.div variants={fadeUp} className="grid gap-4">
                  {options.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <GlassPanel elevation="card" padding="md" edgeLight className="group relative">
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            aria-label={`Remove option ${i + 1}`}
                            className="absolute top-4 right-4 text-ink-faint/40 hover:text-rose transition-colors duration-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                          </button>
                        )}
                        <div className="space-y-5">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-accent/75 tabular-nums">
                              Path {String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <input
                            placeholder={`e.g., ${i === 0 ? 'Acquire the team' : 'Build internally'}`}
                            className="w-full bg-transparent text-lg sm:text-xl font-display font-semibold border-none outline-none placeholder:text-ink-faint/35 tracking-tight pr-8"
                            value={opt.title}
                            onChange={(e) => updateOption(i, 'title', e.target.value)}
                          />
                          <div className="grid sm:grid-cols-2 gap-3">
                            <textarea
                              placeholder="What works in favor of this path..."
                              className="bg-emerald/[0.025] border border-emerald/[0.14] rounded-xl p-4 text-sm outline-none focus:border-emerald/35 focus:bg-emerald/[0.045] transition-colors duration-400 min-h-[88px] text-ink/80 leading-relaxed placeholder:text-emerald/35"
                              value={opt.pro}
                              onChange={(e) => updateOption(i, 'pro', e.target.value)}
                            />
                            <textarea
                              placeholder="What works against..."
                              className="bg-rose/[0.025] border border-rose/[0.14] rounded-xl p-4 text-sm outline-none focus:border-rose/35 focus:bg-rose/[0.045] transition-colors duration-400 min-h-[88px] text-ink/80 leading-relaxed placeholder:text-rose/35"
                              value={opt.con}
                              onChange={(e) => updateOption(i, 'con', e.target.value)}
                            />
                          </div>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="step3"
                variants={staggerContainer(0.07)}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.35 } }}
                className="space-y-8"
              >
                <motion.div variants={reveal}>
                  <span className="kicker-accent mb-4 block">Movement Three &middot; Reasoning</span>
                  <h2 className="text-display text-display-balanced text-2xl sm:text-4xl lg:text-[52px] font-semibold leading-[1.04] mb-4">
                    State your <span className="font-editorial text-accent/95">logic</span>, plainly.
                  </h2>
                  <p className="text-ink-dim/80 text-[15px] font-light leading-relaxed max-w-xl">
                    No one is watching. Write the truth your future self will need to see.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <span className="kicker text-ink-dim/75">My Reasoning</span>
                    <p className="text-[11px] text-ink-faint/65 italic font-light">
                      Why are you leaning toward this choice?
                    </p>
                    <textarea
                      placeholder="The internal logic. The pressure points. The bet you&rsquo;re making."
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 min-h-[180px] outline-none focus:border-accent/40 focus:bg-white/[0.03] transition-colors duration-400 text-ink/85 text-[14px] font-light leading-relaxed placeholder:text-ink-faint/45"
                      value={reasoning}
                      onChange={(e) => setReasoning(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="kicker text-ink-dim/75">Predicted Outcome</span>
                    <p className="text-[11px] text-ink-faint/65 italic font-light">
                      If you are right, what exactly will happen?
                    </p>
                    <textarea
                      placeholder='&ldquo;Revenue will grow&rdquo; is lazy. &ldquo;NPS will hit 72 by August&rdquo; is a prediction.'
                      className="w-full bg-white/[0.02] border border-accent/[0.10] rounded-2xl p-5 min-h-[180px] outline-none focus:border-accent/45 focus:bg-accent/[0.025] transition-colors duration-400 text-ink/85 text-[14px] font-light leading-relaxed placeholder:text-ink-faint/45"
                      value={predictedOutcome}
                      onChange={(e) => setPredictedOutcome(e.target.value)}
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-3">
                  <span className="kicker text-ink-dim/75">Key Assumptions</span>
                  <p className="text-[11px] text-ink-faint/65 italic font-light">
                    What must be true for this to succeed? Type one and press Enter.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {assumptions.map((a, i) => (
                        <motion.span
                          key={`${a}-${i}`}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Badge variant="accent" className="px-3 py-1.5 flex items-center gap-2">
                            {a}
                            <button
                              type="button"
                              onClick={() =>
                                setAssumptions(assumptions.filter((_, idx) => idx !== i))
                              }
                              aria-label={`Remove assumption: ${a}`}
                              className="hover:text-rose transition-colors"
                            >
                              <X className="w-3 h-3" strokeWidth={2} />
                            </button>
                          </Badge>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <Input
                    placeholder="Type an assumption and press Enter..."
                    value={currentAssumption}
                    onChange={(e: any) => setCurrentAssumption(e.target.value)}
                    onKeyDown={addAssumption}
                  />
                </motion.div>
              </motion.section>
            )}

            {step === 4 && (
              <motion.section
                key="step4"
                variants={staggerContainer(0.07)}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.35 } }}
                className="space-y-10"
              >
                <motion.div variants={reveal}>
                  <span className="kicker-accent mb-4 block">Movement Four &middot; Conviction</span>
                  <h2 className="text-display text-display-balanced text-2xl sm:text-4xl lg:text-[52px] font-semibold leading-[1.04] mb-4">
                    How <span className="font-editorial text-accent/95">certain</span> are you, really?
                  </h2>
                  <p className="text-ink-dim/80 text-[15px] font-light leading-relaxed max-w-xl">
                    Be honest. The point of the vault is to discover the gap between certainty and reality.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <ConfidenceDial value={confidence} onChange={setConfidence} level={confidenceLevel} />
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-3">
                  <span className="kicker text-ink-dim/75">Category</span>
                  <div className="flex flex-wrap gap-2">
                    {['Business', 'Hiring', 'Investment', 'Product', 'Personal', 'Other'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          'h-9 px-4 rounded-full border text-xs font-medium tracking-tight transition-colors duration-400',
                          categories.includes(cat)
                            ? 'bg-accent/[0.10] border-accent/55 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_12px_rgba(107,138,254,0.10)]'
                            : 'bg-white/[0.018] border-white/[0.08] text-ink-dim/75 hover:border-white/[0.16] hover:text-ink/90'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.section>
            )}

            {step === 5 && (
              <motion.section
                key="step5"
                variants={staggerContainer(0.08)}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.35 } }}
                className="space-y-10"
              >
                <motion.div variants={reveal}>
                  <span className="kicker-accent mb-4 block">Movement Five &middot; Seal</span>
                  <h2 className="text-display text-display-balanced text-2xl sm:text-4xl lg:text-[52px] font-semibold leading-[1.04] mb-4">
                    A sealed <span className="font-editorial text-accent/95">envelope</span> to your future self.
                  </h2>
                  <p className="text-ink-dim/80 text-[15px] font-light leading-relaxed max-w-xl">
                    Once locked, the entry becomes immutable. The vault will resurface it when reality is ready to answer.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <FuturePreview
                    title={title}
                    predictedOutcome={predictedOutcome}
                    confidence={confidence}
                    confidenceLevel={confidenceLevel}
                    categories={categories}
                    optionsCount={options.filter((o) => o.title.trim()).length}
                    assumptionsCount={assumptions.length}
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <LockAction isSaving={isSaving} onSave={handleSave} disabled={!title.trim()} />
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Footer nav controls (not on final lock step) */}
          {step < STEPS.length && (
            <div className="mt-14 pt-6 border-t border-white/[0.045] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={prevStep}
                disabled={step === 1}
                className={cn(step === 1 && 'invisible sm:invisible')}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={nextStep} size="md" disabled={!canAdvance}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── Bespoke subcomponents ───────── */

function StepRail({
  steps,
  current,
  onJump,
  progress,
}: {
  steps: readonly { id: number; kicker: string; label: string }[];
  current: number;
  onJump: (n: number) => void;
  progress: number;
}) {
  return (
    <aside className="hidden lg:block sticky top-24 self-start h-fit">
      <div className="relative">
        {/* Vertical track */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" aria-hidden />
        <motion.div
          className="absolute left-[7px] top-2 w-px bg-gradient-to-b from-accent via-accent/80 to-accent/30 shadow-[0_0_8px_rgba(107,138,254,0.4)]"
          initial={false}
          animate={{ height: `calc(${progress}% - 4px)` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
        />

        <div className="space-y-7">
          {steps.map((s) => {
            const active = s.id === current;
            const done = s.id < current;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onJump(s.id)}
                className="flex items-start gap-4 text-left group w-full"
              >
                <div
                  className={cn(
                    'relative w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-400',
                    active &&
                      'border-accent bg-accent/[0.12] shadow-[0_0_12px_rgba(107,138,254,0.4)]',
                    done && 'border-accent/55 bg-accent text-void',
                    !active && !done && 'border-white/[0.10] bg-void'
                  )}
                >
                  {done && <Check className="w-2.5 h-2.5" strokeWidth={2.5} />}
                  {active && (
                    <motion.span
                      layoutId="step-rail-pulse"
                      className="absolute inset-0 rounded-full bg-accent/20 animate-ping"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <span
                    className={cn(
                      'block text-[9px] font-medium uppercase tracking-[0.24em] transition-colors duration-400 mb-0.5',
                      active ? 'text-accent/90' : 'text-ink-faint/55'
                    )}
                  >
                    {s.kicker}
                  </span>
                  <span
                    className={cn(
                      'block text-sm font-semibold tracking-tight transition-colors duration-400',
                      active && 'text-ink',
                      done && 'text-ink-dim/70',
                      !active && !done && 'text-ink-dim/55 group-hover:text-ink-dim/85'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function ConfidenceDial({
  value,
  onChange,
  level,
}: {
  value: number;
  onChange: (n: number) => void;
  level: string;
}) {
  const LEVELS = ['Uncertain', 'Skeptical', 'Balanced', 'Confident', 'Conviction'];
  return (
    <GlassPanel elevation="raised" padding="lg" edgeLight className="relative overflow-hidden">
      <div
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[80px] transition-opacity duration-700"
        style={{
          backgroundColor: 'rgba(107,138,254,0.12)',
          opacity: value / 100,
        }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <span className="kicker text-ink-dim/75">Confidence Level</span>
            <p className="text-[11px] text-ink-faint/65 italic font-light mt-1">
              Drag to honestly assess your certainty.
            </p>
          </div>
          <div className="text-right">
            <span className="text-display text-5xl sm:text-6xl font-semibold text-accent tabular-nums tracking-tight leading-none">
              {value}
              <span className="text-2xl sm:text-3xl text-accent/70">%</span>
            </span>
            <p className="font-editorial italic text-sm text-ink-dim/75 mt-2 tracking-tight">{level}</p>
          </div>
        </div>

        <div className="relative px-2 pt-1 pb-2">
          {/* Glow track */}
          <div
            className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1.5 rounded-full overflow-hidden bg-white/[0.05]"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent/70 via-accent to-accent/85 shadow-[0_0_12px_rgba(107,138,254,0.5)]"
              style={{ width: `${value}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="relative w-full appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-ink
              [&::-webkit-slider-thumb]:border-[3px]
              [&::-webkit-slider-thumb]:border-accent
              [&::-webkit-slider-thumb]:shadow-[0_0_16px_rgba(107,138,254,0.6),inset_0_1px_0_rgba(255,255,255,0.4)]
              [&::-webkit-slider-thumb]:cursor-grab
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-200
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-ink
              [&::-moz-range-thumb]:border-[3px]
              [&::-moz-range-thumb]:border-accent
              [&::-moz-range-thumb]:cursor-grab
              h-5"
          />
        </div>

        <div className="flex justify-between mt-5 text-[9px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">
          {LEVELS.map((lvl) => (
            <span
              key={lvl}
              className={cn(
                'transition-colors duration-400',
                level === lvl && 'text-accent font-semibold'
              )}
            >
              {lvl}
            </span>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

function FuturePreview({
  title,
  predictedOutcome,
  confidence,
  confidenceLevel,
  categories,
  optionsCount,
  assumptionsCount,
}: {
  title: string;
  predictedOutcome: string;
  confidence: number;
  confidenceLevel: string;
  categories: string[];
  optionsCount: number;
  assumptionsCount: number;
}) {
  return (
    <GlassPanel
      elevation="floating"
      padding="xl"
      edgeLight
      className="relative overflow-hidden"
    >
      {/* Atmospheric corner glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-accent/[0.08] blur-[100px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 bg-violet/[0.05] blur-[80px] rounded-full" />
      {/* Subtle envelope seam */}
      <div className="pointer-events-none absolute top-1/3 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 space-y-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-accent/75" strokeWidth={1.6} />
            <span className="kicker-accent">Future Preview</span>
          </div>
          <span className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">
            What returns to you, 30+ days from now
          </span>
        </div>

        <div>
          <p className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.22em] mb-2">
            Your decision
          </p>
          <h3 className="text-display text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-[1.18]">
            {title || <span className="text-ink-faint/45 italic font-editorial">untitled decision</span>}
          </h3>
        </div>

        {predictedOutcome && (
          <div>
            <p className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.22em] mb-2">
              You predicted
            </p>
            <p className="font-editorial italic text-[15px] sm:text-base text-ink-dim/90 leading-relaxed">
              &ldquo;{predictedOutcome}&rdquo;
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <PreviewStat label="Confidence" value={`${confidence}%`} sub={confidenceLevel} accent />
          <PreviewStat label="Paths" value={String(optionsCount)} sub={`option${optionsCount !== 1 ? 's' : ''}`} />
          <PreviewStat
            label="Assumptions"
            value={String(assumptionsCount)}
            sub={assumptionsCount >= 3 ? 'strong base' : 'add more'}
          />
          <PreviewStat
            label="Category"
            value={categories[0] || '—'}
            sub={categories.length > 1 ? `+${categories.length - 1} more` : 'tagged'}
          />
        </div>
      </div>
    </GlassPanel>
  );
}

function PreviewStat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-[9px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">{label}</p>
      <p
        className={cn(
          'text-display text-xl font-semibold tabular-nums tracking-tight truncate',
          accent ? 'text-accent' : 'text-ink'
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-ink-dim/65 font-light italic truncate">{sub}</p>
    </div>
  );
}

function LockAction({
  isSaving,
  onSave,
  disabled,
}: {
  isSaving: boolean;
  onSave: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={isSaving || disabled}
      onClick={onSave}
      className="group relative w-full overflow-hidden rounded-3xl border border-accent/[0.28] bg-accent/[0.04] hover:bg-accent/[0.08] transition-colors duration-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Sweep glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-accent/[0.10] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_rgba(107,138,254,0.10)] rounded-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-5 py-12 sm:py-14 px-6">
        <div className="w-14 h-14 rounded-full border border-accent/55 bg-accent/[0.10] flex items-center justify-center text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_0_24px_rgba(107,138,254,0.20)] group-hover:scale-105 transition-transform duration-500">
          {isSaving ? (
            <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.8} />
          ) : (
            <Lock className="w-6 h-6" strokeWidth={1.6} />
          )}
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-display text-xl sm:text-2xl font-semibold tracking-tight">
            {isSaving ? (
              'Sealing the vault…'
            ) : (
              <>
                Lock this <span className="font-editorial text-accent">decision</span>.
              </>
            )}
          </h4>
          <p className="text-[11px] font-medium text-ink-faint/65 uppercase tracking-[0.22em]">
            Once locked, the entry cannot be edited.
          </p>
        </div>
      </div>
    </button>
  );
}

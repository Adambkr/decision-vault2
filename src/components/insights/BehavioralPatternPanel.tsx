import { useMemo } from 'react';
import { motion } from 'motion/react';
import { GlassPanel } from '@/components/ui';
import { BrainCircuit, TrendingUp, AlertTriangle, Sparkles, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { reveal, staggerContainer } from '@/lib/motion';

interface Decision {
  id: string;
  createdAtDate: Date;
  confidence?: number;
  categories?: string[];
  assumptions?: string[];
}

interface Review {
  decisionId: string;
  outcomeMatch?: 'yes' | 'partial' | 'no' | null;
}

interface BehavioralPatternPanelProps {
  decisions: Decision[];
  reviews: Review[];
}

type Tone = 'positive' | 'neutral' | 'caution';

interface Pattern {
  icon: typeof TrendingUp;
  kicker: string;
  headline: string;
  body: string;
  tone: Tone;
  signal: 'strong' | 'moderate' | 'emerging';
}

/**
 * Behavioral Pattern panel — analyzes decision + review history to surface
 * behavioral observations about the user's judgment.
 *
 * Patterns are detected deterministically (no LLM call) from:
 *  • Confidence calibration vs realized accuracy
 *  • Assumption-density correlation with accuracy
 *  • Category dispersion
 *  • Decision cadence rhythm
 *
 * Each insight is presented as a glass-card editorial moment.
 */
export default function BehavioralPatternPanel({ decisions, reviews }: BehavioralPatternPanelProps) {
  const patterns = useMemo(() => derivePatterns(decisions, reviews), [decisions, reviews]);

  if (decisions.length < 3) {
    return (
      <GlassPanel elevation="card" padding="lg" edgeLight className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent/[0.08] border border-accent/[0.22] flex items-center justify-center mx-auto mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_18px_rgba(107,138,254,0.10)]">
          <BrainCircuit className="w-5 h-5 text-accent/75" strokeWidth={1.6} />
        </div>
        <p className="text-display text-base font-semibold tracking-tight mb-2">
          Behavioral patterns unlock at <span className="font-editorial text-accent/95">5+ decisions</span>.
        </p>
        <p className="text-sm text-ink-dim/75 font-light italic max-w-md mx-auto">
          The vault needs a baseline to read your judgment. Log a few more decisions and patterns will surface here.
        </p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="w-4 h-4 text-accent/75" strokeWidth={1.6} />
          <h3 className="text-display text-[15px] font-semibold tracking-tight">
            Behavioral patterns
          </h3>
        </div>
        <span className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">
          {patterns.length} {patterns.length === 1 ? 'observation' : 'observations'}
        </span>
      </div>

      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid sm:grid-cols-2 gap-4"
      >
        {patterns.map((p, i) => (
          <motion.div key={`${p.kicker}-${i}`} variants={reveal}>
            <PatternCard pattern={p} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function PatternCard({ pattern }: { pattern: Pattern }) {
  const Icon = pattern.icon;
  const toneStyles =
    pattern.tone === 'positive'
      ? {
          iconWrap: 'bg-emerald/[0.06] border-emerald/[0.20] text-emerald/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(52,211,153,0.10)]',
          accent: 'text-emerald/90',
          dot: 'bg-emerald',
        }
      : pattern.tone === 'caution'
      ? {
          iconWrap: 'bg-rose/[0.06] border-rose/[0.20] text-rose/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(251,113,133,0.10)]',
          accent: 'text-rose/90',
          dot: 'bg-rose',
        }
      : {
          iconWrap: 'bg-accent/[0.08] border-accent/[0.22] text-accent/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(107,138,254,0.10)]',
          accent: 'text-accent/90',
          dot: 'bg-accent',
        };

  return (
    <GlassPanel elevation="card" padding="md" edgeLight className="h-full relative overflow-hidden group">
      <div className="relative z-10 flex flex-col gap-5 h-full">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', toneStyles.iconWrap)}>
            <Icon className="w-4 h-4" strokeWidth={1.6} />
          </div>
          <SignalBadge signal={pattern.signal} dotClass={toneStyles.dot} />
        </div>

        <div className="space-y-2 min-w-0">
          <span className={cn('text-[10px] font-medium uppercase tracking-[0.22em]', toneStyles.accent)}>
            {pattern.kicker}
          </span>
          <h4 className="text-display text-[15px] font-semibold tracking-tight leading-[1.32]">{pattern.headline}</h4>
        </div>

        <p className="text-[13px] text-ink-dim/80 leading-relaxed font-light">{pattern.body}</p>
      </div>
    </GlassPanel>
  );
}

function SignalBadge({ signal, dotClass }: { signal: 'strong' | 'moderate' | 'emerging'; dotClass: string }) {
  const label = signal === 'strong' ? 'Strong signal' : signal === 'moderate' ? 'Moderate' : 'Emerging';
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor]', dotClass)} />
      <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-ink-faint/70">{label}</span>
    </div>
  );
}

/* ───────── pattern detection ───────── */

function derivePatterns(decisions: Decision[], reviews: Review[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Compute realized accuracy per decision
  const accuracyByDecision = new Map<string, number>();
  for (const r of reviews) {
    let v = 0;
    if (r.outcomeMatch === 'yes') v = 100;
    else if (r.outcomeMatch === 'partial') v = 50;
    accuracyByDecision.set(r.decisionId, v);
  }

  const reviewedDecisions = decisions.filter((d) => accuracyByDecision.has(d.id));

  /* (1) Calibration gap — confidence vs accuracy */
  if (reviewedDecisions.length >= 3) {
    const avgConf =
      reviewedDecisions.reduce((s, d) => s + (d.confidence ?? 0), 0) / reviewedDecisions.length;
    const avgAcc =
      reviewedDecisions.reduce((s, d) => s + (accuracyByDecision.get(d.id) ?? 0), 0) /
      reviewedDecisions.length;
    const gap = avgConf - avgAcc;
    if (Math.abs(gap) >= 6) {
      patterns.push({
        icon: gap > 0 ? AlertTriangle : TrendingUp,
        kicker: gap > 0 ? 'Calibration gap' : 'Quiet conviction',
        headline:
          gap > 0
            ? `You overstate certainty by ${Math.round(gap)}% on average.`
            : `You under-claim your accuracy by ${Math.round(Math.abs(gap))}%.`,
        body:
          gap > 0
            ? 'Across reviewed decisions, your confidence outpaces your realized accuracy. Slow down on calls where you feel >85% certain — that is where the gap usually hides.'
            : 'You consistently get more right than your confidence suggests. Trust your reasoning a little more — your instincts are better calibrated than your self-rating.',
        tone: gap > 0 ? 'caution' : 'positive',
        signal: reviewedDecisions.length >= 8 ? 'strong' : 'moderate',
      });
    }
  }

  /* (2) Assumption density correlation */
  if (reviewedDecisions.length >= 4) {
    const withAssumptions = reviewedDecisions.filter((d) => (d.assumptions?.length ?? 0) >= 3);
    const without = reviewedDecisions.filter((d) => (d.assumptions?.length ?? 0) < 3);
    if (withAssumptions.length >= 2 && without.length >= 2) {
      const avgWith =
        withAssumptions.reduce((s, d) => s + (accuracyByDecision.get(d.id) ?? 0), 0) /
        withAssumptions.length;
      const avgWithout =
        without.reduce((s, d) => s + (accuracyByDecision.get(d.id) ?? 0), 0) / without.length;
      const delta = avgWith - avgWithout;
      if (Math.abs(delta) >= 10) {
        patterns.push({
          icon: Sparkles,
          kicker: 'Assumption signal',
          headline:
            delta > 0
              ? `+${Math.round(delta)}% accuracy when you name 3+ assumptions.`
              : `${Math.round(delta)}% accuracy when you list 3+ assumptions.`,
          body:
            delta > 0
              ? 'Decisions where you forced yourself to articulate the underlying assumptions outperform those you logged on instinct. Lean into the discipline.'
              : 'Counter-intuitively, more written assumptions correlate with worse outcomes for you — possibly an over-analysis tell. Notice when extra reasoning is masking uncertainty.',
          tone: delta > 0 ? 'positive' : 'caution',
          signal: 'moderate',
        });
      }
    }
  }

  /* (3) Category dispersion */
  if (decisions.length >= 5) {
    const catCount = new Map<string, number>();
    for (const d of decisions) {
      const cat = d.categories?.[0] || 'Other';
      catCount.set(cat, (catCount.get(cat) ?? 0) + 1);
    }
    const sorted = [...catCount.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    if (top && top[1] >= Math.ceil(decisions.length * 0.55)) {
      const share = Math.round((top[1] / decisions.length) * 100);
      patterns.push({
        icon: Compass,
        kicker: 'Domain focus',
        headline: `${share}% of your decisions concentrate in ${top[0]}.`,
        body: `Your vault is heavily weighted toward ${top[0].toLowerCase()} decisions. This deepens your calibration there but may leave blind spots in adjacent domains. Consider logging an entry from a quieter category this week.`,
        tone: 'neutral',
        signal: decisions.length >= 12 ? 'strong' : 'moderate',
      });
    }
  }

  /* (4) Decision cadence */
  if (decisions.length >= 4) {
    const sortedDates = [...decisions]
      .map((d) => d.createdAtDate.getTime())
      .sort((a, b) => a - b);
    const gaps: number[] = [];
    for (let i = 1; i < sortedDates.length; i++) {
      gaps.push((sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24));
    }
    if (gaps.length > 0) {
      const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
      // Variance — clustered (low variance, short mean) vs sporadic (high variance)
      const variance = gaps.reduce((s, g) => s + Math.pow(g - mean, 2), 0) / gaps.length;
      const std = Math.sqrt(variance);
      const isClustered = std < mean * 0.7 && mean < 5;
      const isSporadic = std > mean * 1.4;
      if (isClustered) {
        patterns.push({
          icon: TrendingUp,
          kicker: 'Cadence rhythm',
          headline: `You log decisions in a tight rhythm — every ${Math.round(mean)} days, roughly.`,
          body: 'A consistent cadence creates the dataset the vault needs to reveal patterns. Hold it. Calibration insights compound when entries arrive on a steady drumbeat.',
          tone: 'positive',
          signal: 'moderate',
        });
      } else if (isSporadic) {
        patterns.push({
          icon: AlertTriangle,
          kicker: 'Cadence rhythm',
          headline: 'Your entries cluster in bursts, then go quiet.',
          body: 'Sporadic logging often means you only record decisions when stakes feel high — which biases your dataset toward outliers. Try logging one mid-stakes decision per week to balance the picture.',
          tone: 'caution',
          signal: 'emerging',
        });
      }
    }
  }

  // Fallback when no signal yet — surface a guiding observation
  if (patterns.length === 0) {
    patterns.push({
      icon: BrainCircuit,
      kicker: 'Baseline forming',
      headline: 'The vault is still learning your judgment.',
      body: 'Patterns will surface as you log a wider mix of decisions and complete more reviews. Aim for 8–10 entries across at least two categories.',
      tone: 'neutral',
      signal: 'emerging',
    });
  }

  return patterns.slice(0, 4);
}

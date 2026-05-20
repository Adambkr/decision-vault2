import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import HeroOrb from '@/components/three/HeroOrb';
import ParticleField from '@/components/three/ParticleField';
import { useLenis } from '@/hooks/useLenis';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Shield,
  Lock,
  TrendingUp,
  BrainCircuit,
  Target,
  BarChart3,
  RefreshCw,
  Quote,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SectionHeading, ConfidenceRing, GlassPanel } from '@/components/ui';
import { reveal, fadeUp, staggerContainer, scaleIn } from '@/lib/motion';
import ScrollStoryteller from '@/components/landing/ScrollStoryteller';

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 2000;
          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="kicker-accent mb-5 block">{children}</span>;
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  // Cinematic smooth scroll (skipped on touch + reduced-motion automatically)
  useLenis();

  // Scroll-linked hero storytelling — orb floats up + fades as user scrolls past hero
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOrbY = useTransform(heroProgress, [0, 1], prefersReduced ? [0, 0] : [0, -120]);
  const heroOrbScale = useTransform(heroProgress, [0, 1], prefersReduced ? [1, 1] : [1, 0.88]);
  const heroOrbOpacity = useTransform(heroProgress, [0, 0.85], [1, 0]);
  const heroTextY = useTransform(heroProgress, [0, 1], prefersReduced ? [0, 0] : [0, 80]);
  const heroTextOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section — cinematic, editorial */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center pt-28 pb-16 lg:pt-0 lg:pb-0"
      >
        {/* Atmospheric corner lighting unique to hero */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute top-[8%] left-[2%] w-[44%] h-[44%] bg-accent/[0.05] rounded-full blur-[140px] animate-drift hidden sm:block" />
          <div
            className="absolute bottom-[6%] right-[4%] w-[48%] h-[48%] bg-violet/[0.04] rounded-full blur-[160px] animate-drift hidden sm:block"
            style={{ animationDelay: '-6s' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-12 items-center gap-12 lg:gap-16 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.1, 0.1)}
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="md:col-span-7"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/[0.06] border border-accent/[0.18] rounded-full mb-8 backdrop-blur-sm"
            >
              <Sparkles className="w-3 h-3 text-accent/80" strokeWidth={1.6} />
              <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-accent/85">
                Cognitive Intelligence Layer
              </span>
            </motion.div>

            <motion.h1
              variants={reveal}
              className="text-display text-display-balanced mb-7 font-semibold text-[44px] leading-[1.02] sm:text-6xl md:text-[64px] lg:text-[80px] tracking-tight"
            >
              Master the{' '}
              <span className="font-editorial text-accent/95">decisions</span>
              <br className="hidden md:block" /> that shape your future.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-[15px] sm:text-lg text-ink-dim/80 max-w-xl mb-10 leading-relaxed font-light"
            >
              A premium intelligence system that holds your thinking accountable. Record your reasoning,
              predict the outcome, review with reality, and evolve your judgment&mdash;quietly, deliberately.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <Link
                to="/auth?mode=signup"
                className="btn-primary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold tracking-tight"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/[0.08] text-[11px] font-medium uppercase tracking-[0.18em] text-ink-dim hover:text-ink hover:border-accent/30 transition-colors duration-400 bg-white/[0.018]"
              >
                View Pricing
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-14 sm:mt-16 pt-8 border-t border-white/[0.04] grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-10 lg:gap-14"
            >
              {[
                { label: 'Setup', value: '2 min' },
                { label: 'Access', value: 'No Card' },
                { label: 'Philosophy', value: 'Human-first' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">
                    {item.label}
                  </span>
                  <span className="text-xs font-medium text-accent/70 uppercase tracking-[0.14em]">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero 3D — calmer, deeper, with atmospheric framing */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            style={{ y: heroOrbY, scale: heroOrbScale, opacity: heroOrbOpacity }}
            className="md:col-span-5 relative h-[380px] lg:h-[600px] w-full hidden md:block"
          >
            <div className="absolute inset-0 z-0">
              <Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
                <HeroOrb />
                <ParticleField />
              </Canvas>
            </div>
            {/* Hero corner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-accent/[0.04] via-transparent to-transparent" />
            {/* Subtle radial vignette to draw eye to orb */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_30%,rgba(6,8,15,0.4)_85%)]" />
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-6 border-y border-white/[0.04] bg-white/[0.008] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-ink-faint/30">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em]">Trusted by teams at</span>
          {['Linear', 'Vercel', 'Notion', 'Stripe'].map((brand) => (
            <span key={brand} className="text-sm font-semibold tracking-tight opacity-30">{brand}</span>
          ))}
        </div>
      </section>

      {/* Scroll-linked cinematic storytelling — three moments of the vault */}
      <ScrollStoryteller />

      {/* How Decision Intelligence Works */}
      <section className="py-28 sm:py-36 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-20 sm:mb-24">
            <SectionHeading
              kicker="The Process"
              title={
                <>
                  A deliberate cycle of
                  <br className="hidden md:block" /> <span className="font-editorial text-accent/95">recording</span>, predicting, and learning.
                </>
              }
              description="Three quiet movements. Capture what you believe. Watch reality unfold. Then return to face it."
              size="lg"
            />
          </div>

          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-5 lg:gap-6"
          >
            {[
              {
                step: '01',
                title: 'Capture',
                desc: 'Write your decision, your reasoning, and your prediction before you commit. Lock it in the vault.',
                icon: Lock,
              },
              {
                step: '02',
                title: 'Execute',
                desc: 'Make the call. Take action. DecisionVault waits in the background as reality unfolds.',
                icon: Shield,
              },
              {
                step: '03',
                title: 'Calibrate',
                desc: '30, 60, 90 days later — resurface your entry. Compare your prediction to reality. Get sharper.',
                icon: TrendingUp,
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={reveal}
                className="glass-card lift-hover edge-light relative overflow-hidden group p-7 sm:p-9 lg:p-10"
              >
                <div className="absolute -right-3 -top-6 text-[90px] lg:text-[110px] font-mono font-bold text-white/[0.012] leading-none select-none transition-colors duration-700 group-hover:text-accent/[0.05]">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-accent/[0.08] border border-accent/[0.18] flex items-center justify-center mb-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_20px_rgba(107,138,254,0.08)]">
                    <item.icon className="w-4 h-4 text-accent/85" strokeWidth={1.6} />
                  </div>
                  <h3 className="text-display text-xl sm:text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-ink-dim/75 leading-relaxed text-sm font-light">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Confidence & Prediction Section */}
      <section className="py-28 sm:py-36 px-5 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <motion.div variants={fadeUp}>
                <SectionLabel>Confidence Tracking</SectionLabel>
              </motion.div>
              <motion.h2
                variants={reveal}
                className="text-display text-display-balanced text-3xl sm:text-4xl lg:text-[56px] font-semibold mb-6 leading-[1.04]"
              >
                Know where you are calibrated.{' '}
                <span className="font-editorial text-accent/95">And where you are not.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-ink-dim/75 leading-relaxed mb-10 max-w-md font-light">
                Rate your certainty on every decision. Over time, DecisionVault reveals your calibration
                curve&mdash;the gap between what you believed and what actually happened.
              </motion.p>

              <motion.div variants={fadeUp} className="space-y-5">
                {[
                  { label: 'Self-reported confidence', value: 78 },
                  { label: 'Actual outcome accuracy', value: 64 },
                  { label: 'Calibration gap', value: 14, gap: true },
                ].map((bar, i) => (
                  <div key={i} className="space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <span
                        className={cn(
                          'text-xs',
                          bar.gap ? 'text-accent font-medium tracking-tight' : 'text-ink-dim/70'
                        )}
                      >
                        {bar.label}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums tracking-tight',
                          bar.gap ? 'text-accent' : 'text-ink-dim/80'
                        )}
                      >
                        {bar.value}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          'h-full rounded-full',
                          bar.gap
                            ? 'bg-gradient-to-r from-accent/60 to-accent/40 shadow-[0_0_12px_rgba(107,138,254,0.4)]'
                            : 'bg-gradient-to-r from-accent/75 to-accent/55'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <GlassPanel elevation="raised" padding="lg" edgeLight className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-accent/[0.07] blur-[80px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet/[0.04] blur-[60px] rounded-full" />

                {/* Anchor ring */}
                <div className="relative z-10 flex items-start justify-between mb-7">
                  <div>
                    <span className="kicker text-ink-faint/55">Prediction</span>
                    <p className="text-display text-2xl font-semibold mt-2 tracking-tight">Engineering hire</p>
                  </div>
                  <ConfidenceRing value={87} size={72} strokeWidth={4} />
                </div>

                <div className="relative z-10 space-y-6">
                  <p className="text-[15px] text-ink-dim/85 leading-relaxed font-light italic">
                    &ldquo;Hiring this senior engineer will reduce our deployment cycle time by 30% within 90
                    days.&rdquo;
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="kicker text-ink-faint/55">Reality, 90 days later</span>
                    <span className="text-xs font-medium text-emerald/85 tracking-tight">Partially accurate</span>
                  </div>
                  <p className="text-[15px] text-ink-dim/85 leading-relaxed font-light">
                    Cycle time improved <span className="text-ink font-medium">18%</span>. The engineer was
                    strong, but onboarding took longer than expected. Next time:
                    account for ramp-up period.
                  </p>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="py-28 sm:py-36 px-5 sm:px-8 lg:px-12 border-y border-white/[0.04] bg-white/[0.008]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-20 sm:mb-24">
            <SectionHeading
              kicker="Analytics"
              title={
                <>
                  Your cognitive
                  <br className="hidden md:block" /> <span className="font-editorial text-accent/95">intelligence</span> dashboard.
                </>
              }
              description="Private. Visual. Deeply personal. No generic metrics — only insights that matter to your judgment."
              size="lg"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="glass-card p-7 lg:col-span-2 edge-light"
            >
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-4 h-4 text-accent/60" strokeWidth={1.5} />
                <span className="text-sm font-medium text-ink-dim/60">Accuracy Over Time</span>
              </div>
              <div className="h-48 flex items-end gap-1.5 sm:gap-3">
                {[45, 52, 48, 61, 58, 67, 72, 69, 78, 82, 79, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 bg-accent/15 rounded-t-sm relative group min-w-[4px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[9px] sm:text-[10px] text-ink-faint/40 uppercase tracking-wider overflow-x-auto no-scrollbar">
                {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
                  <span key={i} className="min-w-[14px] text-center">{m}</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="glass-card p-7 edge-light"
            >
              <div className="flex items-center gap-3 mb-6">
                <BrainCircuit className="w-4 h-4 text-violet/60" strokeWidth={1.5} />
                <span className="text-sm font-medium text-ink-dim/60">Category Split</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Career', value: 34, color: 'bg-accent/50' },
                  { label: 'Investments', value: 28, color: 'bg-violet/50' },
                  { label: 'Product', value: 22, color: 'bg-cyan/50' },
                  { label: 'Personal', value: 16, color: 'bg-white/10' },
                ].map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-dim/60">{cat.label}</span>
                      <span className="text-ink-dim/40">{cat.value}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Behavioral Intelligence */}
      <section className="py-28 sm:py-36 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="glass-card p-8 relative overflow-hidden edge-light">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet/5 blur-[50px] rounded-full" />
                <div className="relative z-10 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <Target className="w-4 h-4 text-accent/70" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink mb-1">Calibration Strength</p>
                      <p className="text-xs text-ink-dim/60 leading-relaxed">You are highly calibrated in product decisions. When you say 80% confidence, you are right 82% of the time.</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-rose/5 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4 text-rose/60" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink mb-1">Overconfidence Trap</p>
                      <p className="text-xs text-ink-dim/60 leading-relaxed">You tend to be overconfident in investment calls. Your accuracy is 18% lower than your predicted confidence.</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald/5 flex items-center justify-center shrink-0 mt-0.5">
                      <RefreshCw className="w-4 h-4 text-emerald/60" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink mb-1">Pattern Detected</p>
                      <p className="text-xs text-ink-dim/60 leading-relaxed">Decisions with 3+ assumptions are 24% more accurate. This pattern has held for 6 months.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="order-1 lg:order-2"
            >
              <motion.div variants={fadeUp}>
                <SectionLabel>Behavioral Intelligence</SectionLabel>
              </motion.div>
              <motion.h2
                variants={reveal}
                className="text-display text-display-balanced text-3xl sm:text-4xl lg:text-[56px] font-semibold mb-6 leading-[1.04]"
              >
                Understand your judgment.{' '}
                <span className="font-editorial text-violet/85">Not just your outcomes.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-ink-dim/75 leading-relaxed mb-10 max-w-md font-light">
                DecisionVault analyzes your patterns over time. Where are you strong? Where do you overcommit?
                What assumptions consistently fail?
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
                {['Calibration curves', 'Category accuracy', 'Assumption tracking', 'Temporal bias'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-ink-dim/75 tracking-tight"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 sm:py-28 px-5 sm:px-8 lg:px-12 border-y border-white/[0.04] bg-white/[0.005] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_50%,rgba(107,138,254,0.04),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 text-center">
          {[
            { value: 14000, suffix: '+', label: 'Decisions Logged' },
            { value: 89, suffix: '%', label: 'Accuracy Improvement' },
            { value: 0, suffix: '', label: 'AI Intervention', isZero: true },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: i * 0.12, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <span className="text-display text-display-balanced block text-[56px] sm:text-6xl lg:text-7xl font-semibold text-ink mb-3 tabular-nums tracking-tight">
                {stat.isZero ? (
                  <span className="font-editorial text-accent/85">Zero</span>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </span>
              <span className="text-[11px] font-medium text-ink-faint/55 uppercase tracking-[0.28em]">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-28 sm:py-36 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-16 sm:mb-20">
            <SectionHeading
              kicker="Capabilities"
              title={
                <>
                  Built for <span className="font-editorial text-accent/95">clarity</span>.
                </>
              }
              description="Every detail designed to sharpen your thinking, not replace it."
              size="lg"
            />
          </div>

          <motion.div
            variants={staggerContainer(0.07)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              { title: 'Decision Locking', desc: 'Immutable entries. What you thought then is preserved exactly as you wrote it.', icon: Lock },
              { title: 'Outcome Reviews', desc: 'Scheduled reminders to face your predictions and compare them to reality.', icon: CheckCircle2 },
              { title: 'Confidence Tracking', desc: 'Rate your certainty. Over time, see where you are calibrated and where you are not.', icon: TrendingUp },
              { title: 'Zero AI Noise', desc: 'No autocomplete. No suggestions. Your reasoning is entirely your own.', icon: Shield },
              { title: 'Assumption Mapping', desc: 'Document what must be true. When assumptions break, you know where to look.', icon: Sparkles },
              { title: 'Decision DNA', desc: 'Insights that reveal your patterns. Where are you strong? Where do you overcommit?', icon: Play },
            ].map((feat) => (
              <motion.div
                key={feat.title}
                variants={reveal}
                className="glass-card edge-light lift-hover p-6 sm:p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.035] border border-white/[0.07] flex items-center justify-center mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <feat.icon className="w-4 h-4 text-accent/65" strokeWidth={1.6} />
                </div>
                <h3 className="text-display text-[17px] font-semibold mb-2.5 tracking-tight">{feat.title}</h3>
                <p className="text-sm text-ink-dim/70 leading-relaxed font-light">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 sm:py-36 px-5 sm:px-8 lg:px-12 border-y border-white/[0.04] bg-white/[0.005]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-16 sm:mb-20">
            <SectionHeading
              kicker="Testimonials"
              title={
                <>
                  What <span className="font-editorial text-accent/95">deep thinkers</span> say.
                </>
              }
              size="lg"
            />
          </div>

          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              {
                quote: 'DecisionVault changed how I think about my own judgment. I was overconfident in 70% of my calls. Now I know where to slow down.',
                author: 'Sarah Chen',
                role: 'VP Product, Fintech',
              },
              {
                quote: 'The calibration insights alone are worth it. I have never seen my own decision patterns laid out so clearly.',
                author: 'Marcus Osei',
                role: 'Founder, Series B',
              },
              {
                quote: 'Quietly futuristic. It feels like having a private analyst for your own mind. No noise, no hype — just clarity.',
                author: 'Elena Rossi',
                role: 'Engineering Lead',
              },
            ].map((t) => (
              <motion.div
                key={t.author}
                variants={reveal}
                className="glass-card edge-light lift-hover p-7 sm:p-8 relative"
              >
                <Quote className="w-6 h-6 text-accent/[0.18] mb-5" strokeWidth={1} />
                <p className="text-[15px] text-ink-dim/90 leading-relaxed mb-7 font-light">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/[0.10] border border-accent/[0.22] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <span className="text-[11px] font-semibold text-accent tracking-tight">
                      {t.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink tracking-tight">{t.author}</p>
                    <p className="text-[10px] text-ink-faint/55 uppercase tracking-[0.22em] mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Manifesto — editorial cinematic moment */}
      <section className="py-20 sm:py-32 lg:py-44 px-5 sm:px-8 lg:px-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(107,138,254,0.04),transparent_65%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-editorial text-5xl sm:text-7xl lg:text-8xl text-accent/[0.12] block leading-none mb-[-8px]">
              &ldquo;
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-[1.18] tracking-tight px-2 sm:px-6 lg:px-16 text-ink/95 italic">
              In a world where AI makes every decision easier, the hardest&mdash;and most valuable&mdash;thing you
              can do is think for yourself.
            </h2>
            <span className="font-editorial text-5xl sm:text-7xl lg:text-8xl text-accent/[0.12] block mt-2 leading-none">
              &rdquo;
            </span>

            <div className="mt-12 flex flex-col items-center gap-3">
              <span className="h-px w-16 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
              <span className="text-[10px] font-medium text-ink-faint/55 uppercase tracking-[0.32em]">
                The DecisionVault Manifesto
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-20 sm:pb-32 lg:pb-44 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassPanel
              elevation="raised"
              edgeLight
              padding="xl"
              className="text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] lg:w-[480px] lg:h-[480px] bg-accent/[0.10] blur-[80px] sm:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] bg-violet/[0.06] blur-[60px] sm:blur-[90px] rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10 space-y-7 sm:space-y-9">
                <span className="kicker-accent">Begin your journey</span>
                <h2 className="text-display text-display-balanced text-3xl sm:text-4xl md:text-5xl lg:text-[68px] font-semibold leading-[1.04] mb-4">
                  Ready to master your{' '}
                  <span className="font-editorial text-accent/95">next move?</span>
                </h2>
                <p className="text-ink-dim/75 max-w-md mx-auto leading-relaxed text-[15px] sm:text-base font-light">
                  Join thinkers who refuse to let their best decisions fade into memory.
                </p>
                <div className="flex justify-center pt-2">
                  <Link
                    to="/auth?mode=signup"
                    className="btn-primary inline-flex items-center justify-center gap-2.5 h-14 px-9 sm:px-11 rounded-xl text-base sm:text-[17px] font-semibold tracking-tight"
                  >
                    Enter the Vault
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

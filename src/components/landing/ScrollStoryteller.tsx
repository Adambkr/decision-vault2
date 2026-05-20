import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Lock, Eye, Sparkles } from 'lucide-react';

interface StoryFrame {
  kicker: string;
  title: React.ReactNode;
  body: string;
  icon: typeof Lock;
}

const FRAMES: StoryFrame[] = [
  {
    kicker: 'Moment One',
    title: (
      <>
        You commit to a <span className="font-editorial text-accent/95">belief</span>.
      </>
    ),
    body:
      'Write your reasoning, your assumptions, your prediction. The vault closes. Time begins to do what time always does.',
    icon: Lock,
  },
  {
    kicker: 'Moment Two',
    title: (
      <>
        Reality moves in <span className="font-editorial text-violet/85">silence</span>.
      </>
    ),
    body:
      'Days and weeks pass. The world responds — sometimes how you imagined, often not. The vault waits, patient, exact, unblinking.',
    icon: Eye,
  },
  {
    kicker: 'Moment Three',
    title: (
      <>
        You return, and <span className="font-editorial text-cyan/85">change</span>.
      </>
    ),
    body:
      'The entry resurfaces. You compare what you thought to what occurred. Your judgment sharpens — slowly, deliberately, forever.',
    icon: Sparkles,
  },
];

/**
 * Pinned, scroll-linked cinematic storytelling.
 *
 * A 300vh section in which a single centered card cross-fades through three
 * editorial "moments" as the user scrolls. The card stays pinned to viewport
 * center via sticky positioning; opacity + y are driven by useScroll.
 *
 * Falls back gracefully under prefers-reduced-motion (all frames stacked).
 */
export default function ScrollStoryteller() {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Reduced-motion: render frames stacked vertically with no scroll linkage.
  if (prefersReduced) {
    return (
      <section className="py-28 px-5 sm:px-8 lg:px-12 space-y-16 bg-white/[0.005] border-y border-white/[0.04]">
        <div className="max-w-3xl mx-auto space-y-20">
          {FRAMES.map((f, i) => (
            <Frame key={i} frame={f} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative bg-white/[0.005] border-y border-white/[0.04]"
      style={{ height: '320vh' }}
      aria-label="Decision vault storytelling sequence"
    >
      {/* Sticky stage — the "screen" the moments project onto */}
      <div className="sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Drifting atmospheric backdrop just for this section */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute top-[20%] left-[10%] w-[36%] h-[36%] bg-accent/[0.04] rounded-full blur-[160px] animate-drift" />
          <div
            className="absolute bottom-[10%] right-[12%] w-[40%] h-[40%] bg-violet/[0.03] rounded-full blur-[180px] animate-drift"
            style={{ animationDelay: '-9s' }}
          />
        </div>

        {/* Progress rail */}
        <ProgressRail scrollYProgress={scrollYProgress} />

        <div className="relative z-10 max-w-3xl w-full px-5 sm:px-8">
          {FRAMES.map((f, i) => (
            <PinnedFrame key={i} frame={f} index={i} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── helpers ───────── */

function PinnedFrame({
  frame,
  index,
  scrollYProgress,
}: {
  frame: StoryFrame;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // 3 frames, each occupying 1/3 of progress (0–0.33, 0.33–0.66, 0.66–1).
  const seg = 1 / FRAMES.length;
  const start = index * seg;
  const end = (index + 1) * seg;
  const mid = start + seg / 2;
  const fadeIn = seg * 0.25;
  const fadeOut = seg * 0.25;

  // Opacity curve: fade in early, hold, fade out late — except first frame starts visible
  const isFirst = index === 0;
  const isLast = index === FRAMES.length - 1;
  const opacity = useTransform(
    scrollYProgress,
    [
      isFirst ? 0 : start,
      isFirst ? 0 : start + fadeIn,
      end - fadeOut,
      isLast ? 1 : end,
    ],
    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]
  );

  // y: slight rise on entrance, slight rise on exit
  const y = useTransform(
    scrollYProgress,
    [start, mid, end],
    [index === 0 ? 0 : 40, 0, -40]
  );

  const filter = useTransform(
    scrollYProgress,
    [start, start + fadeIn, end - fadeOut, end],
    ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']
  );

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className="absolute inset-x-0 px-5 sm:px-8 will-change-[opacity,transform,filter]"
    >
      <Frame frame={frame} />
    </motion.div>
  );
}

function Frame({ frame }: { frame: StoryFrame }) {
  const Icon = frame.icon;
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-accent/[0.08] border border-accent/[0.20] flex items-center justify-center mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_32px_rgba(107,138,254,0.10)]">
        <Icon className="w-5 h-5 text-accent/85" strokeWidth={1.6} />
      </div>
      <span className="kicker-accent mb-5">{frame.kicker}</span>
      <h2 className="text-display text-display-balanced text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-semibold mb-7 leading-[1.05] tracking-tight">
        {frame.title}
      </h2>
      <p className="text-[15px] sm:text-base text-ink-dim/85 leading-relaxed font-light max-w-xl">
        {frame.body}
      </p>
    </div>
  );
}

function ProgressRail({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const railFill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <div className="hidden md:flex flex-col items-center gap-3 absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 z-20">
      <span className="text-[9px] font-medium uppercase tracking-[0.32em] text-ink-faint/55 [writing-mode:vertical-rl] rotate-180">
        Moments
      </span>
      <div className="relative w-px h-32 bg-white/[0.06] overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-accent via-accent/70 to-accent/20 shadow-[0_0_8px_rgba(107,138,254,0.5)]"
          style={{ height: railFill }}
        />
      </div>
      <div className="flex flex-col gap-2.5 mt-1">
        {FRAMES.map((_, i) => (
          <FrameDot key={i} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}

function FrameDot({
  index,
  scrollYProgress,
}: {
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const seg = 1 / FRAMES.length;
  const center = index * seg + seg / 2;
  const opacity = useTransform(
    scrollYProgress,
    [center - seg / 2, center, center + seg / 2],
    [0.3, 1, 0.3]
  );
  const scale = useTransform(
    scrollYProgress,
    [center - seg / 2, center, center + seg / 2],
    [0.9, 1.3, 0.9]
  );
  return (
    <motion.span
      style={{ opacity, scale }}
      className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(107,138,254,0.6)]"
    />
  );
}

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Show numeric value inside the ring */
  showLabel?: boolean;
  /** Override label content */
  label?: string;
  /** Color tone */
  tone?: 'accent' | 'violet' | 'cyan' | 'emerald';
  /** Animate from 0 on mount/scroll-in */
  animate?: boolean;
  className?: string;
}

const TONE_MAP = {
  accent: { stroke: '#6b8afe', text: 'text-accent/85', glow: 'drop-shadow-[0_0_8px_rgba(107,138,254,0.35)]' },
  violet: { stroke: '#a78bfa', text: 'text-violet/85', glow: 'drop-shadow-[0_0_8px_rgba(167,139,250,0.35)]' },
  cyan: { stroke: '#5eead4', text: 'text-cyan/85', glow: 'drop-shadow-[0_0_8px_rgba(94,234,212,0.3)]' },
  emerald: { stroke: '#34d399', text: 'text-emerald/85', glow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' },
};

/**
 * Cinematic radial confidence ring.
 * Animates from 0 to `value` with a smooth cubic ease on mount/visibility.
 */
export function ConfidenceRing({
  value,
  size = 48,
  strokeWidth = 3,
  showLabel = true,
  label,
  tone = 'accent',
  animate = true,
  className,
}: ConfidenceRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(100, value));

  const [progress, setProgress] = useState(animate ? 0 : target);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animate) {
      setProgress(target);
      return;
    }

    let raf = 0;
    let startTime = 0;
    const duration = 1100;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased * target);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    // Trigger when in view
    const node = ref.current;
    if (!node) {
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          raf = requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [target, animate]);

  const tones = TONE_MAP[tone];
  const dash = (progress / 100) * circumference;
  const labelText = label ?? `${Math.round(progress)}%`;

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tones.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className={tones.glow}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-semibold tabular-nums',
            tones.text
          )}
          style={{ fontSize: Math.max(9, size * 0.22) }}
        >
          {labelText}
        </span>
      )}
    </div>
  );
}

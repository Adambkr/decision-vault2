import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'accent' | 'success' | 'warning' | 'violet' | 'cyan';
  /** Show a leading status dot */
  dot?: boolean;
  className?: string;
}

const dotColors: Record<string, string> = {
  default: 'bg-ink-dim/60',
  outline: 'bg-ink-faint/60',
  secondary: 'bg-ink-dim/60',
  accent: 'bg-accent',
  success: 'bg-emerald',
  warning: 'bg-amber',
  violet: 'bg-violet',
  cyan: 'bg-cyan',
};

export function Badge({ children, variant = 'default', dot, className }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-white/[0.05] text-ink-dim/90 border border-white/[0.07]',
    outline: 'bg-white/[0.015] text-ink-faint/90 border border-white/[0.06]',
    secondary: 'bg-white/[0.05] text-ink-dim/90 border border-white/[0.07]',
    accent: 'bg-accent/[0.10] text-accent/95 border border-accent/[0.22]',
    success: 'bg-emerald/[0.10] text-emerald/95 border border-emerald/[0.22]',
    warning: 'bg-amber/[0.10] text-amber/95 border border-amber/[0.22]',
    violet: 'bg-violet/[0.10] text-violet/95 border border-violet/[0.22]',
    cyan: 'bg-cyan/[0.10] text-cyan/95 border border-cyan/[0.22]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-[0.14em]',
        variants[variant] || variants.default,
        className
      )}
    >
      {dot && <span className={cn('w-1 h-1 rounded-full', dotColors[variant] || dotColors.default)} />}
      {children}
    </span>
  );
}


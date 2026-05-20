import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  /** Persistent accent glow shadow */
  glow?: boolean;
  /** Hover edge-light treatment */
  hover?: boolean;
  /** Soft lift transform on hover */
  hoverLift?: boolean;
  /** Visual elevation */
  elevation?: 'card' | 'raised' | 'floating' | 'surface';
}

/**
 * Card — thin convenience wrapper around the cinematic glass surface.
 * Maintains backward-compatible API while supporting elevation tiers.
 */
export function Card({
  children,
  className,
  glow,
  hover,
  hoverLift,
  elevation = 'card',
  ...rest
}: CardProps) {
  const base =
    elevation === 'raised'
      ? 'glass-raised'
      : elevation === 'floating'
      ? 'glass-floating'
      : elevation === 'surface'
      ? 'glass-surface rounded-2xl'
      : 'glass-card';

  return (
    <div
      className={cn(
        base,
        'p-6 min-w-0',
        glow && 'border-accent/15 accent-glow',
        hover && 'edge-light',
        hoverLift && 'lift-hover',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}


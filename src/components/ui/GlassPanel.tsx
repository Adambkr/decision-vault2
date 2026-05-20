import { type ReactNode, type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Visual elevation tier — chooses surface treatment + shadow depth */
  elevation?: 'surface' | 'card' | 'raised' | 'floating';
  /** Always-on hairline edge highlight — for hero/feature panels */
  edgeLight?: boolean | 'hover';
  /** Subtle persistent accent glow */
  glow?: boolean;
  /** Soft lift transform on hover */
  hoverLift?: boolean;
  /** Padding scale */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Cinematic depth-layered glass surface.
 * Use this instead of ad-hoc `glass-card` divs across the app for consistency.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
  {
    children,
    elevation = 'card',
    edgeLight = 'hover',
    glow = false,
    hoverLift = false,
    padding = 'md',
    className,
    ...rest
  },
  ref
) {
  const base =
    elevation === 'surface'
      ? 'glass-surface rounded-2xl'
      : elevation === 'raised'
      ? 'glass-raised'
      : elevation === 'floating'
      ? 'glass-floating'
      : 'glass-card';

  const pad =
    padding === 'none'
      ? ''
      : padding === 'sm'
      ? 'p-4 sm:p-5'
      : padding === 'md'
      ? 'p-5 sm:p-6 lg:p-7'
      : padding === 'lg'
      ? 'p-6 sm:p-8 lg:p-10'
      : 'p-8 sm:p-12 lg:p-16';

  const edge = edgeLight === true ? 'edge-light-on' : edgeLight === 'hover' ? 'edge-light' : '';

  return (
    <div
      ref={ref}
      className={cn(
        base,
        pad,
        edge,
        glow && 'accent-glow',
        hoverLift && 'lift-hover',
        'min-w-0',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

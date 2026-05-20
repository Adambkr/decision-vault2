import { memo } from 'react';
import { cn } from '@/lib/utils';

interface AtmosphericBackdropProps {
  /** Visual variant — different mood per surface */
  variant?: 'app' | 'dashboard' | 'hero' | 'subtle';
  /** Include subtle grid mask */
  grid?: boolean;
  /** Include corner spotlight */
  spotlight?: boolean;
  className?: string;
}

/**
 * Layered atmospheric background — orbs, grid, spotlight, noise, vignette.
 * Centralizes the "cinematic environment" so pages stay clean.
 *
 * Use one per page/layout. Sits absolutely behind content.
 */
export const AtmosphericBackdrop = memo(function AtmosphericBackdrop({
  variant = 'app',
  grid = false,
  spotlight = false,
  className,
}: AtmosphericBackdropProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden z-0', className)} aria-hidden>
      {/* Orbs */}
      {variant === 'app' && (
        <>
          <div className="atmosphere-orb top-[-15%] left-[-10%] w-[50%] h-[50%] bg-accent opacity-[0.035]" />
          <div className="atmosphere-orb bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-violet opacity-[0.025]" />
          <div className="atmosphere-orb top-[50%] right-[18%] w-[22%] h-[22%] bg-cyan opacity-[0.015]" />
        </>
      )}
      {variant === 'dashboard' && (
        <>
          <div className="atmosphere-orb top-[-12%] right-[-5%] w-[35%] h-[35%] bg-accent opacity-[0.04]" />
          <div className="atmosphere-orb bottom-[-5%] left-[-5%] w-[28%] h-[28%] bg-violet opacity-[0.028]" />
          <div className="atmosphere-orb top-[42%] left-[22%] w-[18%] h-[18%] bg-cyan opacity-[0.018]" />
        </>
      )}
      {variant === 'hero' && (
        <>
          <div className="atmosphere-orb top-[10%] left-[5%] w-[32%] h-[32%] bg-accent opacity-[0.05]" />
          <div className="atmosphere-orb bottom-[5%] right-[8%] w-[36%] h-[36%] bg-violet opacity-[0.035]" />
        </>
      )}
      {variant === 'subtle' && (
        <div className="atmosphere-orb top-[20%] left-[40%] w-[30%] h-[30%] bg-accent opacity-[0.018]" />
      )}

      {grid && <div className="atmosphere-grid" />}
      {spotlight && <div className="atmosphere-spotlight" />}
    </div>
  );
});

import { type ButtonHTMLAttributes, type ReactNode, useRef, useCallback, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'luxury';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  /** Subtle magnetic hover that pulls toward cursor */
  magnetic?: boolean;
}

/**
 * Premium button — depth-layered, tactile, optionally magnetic.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, magnetic = false, ...props },
  forwardedRef
) {
  const internalRef = useRef<HTMLButtonElement>(null);
  const setRefs = useCallback((node: HTMLButtonElement | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !internalRef.current) return;
      const rect = internalRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Smaller magnitude (10%), longer reach feels more elegant
      internalRef.current.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    },
    [magnetic]
  );

  const handleMouseLeave = useCallback(() => {
    if (!magnetic || !internalRef.current) return;
    internalRef.current.style.transform = 'translate(0, 0)';
  }, [magnetic]);

  const variants = {
    primary: 'btn-primary',
    secondary:
      'bg-white/[0.05] hover:bg-white/[0.08] text-ink border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.25)] active:scale-[0.975]',
    ghost:
      'bg-transparent hover:bg-white/[0.04] text-ink-dim hover:text-ink active:scale-[0.975]',
    outline:
      'bg-white/[0.01] border border-accent/25 hover:border-accent/50 text-accent hover:bg-accent/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] active:scale-[0.975]',
    destructive:
      'bg-rose/[0.08] hover:bg-rose/[0.12] text-rose border border-rose/20 active:scale-[0.975]',
    luxury:
      'btn-primary',
  };

  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-6 text-sm',
    lg: 'h-13 px-7 text-base',
    xl: 'h-14 px-10 text-base',
  };

  return (
    <button
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight',
        'transition-[background-color,box-shadow,color,border-color] duration-400',
        'disabled:opacity-40 disabled:pointer-events-none',
        'focus-accent',
        magnetic && 'magnetic-host',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});


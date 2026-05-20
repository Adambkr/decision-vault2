import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  /** Trailing helper text (only when no error) */
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, id, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-dim/80 ml-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'bg-white/[0.035] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-ink placeholder:text-ink-faint/45',
          'focus:outline-none input-glow disabled:opacity-50',
          'tracking-tight',
          error && 'border-rose/45 focus:border-rose/60',
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-[10px] text-rose/90 ml-1">{error}</span>
      ) : hint ? (
        <span className="text-[10px] text-ink-faint/55 ml-1">{hint}</span>
      ) : null}
    </div>
  );
});


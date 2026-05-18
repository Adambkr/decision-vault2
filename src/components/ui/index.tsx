import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'luxury';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-gold-accent hover:bg-gold-light text-luxury-bg gold-glow active:scale-95',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
    outline: 'bg-transparent border border-gold-accent/40 hover:border-gold-accent text-gold-accent hover:bg-gold-accent/5',
    destructive: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20',
    luxury: 'bg-gold-accent text-luxury-bg shadow-[0_0_50px_rgba(245,166,35,0.3)] hover:scale-105 active:scale-95 transition-all duration-500'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg'
  };

  return (
    <button 
      className={cn(
        "rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, label, error, ...props }: any) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-mono uppercase tracking-widest text-white/40 ml-1">{label}</label>}
      <input 
        className={cn(
          "bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-accent transition-colors placeholder:text-white/20",
          error && "border-red-500/50",
          className
        )}
        {...props}
      />
      {error && <span className="text-[10px] text-red-400 ml-1">{error}</span>}
    </div>
  );
}

export function Card({ children, className, glow }: any) {
  return (
    <div className={cn(
      "glass-card p-6",
      glow && "border-gold-accent/20 gold-glow",
      className
    )}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default' }: any) {
  const variants: any = {
    default: 'bg-white/10 text-white/70',
    gold: 'bg-gold-accent/20 text-gold-accent border border-gold-accent/20',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider", variants[variant])}>
      {children}
    </span>
  );
}

import { cn } from '@/lib/utils';

import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  pulse?: boolean;
  style?: CSSProperties;
}

export function Skeleton({ className, pulse = true, style }: SkeletonProps) {
  return (
    <div className={cn("bg-white/[0.04] rounded-xl", pulse && "skeleton", className)} style={style} />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

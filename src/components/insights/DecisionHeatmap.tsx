import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Decision {
  id: string;
  createdAtDate: Date;
  confidence?: number;
}

interface Review {
  decisionId: string;
  outcomeMatch?: 'yes' | 'partial' | 'no' | null;
}

interface DecisionHeatmapProps {
  decisions: Decision[];
  reviews: Review[];
  /** How many weeks back to display (default 26 ≈ half a year). */
  weeks?: number;
}

interface Cell {
  date: Date;
  key: string;
  count: number;
  accuracy: number | null; // 0..100 or null when no reviews
}

/**
 * Decision Heatmap — GitHub-style density grid showing decisions per day.
 *
 * Cells are colored by **accuracy** (when reviews exist) or by **density**
 * (when only a count is available). Hover reveals a glass tooltip with the
 * date, count, and accuracy. Falls back gracefully on small viewports.
 */
export default function DecisionHeatmap({ decisions, reviews, weeks = 26 }: DecisionHeatmapProps) {
  const cells = useMemo(() => buildCells(decisions, reviews, weeks), [decisions, reviews, weeks]);
  const [hovered, setHovered] = useState<Cell | null>(null);
  const total = decisions.length;

  // Month labels — show on the first cell of each new month
  const monthLabels = useMemo(() => {
    const labels: Array<{ week: number; label: string }> = [];
    let lastMonth = -1;
    cells.forEach((c, i) => {
      if (c.date.getDay() !== 0) return;
      const m = c.date.getMonth();
      if (m !== lastMonth) {
        labels.push({
          week: Math.floor(i / 7),
          label: c.date.toLocaleDateString(undefined, { month: 'short' }),
        });
        lastMonth = m;
      }
    });
    return labels;
  }, [cells]);

  const dayLabels = ['Mon', 'Wed', 'Fri'];

  return (
    <div className="relative">
      {/* Month axis */}
      <div className="ml-7 mb-2 grid relative h-3" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
        {monthLabels.map((m) => (
          <span
            key={`${m.week}-${m.label}`}
            className="text-[9px] font-medium uppercase tracking-[0.22em] text-ink-faint/55 col-span-2"
            style={{ gridColumnStart: m.week + 1 }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Day axis */}
        <div className="flex flex-col justify-between text-[9px] font-medium uppercase tracking-[0.22em] text-ink-faint/55 py-0.5 select-none">
          {dayLabels.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Grid */}
        <div
          className="grid gap-[3px] flex-1"
          style={{
            gridTemplateColumns: `repeat(${weeks}, 1fr)`,
            gridTemplateRows: 'repeat(7, 1fr)',
            gridAutoFlow: 'column',
          }}
          role="grid"
          aria-label="Decision activity heatmap"
        >
          {cells.map((c, i) => (
            <HeatCell
              key={c.key}
              cell={c}
              index={i}
              onHoverChange={(active) => setHovered(active ? c : null)}
              hovered={hovered?.key === c.key}
            />
          ))}
        </div>
      </div>

      {/* Footer — legend + total */}
      <div className="flex items-center justify-between mt-5">
        <span className="text-[10px] font-medium text-ink-faint/65 uppercase tracking-[0.22em] tabular-nums">
          {total} {total === 1 ? 'decision' : 'decisions'} this period
        </span>

        <Legend hasReviews={reviews.length > 0} />
      </div>

      {/* Hover detail */}
      <div className="h-5 mt-3 text-[11px] text-ink-dim/80">
        {hovered && (
          <motion.div
            key={hovered.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <span className="text-ink/90 font-medium tracking-tight">
              {hovered.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-ink-faint/55">·</span>
            <span className="tabular-nums">
              {hovered.count} {hovered.count === 1 ? 'decision' : 'decisions'}
            </span>
            {hovered.accuracy !== null && (
              <>
                <span className="text-ink-faint/55">·</span>
                <span className="text-accent font-medium tabular-nums">
                  {Math.round(hovered.accuracy)}% accurate
                </span>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ───────── helpers ───────── */

function buildCells(decisions: Decision[], reviews: Review[], weeks: number): Cell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start: weeks * 7 days ago, snapped to Monday
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7);
  const dow = (start.getDay() + 6) % 7; // monday-indexed
  start.setDate(start.getDate() - dow);

  // Bucket decisions + reviews by date key
  const decByDate = new Map<string, Decision[]>();
  for (const d of decisions) {
    const key = dateKey(d.createdAtDate);
    if (!decByDate.has(key)) decByDate.set(key, []);
    decByDate.get(key)!.push(d);
  }

  const revByDecisionId = new Map<string, Review[]>();
  for (const r of reviews) {
    if (!revByDecisionId.has(r.decisionId)) revByDecisionId.set(r.decisionId, []);
    revByDecisionId.get(r.decisionId)!.push(r);
  }

  const cells: Cell[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < weeks * 7; i++) {
    const key = dateKey(cursor);
    const dayDecisions = decByDate.get(key) ?? [];
    const dayReviews = dayDecisions.flatMap((d) => revByDecisionId.get(d.id) ?? []);
    let accuracy: number | null = null;
    if (dayReviews.length > 0) {
      const sum = dayReviews.reduce((s, r) => {
        if (r.outcomeMatch === 'yes') return s + 100;
        if (r.outcomeMatch === 'partial') return s + 50;
        return s;
      }, 0);
      accuracy = sum / dayReviews.length;
    }
    cells.push({
      date: new Date(cursor),
      key,
      count: dayDecisions.length,
      accuracy,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function HeatCell({
  cell,
  index,
  onHoverChange,
  hovered,
}: {
  cell: Cell;
  index: number;
  onHoverChange: (active: boolean) => void;
  hovered: boolean;
}) {
  const tone = cellTone(cell);
  return (
    <motion.div
      role="gridcell"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.0025, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      tabIndex={cell.count > 0 ? 0 : -1}
      className={cn(
        'rounded-[3px] aspect-square cursor-default transition-colors duration-300',
        tone.bg,
        tone.ring,
        hovered && 'ring-1 ring-accent/60 shadow-[0_0_10px_rgba(107,138,254,0.4)]'
      )}
      style={{ minHeight: 10 }}
      aria-label={
        cell.count > 0
          ? `${cell.count} decision${cell.count === 1 ? '' : 's'} on ${cell.date.toDateString()}`
          : undefined
      }
    />
  );
}

function cellTone(cell: Cell): { bg: string; ring: string } {
  if (cell.count === 0) {
    return {
      bg: 'bg-white/[0.025]',
      ring: '',
    };
  }
  // Density tier from count
  const densityTier = Math.min(cell.count, 4); // 1..4

  // If we have accuracy data, colorize toward emerald (good) or rose (poor)
  if (cell.accuracy !== null) {
    if (cell.accuracy >= 75) {
      // emerald scale
      return densityClass([
        'bg-emerald/[0.18]',
        'bg-emerald/[0.34]',
        'bg-emerald/[0.55]',
        'bg-emerald/[0.78]',
      ], densityTier);
    }
    if (cell.accuracy >= 45) {
      // accent (balanced)
      return densityClass([
        'bg-accent/[0.16]',
        'bg-accent/[0.32]',
        'bg-accent/[0.52]',
        'bg-accent/[0.75]',
      ], densityTier);
    }
    return densityClass([
      'bg-rose/[0.16]',
      'bg-rose/[0.32]',
      'bg-rose/[0.52]',
      'bg-rose/[0.75]',
    ], densityTier);
  }

  // No reviews yet → density-only in muted accent
  return densityClass([
    'bg-accent/[0.10]',
    'bg-accent/[0.22]',
    'bg-accent/[0.38]',
    'bg-accent/[0.58]',
  ], densityTier);
}

function densityClass(scale: string[], tier: number): { bg: string; ring: string } {
  return { bg: scale[Math.max(0, Math.min(tier - 1, scale.length - 1))], ring: '' };
}

function Legend({ hasReviews }: { hasReviews: boolean }) {
  if (!hasReviews) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-medium text-ink-faint/55 uppercase tracking-[0.22em]">Density</span>
        <span className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.025]" />
        <span className="w-2.5 h-2.5 rounded-[2px] bg-accent/[0.22]" />
        <span className="w-2.5 h-2.5 rounded-[2px] bg-accent/[0.38]" />
        <span className="w-2.5 h-2.5 rounded-[2px] bg-accent/[0.58]" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Tone color="bg-rose/[0.55]" label="< 45%" />
      <Tone color="bg-accent/[0.55]" label="45–75%" />
      <Tone color="bg-emerald/[0.55]" label="75%+" />
    </div>
  );
}

function Tone({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2.5 h-2.5 rounded-[2px]', color)} />
      <span className="text-[9px] font-medium text-ink-faint/65 uppercase tracking-[0.18em] tabular-nums">{label}</span>
    </div>
  );
}

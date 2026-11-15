import { withAlpha } from './categoryColours';

// Small reusable charts for the Top 5 area. Every one shows its value as real
// text as well, so nothing depends on colour alone.

export function formatScore(score: number | null | undefined): string {
  return score === null || score === undefined ? '–' : score.toFixed(1);
}

const TRACK = '#2d2f36';

/**
 * Score ring: a ring filled in proportion to the score (out of 100), the score
 * as normal text in the middle and "Top5 Score" underneath.
 */
export function ScoreRing({ score, colour, size = 72, gold = false }: { score: number | null; colour: string; size?: number; gold?: boolean }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const fraction = score === null ? 0 : Math.min(1, Math.max(0, score / 100));
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" width={size} height={size} aria-hidden="true" className="-rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke={TRACK} strokeWidth="3.2" />
          {fraction > 0 && (
            <circle
              cx="18" cy="18" r={radius} fill="none" stroke={colour} strokeWidth="3.2" strokeLinecap="round"
              strokeDasharray={`${fraction * circumference} ${circumference}`}
            />
          )}
        </svg>
        <span
          className="text-display absolute inset-0 flex items-center justify-center text-white"
          style={{ fontSize: Math.round(size * 0.34), ...(gold ? { color: '#f4c95d' } : {}) }}
        >
          {formatScore(score)}
          {score !== null && <span className="sr-only"> out of 100</span>}
        </span>
      </div>
      <span className="text-[11px] font-semibold leading-none" style={{ color: colour }}>Top5 Score</span>
    </div>
  );
}

/** Compact score for tables: the number in a small chip edged in the category colour. */
export function ScoreChip({ score, colour, gold = false }: { score: number | null; colour: string; gold?: boolean }) {
  return (
    <span
      className="text-display inline-block min-w-[3rem] rounded-md border px-2 py-0.5 text-center text-base text-white"
      style={{ borderColor: colour, backgroundColor: withAlpha(colour, 0.16), ...(gold ? { color: '#f4c95d' } : {}) }}
    >
      {formatScore(score)}
    </span>
  );
}

const LEVELS: Record<string, number> = { Easy: 1, Average: 2, Hard: 3 };

/** Three-step meter (1, 2 or 3 steps filled for Easy, Average, Hard) plus the word. */
export function OpponentsMeter({ level, colour, align = 'left' }: {
  level: string | null;
  colour: string;
  align?: 'left' | 'center';
}) {
  const steps = (level && LEVELS[level]) || 0;
  return (
    <div className={align === 'center' ? 'inline-flex flex-col items-center' : 'flex flex-col items-start'}>
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map(step => (
          <span
            key={step}
            className="h-1.5 w-[22px] rounded-full"
            style={{ backgroundColor: step <= steps ? colour : TRACK }}
          />
        ))}
      </div>
      <span className="mt-1 text-sm font-semibold text-gray-100">
        {level ?? '–'}
        {steps > 0 && <span className="sr-only"> ({steps} of 3)</span>}
      </span>
    </div>
  );
}

/** Thin bar showing a size from 0 to 1. Decorative: the value is always shown as text beside it. */
export function ThinBar({ fraction, colour }: { fraction: number; colour: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: TRACK }} aria-hidden="true">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%`, backgroundColor: colour }}
      />
    </div>
  );
}

/** A number for a stat bar, or null when the stat is empty. "9–0–1" (won–drawn–lost) counts its wins. */
function barNumber(value: string | number | null): number | null {
  if (value === null || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

/**
 * Bar sizes (0 to 1) for each row's five stats, relative to the best value
 * among the rows shown. Higher is better, except where lowerIsBetter is set:
 * there the lowest value is the best and gets the full bar.
 */
export function statBarFractions(
  rows: (string | number | null)[][],
  lowerIsBetter: boolean[],
): (number | null)[][] {
  const columns = lowerIsBetter.length;
  const numbers = rows.map(row => Array.from({ length: columns }, (_, i) => barNumber(row[i] ?? null)));
  return numbers.map(row => row.map((n, i) => {
    if (n === null) return null;
    const all = numbers.map(r => r[i]).filter((v): v is number => v !== null);
    if (lowerIsBetter[i]) {
      const best = Math.min(...all);
      return n <= best ? 1 : best <= 0 ? 0 : best / n;
    }
    const best = Math.max(...all);
    return best <= 0 ? 0 : Math.max(0, n) / best;
  }));
}

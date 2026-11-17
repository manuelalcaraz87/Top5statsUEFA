import type { ReactNode } from 'react';
import type { Category, Top5Entry } from './top5Data';
import { formatScore } from './charts';
import { formatWeight } from '../../services/scoresService';

// The two side panels next to the ranked cards.

const MARK = '#9CA3AF';
const TRACK = '#2d2f36';

function Panel({ title, children, live = false }: { title: string; children: ReactNode; live?: boolean }) {
  return (
    <section aria-live={live ? 'polite' : undefined} className="rounded-xl border border-[#2a2c33] bg-[#16181d] p-4">
      <h4 className="text-display mb-3 text-sm text-white">{title}</h4>
      {children}
    </section>
  );
}

/** "Where the top 5 sit": a 0 to 100 scale, a mark at 50 and one dot per row shown. */
export function WherePanel({ entries, category }: { entries: Top5Entry[]; category: Category }) {
  const scored = entries.map((e, i) => ({ e, rank: i + 1 })).filter(x => x.e.top5Score !== null);
  if (scored.length === 0) return null;
  const description =
    `Scale from 0 to 100. 50 is an average ${category.noun}. ` +
    scored.map(x => `Number ${x.rank}, ${x.e.name}: ${formatScore(x.e.top5Score)}`).join('. ') + '.';
  return (
    <Panel title={`Where the top ${entries.length} sit`}>
      <div role="img" aria-label={description} className="px-2 pb-1 pt-5">
        <div className="relative h-2 rounded-full" style={{ backgroundColor: TRACK }}>
          <span
            className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-gray-300"
            aria-hidden="true"
          >
            Average 50
          </span>
          <span
            className="absolute -bottom-1.5 -top-1.5 left-1/2 w-0.5 -translate-x-1/2"
            style={{ backgroundColor: MARK }}
            aria-hidden="true"
          />
          {[...scored].reverse().map(({ e, rank }) => (
            <span
              key={e.key}
              className="absolute top-1/2 rounded-full border-2 border-[#16181d]"
              aria-hidden="true"
              style={{
                left: `${e.top5Score}%`,
                width: rank === 1 ? 16 : 12,
                height: rank === 1 ? 16 : 12,
                transform: 'translate(-50%, -50%)',
                backgroundColor: category.colour,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-gray-400" aria-hidden="true">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-300">
        Each dot is one of the top {entries.length}: {scored.map(x => formatScore(x.e.top5Score)).join(', ')}.
        The grey mark is an average {category.noun}.
      </p>
    </Panel>
  );
}

function signed(n: number): string {
  if (n === 0) return 'No change';
  return `${n > 0 ? '+' : '−'}${Math.abs(n).toFixed(1)} points`;
}

/** Drops a trailing penalty note, e.g. "Goals per 90 (penalty = ½)" -> "Goals per 90" (the rule is explained in "How this score is calculated"). */
function shortLabel(label: string): string {
  return label.replace(/\s*\([^)]*penalt[^)]*\)\s*$/i, '');
}

/** "Why this score": one bar per ingredient of the chosen row, with a mark at 50. */
export function WhyPanel({ entry, rank, category }: { entry: Top5Entry; rank: number; category: Category }) {
  const ingredients = entry.ingredients ?? [];
  const title = `Why ${entry.name} scores ${formatScore(entry.top5Score)}`;
  const hasAdjustment = entry.clAdjustment !== null && entry.clAdjustment !== undefined;
  return (
    <Panel title={title} live>
      <p className="sr-only">Number {rank} in the list.</p>
      {ingredients.length === 0 ? (
        <p className="text-sm text-gray-400">No current data</p>
      ) : (
        <ul className="space-y-3">
          {ingredients.map(item => (
            <li key={item.key}>
              <div className="mb-1 flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-sm leading-tight text-gray-100">{shortLabel(item.label)}</span>
                  <span className="block text-xs leading-tight text-gray-400">{formatWeight(item.weight)} of score</span>
                </span>
                <span className="text-sm font-bold tabular-nums text-white">{item.score.toFixed(1)}</span>
              </div>
              <div
                role="meter"
                aria-label={`${item.label}, ${formatWeight(item.weight)} of the score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.score}
                aria-valuetext={`${item.score.toFixed(1)} out of 100`}
                className="relative h-2 rounded-full"
                style={{ backgroundColor: TRACK }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, item.score))}%`, backgroundColor: category.colour }}
                />
                <span
                  className="absolute -bottom-1 -top-1 left-1/2 w-0.5 -translate-x-1/2"
                  style={{ backgroundColor: MARK }}
                  aria-hidden="true"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasAdjustment && (
        <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-[#2a2c33] pt-3 text-sm">
          <span className="text-gray-100">Champions League adjustment</span>
          <span className="font-bold tabular-nums text-white">{signed(entry.clAdjustment as number)}</span>
        </p>
      )}
      {ingredients.length > 0 && (
        <p className="mt-3 text-sm text-gray-300">
          Each bar runs from 0 to 100. The grey mark is 50, an average {category.noun} on that measure.
          {hasAdjustment ? ' The Champions League adjustment is added after the bars are weighted.' : ''}
        </p>
      )}
    </Panel>
  );
}

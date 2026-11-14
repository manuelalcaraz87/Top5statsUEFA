import { ClubCrest } from '../ClubCrest';
import { LeagueBadge } from '../LeagueBadge';
import { NoCurrentData } from '../NoCurrentData';
import type { Category, CategoryData, StatValue } from './top5Data';

// Building blocks shared by the Top 5 tabs.

export const DASH = '–';
export const SCORE_CAPTION = 'Score coming soon';

export function formatStat(value: StatValue): string {
  return value === null || value === '' ? DASH : String(value);
}

/** Top5 Score: shows "–" with "Score coming soon" until the score exists. */
export function ScoreValue({ score, large = false }: { score: number | null; large?: boolean }) {
  return (
    <div className={large ? 'text-center' : ''}>
      <p className={`font-bold tabular-nums text-white ${large ? 'text-4xl' : 'text-base'}`}>
        {score === null ? DASH : score}
      </p>
      {score === null && (
        <p className={`text-gray-500 ${large ? 'mt-1 text-xs' : 'text-[10px]'}`}>{SCORE_CAPTION}</p>
      )}
    </div>
  );
}

export function LastUpdated({ time }: { time: Date | null }) {
  return (
    <p className="text-xs text-gray-500">
      Last updated{' '}
      {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : DASH}
    </p>
  );
}

function HowCalculated() {
  return (
    <div className="mt-6 rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h4 className="mb-1 text-sm font-medium text-gray-200">How this score is calculated</h4>
      <p className="text-sm text-gray-500">Coming soon</p>
    </div>
  );
}

/** One category tab: top-5 table, last-updated time and the explanation panel. */
export function CategoryTable({ category, data, title }: {
  category: Category;
  data: CategoryData;
  /** Heading above the table; defaults to "Top 5 <category>". */
  title?: string;
}) {
  const { entries, loading, lastUpdated } = data;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-gray-100">{title ?? `Top 5 ${category.label}`}</h3>
        <LastUpdated time={lastUpdated} />
      </div>

      {entries.length === 0 ? (
        <NoCurrentData loading={loading} />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="px-2 pb-3 text-left font-normal">#</th>
                <th className="pb-3 text-left font-normal">Name</th>
                <th className="px-2 pb-3 text-center font-normal">Top5 Score</th>
                {category.statLabels.map(label => (
                  <th key={label} className="px-2 pb-3 text-center font-normal">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.key} className="border-b border-gray-800 transition-colors hover:bg-white/5">
                  <td className="px-2 py-3 text-sm text-gray-400">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <ClubCrest club={entry.club} size={28} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-100">{entry.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          {entry.club !== entry.name && (
                            <span className="truncate text-xs text-gray-400">{entry.club}</span>
                          )}
                          <LeagueBadge league={entry.league} size={16} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center"><ScoreValue score={entry.top5Score} /></td>
                  {entry.stats.map((value, i) => (
                    <td key={i} className="px-2 py-3 text-center text-sm tabular-nums text-gray-200">
                      {formatStat(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <HowCalculated />
    </div>
  );
}

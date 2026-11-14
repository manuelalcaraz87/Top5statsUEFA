import { ClubCrest } from '../ClubCrest';
import { LeagueBadge } from '../LeagueBadge';
import { NoCurrentData } from '../NoCurrentData';
import { CATEGORIES, CATEGORY_ORDER, type CategoryData, type CategoryId, type Top5Entry, type Category } from './top5Data';
import { DASH, LastUpdated, SCORE_CAPTION, ScoreValue, formatStat } from './shared';

// Top 5 tab: one card per category showing the current leader.

function LeaderCard({ category, leader, loading }: { category: Category; leader?: Top5Entry; loading: boolean }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{category.leaderLabel}</p>

      {!leader ? (
        <NoCurrentData loading={loading} compact />
      ) : (
        <>
          <div className="mb-1">
            <LeagueBadge league={leader.league} size={20} />
          </div>
          <div className="flex items-center gap-2.5">
            <ClubCrest club={leader.club} size={36} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{leader.name}</p>
              {leader.club !== leader.name && <p className="truncate text-xs text-gray-400">{leader.club}</p>}
            </div>
          </div>

          <div className="my-4 rounded-lg border border-gray-800 bg-[#111111] px-3 py-4">
            <p className="mb-1 text-center text-[11px] uppercase tracking-wide text-gray-500">Top5 Score</p>
            <ScoreValue score={leader.top5Score} large />
          </div>

          <p className="mb-3 text-xs text-gray-400">
            Opponents faced: <span className="text-gray-200">{leader.opponentsFaced ?? DASH}</span>
            {leader.opponentsFaced === null && <span className="block text-[10px] text-gray-500">{SCORE_CAPTION}</span>}
          </p>

          <dl className="space-y-1.5 border-t border-gray-800 pt-3">
            {category.statLabels.map((label, i) => (
              <div key={label} className="flex items-baseline justify-between gap-2 text-sm">
                <dt className="text-gray-400">{label}</dt>
                <dd className="tabular-nums text-gray-100">{formatStat(leader.stats[i])}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}

export function Top5Tab({ data }: { data: Record<CategoryId, CategoryData> }) {
  const times = CATEGORY_ORDER.map(id => data[id].lastUpdated).filter((t): t is Date => t !== null);
  const latest = times.length ? new Date(Math.max(...times.map(t => t.getTime()))) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-gray-100">Current leaders</h3>
          <p className="text-sm text-gray-500">La Liga, EPL, Serie A, Bundesliga and Ligue 1</p>
        </div>
        <LastUpdated time={latest} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {CATEGORY_ORDER.map(id => (
          <LeaderCard key={id} category={CATEGORIES[id]} leader={data[id].entries[0]} loading={data[id].loading} />
        ))}
      </div>
    </div>
  );
}

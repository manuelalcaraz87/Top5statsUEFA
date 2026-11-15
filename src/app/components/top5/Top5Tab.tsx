import { ClubCrest } from '../ClubCrest';
import { LeagueBadge } from '../LeagueBadge';
import { NoCurrentData } from '../NoCurrentData';
import { CATEGORIES, CATEGORY_ORDER, type CategoryData, type CategoryId, type Top5Entry, type Category, type Top5League } from './top5Data';
import { LastUpdated, OpponentsInfo, formatStat } from './shared';
import { OpponentsMeter, ScoreRing } from './charts';

// Top 5 tab: one card per category showing the current leader.

function LeaderCard({ category, leader, loading }: { category: Category; leader?: Top5Entry; loading: boolean }) {
  return (
    <div
      className="flex flex-col rounded-xl border border-[#2a2c33] border-t-4 bg-[#16181d] p-4"
      style={{ borderTopColor: category.colour }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: category.colour }}
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: category.colour }} />
          {category.leaderLabel}
        </p>
        {leader && <LeagueBadge league={leader.league} size={20} />}
      </div>

      {!leader ? (
        <NoCurrentData loading={loading} compact />
      ) : (
        <>
          <div className="flex min-h-[2.75rem] items-center gap-2.5">
            <ClubCrest club={leader.club} size={36} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{leader.name}</p>
              {leader.club !== leader.name && <p className="truncate text-xs text-gray-300">{leader.club}</p>}
            </div>
          </div>

          <div className="my-4 flex items-center gap-4">
            <ScoreRing score={leader.top5Score} colour={category.colour} size={76} />
            <div>
              <p className="mb-1 text-[11px] leading-tight text-gray-400">
                Opponents faced<OpponentsInfo />
              </p>
              <OpponentsMeter level={leader.opponentsFaced} colour={category.colour} />
            </div>
          </div>

          <dl className="space-y-1.5 border-t border-gray-800 pt-3">
            {category.statLabels.map((label, i) => (
              <div key={label} className="flex items-baseline justify-between gap-2 text-sm">
                <dt className="text-gray-300">{label}</dt>
                <dd className="tabular-nums text-gray-100">{formatStat(leader.stats[i])}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}

export function Top5Tab({ data, league }: { data: Record<CategoryId, CategoryData>; league?: Top5League }) {
  const times = CATEGORY_ORDER.map(id => data[id].lastUpdated).filter((t): t is Date => t !== null);
  const latest = times.length ? new Date(Math.max(...times.map(t => t.getTime()))) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-white">
            {league ? 'Current leaders' : 'The best in Europe right now'}
          </h3>
          <p className="text-sm text-gray-300">
            {league
              ? league.label ?? league.name
              : 'Leaders by Top5 Score across the five leagues and the Champions League.'}
          </p>
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

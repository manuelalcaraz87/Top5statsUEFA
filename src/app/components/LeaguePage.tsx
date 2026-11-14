import { LeagueBadge } from './LeagueBadge';
import { TopStatsSection } from './TopStatsSection';
import { LEAGUES } from '../data/leagueData';

// League page (also used for the Champions League): a plain-text heading
// with the league's text chip, then the same Top 5 area as the home page,
// filtered to this one competition. The match strip is shown above it by App.

interface League {
  id: string;
  /** Short name, e.g. "EPL" or "UCL" (used by the text chip and the data). */
  name: string;
  /** Full name for the heading, e.g. "Premier League". */
  label?: string;
}

export function LeaguePage({ league }: { league: League }) {
  if (!LEAGUES.some(l => l.id === league.id)) return null;

  return (
    <div key={league.id}>
      <div className="border-b border-gray-900 bg-[#0d0d0d]">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <LeagueBadge league={league.name} size={28} />
          <h1 className="text-lg font-bold text-white">{league.label ?? league.name}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <TopStatsSection key={league.id} league={{ id: league.id, name: league.name, label: league.label }} />
      </div>
    </div>
  );
}

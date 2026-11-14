import { useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { LeagueBadge } from './LeagueBadge';
import { NoCurrentData } from './NoCurrentData';
import { useMatches } from '../hooks/useMatches';
import { useClubStrengths } from '../hooks/useClubStrengths';
import type { NormalizedMatch } from '../services/footballDataService';

// Match strip shown at the top of every page. Real football-data.org matches
// only: live now, finished today and upcoming, grouped by league in one row
// that scrolls sideways. Same neutral colours for every league.

const LEAGUE_ORDER = ['La Liga', 'EPL', 'Serie A', 'Bundesliga', 'Ligue 1', 'UCL'];
const STATUS_ORDER: Record<NormalizedMatch['status'], number> = { live: 0, finished: 1, upcoming: 2 };

function isToday(utcDate: string): boolean {
  const d = new Date(utcDate);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

/** Keep live, finished-today and upcoming matches; live first, then by kick-off. */
function stripMatches(all: NormalizedMatch[]): NormalizedMatch[] {
  return all
    .filter(m => m.status !== 'finished' || isToday(m.utcDate))
    .sort((a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
}

interface MatchesSectionProps {
  /**
   * On a league or Champions League page: show only this competition
   * (e.g. "epl" or "ucl"). Left out on the home page, which shows them all.
   */
  onlyLeagueId?: string;
}

export function MatchesSection({ onlyLeagueId }: MatchesSectionProps) {
  const { allMatches, loading, error, refresh } = useMatches();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Never fall back to other competitions: if the selected one has no
  // matches, the strip says "No matches in the next few days".
  const matches = stripMatches(allMatches)
    .filter(m => !onlyLeagueId || m.leagueId === onlyLeagueId);
  const byLeague = matches.reduce<Record<string, NormalizedMatch[]>>((acc, m) => {
    (acc[m.leagueName] ??= []).push(m);
    return acc;
  }, {});

  const leagues = [
    ...LEAGUE_ORDER.filter(l => byLeague[l]),
    ...Object.keys(byLeague).filter(l => !LEAGUE_ORDER.includes(l)),
  ];

  const strengths = useClubStrengths(matches.map(m => m.leagueId));
  const hasLive = matches.some(m => m.status === 'live');

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(200, el.clientWidth * 0.8);
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  let empty: ReactNode = null;
  if (leagues.length === 0) {
    if (loading) empty = <NoCurrentData loading compact />;
    else if (error) empty = <NoCurrentData compact />;
    else empty = (
      <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-3">
        <p className="text-sm text-gray-500">No matches in the next few days</p>
      </div>
    );
  }

  const buttonClass = 'rounded-lg bg-[#2a2a2a] p-2 text-gray-300 transition-colors hover:bg-[#333333] hover:text-white';

  return (
    <section className="border-b border-gray-800 bg-[#141414]" aria-label="Matches">
      <div className="mx-auto max-w-[1800px] px-4 py-3 sm:px-6 lg:px-8">
        {/* Header and legend */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Matches</h2>
              {hasLive && (
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  Live
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-gray-500">Bar and number show each club's strength.</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button onClick={refresh} className={buttonClass} title="Refresh" aria-label="Refresh matches">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {leagues.length > 0 && (
              <>
                <button onClick={() => scroll('left')} className={buttonClass} aria-label="Scroll left">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => scroll('right')} className={buttonClass} aria-label="Scroll right">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {empty}

        {/* One sideways-scrolling row: league groups, each with its cards */}
        {leagues.length > 0 && (
          <div
            ref={scrollerRef}
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {leagues.map(leagueName => {
              const leagueMatches = byLeague[leagueName];
              const leagueStrengths = strengths[leagueMatches[0].leagueId] ?? {};
              return (
                <div key={leagueName} className="flex-shrink-0">
                  <div className="mb-2 flex items-center gap-2">
                    <LeagueBadge league={leagueName} size={22} />
                    <h3 className="text-xs font-semibold text-gray-200">{leagueName}</h3>
                    <span className="text-[10px] text-gray-500">{leagueMatches.length}</span>
                  </div>
                  <div className="flex gap-2">
                    {leagueMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        homeStrength={leagueStrengths[match.homeTeam]}
                        awayStrength={leagueStrengths[match.awayTeam]}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

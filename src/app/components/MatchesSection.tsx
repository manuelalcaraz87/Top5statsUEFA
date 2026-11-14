import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { LeagueBadge } from './LeagueBadge';
import { NoCurrentData } from './NoCurrentData';
import { useMatches } from '../hooks/useMatches';
import { useClubStrengths } from '../hooks/useClubStrengths';
import type { NormalizedMatch } from '../services/footballDataService';

// Match strip shown at the top of every page. Real football-data.org matches
// only. Home page: one group per competition in a row that scrolls sideways,
// each group paging through its own matches 3 at a time (1 on a phone), with a
// row of chips above that jump to a group. League pages: a plain wrapping grid.
// Same neutral colours for every league.

const LEAGUE_ORDER = ['La Liga', 'EPL', 'Serie A', 'Bundesliga', 'Ligue 1', 'UCL'];
const CARD_GAP_PX = 8;
const BUTTON_CLASS = 'rounded-lg bg-[#2a2a2a] p-2 text-gray-300 transition-colors hover:bg-[#333333] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[#2a2a2a] disabled:hover:text-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400';

const kickoff = (m: NormalizedMatch) => new Date(m.utcDate).getTime();

/** Matches in play first, then upcoming by kick-off time, then finished with the most recent first. */
function sortMatches(all: NormalizedMatch[]): NormalizedMatch[] {
  const live = all.filter(m => m.status === 'live').sort((a, b) => kickoff(a) - kickoff(b));
  const upcoming = all.filter(m => m.status === 'upcoming').sort((a, b) => kickoff(a) - kickoff(b));
  const finished = all.filter(m => m.status === 'finished').sort((a, b) => kickoff(b) - kickoff(a));
  return [...live, ...upcoming, ...finished];
}

/** True on screens at least as wide as `minWidth` (Tailwind's "sm" is 640). */
function useWideScreen(minWidth = 640): boolean {
  const query = `(min-width: ${minWidth}px)`;
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return wide;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Strengths = ReturnType<typeof useClubStrengths>;

/** One competition on the home page: header with arrows, then its cards, paged. */
function CompetitionGroup({ leagueName, matches, strengths, perPage }: {
  leagueName: string;
  matches: NormalizedMatch[];
  strengths: Strengths;
  perPage: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [first, setFirst] = useState(0); // index of the first card in view
  const total = matches.length;

  const updatePosition = useCallback(() => {
    const el = scrollerRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    setFirst(Math.max(0, Math.min(total - 1, Math.round(el.scrollLeft / (card.offsetWidth + CARD_GAP_PX)))));
  }, [total]);

  useEffect(() => { updatePosition(); }, [updatePosition, perPage]);

  const page = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({
      left: direction * perPage * (card.offsetWidth + CARD_GAP_PX),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const last = Math.min(first + perPage, total);
  const position = total === 0 ? '' : last === first + 1 ? `${first + 1} of ${total}` : `${first + 1}–${last} of ${total}`;
  const atStart = first <= 0;
  const atEnd = last >= total;
  const step = perPage === 1 ? 'match' : `${perPage} matches`;

  return (
    <div
      data-group={leagueName}
      role="group"
      aria-label={`${leagueName} matches`}
      className="w-[min(320px,calc(100vw-2rem))] flex-shrink-0 snap-start scroll-mx-4 sm:w-[544px] sm:scroll-mx-0"
    >
      <div className="mb-2 flex items-center gap-2">
        <LeagueBadge league={leagueName} size={22} />
        <h3 className="min-w-0 truncate text-xs font-semibold text-gray-200">{leagueName}</h3>
        {matches[0]?.matchday != null && (
          <span className="hidden whitespace-nowrap text-[10px] text-gray-500 sm:inline">Matchday {matches[0].matchday}</span>
        )}
        {total > 0 && (
          <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
            <span className="text-[11px] tabular-nums text-gray-400" aria-live="polite">{position}</span>
            <button type="button" onClick={() => page(-1)} disabled={atStart} className={BUTTON_CLASS}
              aria-label={`Previous ${step}, ${leagueName}`}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => page(1)} disabled={atEnd} className={BUTTON_CLASS}
              aria-label={`Next ${step}, ${leagueName}`}>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-sm text-gray-500">No matches</p>
        </div>
      ) : (
        <div
          ref={scrollerRef}
          onScroll={updatePosition}
          tabIndex={0}
          aria-label={`${leagueName} match cards, scroll sideways`}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scrollbar-hide focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {matches.map(match => (
            <div key={match.id} className="w-full flex-shrink-0 snap-start sm:w-[calc((100%-1rem)/3)]">
              <MatchCard match={match} homeStrength={strengths[match.id]?.home} awayStrength={strengths[match.id]?.away} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MatchesSectionProps {
  /**
   * On a league or Champions League page: show only this competition
   * (e.g. "epl" or "ucl"). Left out on the home page, which shows them all.
   */
  onlyLeagueId?: string;
}

export function MatchesSection({ onlyLeagueId }: MatchesSectionProps) {
  const { allMatches, loading, waking, error, refresh } = useMatches(onlyLeagueId);
  const stripRef = useRef<HTMLDivElement>(null);
  const perPage = useWideScreen() ? 3 : 1;

  // Never fall back to other competitions: a league page shows only its own.
  const matches = sortMatches(allMatches.filter(m => !onlyLeagueId || m.leagueId === onlyLeagueId));
  const byLeague = matches.reduce<Record<string, NormalizedMatch[]>>((acc, m) => {
    (acc[m.leagueName] ??= []).push(m);
    return acc;
  }, {});

  const leagues = [
    ...LEAGUE_ORDER.filter(l => byLeague[l]),
    ...Object.keys(byLeague).filter(l => !LEAGUE_ORDER.includes(l)),
  ];
  // Home page: every competition gets a group and a chip, even with no matches.
  const groups = [...LEAGUE_ORDER, ...leagues.filter(l => !LEAGUE_ORDER.includes(l))];

  const strengths = useClubStrengths(matches);
  const hasLive = matches.some(m => m.status === 'live');

  const jumpTo = (leagueName: string) => {
    const group = Array.from(stripRef.current?.children ?? [])
      .find(el => (el as HTMLElement).dataset.group === leagueName);
    group?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
  };

  let empty: ReactNode = null;
  if (leagues.length === 0) {
    if (loading && waking) empty = (
      <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-3">
        <p className="text-sm italic text-gray-400">Waking up live data, this can take up to a minute</p>
      </div>
    );
    else if (loading) empty = <NoCurrentData loading compact />;
    else if (error) empty = <NoCurrentData compact />;
    else if (onlyLeagueId) empty = (
      <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-3">
        <p className="text-sm text-gray-500">No matches in the next few days</p>
      </div>
    );
  }
  // The home page shows its chips and groups only once there is an answer.
  const showHome = !onlyLeagueId && !(leagues.length === 0 && (loading || error));

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
          <button type="button" onClick={refresh} className={`${BUTTON_CLASS} flex-shrink-0`} title="Refresh" aria-label="Refresh matches">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {empty}

        {/* Home page: one chip per competition; tapping one scrolls to its group */}
        {showHome && (
          <nav aria-label="Jump to a competition" className="mb-3 flex flex-wrap gap-2">
            {groups.map(leagueName => {
              const count = byLeague[leagueName]?.length ?? 0;
              const label = count > 0 ? `${count} ${count === 1 ? 'match' : 'matches'}` : 'no matches';
              return (
                <button
                  key={leagueName}
                  type="button"
                  onClick={() => jumpTo(leagueName)}
                  aria-label={`${leagueName}, ${label}. Go to ${leagueName}`}
                  className={`flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-2 py-1 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400 ${
                    count > 0 ? 'bg-[#1a1a1a] text-gray-200 hover:border-[#3a3a3a] hover:bg-[#222222]' : 'bg-[#141414] text-gray-600 hover:border-[#3a3a3a]'
                  }`}
                >
                  <span className={count > 0 ? '' : 'opacity-50'} aria-hidden="true"><LeagueBadge league={leagueName} size={20} /></span>
                  <span>{leagueName} · {count > 0 ? count : 'no matches'}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Home page: one sideways-scrolling row of competition groups */}
        {showHome && (
          <div
            ref={stripRef}
            className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {groups.map(leagueName => (
              <CompetitionGroup
                key={leagueName}
                leagueName={leagueName}
                matches={byLeague[leagueName] ?? []}
                strengths={strengths}
                perPage={perPage}
              />
            ))}
          </div>
        )}

        {/* League and Champions League pages: a wrapping grid, no paging */}
        {onlyLeagueId && matches.length > 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {matches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                homeStrength={strengths[match.id]?.home}
                awayStrength={strengths[match.id]?.away}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

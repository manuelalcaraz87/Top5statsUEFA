import { ChevronLeft, ChevronRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { LeagueBadge } from './LeagueBadge';
import { NoCurrentData } from './NoCurrentData';
import { useMatches } from '../hooks/useMatches';
// v2 – stable hook order

// ── Static config ───────────────────────────────────────────────────

// League display order
const LEAGUE_ORDER = ['La Liga', 'EPL', 'Serie A', 'Bundesliga', 'Ligue 1', 'UCL'];

interface League {
  id: string;
  name: string;
  color: string;
  accentColor: string;
}

interface MatchesSectionProps {
  selectedLeague: League;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MatchesSection({ selectedLeague }: MatchesSectionProps) {
  const { matchesByLeague, allMatches, hasLive, loading, error, lastUpdated, refresh } = useMatches();

  // Live data only; if there are no matches the section says "No current data"
  const activeMBL = matchesByLeague;

  const isUsingLive = allMatches.length > 0;

  // Sort leagues in preferred order, append any extras
  const leagues = [
    ...LEAGUE_ORDER.filter(l => activeMBL[l]),
    ...Object.keys(activeMBL).filter(l => !LEAGUE_ORDER.includes(l)),
  ];

  const handleScroll = (leagueId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`matches-${leagueId}`);
    if (!container) return;
    container.scrollTo({ left: container.scrollLeft + (direction === 'left' ? -170 : 170), behavior: 'smooth' });
  };

  const handleMainScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('main-matches-container');
    if (!container) return;
    container.scrollTo({ left: container.scrollLeft + (direction === 'left' ? -550 : 550), behavior: 'smooth' });
  };

  return (
    <div className="bg-[#1a1a1a] border-y border-gray-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-sm font-semibold">Match Cards</h2>
            {/* Live / offline indicator */}
            {isUsingLive ? (
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                {hasLive && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
                {lastUpdated && !hasLive && (
                  <span className="text-[10px] text-gray-500">
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            ) : error ? (
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            ) : loading ? (
              <span className="text-[10px] text-gray-500 animate-pulse">Loading…</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isUsingLive && (
              <button
                onClick={refresh}
                className="p-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#333333] hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => handleMainScroll('left')}  className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-colors"><ChevronLeft  className="w-4 h-4" /></button>
            <button onClick={() => handleMainScroll('right')} className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* League panels */}
        {leagues.length === 0 && <NoCurrentData title="Matches" loading={loading} />}
        <div
          id="main-matches-container"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {leagues.map((leagueName) => {
            const leagueMatches = activeMBL[leagueName] ?? [];
            const liveCount = leagueMatches.filter(m => m.status === 'live').length;

            return (
              <div
                key={leagueName}
                className="rounded-lg flex-shrink-0 overflow-hidden border border-[#2a2a2a]"
                style={{ width: '530px' }}
              >
                {/* League header */}
                <div className="relative h-14 overflow-hidden" style={{ background: 'linear-gradient(to right, #1a1a1a 0%, #141414 55%, #0d0d0d 100%)' }}>
                  <div className="relative z-10 flex items-center justify-between h-full px-3">
                    <div className="flex items-center gap-2.5">
                      <LeagueBadge league={leagueName} size={32} />
                      <div>
                        <h3 className="text-white text-sm font-semibold leading-tight">{leagueName}</h3>
                        <p className="text-gray-300 text-[10px]">
                          {`${leagueMatches.length} matches${liveCount > 0 ? ` · ${liveCount} live` : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleScroll(leagueName, 'left')}  className="p-1 bg-black/40 text-white rounded hover:bg-black/60 transition-colors backdrop-blur-sm"><ChevronLeft  className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleScroll(leagueName, 'right')} className="p-1 bg-black/40 text-white rounded hover:bg-black/60 transition-colors backdrop-blur-sm"><ChevronRight className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>

                {/* Match cards */}
                <div className="bg-[#2a2a2a] p-3">
                  <div
                    id={`matches-${leagueName}`}
                    className="flex gap-2 overflow-x-hidden hover:overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {leagueMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={{
                          id:          match.id,
                          homeTeam:    match.homeTeam,
                          awayTeam:    match.awayTeam,
                          homeScore:   match.homeScore,
                          awayScore:   match.awayScore,
                          status:      match.status,
                          minute:      match.minute ?? undefined,
                          time:        match.time,
                          league:      match.leagueName,
                          leagueColor: match.leagueColor,
                        }}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { LeagueBadge } from './LeagueBadge';
import { useMatches } from '../hooks/useMatches';
import type { NormalizedMatch } from '../services/footballDataService';
// v2 – stable hook order

// ── Static images and config ───────────────────────────────────────────────────

const STADIUM_IMAGES: Record<string, string> = {
  'La Liga':    'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=600&q=75&fit=crop&auto=format',
  'EPL':        'https://images.unsplash.com/photo-1623793478409-50c0c0478d26?w=600&q=75&fit=crop&auto=format',
  'Serie A':    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&q=75&fit=crop&auto=format',
  'Bundesliga': 'https://images.unsplash.com/photo-1573559055341-51c1ced2b864?w=600&q=75&fit=crop&auto=format',
  'Ligue 1':    'https://images.unsplash.com/photo-1676746610993-fa0c050d1f6d?w=600&q=75&fit=crop&auto=format',
  'UCL':        'https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=600&q=75&fit=crop&auto=format',
};

// League display order
const LEAGUE_ORDER = ['La Liga', 'EPL', 'Serie A', 'Bundesliga', 'Ligue 1', 'UCL'];

// Static fallback when API is unavailable
const STATIC_MATCHES: NormalizedMatch[] = [
  { id: 1,  homeTeam: 'Real Madrid',   awayTeam: 'Barcelona',    homeScore: 2,    awayScore: 1,    status: 'live',     minute: 67, time: undefined, leagueCode: 'PD',  leagueName: 'La Liga',    leagueColor: '#ee8707', leagueId: 'la-liga',    utcDate: '' },
  { id: 2,  homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla',    homeScore: 2,    awayScore: 0,    status: 'finished', minute: null, time: undefined, leagueCode: 'PD',  leagueName: 'La Liga',    leagueColor: '#ee8707', leagueId: 'la-liga',    utcDate: '' },
  { id: 3,  homeTeam: 'Valencia',      awayTeam: 'Real Sociedad', homeScore: null, awayScore: null, status: 'upcoming', minute: null, time: '18:30',  leagueCode: 'PD',  leagueName: 'La Liga',    leagueColor: '#ee8707', leagueId: 'la-liga',    utcDate: '' },
  { id: 4,  homeTeam: 'Betis',         awayTeam: 'Villarreal',   homeScore: 1,    awayScore: 1,    status: 'live',     minute: 55, time: undefined, leagueCode: 'PD',  leagueName: 'La Liga',    leagueColor: '#ee8707', leagueId: 'la-liga',    utcDate: '' },
  { id: 5,  homeTeam: 'Man City',      awayTeam: 'Arsenal',      homeScore: 1,    awayScore: 1,    status: 'live',     minute: 45, time: undefined, leagueCode: 'PL',  leagueName: 'EPL',        leagueColor: '#3d195b', leagueId: 'epl',        utcDate: '' },
  { id: 6,  homeTeam: 'Liverpool',     awayTeam: 'Chelsea',      homeScore: null, awayScore: null, status: 'upcoming', minute: null, time: '17:30',  leagueCode: 'PL',  leagueName: 'EPL',        leagueColor: '#3d195b', leagueId: 'epl',        utcDate: '' },
  { id: 7,  homeTeam: 'Tottenham',     awayTeam: 'Man United',   homeScore: 2,    awayScore: 0,    status: 'finished', minute: null, time: undefined, leagueCode: 'PL',  leagueName: 'EPL',        leagueColor: '#3d195b', leagueId: 'epl',        utcDate: '' },
  { id: 8,  homeTeam: 'Newcastle',     awayTeam: 'Aston Villa',  homeScore: null, awayScore: null, status: 'upcoming', minute: null, time: '15:00',  leagueCode: 'PL',  leagueName: 'EPL',        leagueColor: '#3d195b', leagueId: 'epl',        utcDate: '' },
  { id: 9,  homeTeam: 'Inter Milan',   awayTeam: 'AC Milan',     homeScore: null, awayScore: null, status: 'upcoming', minute: null, time: '19:45',  leagueCode: 'SA',  leagueName: 'Serie A',    leagueColor: '#024494', leagueId: 'serie-a',    utcDate: '' },
  { id: 10, homeTeam: 'Juventus',      awayTeam: 'Napoli',       homeScore: 1,    awayScore: 1,    status: 'live',     minute: 82, time: undefined, leagueCode: 'SA',  leagueName: 'Serie A',    leagueColor: '#024494', leagueId: 'serie-a',    utcDate: '' },
  { id: 11, homeTeam: 'Roma',          awayTeam: 'Lazio',        homeScore: 2,    awayScore: 1,    status: 'finished', minute: null, time: undefined, leagueCode: 'SA',  leagueName: 'Serie A',    leagueColor: '#024494', leagueId: 'serie-a',    utcDate: '' },
  { id: 12, homeTeam: 'Atalanta',      awayTeam: 'Fiorentina',   homeScore: null, awayScore: null, status: 'upcoming', minute: null, time: '17:00',  leagueCode: 'SA',  leagueName: 'Serie A',    leagueColor: '#024494', leagueId: 'serie-a',    utcDate: '' },
  { id: 13, homeTeam: 'Bayern',        awayTeam: 'Dortmund',     homeScore: 3,    awayScore: 2,    status: 'finished', minute: null, time: undefined, leagueCode: 'BL1', leagueName: 'Bundesliga', leagueColor: '#d20515', leagueId: 'bundesliga', utcDate: '' },
  { id: 14, homeTeam: 'Leverkusen',    awayTeam: 'RB Leipzig',   homeScore: null, awayScore: null, status: 'upcoming', minute: null, time: '16:30',  leagueCode: 'BL1', leagueName: 'Bundesliga', leagueColor: '#d20515', leagueId: 'bundesliga', utcDate: '' },
  { id: 15, homeTeam: 'Frankfurt',     awayTeam: 'Stuttgart',    homeScore: 1,    awayScore: 0,    status: 'live',     minute: 34, time: undefined, leagueCode: 'BL1', leagueName: 'Bundesliga', leagueColor: '#d20515', leagueId: 'bundesliga', utcDate: '' },
  { id: 16, homeTeam: 'PSG',           awayTeam: 'Lyon',         homeScore: null, awayScore: null, status: 'upcoming', minute: null, time: '20:00',  leagueCode: 'FL1', leagueName: 'Ligue 1',    leagueColor: '#dae025', leagueId: 'ligue-1',    utcDate: '' },
  { id: 17, homeTeam: 'Monaco',        awayTeam: 'Marseille',    homeScore: 2,    awayScore: 2,    status: 'live',     minute: 78, time: undefined, leagueCode: 'FL1', leagueName: 'Ligue 1',    leagueColor: '#dae025', leagueId: 'ligue-1',    utcDate: '' },
  { id: 18, homeTeam: 'Lille',         awayTeam: 'Nice',         homeScore: 1,    awayScore: 0,    status: 'finished', minute: null, time: undefined, leagueCode: 'FL1', leagueName: 'Ligue 1',    leagueColor: '#dae025', leagueId: 'ligue-1',    utcDate: '' },
];

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

  // Use live data if available and non-empty, else fall back to static
  const activeMBL = allMatches.length > 0 ? matchesByLeague : (() => {
    const m: Record<string, NormalizedMatch[]> = {};
    for (const match of STATIC_MATCHES) {
      if (!m[match.leagueName]) m[match.leagueName] = [];
      m[match.leagueName].push(match);
    }
    return m;
  })();

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
                {/* Stadium image header */}
                <div className="relative h-14 overflow-hidden">
                  {STADIUM_IMAGES[leagueName] && (
                    <img src={STADIUM_IMAGES[leagueName]} alt={leagueName} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)' }} />
                  <div className="relative z-10 flex items-center justify-between h-full px-3">
                    <div className="flex items-center gap-2.5">
                      <LeagueBadge league={leagueName} size={32} />
                      <div>
                        <h3 className="text-white text-sm font-semibold leading-tight">{leagueName}</h3>
                        <p className="text-gray-300 text-[10px]">
                          {isUsingLive
                            ? `${leagueMatches.length} matches${liveCount > 0 ? ` · ${liveCount} live` : ''}`
                            : `${leagueMatches.length} matches today`}
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

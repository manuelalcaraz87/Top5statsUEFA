import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { LeagueBadge } from './LeagueBadge';

const STADIUM_IMAGES: Record<string, string> = {
  'La Liga':     'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=600&q=75&fit=crop&auto=format',
  'EPL':         'https://images.unsplash.com/photo-1623793478409-50c0c0478d26?w=600&q=75&fit=crop&auto=format',
  'Serie A':     'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&q=75&fit=crop&auto=format',
  'Bundesliga':  'https://images.unsplash.com/photo-1573559055341-51c1ced2b864?w=600&q=75&fit=crop&auto=format',
  'Ligue 1':     'https://images.unsplash.com/photo-1676746610993-fa0c050d1f6d?w=600&q=75&fit=crop&auto=format',
  'UCL':         'https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=600&q=75&fit=crop&auto=format',
};

interface League {
  id: string;
  name: string;
  color: string;
  accentColor: string;
}

interface MatchesSectionProps {
  selectedLeague: League;
}

const allMatches = [
  // La Liga
  {
    id: 1,
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    minute: 67,
    league: 'La Liga',
    leagueColor: '#ee8707',
  },
  {
    id: 2,
    homeTeam: 'Atletico Madrid',
    awayTeam: 'Sevilla',
    homeScore: 2,
    awayScore: 0,
    status: 'finished',
    league: 'La Liga',
    leagueColor: '#ee8707',
  },
  {
    id: 3,
    homeTeam: 'Valencia',
    awayTeam: 'Real Sociedad',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '18:30',
    league: 'La Liga',
    leagueColor: '#ee8707',
  },
  {
    id: 4,
    homeTeam: 'Betis',
    awayTeam: 'Villarreal',
    homeScore: 1,
    awayScore: 1,
    status: 'live',
    minute: 55,
    league: 'La Liga',
    leagueColor: '#ee8707',
  },
  // EPL
  {
    id: 5,
    homeTeam: 'Man City',
    awayTeam: 'Arsenal',
    homeScore: 1,
    awayScore: 1,
    status: 'live',
    minute: 45,
    league: 'EPL',
    leagueColor: '#3d195b',
  },
  {
    id: 6,
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '17:30',
    league: 'EPL',
    leagueColor: '#3d195b',
  },
  {
    id: 7,
    homeTeam: 'Tottenham',
    awayTeam: 'Man United',
    homeScore: 2,
    awayScore: 0,
    status: 'finished',
    league: 'EPL',
    leagueColor: '#3d195b',
  },
  {
    id: 8,
    homeTeam: 'Newcastle',
    awayTeam: 'Aston Villa',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '15:00',
    league: 'EPL',
    leagueColor: '#3d195b',
  },
  // Serie A
  {
    id: 9,
    homeTeam: 'Inter Milan',
    awayTeam: 'AC Milan',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '19:45',
    league: 'Serie A',
    leagueColor: '#024494',
  },
  {
    id: 10,
    homeTeam: 'Juventus',
    awayTeam: 'Napoli',
    homeScore: 1,
    awayScore: 1,
    status: 'live',
    minute: 82,
    league: 'Serie A',
    leagueColor: '#024494',
  },
  {
    id: 11,
    homeTeam: 'Roma',
    awayTeam: 'Lazio',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    league: 'Serie A',
    leagueColor: '#024494',
  },
  {
    id: 12,
    homeTeam: 'Atalanta',
    awayTeam: 'Fiorentina',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '17:00',
    league: 'Serie A',
    leagueColor: '#024494',
  },
  // Bundesliga
  {
    id: 13,
    homeTeam: 'Bayern',
    awayTeam: 'Dortmund',
    homeScore: 3,
    awayScore: 2,
    status: 'finished',
    league: 'Bundesliga',
    leagueColor: '#d20515',
  },
  {
    id: 14,
    homeTeam: 'Leverkusen',
    awayTeam: 'RB Leipzig',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '16:30',
    league: 'Bundesliga',
    leagueColor: '#d20515',
  },
  {
    id: 15,
    homeTeam: 'Frankfurt',
    awayTeam: 'Stuttgart',
    homeScore: 1,
    awayScore: 0,
    status: 'live',
    minute: 34,
    league: 'Bundesliga',
    leagueColor: '#d20515',
  },
  // Ligue 1
  {
    id: 16,
    homeTeam: 'PSG',
    awayTeam: 'Lyon',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '20:00',
    league: 'Ligue 1',
    leagueColor: '#dae025',
  },
  {
    id: 17,
    homeTeam: 'Monaco',
    awayTeam: 'Marseille',
    homeScore: 2,
    awayScore: 2,
    status: 'live',
    minute: 78,
    league: 'Ligue 1',
    leagueColor: '#dae025',
  },
  {
    id: 18,
    homeTeam: 'Lille',
    awayTeam: 'Nice',
    homeScore: 1,
    awayScore: 0,
    status: 'finished',
    league: 'Ligue 1',
    leagueColor: '#dae025',
  },
];

export function MatchesSection({ selectedLeague }: MatchesSectionProps) {
  // Group matches by league
  const matchesByLeague = allMatches.reduce((acc, match) => {
    if (!acc[match.league]) {
      acc[match.league] = [];
    }
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, typeof allMatches>);

  const leagues = Object.keys(matchesByLeague);

  const handleScroll = (leagueId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(`matches-${leagueId}`);
    if (!container) return;

    const scrollAmount = 170;
    const newPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  const handleMainScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('main-matches-container');
    if (!container) return;

    const scrollAmount = 550;
    const newPosition = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#1a1a1a] border-y border-gray-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white">Match Cards</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleMainScroll('left')}
              className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMainScroll('right')}
              className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          id="main-matches-container"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {leagues.map((league) => {
            const leagueMatches = matchesByLeague[league];

            return (
              <div
                key={league}
                className="rounded-lg flex-shrink-0 overflow-hidden border border-[#2a2a2a]"
                style={{ width: '530px' }}
              >
                {/* Stadium image header */}
                <div className="relative h-14 overflow-hidden">
                  {STADIUM_IMAGES[league] && (
                    <img
                      src={STADIUM_IMAGES[league]}
                      alt={league}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)` }}
                  />
                  <div className="relative z-10 flex items-center justify-between h-full px-3">
                    <div className="flex items-center gap-2.5">
                      <LeagueBadge league={league} size={32} />
                      <div>
                        <h3 className="text-white text-sm font-semibold leading-tight">{league}</h3>
                        <p className="text-gray-300 text-[10px]">{leagueMatches.length} matches today</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleScroll(league, 'left')}
                        className="p-1 bg-black/40 text-white rounded hover:bg-black/60 transition-colors backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleScroll(league, 'right')}
                        className="p-1 bg-black/40 text-white rounded hover:bg-black/60 transition-colors backdrop-blur-sm"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Match cards area */}
                <div className="bg-[#2a2a2a] p-3">
                  <div
                    id={`matches-${league}`}
                    className="flex gap-2 overflow-x-hidden hover:overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {leagueMatches.map((match) => (
                      <MatchCard key={match.id} match={match} compact={true} />
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
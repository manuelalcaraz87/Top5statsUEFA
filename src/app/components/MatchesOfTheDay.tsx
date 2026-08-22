import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LiveMatchCard } from './LiveMatchCard';

const matches = [
  {
    id: 1,
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    homeScore: 2,
    awayScore: 2,
    status: 'live',
    minute: 67,
    league: 'Premier League',
  },
  {
    id: 2,
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 1,
    awayScore: 0,
    status: 'live',
    minute: 45,
    league: 'La Liga',
  },
  {
    id: 3,
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '15:00',
    league: 'Premier League',
  },
  {
    id: 4,
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '17:30',
    league: 'Bundesliga',
  },
  {
    id: 5,
    homeTeam: 'AC Milan',
    awayTeam: 'Inter Milan',
    homeScore: 3,
    awayScore: 2,
    status: 'finished',
    league: 'Serie A',
  },
  {
    id: 6,
    homeTeam: 'PSG',
    awayTeam: 'Lyon',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    time: '20:00',
    league: 'Ligue 1',
  },
];

export function MatchesOfTheDay() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('matches-container');
    if (!container) return;

    const scrollAmount = 320;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  useEffect(() => {
    const container = document.getElementById('matches-container');
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };

    container.addEventListener('scroll', checkScroll);
    checkScroll();

    return () => container.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white">Matches Today</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-lg transition-colors ${
                canScrollLeft
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-lg transition-colors ${
                canScrollRight
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          id="matches-container"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {matches.map((match) => (
            <LiveMatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}

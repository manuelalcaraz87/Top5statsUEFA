import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { MatchesSection } from './components/MatchesSection';
import { TopStatsSection } from './components/TopStatsSection';
import { SocialFeed } from './components/SocialFeed';
import { LeagueBadge } from './components/LeagueBadge';
import { LeaguePage } from './components/LeaguePage';

const leagues = [
  {
    id: 'la-liga',
    name: 'La Liga',
    color: '#ee8707',
    accentColor: '#ff4444',
  },
  {
    id: 'epl',
    name: 'EPL',
    color: '#3d195b',
    accentColor: '#00ff87',
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    color: '#024494',
    accentColor: '#00a651',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    color: '#d20515',
    accentColor: '#ffffff',
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    color: '#dae025',
    accentColor: '#14181e',
  },
  {
    id: 'ucl',
    name: 'UCL',
    color: '#003b7a',
    accentColor: '#ffd700',
  },
];

export default function App() {
  const [selectedLeague, setSelectedLeague] = useState(leagues[0]);
  const [activeView, setActiveView] = useState<'home' | 'league'>('home');

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Top Navigation Bar - Black Theme */}
      <nav className="bg-[#1a1a1a] shadow-lg border-b border-gray-800">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center">
            {/* Logo */}
            <button
              onClick={() => {
                setSelectedLeague(leagues[0]);
                setActiveView('home');
              }}
              className={`px-6 py-4 flex items-center gap-2 transition-colors border-r border-gray-800 ${
                activeView === 'home'
                  ? 'bg-[#c41e3a] hover:bg-[#a01829]'
                  : 'bg-black hover:bg-gray-900'
              }`}
            >
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-white hidden sm:inline">Home</span>
            </button>

            {/* League Tabs */}
            <div className="flex flex-1 overflow-x-auto scrollbar-hide">
              {leagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => {
                    setSelectedLeague(league);
                    setActiveView('league');
                  }}
                  className={`px-4 py-3 text-white whitespace-nowrap transition-colors border-r border-gray-800 flex items-center gap-2 relative ${
                    selectedLeague.id === league.id && activeView === 'league'
                      ? 'bg-[#1e1e1e]'
                      : 'hover:bg-[#252525]'
                  }`}
                  style={selectedLeague.id === league.id && activeView === 'league'
                    ? { boxShadow: `inset 0 -2px 0 ${league.color}` }
                    : undefined
                  }
                >
                  <LeagueBadge league={league.name} size={24} />
                  <span className="hidden sm:inline">{league.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {activeView === 'home' ? (
        <>
          {/* Matches Section - Full Width */}
          <MatchesSection selectedLeague={selectedLeague} />

          {/* Main Stats + Social Sidebar */}
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-9">
                <TopStatsSection />
              </div>
              <div className="lg:col-span-3">
                <SocialFeed selectedLeague={selectedLeague} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <LeaguePage league={selectedLeague} />
      )}
    </div>
  );
}
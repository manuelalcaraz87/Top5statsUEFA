import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { MatchesSection } from './components/MatchesSection';
import { TopStatsSection } from './components/TopStatsSection';
import { SocialFeed } from './components/SocialFeed';
import { LeagueBadge } from './components/LeagueBadge';
import { LeaguePage } from './components/LeaguePage';

const UNDER_CONSTRUCTION_IMAGE =
  'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1800&q=80';

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

  const shouldShowUnderConstruction =
    import.meta.env.PROD || import.meta.env.VITE_SHOW_UNDER_CONSTRUCTION === 'true';

  if (shouldShowUnderConstruction) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0b0f19] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url(${UNDER_CONSTRUCTION_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[#070b12]/75" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="max-w-2xl rounded-3xl border border-white/10 bg-black/35 p-8 text-center shadow-2xl backdrop-blur-sm sm:p-12">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#f4c95d]/40 bg-[#f4c95d]/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#f4c95d]">
              <Trophy className="h-4 w-4" />
              Coming soon
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
              Under Construction
            </h1>

            <p className="mt-6 text-base text-slate-200 sm:text-lg">
              We&apos;re preparing the next matchday experience. Please check back soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
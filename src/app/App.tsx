import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { MatchesSection } from './components/MatchesSection';
import { TopStatsSection } from './components/TopStatsSection';
import { LeagueBadge } from './components/LeagueBadge';
import { LeaguePage } from './components/LeaguePage';

const leagues = [
  {
    id: 'la-liga',
    name: 'La Liga',
    label: 'La Liga',
    color: '#94a3b8',
    accentColor: '#94a3b8',
  },
  {
    id: 'epl',
    name: 'EPL',
    label: 'Premier League',
    color: '#94a3b8',
    accentColor: '#94a3b8',
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    label: 'Serie A',
    color: '#94a3b8',
    accentColor: '#94a3b8',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    label: 'Bundesliga',
    color: '#94a3b8',
    accentColor: '#94a3b8',
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    label: 'Ligue 1',
    color: '#94a3b8',
    accentColor: '#94a3b8',
  },
  {
    id: 'ucl',
    name: 'UCL',
    label: 'Champions League',
    color: '#94a3b8',
    accentColor: '#94a3b8',
  },
];

const FOOTER_TEXT =
  'Top5Stats is an independent statistics site. It is not affiliated with, endorsed by or sponsored by any league, club, player or UEFA. All names are used for identification only. Data: football-data.org, API-Football.';

function SiteFooter() {
  return (
    <footer className="border-t border-gray-800 bg-[#0d0d0d] px-4 py-5 sm:px-6 lg:px-8">
      <p className="mx-auto max-w-[1800px] text-center text-xs leading-relaxed text-gray-500">
        {FOOTER_TEXT}
      </p>
    </footer>
  );
}

export default function App() {
  const [selectedLeague, setSelectedLeague] = useState(leagues[0]);
  const [activeView, setActiveView] = useState<'home' | 'league'>('home');

  const shouldShowUnderConstruction =
    import.meta.env.PROD || import.meta.env.VITE_SHOW_UNDER_CONSTRUCTION === 'true';

  if (shouldShowUnderConstruction) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0b0f19] text-white">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #1a1a1a 0%, #0b0f19 55%, #070b12 100%)' }}
        />

        <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-6 py-12">
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
        <SiteFooter />
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
            {/* Site name (Home) */}
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
              <span className="text-white font-semibold">Top5Stats</span>
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
                  <span>{league.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Match strip: at the top of every page (home and every league page) */}
      <MatchesSection onlyLeagueId={activeView === 'league' ? selectedLeague.id : undefined} />

      {activeView === 'home' ? (
        /* Main Stats (social feed hidden pending redesign) */
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TopStatsSection />
        </div>
      ) : (
        <LeaguePage league={selectedLeague} />
      )}

      <SiteFooter />
    </div>
  );
}
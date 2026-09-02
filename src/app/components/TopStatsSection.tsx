import { useState } from 'react';
import { Trophy, Goal, Users, Shield, Activity, Hand } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { ClubCrest } from './ClubCrest';
import { LeagueBadge } from './LeagueBadge';
import { useLeagueData } from '../hooks/useLeagueData';

const BERNABEU = 'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=800&q=75&fit=crop&auto=format';

function PlayerAvatar({ name, teamColor, size = 40 }: { name: string; teamColor: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${teamColor}ee, ${teamColor}77)`,
        border: `2px solid ${teamColor}`,
        fontSize: size * 0.32,
        boxShadow: `0 2px 8px ${teamColor}44`,
      }}
    >
      {initials}
    </div>
  );
}

interface Player {
  id: number;
  name: string;
  team: string;
  league: string;
  leagueColor: string;
  value: number;
  stat2?: number;
  // Optional richer fields, populated only for live defender/goalkeeper
  // stats (Sportmonks — see sportmonksService.ts / useLeagueData.ts).
  tacklesWon?: number;
  interceptions?: number;
  clearances?: number;
  saves?: number;
  savePercentage?: number;
  minutesPlayed?: number;
}

interface Team {
  id: number;
  name: string;
  league: string;
  leagueColor: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  gd: number;
}

const topTeams: Team[] = [
  { id: 1, name: 'Real Madrid', league: 'La Liga', leagueColor: '#ee8707', points: 45, wins: 14, draws: 3, losses: 0, gd: 28 },
  { id: 2, name: 'Man City', league: 'EPL', leagueColor: '#3d195b', points: 43, wins: 13, draws: 4, losses: 0, gd: 25 },
  { id: 3, name: 'Inter Milan', league: 'Serie A', leagueColor: '#024494', points: 42, wins: 13, draws: 3, losses: 1, gd: 24 },
  { id: 4, name: 'Bayern Munich', league: 'Bundesliga', leagueColor: '#d20515', points: 41, wins: 13, draws: 2, losses: 2, gd: 27 },
  { id: 5, name: 'PSG', league: 'Ligue 1', leagueColor: '#dae025', points: 40, wins: 12, draws: 4, losses: 1, gd: 22 },
];

const topScorers: Player[] = [
  { id: 1, name: 'Erling Haaland', team: 'Man City', league: 'EPL', leagueColor: '#3d195b', value: 18, stat2: 22 },
  { id: 2, name: 'Harry Kane', team: 'Bayern Munich', league: 'Bundesliga', leagueColor: '#d20515', value: 17, stat2: 20 },
  { id: 3, name: 'Kylian Mbappé', team: 'Real Madrid', league: 'La Liga', leagueColor: '#ee8707', value: 16, stat2: 19 },
  { id: 4, name: 'Lautaro Martínez', team: 'Inter Milan', league: 'Serie A', leagueColor: '#024494', value: 15, stat2: 18 },
  { id: 5, name: 'Gonçalo Ramos', team: 'PSG', league: 'Ligue 1', leagueColor: '#dae025', value: 14, stat2: 17 },
];

const topAssists: Player[] = [
  { id: 1, name: 'Kevin De Bruyne', team: 'Man City', league: 'EPL', leagueColor: '#3d195b', value: 12, stat2: 18 },
  { id: 2, name: 'Florian Wirtz', team: 'Leverkusen', league: 'Bundesliga', leagueColor: '#d20515', value: 11, stat2: 16 },
  { id: 3, name: 'Vinícius Jr', team: 'Real Madrid', league: 'La Liga', leagueColor: '#ee8707', value: 10, stat2: 15 },
  { id: 4, name: 'Rafael Leão', team: 'AC Milan', league: 'Serie A', leagueColor: '#024494', value: 9, stat2: 14 },
  { id: 5, name: 'Ousmane Dembélé', team: 'PSG', league: 'Ligue 1', leagueColor: '#dae025', value: 9, stat2: 13 },
];

const topDefenders: Player[] = [
  { id: 1, name: 'Rúben Dias', team: 'Man City', league: 'EPL', leagueColor: '#3d195b', value: 9.0, stat2: 8 },
  { id: 2, name: 'Antonio Rüdiger', team: 'Real Madrid', league: 'La Liga', leagueColor: '#ee8707', value: 8.8, stat2: 7 },
  { id: 3, name: 'Kim Min-jae', team: 'Bayern Munich', league: 'Bundesliga', leagueColor: '#d20515', value: 8.6, stat2: 6 },
  { id: 4, name: 'Alessandro Bastoni', team: 'Inter Milan', league: 'Serie A', leagueColor: '#024494', value: 8.4, stat2: 5 },
  { id: 5, name: 'Marquinhos', team: 'PSG', league: 'Ligue 1', leagueColor: '#dae025', value: 8.2, stat2: 5 },
];

const topKeepers: Player[] = [
  { id: 1, name: 'Ederson', team: 'Man City', league: 'EPL', leagueColor: '#3d195b', value: 12, stat2: 7.8 },
  { id: 2, name: 'Thibaut Courtois', team: 'Real Madrid', league: 'La Liga', leagueColor: '#ee8707', value: 11, stat2: 7.6 },
  { id: 3, name: 'Mike Maignan', team: 'AC Milan', league: 'Serie A', leagueColor: '#024494', value: 10, stat2: 7.4 },
  { id: 4, name: 'Manuel Neuer', team: 'Bayern Munich', league: 'Bundesliga', leagueColor: '#d20515', value: 10, stat2: 7.2 },
  { id: 5, name: 'Gianluigi Donnarumma', team: 'PSG', league: 'Ligue 1', leagueColor: '#dae025', value: 9, stat2: 7.0 },
];

type TabType = 'top5' | 'teams' | 'goals' | 'assists' | 'defender' | 'gk';

export function TopStatsSection() {
  const [activeTab, setActiveTab] = useState<TabType>('top5');
  const laLiga = useLeagueData('la-liga');
  const epl = useLeagueData('epl');
  const serieA = useLeagueData('serie-a');
  const bundesliga = useLeagueData('bundesliga');
  const ligue1 = useLeagueData('ligue-1');

  const liveLeagues = [
    { id: 'la-liga', name: 'La Liga', color: '#ee8707', data: laLiga.data, loading: laLiga.loadingStandings || laLiga.loadingScorers, loadingDefenders: laLiga.loadingDefenders },
    { id: 'epl', name: 'EPL', color: '#3d195b', data: epl.data, loading: epl.loadingStandings || epl.loadingScorers, loadingDefenders: epl.loadingDefenders },
    { id: 'serie-a', name: 'Serie A', color: '#024494', data: serieA.data, loading: serieA.loadingStandings || serieA.loadingScorers, loadingDefenders: serieA.loadingDefenders },
    { id: 'bundesliga', name: 'Bundesliga', color: '#d20515', data: bundesliga.data, loading: bundesliga.loadingStandings || bundesliga.loadingScorers, loadingDefenders: bundesliga.loadingDefenders },
    { id: 'ligue-1', name: 'Ligue 1', color: '#dae025', data: ligue1.data, loading: ligue1.loadingStandings || ligue1.loadingScorers, loadingDefenders: ligue1.loadingDefenders },
  ];

  const liveTeams: Team[] = liveLeagues.flatMap(league =>
    league.data.standings.slice(0, 5).map((standing, index) => ({
      id: `${league.id}-${standing.position}` as unknown as number,
      name: standing.team,
      league: league.name,
      leagueColor: league.color,
      points: standing.points,
      wins: standing.won,
      draws: standing.drawn,
      losses: standing.lost,
      gd: standing.gd,
      position: index + 1,
    })),
  ).sort((a, b) => b.points - a.points).slice(0, 5);

  const liveScorers: Player[] = liveLeagues.flatMap(league =>
    league.data.topScorers.map(player => ({
      id: player.rank,
      name: player.name,
      team: player.team,
      league: league.name,
      leagueColor: league.color,
      value: player.goals,
      stat2: player.assists,
    })),
  ).sort((a, b) => b.value - a.value).slice(0, 5);

  const liveAssists: Player[] = liveLeagues.flatMap(league =>
    league.data.topAssisters.map(player => ({
      id: player.rank,
      name: player.name,
      team: player.team,
      league: league.name,
      leagueColor: league.color,
      value: player.assists,
      stat2: player.goals,
    })),
  ).sort((a, b) => b.value - a.value).slice(0, 5);

  // Defenders: ranked by rating (goals field holds rating for this list — see
  // useLeagueData.ts toDefenderPlayer). Goalkeepers: ranked by clean sheets.
  const liveDefenders: Player[] = liveLeagues.flatMap(league =>
    league.data.topDefenders.map(player => ({
      id: player.rank,
      name: player.name,
      team: player.team,
      league: league.name,
      leagueColor: league.color,
      value: player.goals,
      stat2: player.assists,
      tacklesWon: player.tacklesWon,
      interceptions: player.interceptions,
      clearances: player.clearances,
      minutesPlayed: player.minutesPlayed,
    })),
  ).sort((a, b) => b.value - a.value).slice(0, 5);

  const liveKeepers: Player[] = liveLeagues.flatMap(league =>
    league.data.topKeepers.map(player => ({
      id: player.rank,
      name: player.name,
      team: player.team,
      league: league.name,
      leagueColor: league.color,
      value: player.goals,
      stat2: player.assists,
      saves: player.saves,
      savePercentage: player.savePercentage,
      minutesPlayed: player.minutesPlayed,
    })),
  ).sort((a, b) => b.value - a.value).slice(0, 5);

  // Find the league standings for the overall points leader
  const overallLeaderTeam = liveTeams[0];
  const overallLeaderLeague = overallLeaderTeam
    ? liveLeagues.find(l => l.name === overallLeaderTeam.league)
    : null;
  const overallLeaderStanding = overallLeaderLeague?.data.standings[0] ?? null;

  const liveDataLoading = liveLeagues.some(league => league.loading);
  const liveDefendersLoading = liveLeagues.some(league => league.loadingDefenders);
  const displayTeams = liveTeams.length > 0 ? liveTeams : liveDataLoading ? topTeams : [];
  const displayScorers = liveScorers.length > 0 ? liveScorers : liveDataLoading ? topScorers : [];
  const displayAssists = liveAssists.length > 0 ? liveAssists : liveDataLoading ? topAssists : [];
  const displayDefenders = liveDefenders.length > 0 ? liveDefenders : liveDefendersLoading ? topDefenders : [];
  const displayKeepers = liveKeepers.length > 0 ? liveKeepers : liveDefendersLoading ? topKeepers : [];

  const tabs = [
    { id: 'top5' as TabType, label: 'Top 5', icon: Trophy },
    { id: 'teams' as TabType, label: 'Teams', icon: Users },
    { id: 'goals' as TabType, label: 'Goals', icon: Goal },
    { id: 'assists' as TabType, label: 'Assists', icon: Activity },
    { id: 'defender' as TabType, label: 'Defender', icon: Shield },
    { id: 'gk' as TabType, label: 'GK', icon: Hand },
  ];

  return (
    <div className="bg-[#111111] rounded-lg shadow-xl border border-gray-800 overflow-hidden">
      {/* Tabs Header */}
      <div className="bg-[#0d0d0d] border-b border-gray-800 overflow-x-auto scrollbar-hide"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-4 whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-white bg-[#2a2a2a] text-white'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'top5' && (
          <Top5Overview
            teams={displayTeams}
            scorers={displayScorers}
            assists={displayAssists}
            defenders={displayDefenders}
            keepers={displayKeepers}
            leaderStanding={overallLeaderStanding}
            leaderLeagueColor={overallLeaderLeague?.color ?? '#666'}
            stadiumImage={overallLeaderLeague?.data.stadiumImage ?? null}
            stadiumName={overallLeaderLeague?.data.stadiumName ?? null}
          />
        )}
        {activeTab === 'teams' && <TeamsList teams={displayTeams} />}
        {activeTab === 'goals' && <PlayersList players={displayScorers} title="Top Scorers" subtitle="Goals / Assists" />}
        {activeTab === 'assists' && <PlayersList players={displayAssists} title="Top Assists" subtitle="Assists / Goals" />}
        {activeTab === 'defender' && (
          displayDefenders.length > 0
            ? <PlayersList players={displayDefenders} title="Top Defenders" subtitle="Rating / Clean Sheets" />
            : <UnavailableStats title="Top Defenders" />
        )}
        {activeTab === 'gk' && (
          displayKeepers.length > 0
            ? <PlayersList players={displayKeepers} title="Top Goalkeepers" subtitle="Clean Sheets / Rating" />
            : <UnavailableStats title="Top Goalkeepers" />
        )}
      </div>
    </div>
  );
}

function Top5Overview({ teams, scorers, assists, defenders, keepers, leaderStanding, leaderLeagueColor, stadiumImage, stadiumName }: {
  teams: Team[];
  scorers: Player[];
  assists: Player[];
  defenders: Player[];
  keepers: Player[];
  leaderStanding: import('../data/leagueData').Standing | null;
  leaderLeagueColor: string;
  stadiumImage: string | null;
  stadiumName: string | null;
}) {
  const topTeams = teams.length > 0 ? teams : [{ id: 0, name: 'No current data', league: '', leagueColor: '#666', points: 0, wins: 0, draws: 0, losses: 0, gd: 0 }];
  const topScorers = scorers.length > 0 ? scorers : [{ id: 0, name: 'No current data', team: '', league: '', leagueColor: '#666', value: 0, stat2: 0 }];
  const topAssists = assists.length > 0 ? assists : [{ id: 0, name: 'No current data', team: '', league: '', leagueColor: '#666', value: 0, stat2: 0 }];
  const topDefenders = defenders.length > 0 ? defenders : [{ id: 0, name: 'No current data', team: '', league: '', leagueColor: '#666', value: 0, stat2: 0 }];
  const topKeepers = keepers.length > 0 ? keepers : [{ id: 0, name: 'No current data', team: '', league: '', leagueColor: '#666', value: 0, stat2: 0 }];

  // Derive live stats for the overall points leader
  const leader = leaderStanding;
  const played = leader ? leader.played : (topTeams[0].wins + topTeams[0].draws + topTeams[0].losses);
  const wins = leader ? leader.won : topTeams[0].wins;
  const draws = leader ? leader.drawn : topTeams[0].draws;
  const losses = leader ? leader.lost : topTeams[0].losses;
  const points = leader ? leader.points : topTeams[0].points;
  const gf = leader ? leader.gf : 0;
  const ga = leader ? leader.ga : 0;
  const ppm = played > 0 ? (points / played).toFixed(2) : '0.00';
  const form = leader?.form ?? [];
  const formColors: Record<string, string> = { W: '#22c55e', D: '#f59e0b', L: '#ef4444' };
  const color = leaderLeagueColor;

  // Win/draw/loss distribution for pie chart
  const winPct  = played > 0 ? Math.round((wins  / played) * 100) : 33;
  const drawPct = played > 0 ? Math.round((draws / played) * 100) : 33;
  const lossPct = played > 0 ? Math.max(0, 100 - winPct - drawPct) : 34;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-gray-100 mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Overall Leaders Across Top 5 Leagues
        </h3>
        <p className="text-gray-500 text-sm mb-8">
          Top performers from La Liga, EPL, Serie A, Bundesliga, and Ligue 1
        </p>
      </div>

      {/* Leading Team Section */}
      <div className="space-y-4">
        {/* Hero banner with stadium image */}
        <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 120 }}>
          <img
            src={stadiumImage || BERNABEU}
            alt={stadiumName || 'Stadium'}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          <div className="relative z-10 p-5 flex flex-wrap items-center gap-4">
            <ClubCrest club={topTeams[0].name} size={56} />
            <div>
              <p className="text-white text-xl font-bold">{topTeams[0].name}</p>
              <div className="flex items-center gap-2 mt-1">
                <LeagueBadge league={topTeams[0].league} size={20} />
                <p className="text-gray-300 text-sm">{topTeams[0].league}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 ml-auto">
              <div className="text-center">
                <p className="text-[11px] text-gray-400 mb-0.5">Points</p>
                <p className="text-2xl font-bold text-white">{points}</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-[11px] text-gray-400 mb-0.5">GF</p>
                <p className="text-2xl font-bold text-white">{gf || topTeams[0].gd + 'GD'}</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-[11px] text-gray-400 mb-0.5">Pts/Game</p>
                <p className="text-2xl font-bold text-white">{ppm}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-950/30 to-[#111111] rounded-lg border border-blue-900/30 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl">
            {/* Form Card */}
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-sm text-gray-400">Recent Form</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Last {form.length > 0 ? form.length : 5} games</p>
                <div className="flex items-center gap-1 mb-4">
                  {form.length > 0
                    ? form.map((f, i) => (
                        <span key={i} className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-medium"
                          style={{ backgroundColor: formColors[f] }}>{f}</span>
                      ))
                    : ['W','W','D','W','L'].map((f, i) => (
                        <span key={i} className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-medium"
                          style={{ backgroundColor: formColors[f] }}>{f}</span>
                      ))
                  }
                </div>
              </div>

              {/* W/D/L breakdown pie */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Season record</p>
                <div className="flex items-center gap-2">
                  <PieChart width={60} height={60}>
                    <Pie data={[{ value: winPct }, { value: drawPct }, { value: lossPct }]}
                      cx={30} cy={30} startAngle={90} endAngle={-270}
                      innerRadius={15} outerRadius={28} paddingAngle={2} dataKey="value">
                      <Cell fill="#22c55e" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                    </Pie>
                  </PieChart>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-gray-400">{winPct}% wins</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-gray-400">{drawPct}% draws</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-gray-400">{lossPct}% losses</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* League Statistics */}
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-sm text-gray-400">League Statistics</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Games Played', val: played,   cls: 'text-gray-200' },
                  { label: 'Wins',         val: wins,     cls: 'text-green-500' },
                  { label: 'Draws',        val: draws,    cls: 'text-yellow-500' },
                  { label: 'Losses',       val: losses,   cls: 'text-red-500' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{r.label}</span>
                    <span className={`text-sm font-medium ${r.cls}`}>{r.val}</span>
                  </div>
                ))}
                <div className="h-px bg-gray-800 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Points</span>
                  <span className="text-lg font-medium" style={{ color }}>{points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Pts/Match</span>
                  <span className="text-lg font-medium text-blue-400">{ppm}</span>
                </div>
              </div>
            </div>

            {/* Goal Difference breakdown */}
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <p className="text-sm text-gray-400">Goal Record</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Goals Scored',   val: gf,               cls: 'text-green-400' },
                  { label: 'Goals Conceded', val: ga,               cls: 'text-red-400'   },
                  { label: 'Goal Diff',      val: `+${gf - ga}`,    cls: 'text-blue-400'  },
                  { label: 'Goals/Game',     val: played > 0 ? (gf / played).toFixed(2) : '–', cls: 'text-gray-200' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{r.label}</span>
                    <span className={`text-sm font-medium ${r.cls}`}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Scorer quick summary */}
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <p className="text-sm text-gray-400">Top Scorer</p>
              </div>
              {topScorers[0].name !== 'No current data' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar name={topScorers[0].name} teamColor={topScorers[0].leagueColor} size={32} />
                    <div>
                      <p className="text-gray-200 text-xs font-semibold leading-tight">{topScorers[0].name}</p>
                      <p className="text-gray-500 text-[10px]">{topScorers[0].team}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: topScorers[0].leagueColor }}>{topScorers[0].value}</p>
                      <p className="text-[10px] text-gray-500">Goals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">{topScorers[0].stat2}</p>
                      <p className="text-[10px] text-gray-500">Assists</p>
                    </div>
                  </div>
                  <div className="mt-1 text-center">
                    <LeagueBadge league={topScorers[0].league} size={18} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20">
                  <p className="text-sm text-gray-600 italic">Loading…</p>
                </div>
              )}
            </div>

            {/* Top Assister quick summary */}
            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <p className="text-sm text-gray-400">Top Assister</p>
              </div>
              {topAssists[0].name !== 'No current data' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar name={topAssists[0].name} teamColor={topAssists[0].leagueColor} size={32} />
                    <div>
                      <p className="text-gray-200 text-xs font-semibold leading-tight">{topAssists[0].name}</p>
                      <p className="text-gray-500 text-[10px]">{topAssists[0].team}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: topAssists[0].leagueColor }}>{topAssists[0].value}</p>
                      <p className="text-[10px] text-gray-500">Assists</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-gray-400">{topAssists[0].stat2}</p>
                      <p className="text-[10px] text-gray-500">Goals</p>
                    </div>
                  </div>
                  <div className="mt-1 text-center">
                    <LeagueBadge league={topAssists[0].league} size={18} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20">
                  <p className="text-sm text-gray-600 italic">Loading…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Scorer Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <PlayerAvatar name={topScorers[0].name} teamColor={topScorers[0].leagueColor} size={44} />
          <ClubCrest club={topScorers[0].team} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <Goal className="w-4 h-4 text-green-600" />
              <h4 className="text-gray-100">Top Scorer</h4>
            </div>
            <p className="text-sm text-gray-400">{topScorers[0].name} • {topScorers[0].team}</p>
          </div>
          <div className="ml-auto">
            <LeagueBadge league={topScorers[0].league} size={28} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-950/40 to-[#1a1a1a] p-4 rounded-lg border border-green-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topScorers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Goals</p>
            </div>
            <p className="text-3xl font-light text-white">{topScorers[0].value}</p>
            <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(topScorers[0].value / 25) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-950/40 to-[#1a1a1a] p-4 rounded-lg border border-green-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topScorers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Assists</p>
            </div>
            <p className="text-3xl font-light text-white">{topScorers[0].stat2}</p>
            <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(topScorers[0].stat2! / 30) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-950/40 to-[#1a1a1a] p-4 rounded-lg border border-green-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topScorers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Goals + Assists</p>
            </div>
            <p className="text-3xl font-light text-white">{topScorers[0].value + (topScorers[0].stat2 ?? 0)}</p>
            <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((topScorers[0].value + (topScorers[0].stat2 ?? 0)) / 35) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-950/40 to-[#1a1a1a] p-4 rounded-lg border border-green-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topScorers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Goal Contributions</p>
            </div>
            <p className="text-3xl font-light text-white">{topScorers[0].value + (topScorers[0].stat2 ?? 0)}</p>
            <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((topScorers[0].value + (topScorers[0].stat2 ?? 0)) / 35) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-950/40 to-[#1a1a1a] p-4 rounded-lg border border-green-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topScorers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Goals Rank</p>
            </div>
            <p className="text-3xl font-light text-white">#1</p>
            <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Assister Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <PlayerAvatar name={topAssists[0].name} teamColor={topAssists[0].leagueColor} size={44} />
          <ClubCrest club={topAssists[0].team} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <h4 className="text-gray-100">Top Assister</h4>
            </div>
            <p className="text-sm text-gray-400">{topAssists[0].name} • {topAssists[0].team}</p>
          </div>
          <div className="ml-auto">
            <LeagueBadge league={topAssists[0].league} size={28} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topAssists[0].leagueColor }} />
              <p className="text-xs text-gray-400">Assists</p>
            </div>
            <p className="text-3xl font-light text-white">{topAssists[0].value}</p>
            <div className="mt-3 w-full bg-purple-900/40 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(topAssists[0].value / 15) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topAssists[0].leagueColor }} />
              <p className="text-xs text-gray-400">Goals</p>
            </div>
            <p className="text-3xl font-light text-white">{topAssists[0].stat2}</p>
            <div className="mt-3 w-full bg-purple-900/40 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${((topAssists[0].stat2 ?? 0) / 25) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topAssists[0].leagueColor }} />
              <p className="text-xs text-gray-400">Goal Contributions</p>
            </div>
            <p className="text-3xl font-light text-white">{topAssists[0].value + (topAssists[0].stat2 ?? 0)}</p>
            <div className="mt-3 w-full bg-purple-900/40 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${((topAssists[0].value + (topAssists[0].stat2 ?? 0)) / 35) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topAssists[0].leagueColor }} />
              <p className="text-xs text-gray-400">Assists Rank</p>
            </div>
            <p className="text-3xl font-light text-white">#1</p>
            <div className="mt-3 w-full bg-purple-900/40 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topAssists[0].leagueColor }} />
              <p className="text-xs text-gray-400">League</p>
            </div>
            <div className="mt-2">
              <LeagueBadge league={topAssists[0].league} size={32} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{topAssists[0].league}</p>
          </div>
        </div>
      </div>

      {/* Top Defender Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <PlayerAvatar name={topDefenders[0].name} teamColor={topDefenders[0].leagueColor} size={44} />
          <ClubCrest club={topDefenders[0].team} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <h4 className="text-gray-100">Top Defender</h4>
            </div>
            <p className="text-sm text-gray-400">{topDefenders[0].name} • {topDefenders[0].team}</p>
          </div>
          <div className="ml-auto">
            <LeagueBadge league={topDefenders[0].league} size={28} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-orange-950/40 to-[#1a1a1a] p-4 rounded-lg border border-orange-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topDefenders[0].leagueColor }} />
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <p className="text-3xl font-light text-white">{topDefenders[0].value.toFixed(1)}</p>
            <div className="mt-3 w-full bg-orange-900/40 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${Math.min(Math.max(((topDefenders[0].value - 6) / 4) * 100, 0), 100)}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-950/40 to-[#1a1a1a] p-4 rounded-lg border border-orange-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topDefenders[0].leagueColor }} />
              <p className="text-xs text-gray-400">Clean Sheets</p>
            </div>
            <p className="text-3xl font-light text-white">{topDefenders[0].stat2}</p>
            <div className="mt-3 w-full bg-orange-900/40 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${(topDefenders[0].stat2! / 12) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-950/40 to-[#1a1a1a] p-4 rounded-lg border border-orange-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topDefenders[0].leagueColor }} />
              <p className="text-xs text-gray-400">Tackles Won</p>
            </div>
            <p className="text-3xl font-light text-white">{topDefenders[0].tacklesWon ?? 67}</p>
            <div className="mt-3 w-full bg-orange-900/40 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${((topDefenders[0].tacklesWon ?? 67) / 80) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-950/40 to-[#1a1a1a] p-4 rounded-lg border border-orange-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topDefenders[0].leagueColor }} />
              <p className="text-xs text-gray-400">Interceptions</p>
            </div>
            <p className="text-3xl font-light text-white">{topDefenders[0].interceptions ?? 52}</p>
            <div className="mt-3 w-full bg-orange-900/40 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${((topDefenders[0].interceptions ?? 52) / 70) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-950/40 to-[#1a1a1a] p-4 rounded-lg border border-orange-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topDefenders[0].leagueColor }} />
              <p className="text-xs text-gray-400">Clearances</p>
            </div>
            <p className="text-3xl font-light text-white">{topDefenders[0].clearances ?? 89}</p>
            <div className="mt-3 w-full bg-orange-900/40 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${((topDefenders[0].clearances ?? 89) / 110) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Goalkeeper Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <PlayerAvatar name={topKeepers[0].name} teamColor={topKeepers[0].leagueColor} size={44} />
          <ClubCrest club={topKeepers[0].team} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h4 className="text-gray-100">Top Goalkeeper</h4>
            </div>
            <p className="text-sm text-gray-400">{topKeepers[0].name} • {topKeepers[0].team}</p>
          </div>
          <div className="ml-auto">
            <LeagueBadge league={topKeepers[0].league} size={28} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-indigo-950/40 to-[#1a1a1a] p-4 rounded-lg border border-indigo-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topKeepers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Clean Sheets</p>
            </div>
            <p className="text-3xl font-light text-white">{topKeepers[0].value}</p>
            <div className="mt-3 w-full bg-indigo-900/40 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(topKeepers[0].value / 17) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-950/40 to-[#1a1a1a] p-4 rounded-lg border border-indigo-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topKeepers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <p className="text-3xl font-light text-white">{topKeepers[0].stat2!.toFixed(1)}</p>
            <div className="mt-3 w-full bg-indigo-900/40 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(Math.max(((topKeepers[0].stat2! - 6) / 4) * 100, 0), 100)}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-950/40 to-[#1a1a1a] p-4 rounded-lg border border-indigo-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topKeepers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Saves</p>
            </div>
            <p className="text-3xl font-light text-white">{topKeepers[0].saves ?? 78}</p>
            <div className="mt-3 w-full bg-indigo-900/40 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((topKeepers[0].saves ?? 78) / 100) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-950/40 to-[#1a1a1a] p-4 rounded-lg border border-indigo-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topKeepers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Save %</p>
            </div>
            <p className="text-3xl font-light text-white">{topKeepers[0].savePercentage ?? 76}%</p>
            <div className="mt-3 w-full bg-indigo-900/40 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${topKeepers[0].savePercentage ?? 76}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-950/40 to-[#1a1a1a] p-4 rounded-lg border border-indigo-900/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topKeepers[0].leagueColor }} />
              <p className="text-xs text-gray-400">Minutes Played</p>
            </div>
            <p className="text-3xl font-light text-white">{topKeepers[0].minutesPlayed ?? 1530}</p>
            <div className="mt-3 w-full bg-indigo-900/40 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((topKeepers[0].minutesPlayed ?? 1530) / 1800) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamsList({ teams }: { teams: Team[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-100">Top 5 Teams Across All Leagues</h3>
        <p className="text-sm text-gray-400">Based on current points</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-600 pb-3 px-2">#</th>
              <th className="text-left text-xs text-gray-500 pb-3">Team</th>
              <th className="text-left text-xs text-gray-500 pb-3">League</th>
              <th className="text-center text-xs text-gray-500 pb-3">W</th>
              <th className="text-center text-xs text-gray-500 pb-3">D</th>
              <th className="text-center text-xs text-gray-500 pb-3">L</th>
              <th className="text-center text-xs text-gray-500 pb-3">GD</th>
              <th className="text-center text-xs text-gray-500 pb-3">PTS</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                <td className="py-4 px-2">
                  <span className="text-gray-400 text-sm">{index + 1}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <ClubCrest club={team.name} size={30} />
                    <span className="text-gray-100 font-medium">{team.name}</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <LeagueBadge league={team.league} size={18} />
                    <span className="text-sm text-gray-400">{team.league}</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm text-gray-200">{team.wins}</span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm text-gray-200">{team.draws}</span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm text-gray-200">{team.losses}</span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-sm text-gray-200">{team.gd > 0 ? '+' : ''}{team.gd}</span>
                </td>
                <td className="py-4 text-center">
                  <span className="text-gray-100">{team.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type PlayerListType = 'goals' | 'assists' | 'defender' | 'gk';

function detectPlayerListType(subtitle: string): PlayerListType {
  if (subtitle.startsWith('Goals'))   return 'goals';
  if (subtitle.startsWith('Assists')) return 'assists';
  if (subtitle.startsWith('Rating'))  return 'defender';
  return 'gk';
}

function PlayersList({ players, title, subtitle }: { players: Player[]; title: string; subtitle: string }) {
  const type = detectPlayerListType(subtitle);

  const headerCols = type === 'goals'
    ? ['Goals', 'Assists', 'G+A', 'Goal Contr.', 'Goals Rank']
    : type === 'assists'
    ? ['Assists', 'Goals', 'G+A', 'Goal Contr.', 'Assists Rank']
    : type === 'defender'
    ? ['Rating', 'Clean Sheets', 'Tackles', 'Interceptions', 'Clearances']
    : ['Clean Sheets', 'Rating', 'Saves', 'Save %', 'Minutes'];

  function rowValues(p: Player, index: number) {
    if (type === 'goals')    return [p.value, p.stat2 ?? 0, p.value + (p.stat2 ?? 0), p.value + (p.stat2 ?? 0), `#${index + 1}`];
    if (type === 'assists')  return [p.value, p.stat2 ?? 0, p.value + (p.stat2 ?? 0), p.value + (p.stat2 ?? 0), `#${index + 1}`];
    if (type === 'defender') return [
      p.value.toFixed(1),
      p.stat2 ?? '—',
      p.tacklesWon    ?? '—',
      p.interceptions ?? '—',
      p.clearances    ?? '—',
    ];
    return [
      p.value,
      (p.stat2 ?? 0).toFixed(1),
      p.saves          ?? '—',
      p.savePercentage ? `${p.savePercentage}%` : '—',
      p.minutesPlayed  ?? '—',
    ];
  }

  const accentFrom   = type === 'goals' ? 'from-green-950/30'  : type === 'assists' ? 'from-purple-950/30' : type === 'defender' ? 'from-orange-950/30' : 'from-indigo-950/30';
  const accentBorder = type === 'goals' ? 'border-green-900/30' : type === 'assists' ? 'border-purple-900/30' : type === 'defender' ? 'border-orange-900/30' : 'border-indigo-900/30';
  const accentText   = type === 'goals' ? 'text-green-400'     : type === 'assists' ? 'text-purple-400'     : type === 'defender' ? 'text-orange-400'     : 'text-indigo-400';
  const primaryCol   = accentText;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-100">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>

      {/* Header row */}
      <div
        className={`grid items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br ${accentFrom} to-[#111] border ${accentBorder} text-xs text-gray-500`}
        style={{ gridTemplateColumns: `2rem 1fr 2.5rem repeat(${headerCols.length}, 4.5rem)` }}
      >
        <span>#</span>
        <span>Player</span>
        <span></span>
        {headerCols.map(h => <span key={h} className={`text-center ${accentText}`}>{h}</span>)}
      </div>

      {players.map((player, index) => {
        const vals = rowValues(player, index);
        const isTop3 = index < 3;
        return (
          <div
            key={player.id}
            className={`grid items-center gap-2 px-3 py-3 rounded-lg border transition-colors
              ${isTop3
                ? `bg-gradient-to-br ${accentFrom} to-[#1a1a1a] ${accentBorder} hover:brightness-110`
                : 'bg-[#1a1a1a] border-gray-800 hover:bg-[#222]'
              }`}
            style={{ gridTemplateColumns: `2rem 1fr 2.5rem repeat(${headerCols.length}, 4.5rem)` }}
          >
            <span className={`text-sm font-bold text-center ${isTop3 ? accentText : 'text-gray-600'}`}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <PlayerAvatar name={player.name} teamColor={player.leagueColor} size={28} />
                <div className="min-w-0">
                  <p className="text-gray-100 font-medium text-sm truncate">{player.name}</p>
                  <div className="flex items-center gap-1">
                    <LeagueBadge league={player.league} size={12} />
                    <p className="text-xs text-gray-500 truncate">{player.team}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <ClubCrest club={player.team} size={24} />
            </div>
            {vals.map((v, i) => (
              <div key={i} className="text-center">
                <span className={`text-sm font-semibold ${i === 0 ? primaryCol : 'text-gray-300'}`}>{v}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function LiveHomeOverview({ teams, scorers, assists }: { teams: Team[]; scorers: Player[]; assists: Player[] }) {
  const leader = teams[0];
  const scorer = scorers[0];
  const assister = assists[0];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-gray-100 mb-2 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Current Leaders Across Top 5 Leagues
        </h3>
        <p className="text-gray-500 text-sm">Live 2026/27 standings, scorers, and assists</p>
      </div>
      {leader && (
        <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-5 flex items-center gap-4">
          <ClubCrest club={leader.name} size={52} />
          <div>
            <p className="text-white text-xl font-bold">{leader.name}</p>
            <p className="text-gray-500 text-sm">{leader.league} leader</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-white">{leader.points}</p>
            <p className="text-xs text-gray-500">points</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scorer && <LiveLeaderCard title="Top Scorer" player={scorer} primaryLabel="Goals" primaryValue={scorer.value} secondaryLabel="Assists" secondaryValue={scorer.stat2 ?? 0} />}
        {assister && <LiveLeaderCard title="Top Assister" player={assister} primaryLabel="Assists" primaryValue={assister.value} secondaryLabel="Goals" secondaryValue={assister.stat2 ?? 0} />}
      </div>
      <UnavailableStats title="Defenders and goalkeepers" />
    </div>
  );
}

function LiveLeaderCard({ title, player, primaryLabel, primaryValue, secondaryLabel, secondaryValue }: { title: string; player: Player; primaryLabel: string; primaryValue: number; secondaryLabel: string; secondaryValue: number }) {
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
      <p className="text-sm text-gray-400 mb-3">{title} · {player.league}</p>
      <div className="flex items-center gap-3 mb-4">
        <PlayerAvatar name={player.name} teamColor={player.leagueColor} size={38} />
        <div><p className="text-white font-medium">{player.name}</p><p className="text-xs text-gray-500">{player.team}</p></div>
      </div>
      <div className="flex gap-8"><div><p className="text-2xl text-white">{primaryValue}</p><p className="text-xs text-gray-500">{primaryLabel}</p></div><div><p className="text-2xl text-gray-400">{secondaryValue}</p><p className="text-xs text-gray-500">{secondaryLabel}</p></div></div>
    </div>
  );
}

function UnavailableStats({ title }: { title: string }) {
  return <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-5"><p className="text-gray-300 font-medium">{title}</p><p className="text-sm text-gray-500 mt-2">Current 2026/27 data is unavailable from the configured API plan.</p></div>;
}
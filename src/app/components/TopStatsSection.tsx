import { useState } from 'react';
import { Trophy, Goal, Users, Shield, Activity, Hand } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { ClubCrest } from './ClubCrest';
import { LeagueBadge } from './LeagueBadge';
import { NoCurrentData, NO_CURRENT_DATA } from './NoCurrentData';
import { useLeagueData } from '../hooks/useLeagueData';

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
  // Optional defender/goalkeeper fields (no data provider for these yet).
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

type TabType = 'top5' | 'teams' | 'goals' | 'assists' | 'defender' | 'gk';

export function TopStatsSection() {
  const [activeTab, setActiveTab] = useState<TabType>('top5');
  const laLiga = useLeagueData('la-liga');
  const epl = useLeagueData('epl');
  const serieA = useLeagueData('serie-a');
  const bundesliga = useLeagueData('bundesliga');
  const ligue1 = useLeagueData('ligue-1');

  const liveLeagues = [
    { id: 'la-liga', name: 'La Liga', color: '#94a3b8', data: laLiga.data, loading: laLiga.loadingStandings || laLiga.loadingScorers },
    { id: 'epl', name: 'EPL', color: '#94a3b8', data: epl.data, loading: epl.loadingStandings || epl.loadingScorers },
    { id: 'serie-a', name: 'Serie A', color: '#94a3b8', data: serieA.data, loading: serieA.loadingStandings || serieA.loadingScorers },
    { id: 'bundesliga', name: 'Bundesliga', color: '#94a3b8', data: bundesliga.data, loading: bundesliga.loadingStandings || bundesliga.loadingScorers },
    { id: 'ligue-1', name: 'Ligue 1', color: '#94a3b8', data: ligue1.data, loading: ligue1.loadingStandings || ligue1.loadingScorers },
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

  // Find the league standings for the overall points leader
  const overallLeaderTeam = liveTeams[0];
  const overallLeaderLeague = overallLeaderTeam
    ? liveLeagues.find(l => l.name === overallLeaderTeam.league)
    : null;
  const overallLeaderStanding = overallLeaderLeague?.data.standings[0] ?? null;

  // Only live data is shown. While requests are in flight the empty states
  // say "Loading…"; afterwards they say "No current data".
  const loading = liveLeagues.some(league => league.loading);

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
            teams={liveTeams}
            scorers={liveScorers}
            assists={liveAssists}
            leaderStanding={overallLeaderStanding}
            leaderLeagueColor={overallLeaderLeague?.color ?? '#94a3b8'}
            loading={loading}
          />
        )}
        {activeTab === 'teams' && (
          liveTeams.length > 0
            ? <TeamsList teams={liveTeams} />
            : <NoCurrentData title="Top 5 Teams Across All Leagues" loading={loading} />
        )}
        {activeTab === 'goals' && (
          liveScorers.length > 0
            ? <PlayersList players={liveScorers} title="Top Scorers" subtitle="Goals / Assists" />
            : <NoCurrentData title="Top Scorers" loading={loading} />
        )}
        {activeTab === 'assists' && (
          liveAssists.length > 0
            ? <PlayersList players={liveAssists} title="Top Assists" subtitle="Assists / Goals" />
            : <NoCurrentData title="Top Assists" loading={loading} />
        )}
        {activeTab === 'defender' && <NoCurrentData title="Top Defenders" />}
        {activeTab === 'gk' && <NoCurrentData title="Top Goalkeepers" />}
      </div>
    </div>
  );
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function SectionHeading({ icon: Icon, iconClass, title }: { icon: typeof Goal; iconClass: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <h4 className="text-gray-100">{title}</h4>
    </div>
  );
}

function Top5Overview({ teams, scorers, assists, leaderStanding, leaderLeagueColor, loading }: {
  teams: Team[];
  scorers: Player[];
  assists: Player[];
  leaderStanding: import('../data/leagueData').Standing | null;
  leaderLeagueColor: string;
  loading: boolean;
}) {
  const topTeam = teams[0];
  const leader = leaderStanding;
  const scorer = scorers[0];
  const assister = assists[0];
  const color = leaderLeagueColor;

  const played = leader?.played ?? 0;
  const ppm = leader && played > 0 ? (leader.points / played).toFixed(2) : null;
  const formColors: Record<string, string> = { W: '#22c55e', D: '#f59e0b', L: '#ef4444' };

  // Win/draw/loss distribution — only computed from real games played
  const winPct  = played > 0 ? Math.round((leader!.won   / played) * 100) : 0;
  const drawPct = played > 0 ? Math.round((leader!.drawn / played) * 100) : 0;
  const lossPct = played > 0 ? Math.max(0, 100 - winPct - drawPct) : 0;

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
      {topTeam && leader ? (
        <div className="space-y-4">
          {/* Hero banner */}
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 120, background: 'linear-gradient(135deg, #1f1f1f 0%, #141414 55%, #0d0d0d 100%)' }}>
            <div className="relative z-10 p-5 flex flex-wrap items-center gap-4">
              <ClubCrest club={topTeam.name} size={56} />
              <div>
                <p className="text-white text-xl font-bold">{topTeam.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <LeagueBadge league={topTeam.league} size={20} />
                  <p className="text-gray-300 text-sm">{topTeam.league}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 ml-auto">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">Points</p>
                  <p className="text-2xl font-bold text-white">{leader.points}</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">GF</p>
                  <p className="text-2xl font-bold text-white">{leader.gf}</p>
                </div>
                {ppm && (
                  <>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                      <p className="text-[11px] text-gray-400 mb-0.5">Pts/Game</p>
                      <p className="text-2xl font-bold text-white">{ppm}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-950/30 to-[#111111] rounded-lg border border-blue-900/30 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl">
              {/* Form Card — only real results */}
              {(leader.form.length > 0 || played > 0) && (
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-sm text-gray-400">Recent Form</p>
                  </div>

                  {leader.form.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">Last {leader.form.length} games</p>
                      <div className="flex items-center gap-1 mb-4">
                        {leader.form.map((f, i) => (
                          <span key={i} className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-medium"
                            style={{ backgroundColor: formColors[f] }}>{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* W/D/L breakdown pie */}
                  {played > 0 && (
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
                  )}
                </div>
              )}

              {/* League Statistics */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-sm text-gray-400">League Statistics</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Games Played', val: leader.played, cls: 'text-gray-200' },
                    { label: 'Wins', val: leader.won, cls: 'text-green-500' },
                    { label: 'Draws', val: leader.drawn, cls: 'text-yellow-500' },
                    { label: 'Losses', val: leader.lost, cls: 'text-red-500' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{r.label}</span>
                      <span className={`text-sm font-medium ${r.cls}`}>{r.val}</span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-800 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Points</span>
                    <span className="text-lg font-medium" style={{ color }}>{leader.points}</span>
                  </div>
                  {ppm && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Pts/Match</span>
                      <span className="text-lg font-medium text-blue-400">{ppm}</span>
                    </div>
                  )}
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
                    { label: 'Goals Scored', val: leader.gf, cls: 'text-green-400' },
                    { label: 'Goals Conceded', val: leader.ga, cls: 'text-red-400' },
                    { label: 'Goal Diff', val: signed(leader.gf - leader.ga), cls: 'text-blue-400' },
                    { label: 'Goals/Game', val: played > 0 ? (leader.gf / played).toFixed(2) : '–', cls: 'text-gray-200' },
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
                {scorer ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={scorer.name} teamColor={scorer.leagueColor} size={32} />
                      <div>
                        <p className="text-gray-200 text-xs font-semibold leading-tight">{scorer.name}</p>
                        <p className="text-gray-500 text-[10px]">{scorer.team}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: scorer.leagueColor }}>{scorer.value}</p>
                        <p className="text-[10px] text-gray-500">Goals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">{scorer.stat2}</p>
                        <p className="text-[10px] text-gray-500">Assists</p>
                      </div>
                    </div>
                    <div className="mt-1 text-center">
                      <LeagueBadge league={scorer.league} size={18} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 h-20 flex items-center justify-center">{loading ? 'Loading…' : NO_CURRENT_DATA}</p>
                )}
              </div>

              {/* Top Assister quick summary */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <p className="text-sm text-gray-400">Top Assister</p>
                </div>
                {assister ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={assister.name} teamColor={assister.leagueColor} size={32} />
                      <div>
                        <p className="text-gray-200 text-xs font-semibold leading-tight">{assister.name}</p>
                        <p className="text-gray-500 text-[10px]">{assister.team}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <p className="text-2xl font-bold" style={{ color: assister.leagueColor }}>{assister.value}</p>
                        <p className="text-[10px] text-gray-500">Assists</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-gray-400">{assister.stat2}</p>
                        <p className="text-[10px] text-gray-500">Goals</p>
                      </div>
                    </div>
                    <div className="mt-1 text-center">
                      <LeagueBadge league={assister.league} size={18} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 h-20 flex items-center justify-center">{loading ? 'Loading…' : NO_CURRENT_DATA}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <NoCurrentData title="Leading team" loading={loading} />
      )}

      {/* Top Scorer Section */}
      <div className="space-y-4">
        {scorer ? (
          <>
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <PlayerAvatar name={scorer.name} teamColor={scorer.leagueColor} size={44} />
              <ClubCrest club={scorer.team} size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <Goal className="w-4 h-4 text-green-600" />
                  <h4 className="text-gray-100">Top Scorer</h4>
                </div>
                <p className="text-sm text-gray-400">{scorer.name} • {scorer.team}</p>
              </div>
              <div className="ml-auto">
                <LeagueBadge league={scorer.league} size={28} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Goals',           val: scorer.value,                       max: 25 },
                { label: 'Assists',         val: scorer.stat2 ?? 0,                  max: 30 },
                { label: 'Goals + Assists', val: scorer.value + (scorer.stat2 ?? 0), max: 35 },
              ].map(({ label, val, max }) => (
                <div key={label} className="bg-gradient-to-br from-green-950/40 to-[#1a1a1a] p-4 rounded-lg border border-green-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: scorer.leagueColor }} />
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                  <p className="text-3xl font-light text-white">{val}</p>
                  <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min((val / max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <SectionHeading icon={Goal} iconClass="text-green-600" title="Top Scorer" />
            <NoCurrentData loading={loading} />
          </>
        )}
      </div>

      {/* Top Assister Section */}
      <div className="space-y-4">
        {assister ? (
          <>
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <PlayerAvatar name={assister.name} teamColor={assister.leagueColor} size={44} />
              <ClubCrest club={assister.team} size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <h4 className="text-gray-100">Top Assister</h4>
                </div>
                <p className="text-sm text-gray-400">{assister.name} • {assister.team}</p>
              </div>
              <div className="ml-auto">
                <LeagueBadge league={assister.league} size={28} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Assists',            val: assister.value,                         max: 15 },
                { label: 'Goals',              val: assister.stat2 ?? 0,                    max: 25 },
                { label: 'Goal Contributions', val: assister.value + (assister.stat2 ?? 0), max: 35 },
              ].map(({ label, val, max }) => (
                <div key={label} className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: assister.leagueColor }} />
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                  <p className="text-3xl font-light text-white">{val}</p>
                  <div className="mt-3 w-full bg-purple-900/40 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min((val / max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: assister.leagueColor }} />
                  <p className="text-xs text-gray-400">League</p>
                </div>
                <div className="mt-2">
                  <LeagueBadge league={assister.league} size={32} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{assister.league}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <SectionHeading icon={Activity} iconClass="text-purple-600" title="Top Assister" />
            <NoCurrentData loading={loading} />
          </>
        )}
      </div>

      {/* Defender and goalkeeper: no data provider for these yet */}
      <div className="space-y-4">
        <SectionHeading icon={Shield} iconClass="text-orange-600" title="Top Defender" />
        <NoCurrentData />
      </div>
      <div className="space-y-4">
        <SectionHeading icon={Hand} iconClass="text-indigo-600" title="Top Goalkeeper" />
        <NoCurrentData />
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
            key={`${player.league}-${player.id}`}
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
  return <NoCurrentData title={title} />;
}

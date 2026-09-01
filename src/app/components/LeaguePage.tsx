import { useState } from 'react';
import { Trophy, Goal, Users, Shield, Activity, Hand, Wifi, WifiOff } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { ClubCrest } from './ClubCrest';
import { LeagueBadge } from './LeagueBadge';
import { SocialFeed } from './SocialFeed';
import { MatchCard } from './MatchCard';
import { LEAGUE_DATA, type LeagueData, type Player, type FormResult } from '../data/leagueData';
import { useLeagueData } from '../hooks/useLeagueData';
import { useMatches } from '../hooks/useMatches';
import type { NormalizedMatch } from '../services/footballDataService';

interface League {
  id: string;
  name: string;
  color: string;
  accentColor: string;
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function PlayerAvatar({ name, teamColor, size = 40 }: { name: string; teamColor: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white select-none"
      style={{
        width: size, height: size,
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

function FormBadge({ result }: { result: FormResult }) {
  const colors: Record<FormResult, string> = { W: '#22c55e', D: '#f59e0b', L: '#ef4444' };
  return (
    <span
      className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-medium flex-shrink-0"
      style={{ backgroundColor: colors[result] }}
    >
      {result}
    </span>
  );
}

// ── Match strip (mirrors one MatchesSection league group) ────────────────────

function LeagueMatchStrip({
  data,
  league,
  liveMatches,
}: {
  data: LeagueData;
  league: League;
  liveMatches?: NormalizedMatch[];
}) {
  const isLive = liveMatches && liveMatches.length > 0;
  const hasLiveStatus = isLive && liveMatches!.some(m => m.status === 'live');

  const cards = isLive
    ? liveMatches!.map(m => ({
        id: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam,
        homeScore: m.homeScore, awayScore: m.awayScore,
        status: m.status, minute: m.minute ?? undefined, time: m.time,
        league: league.name, leagueColor: league.color,
      }))
    : data.matches.map(m => ({
        id: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam,
        homeScore: m.homeScore ?? null, awayScore: m.awayScore ?? null,
        status: m.status, minute: m.minute, time: m.time,
        league: league.name, leagueColor: league.color,
      }));

  return (
    <div className="bg-[#0d0d0d] border-b border-gray-900">
      <div className="max-w-[1800px] mx-auto">
        {/* Stadium header */}
        <div className="relative h-14 overflow-hidden flex items-center px-4 sm:px-6 lg:px-8">
          <img src={data.stadiumImage} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)' }} />
          <div className="relative z-10 flex items-center gap-3">
            <LeagueBadge league={league.name} size={32} />
            <span className="text-white font-bold text-sm">{league.name}</span>
            <span className="text-gray-400 text-xs">· Matchday {data.currentMatchday}</span>
          </div>
          <div className="ml-auto relative z-10 flex items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-green-400" />
                {hasLiveStatus && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
              </div>
            ) : (
              <WifiOff className="w-3 h-3 text-gray-600" />
            )}
            <span className="text-gray-500 text-xs">{cards.length} matches</span>
          </div>
        </div>

        {/* Compact match cards */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3">
            {cards.map(m => (
              <MatchCard key={m.id} match={m as any} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Top5 overview tab ────────────────────────────────────────────────────────

function LeagueTop5Overview({ data, league, topTeamScorer }: { data: LeagueData; league: League; topTeamScorer?: Player | null }) {
  const leader = data.standings[0];
  const scorer = data.topScorers[0];
  const leaderScorer = topTeamScorer ?? data.topScorers.find(player => player.team === leader?.team) ?? scorer;
  const assister = data.topAssisters[0];
  const defender = data.topDefenders[0];
  const keeper = data.topKeepers[0];
  const ppm = leader ? (leader.points / leader.played).toFixed(2) : '0.00';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-gray-100 mb-1 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          {league.name} Season Overview
        </h3>
        <p className="text-gray-500 text-sm">Top performers and leaders — 2026/27 season</p>
      </div>

      {/* ── Leader hero ── */}
      {leader && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 120 }}>
            <img src={data.stadiumImage} alt={data.stadiumName} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
            <div className="relative z-10 p-5 flex flex-wrap items-center gap-4">
              <ClubCrest club={leader.team} size={56} />
              <div>
                <p className="text-white text-xl font-bold">{leader.team}</p>
                <div className="flex items-center gap-2 mt-1">
                  <LeagueBadge league={league.name} size={20} />
                  <p className="text-gray-300 text-sm">{league.name} · 1st place</p>
                </div>
              </div>
              <div className="flex items-center gap-5 ml-auto">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">Points</p>
                  <p className="text-2xl font-bold" style={{ color: league.color }}>{leader.points}</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">GD</p>
                  <p className="text-2xl font-bold text-white">+{leader.gd}</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">Pts/Game</p>
                  <p className="text-2xl font-bold text-white">{ppm}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg border p-6"
            style={{ background: `linear-gradient(135deg, ${league.color}12 0%, #111111 60%)`, borderColor: `${league.color}30` }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl">
              {/* Recent form */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: league.color }} />
                  <p className="text-sm text-gray-400">Recent Form</p>
                </div>
                <p className="text-xs text-gray-400 mb-2">Last 5 games</p>
                <div className="flex items-center gap-1 mb-4">
                  {leader.form.map((f, i) => <FormBadge key={i} result={f} />)}
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Wins vs Tiers</p>
                  <div className="flex items-center gap-2">
                    <PieChart width={60} height={60}>
                      <Pie data={[{ value: 40 }, { value: 35 }, { value: 25 }]} cx={30} cy={30}
                        startAngle={90} endAngle={-270} innerRadius={15} outerRadius={28} paddingAngle={2} dataKey="value">
                        <Cell fill="#22c55e" /><Cell fill="#3b82f6" /><Cell fill="#60a5fa" />
                      </Pie>
                    </PieChart>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-gray-600">40% top 5</span></div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-gray-600">35% mid</span></div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300" /><span className="text-gray-600">25% btm</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* League stats */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-sm text-gray-400">League Stats</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Games', val: leader.played, cls: 'text-gray-200' },
                    { label: 'Wins',  val: leader.won,    cls: 'text-green-500' },
                    { label: 'Draws', val: leader.drawn,  cls: 'text-yellow-500' },
                    { label: 'Losses',val: leader.lost,   cls: 'text-red-500' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{r.label}</span>
                      <span className={`text-sm font-medium ${r.cls}`}>{r.val}</span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-800 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Points</span>
                    <span className="text-lg font-medium" style={{ color: league.color }}>{leader.points}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Pts/Match</span>
                    <span className="text-lg font-medium text-blue-400">{ppm}</span>
                  </div>
                </div>
              </div>

              {/* Season stats */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <p className="text-sm text-gray-400">Season Stats</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Total Goals',   val: data.stats.totalGoals },
                    { label: 'Goals/Game',    val: data.stats.goalsPerGame.toFixed(2) },
                    { label: 'Matchday',      val: `${data.currentMatchday}/${data.totalMatchdays}` },
                    { label: 'Home Win %',    val: `${data.stats.homeWinPct}%` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{r.label}</span>
                      <span className="text-sm font-medium text-gray-200">{r.val}</span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-800 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Clubs</span>
                    <span className="text-lg font-medium text-purple-400">{data.totalClubs}</span>
                  </div>
                </div>
              </div>

              {/* Possession */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm text-gray-400">Possession</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Avg on Wins',   pct: 63, cls: 'bg-green-500',  textCls: 'text-green-500' },
                    { label: 'Avg on Draws',  pct: 57, cls: 'bg-yellow-500', textCls: 'text-yellow-500' },
                    { label: 'Avg on Losses', pct: 51, cls: 'bg-red-500',    textCls: 'text-red-500' },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">{r.label}</span>
                        <span className={`text-sm font-medium ${r.textCls}`}>{r.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className={`${r.cls} h-1.5 rounded-full`} style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top scorer quick card */}
              {leaderScorer && (
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="text-sm text-gray-400">Top Scorer</p>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <PlayerAvatar name={leaderScorer.name} teamColor={league.color} size={32} />
                    <div>
                      <p className="text-gray-200 text-xs font-semibold leading-tight">{leaderScorer.name}</p>
                      <p className="text-gray-600 text-[10px]">{leaderScorer.team}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: league.color }}>{leaderScorer.goals}</p>
                      <p className="text-[10px] text-gray-600">Goals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">{leaderScorer.assists}</p>
                      <p className="text-[10px] text-gray-600">Assists</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Top Scorer section ── */}
      {scorer && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <PlayerAvatar name={scorer.name} teamColor={league.color} size={44} />
            <ClubCrest club={scorer.team} size={36} />
            <div>
              <div className="flex items-center gap-2">
                <Goal className="w-4 h-4 text-green-500" />
                <h4 className="text-gray-100">Top Scorer</h4>
              </div>
              <p className="text-sm text-gray-400">{scorer.name} · {scorer.team}</p>
            </div>
            <div className="ml-auto"><LeagueBadge league={league.name} size={28} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Goals',           val: scorer.goals,                  pct: scorer.goals / 25 },
              { label: 'Assists',         val: scorer.assists,                pct: scorer.assists / 15 },
              { label: 'Conversion Rate', val: '82%',                         pct: 0.82 },
              { label: 'Expected Goals',  val: (scorer.goals * 0.91).toFixed(1), pct: (scorer.goals * 0.91) / 20 },
              { label: 'Minutes/Goal',    val: Math.round(1530 / scorer.goals), pct: 1 - Math.round(1530 / scorer.goals) / 150 },
            ].map(({ label, val, pct }) => (
              <div key={label} className="bg-gradient-to-br from-green-950/40 to-[#1a1a1a] p-4 rounded-lg border border-green-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: league.color }} />
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
                <p className="text-3xl font-light text-white">{val}</p>
                <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Assister section ── */}
      {assister && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <PlayerAvatar name={assister.name} teamColor={league.color} size={44} />
            <ClubCrest club={assister.team} size={36} />
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <h4 className="text-gray-100">Top Assister</h4>
              </div>
              <p className="text-sm text-gray-400">{assister.name} · {assister.team}</p>
            </div>
            <div className="ml-auto"><LeagueBadge league={league.name} size={28} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Assists',           val: assister.assists,                   pct: assister.assists / 15 },
              { label: 'Goals',             val: assister.goals,                     pct: assister.goals / 20 },
              { label: 'Expected Assists',  val: (assister.assists * 0.9).toFixed(1),pct: (assister.assists * 0.9) / 15 },
              { label: 'Key Passes',        val: assister.assists * 4,               pct: (assister.assists * 4) / 60 },
              { label: 'Pass Accuracy',     val: '89%',                              pct: 0.89 },
            ].map(({ label, val, pct }) => (
              <div key={label} className="bg-gradient-to-br from-purple-950/40 to-[#1a1a1a] p-4 rounded-lg border border-purple-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: league.color }} />
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
                <p className="text-3xl font-light text-white">{val}</p>
                <div className="mt-3 w-full bg-purple-900/40 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Defender section ── */}
      {defender && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <PlayerAvatar name={defender.name} teamColor={league.color} size={44} />
            <ClubCrest club={defender.team} size={36} />
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <h4 className="text-gray-100">Top Defender</h4>
              </div>
              <p className="text-sm text-gray-400">{defender.name} · {defender.team}</p>
            </div>
            <div className="ml-auto"><LeagueBadge league={league.name} size={28} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Rating',        val: defender.goals.toFixed(1),   pct: (defender.goals - 6) / 4 },
              { label: 'Clean Sheets',  val: defender.assists,            pct: defender.assists / 12 },
              { label: 'Tackles Won',   val: defender.tacklesWon    ?? 67, pct: (defender.tacklesWon    ?? 67) / 80 },
              { label: 'Interceptions', val: defender.interceptions ?? 52, pct: (defender.interceptions ?? 52) / 70 },
              { label: 'Clearances',    val: defender.clearances    ?? 89, pct: (defender.clearances    ?? 89) / 110 },
            ].map(({ label, val, pct }) => (
              <div key={label} className="bg-gradient-to-br from-orange-950/40 to-[#1a1a1a] p-4 rounded-lg border border-orange-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: league.color }} />
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
                <p className="text-3xl font-light text-white">{val}</p>
                <div className="mt-3 w-full bg-orange-900/40 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${Math.min(Math.max(pct * 100, 0), 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Goalkeeper section ── */}
      {keeper && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <PlayerAvatar name={keeper.name} teamColor={league.color} size={44} />
            <ClubCrest club={keeper.team} size={36} />
            <div>
              <div className="flex items-center gap-2">
                <Hand className="w-4 h-4 text-indigo-400" />
                <h4 className="text-gray-100">Top Goalkeeper</h4>
              </div>
              <p className="text-sm text-gray-400">{keeper.name} · {keeper.team}</p>
            </div>
            <div className="ml-auto"><LeagueBadge league={league.name} size={28} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Clean Sheets',    val: keeper.goals,                            pct: keeper.goals / 17 },
              { label: 'Rating',          val: keeper.assists.toFixed(1),                pct: (keeper.assists - 6) / 4 },
              { label: 'Saves',           val: keeper.saves          ?? 78,              pct: (keeper.saves ?? 78) / 100 },
              { label: 'Save %',          val: `${keeper.savePercentage ?? 76}%`,        pct: (keeper.savePercentage ?? 76) / 100 },
              { label: 'Minutes Played',  val: keeper.minutesPlayed  ?? 1530,            pct: (keeper.minutesPlayed ?? 1530) / 1800 },
            ].map(({ label, val, pct }) => (
              <div key={label} className="bg-gradient-to-br from-indigo-950/40 to-[#1a1a1a] p-4 rounded-lg border border-indigo-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: league.color }} />
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
                <p className="text-3xl font-light text-white">{val}</p>
                <div className="mt-3 w-full bg-indigo-900/40 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(Math.max(pct * 100, 0), 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Standings tab ────────────────────────────────────────────────────────────

function LeagueTeamsList({ data, league }: { data: LeagueData; league: League }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-100">{league.name} Standings</h3>
        <p className="text-sm text-gray-400">2026/27 season</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-600 pb-3 px-2">#</th>
              <th className="text-left text-xs text-gray-500 pb-3">Club</th>
              <th className="text-center text-xs text-gray-500 pb-3">P</th>
              <th className="text-center text-xs text-gray-500 pb-3">W</th>
              <th className="text-center text-xs text-gray-500 pb-3">D</th>
              <th className="text-center text-xs text-gray-500 pb-3">L</th>
              <th className="text-center text-xs text-gray-500 pb-3">GD</th>
              <th className="text-center text-xs text-gray-500 pb-3">Form</th>
              <th className="text-center text-xs text-gray-500 pb-3">PTS</th>
            </tr>
          </thead>
          <tbody>
            {data.standings.map((row) => {
              const isLeader = row.position === 1;
              return (
                <tr
                  key={row.team}
                  className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                  style={isLeader ? { borderLeft: `2px solid ${league.color}` } : undefined}
                >
                  <td className="py-3 px-2">
                    <span className={`text-sm font-bold ${isLeader ? '' : 'text-gray-500'}`}
                      style={isLeader ? { color: league.color } : undefined}>
                      {row.position}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <ClubCrest club={row.team} size={28} />
                      <span className={`font-medium ${isLeader ? 'text-white' : 'text-gray-100'}`}>{row.team}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center"><span className="text-sm text-gray-400">{row.played}</span></td>
                  <td className="py-3 text-center"><span className="text-sm text-green-400">{row.won}</span></td>
                  <td className="py-3 text-center"><span className="text-sm text-gray-400">{row.drawn}</span></td>
                  <td className="py-3 text-center"><span className="text-sm text-red-400">{row.lost}</span></td>
                  <td className="py-3 text-center">
                    <span className={`text-sm ${row.gd > 0 ? 'text-green-400' : row.gd < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-0.5 justify-center">
                      {row.form.map((f, i) => <FormBadge key={i} result={f} />)}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="font-bold text-gray-100"
                      style={isLeader ? { color: league.color } : undefined}>
                      {row.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Generic player list tab ──────────────────────────────────────────────────

function LeaguePlayersList({ players, title, subtitle, league }: {
  players: Player[];
  title: string;
  subtitle: string;
  league: League;
}) {
  const [primaryLabel, secondaryLabel] = subtitle.split(' / ');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-100">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.rank}
            className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors border border-gray-800"
          >
            <span className="text-gray-600 text-sm font-bold w-5 text-center flex-shrink-0">{index + 1}</span>
            <PlayerAvatar name={player.name} teamColor={league.color} size={36} />
            <ClubCrest club={player.team} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-gray-100 font-medium truncate">{player.name}</p>
              <p className="text-xs text-gray-500 truncate">{player.team}</p>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-gray-100">{player.goals}</p>
                <p className="text-xs text-gray-500">{primaryLabel}</p>
              </div>
              <div>
                <p className="text-gray-600">{player.assists}</p>
                <p className="text-xs text-gray-500">{secondaryLabel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main tabbed stats section ────────────────────────────────────────────────

type TabType = 'top5' | 'teams' | 'goals' | 'assists' | 'defender' | 'gk';

function LeagueStatsSection({ data, league, isLive, topTeamScorer }: { data: LeagueData; league: League; isLive?: boolean; topTeamScorer?: Player | null }) {
  const [activeTab, setActiveTab] = useState<TabType>('top5');

  const tabs = [
    { id: 'top5'     as TabType, label: 'Top 5',    icon: Trophy  },
    { id: 'teams'    as TabType, label: 'Teams',    icon: Users   },
    { id: 'goals'    as TabType, label: 'Goals',    icon: Goal    },
    { id: 'assists'  as TabType, label: 'Assists',  icon: Activity },
    { id: 'defender' as TabType, label: 'Defender', icon: Shield  },
    { id: 'gk'       as TabType, label: 'GK',       icon: Hand    },
  ];

  return (
    <div className="bg-[#111111] rounded-lg shadow-xl border border-gray-800 overflow-hidden">
      {/* Tabs + live badge */}
      <div className="bg-[#0d0d0d] border-b border-gray-800 flex items-stretch">
        <div className="flex-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 whitespace-nowrap transition-colors border-b-2 ${
                    isActive ? 'bg-[#2a2a2a]' : 'border-transparent text-gray-400 hover:text-white hover:bg-[#252525]'
                  }`}
                  style={isActive ? { borderBottomColor: league.color, color: league.color } : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Live / offline pill */}
        <div className="flex items-center pr-4 pl-2 flex-shrink-0">
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-green-950/50 border border-green-900/40 rounded-full px-2.5 py-1">
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-green-400 font-medium">Live Data</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-800/50 border border-gray-700/40 rounded-full px-2.5 py-1">
              <WifiOff className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] text-gray-500">Cached</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'top5'     && <LeagueTop5Overview data={data} league={league} topTeamScorer={topTeamScorer} />}
        {activeTab === 'teams'    && <LeagueTeamsList data={data} league={league} />}
        {activeTab === 'goals'    && <LeaguePlayersList players={data.topScorers}   title="Top Scorers"     subtitle="Goals / Assists"       league={league} />}
        {activeTab === 'assists'  && <LeaguePlayersList players={data.topAssisters} title="Top Assisters"   subtitle="Assists / Goals"       league={league} />}
        {activeTab === 'defender' && <LeaguePlayersList players={data.topDefenders} title="Top Defenders"   subtitle="Rating / Clean Sheets" league={league} />}
        {activeTab === 'gk'       && <LeaguePlayersList players={data.topKeepers}   title="Top Goalkeepers" subtitle="Clean Sheets / Rating"  league={league} />}
      </div>
    </div>
  );
}

// ── Page entry point ─────────────────────────────────────────────────────────

export function LeaguePage({ league }: { league: League }) {
  const staticData = LEAGUE_DATA[league.id];
  const { data, isLive, topTeamScorer } = useLeagueData(league.id);
  const { matchesByLeague } = useMatches();

  const liveLeagueMatches = matchesByLeague[league.name];

  if (!staticData) return null;

  return (
    <div key={league.id}>
      {/* ── Match strip ── */}
      <LeagueMatchStrip data={data} league={league} liveMatches={liveLeagueMatches} />

      {/* ── Same 9 + 3 grid as Home ── */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <LeagueStatsSection data={data} league={league} isLive={isLive} topTeamScorer={topTeamScorer} />
          </div>
          <div className="lg:col-span-3">
            <SocialFeed selectedLeague={league} />
          </div>
        </div>
      </div>
    </div>
  );
}

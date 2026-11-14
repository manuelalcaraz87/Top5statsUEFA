import { useState } from 'react';
import { Trophy, Goal, Users, Shield, Activity, Hand, Wifi, WifiOff } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { ClubCrest } from './ClubCrest';
import { LeagueBadge } from './LeagueBadge';
import { MatchCard } from './MatchCard';
import { NoCurrentData } from './NoCurrentData';
import { LEAGUES, type LeagueData, type Player, type FormResult } from '../data/leagueData';
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

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

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

function SectionHeading({ icon: Icon, iconClass, title }: { icon: typeof Goal; iconClass: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <h4 className="text-gray-100">{title}</h4>
    </div>
  );
}

// ── Match strip (mirrors one MatchesSection league group) ────────────────────

function LeagueMatchStrip({
  data,
  league,
  liveMatches,
  loading,
}: {
  data: LeagueData;
  league: League;
  liveMatches?: NormalizedMatch[];
  loading: boolean;
}) {
  const cards = (liveMatches ?? []).map(m => ({
    id: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam,
    homeScore: m.homeScore, awayScore: m.awayScore,
    status: m.status, minute: m.minute ?? undefined, time: m.time,
    league: league.name, leagueColor: league.color,
  }));
  const isLive = cards.length > 0;
  const hasLiveStatus = cards.some(m => m.status === 'live');

  return (
    <div className="bg-[#0d0d0d] border-b border-gray-900">
      <div className="max-w-[1800px] mx-auto">
        {/* League header */}
        <div className="relative h-14 overflow-hidden flex items-center px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to right, #1a1a1a 0%, #141414 55%, #0d0d0d 100%)' }}>
          <div className="relative z-10 flex items-center gap-3">
            <LeagueBadge league={league.name} size={32} />
            <span className="text-white font-bold text-sm">{league.name}</span>
            {data.currentMatchday !== null && (
              <span className="text-gray-400 text-xs">· Matchday {data.currentMatchday}</span>
            )}
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
            {isLive && <span className="text-gray-500 text-xs">{cards.length} matches</span>}
          </div>
        </div>

        {/* Compact match cards */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto scrollbar-hide">
          {isLive ? (
            <div className="flex gap-3">
              {cards.map(m => (
                <MatchCard key={m.id} match={m as any} compact />
              ))}
            </div>
          ) : (
            <NoCurrentData title="Matches" loading={loading} compact />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Top5 overview tab ────────────────────────────────────────────────────────

function LeagueTop5Overview({ data, league, topTeamScorer, loading }: {
  data: LeagueData;
  league: League;
  topTeamScorer?: Player | null;
  loading: boolean;
}) {
  const leader = data.standings[0];
  const scorer = data.topScorers[0];
  const leaderScorer = topTeamScorer ?? scorer;
  const assister = data.topAssisters[0];
  const ppm = leader && leader.played > 0 ? (leader.points / leader.played).toFixed(2) : null;

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
      {leader ? (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 120, background: 'linear-gradient(135deg, #1f1f1f 0%, #141414 55%, #0d0d0d 100%)' }}>
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
                  <p className="text-2xl font-bold text-white">{signed(leader.gd)}</p>
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

          <div
            className="rounded-lg border p-6"
            style={{ background: `linear-gradient(135deg, ${league.color}12 0%, #111111 60%)`, borderColor: `${league.color}30` }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl">
              {/* Recent form and W/D/L — only from real results */}
              {(leader.form.length > 0 || leader.played > 0) && (
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: league.color }} />
                    <p className="text-sm text-gray-400">Recent Form</p>
                  </div>
                  {leader.form.length > 0 && (
                    <>
                      <p className="text-xs text-gray-400 mb-2">Last {leader.form.length} games</p>
                      <div className="flex items-center gap-1 mb-4">
                        {leader.form.map((f, i) => <FormBadge key={i} result={f} />)}
                      </div>
                    </>
                  )}
                  {leader.played > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">W / D / L</p>
                      <div className="flex items-center gap-2">
                        <PieChart width={60} height={60}>
                          <Pie data={[{ value: leader.won }, { value: leader.drawn }, { value: leader.lost }]} cx={30} cy={30}
                            startAngle={90} endAngle={-270} innerRadius={15} outerRadius={28} paddingAngle={2} dataKey="value">
                            <Cell fill="#22c55e" /><Cell fill="#eab308" /><Cell fill="#ef4444" />
                          </Pie>
                        </PieChart>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-gray-400">{Math.round((leader.won / leader.played) * 100)}% W</span></div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-gray-400">{Math.round((leader.drawn / leader.played) * 100)}% D</span></div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-gray-400">{Math.round((leader.lost / leader.played) * 100)}% L</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Leader record */}
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
                  {ppm && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Pts/Match</span>
                      <span className="text-lg font-medium text-blue-400">{ppm}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Season totals, derived from the live table */}
              {data.stats && (
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <p className="text-sm text-gray-400">Season Stats</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Total Goals',    val: data.stats.totalGoals },
                      { label: 'Goals/Game',     val: data.stats.goalsPerGame.toFixed(2) },
                      { label: 'Matches Played', val: data.stats.matchesPlayed },
                      ...(data.currentMatchday !== null ? [{ label: 'Matchday', val: data.currentMatchday }] : []),
                    ].map(r => (
                      <div key={r.label} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{r.label}</span>
                        <span className="text-sm font-medium text-gray-200">{r.val}</span>
                      </div>
                    ))}
                    <div className="h-px bg-gray-800 my-1" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Clubs</span>
                      <span className="text-lg font-medium text-purple-400">{data.standings.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Goal record */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm text-gray-400">Goal Record</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Goals For',     val: leader.gf,         pct: Math.min((leader.gf / 80) * 100, 100), cls: 'bg-green-500', textCls: 'text-green-400' },
                    { label: 'Goals Against', val: leader.ga,         pct: Math.min((leader.ga / 50) * 100, 100), cls: 'bg-red-500',   textCls: 'text-red-400' },
                    { label: 'Goal Diff',     val: signed(leader.gd), pct: Math.min(Math.max((leader.gd / 50) * 100, 0), 100), cls: 'bg-blue-500', textCls: 'text-blue-400' },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">{r.label}</span>
                        <span className={`text-sm font-medium ${r.textCls}`}>{r.val}</span>
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
      ) : (
        <NoCurrentData title="League leader" loading={loading} />
      )}

      {/* ── Top Scorer section ── */}
      <div className="space-y-4">
        {scorer ? (
          <>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Goals',           val: scorer.goals,                  pct: scorer.goals / 25 },
                { label: 'Assists',         val: scorer.assists,                pct: scorer.assists / 15 },
                { label: 'Goals + Assists', val: scorer.goals + scorer.assists, pct: (scorer.goals + scorer.assists) / 35 },
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
          </>
        ) : (
          <>
            <SectionHeading icon={Goal} iconClass="text-green-500" title="Top Scorer" />
            <NoCurrentData loading={loading} />
          </>
        )}
      </div>

      {/* ── Top Assister section ── */}
      <div className="space-y-4">
        {assister ? (
          <>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Assists',         val: assister.assists,                    pct: assister.assists / 15 },
                { label: 'Goals',           val: assister.goals,                      pct: assister.goals / 20 },
                { label: 'Goals + Assists', val: assister.goals + assister.assists,   pct: (assister.goals + assister.assists) / 35 },
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
          </>
        ) : (
          <>
            <SectionHeading icon={Activity} iconClass="text-purple-500" title="Top Assister" />
            <NoCurrentData loading={loading} />
          </>
        )}
      </div>

      {/* ── Defender and goalkeeper: no data provider for these yet ── */}
      <div className="space-y-4">
        <SectionHeading icon={Shield} iconClass="text-orange-500" title="Top Defender" />
        <NoCurrentData />
      </div>
      <div className="space-y-4">
        <SectionHeading icon={Hand} iconClass="text-indigo-400" title="Top Goalkeeper" />
        <NoCurrentData />
      </div>
    </div>
  );
}

// ── Standings tab ────────────────────────────────────────────────────────────

function LeagueTeamsList({ data, league, loading }: { data: LeagueData; league: League; loading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-100">{league.name} Standings</h3>
        <p className="text-sm text-gray-400">2026/27 season</p>
      </div>
      {data.standings.length === 0 ? (
        <NoCurrentData loading={loading} />
      ) : (
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
                        {signed(row.gd)}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-0.5 justify-center">
                        {row.form.length > 0
                          ? row.form.map((f, i) => <FormBadge key={i} result={f} />)
                          : <span className="text-xs text-gray-600">—</span>}
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
      )}
    </div>
  );
}

// ── Goals / assists player list tab ──────────────────────────────────────────

function LeaguePlayersList({ players, title, type, league, loading }: {
  players: Player[];
  title: string;
  type: 'goals' | 'assists';
  league: League;
  loading: boolean;
}) {
  const subtitle   = type === 'goals' ? 'Goals / Assists' : 'Assists / Goals';
  const headerCols = type === 'goals' ? ['Goals', 'Assists', 'G+A'] : ['Assists', 'Goals', 'G+A'];
  const rowValues  = (p: Player) => type === 'goals'
    ? [p.goals, p.assists, p.goals + p.assists]
    : [p.assists, p.goals, p.goals + p.assists];

  const accentFrom   = type === 'goals' ? 'from-green-950/30'   : 'from-purple-950/30';
  const accentBorder = type === 'goals' ? 'border-green-900/30' : 'border-purple-900/30';
  const accentText   = type === 'goals' ? 'text-green-400'      : 'text-purple-400';
  const gridCols = `2rem 1fr 6rem repeat(${headerCols.length}, 4.5rem)`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-100">{title}</h3>
        <p className="text-sm text-gray-400">{league.name} · {subtitle}</p>
      </div>

      {players.length === 0 ? (
        <NoCurrentData loading={loading} />
      ) : (
        <>
          {/* Header row */}
          <div className={`grid items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br ${accentFrom} to-[#111] border ${accentBorder} text-xs text-gray-500`}
            style={{ gridTemplateColumns: gridCols }}>
            <span>#</span>
            <span>Player</span>
            <span>Club</span>
            {headerCols.map(h => <span key={h} className={`text-center ${accentText}`}>{h}</span>)}
          </div>

          {players.map((player, index) => {
            const vals = rowValues(player);
            const isTop3 = index < 3;
            return (
              <div
                key={player.rank ?? index}
                className={`grid items-center gap-2 px-3 py-3 rounded-lg border transition-colors
                  ${isTop3
                    ? `bg-gradient-to-br ${accentFrom} to-[#1a1a1a] ${accentBorder} hover:brightness-110`
                    : 'bg-[#1a1a1a] border-gray-800 hover:bg-[#222]'
                  }`}
                style={{ gridTemplateColumns: gridCols }}
              >
                <span className={`text-sm font-bold text-center ${isTop3 ? accentText : 'text-gray-600'}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar name={player.name} teamColor={league.color} size={28} />
                    <div className="min-w-0">
                      <p className="text-gray-100 font-medium text-sm truncate">{player.name}</p>
                      <p className="text-xs text-gray-500 truncate">{player.team}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <ClubCrest club={player.team} size={26} />
                </div>
                {vals.map((v, i) => (
                  <div key={i} className="text-center">
                    <span className={`text-sm font-semibold ${i === 0 ? accentText : 'text-gray-300'}`}>{v}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Main tabbed stats section ────────────────────────────────────────────────

type TabType = 'top5' | 'teams' | 'goals' | 'assists' | 'defender' | 'gk';

function LeagueStatsSection({ data, league, isLive, topTeamScorer, loadingStandings, loadingScorers }: {
  data: LeagueData;
  league: League;
  isLive: boolean;
  topTeamScorer?: Player | null;
  loadingStandings: boolean;
  loadingScorers: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('top5');
  const loadingAny = loadingStandings || loadingScorers;

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
              <span className="text-[10px] text-gray-500">{loadingAny ? 'Loading…' : 'No live data'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'top5'     && <LeagueTop5Overview data={data} league={league} topTeamScorer={topTeamScorer} loading={loadingAny} />}
        {activeTab === 'teams'    && <LeagueTeamsList data={data} league={league} loading={loadingStandings} />}
        {activeTab === 'goals'    && <LeaguePlayersList players={data.topScorers}   title="Top Scorers"   type="goals"   league={league} loading={loadingScorers} />}
        {activeTab === 'assists'  && <LeaguePlayersList players={data.topAssisters} title="Top Assisters" type="assists" league={league} loading={loadingScorers} />}
        {activeTab === 'defender' && <NoCurrentData title="Top Defenders" />}
        {activeTab === 'gk'       && <NoCurrentData title="Top Goalkeepers" />}
      </div>
    </div>
  );
}

// ── Page entry point ─────────────────────────────────────────────────────────

export function LeaguePage({ league }: { league: League }) {
  const { data, isLive, topTeamScorer, loadingStandings, loadingScorers } = useLeagueData(league.id);
  const { matchesByLeague, loading: loadingMatches } = useMatches();

  if (!LEAGUES.some(l => l.id === league.id)) return null;

  return (
    <div key={league.id}>
      {/* ── Match strip ── */}
      <LeagueMatchStrip data={data} league={league} liveMatches={matchesByLeague[league.name]} loading={loadingMatches} />

      {/* ── Stats, full width like Home (social feed hidden pending redesign) ── */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LeagueStatsSection
          data={data}
          league={league}
          isLive={isLive}
          topTeamScorer={topTeamScorer}
          loadingStandings={loadingStandings}
          loadingScorers={loadingScorers}
        />
      </div>
    </div>
  );
}

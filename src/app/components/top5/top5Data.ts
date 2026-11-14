import { useEffect, useState } from 'react';
import { useLeagueData } from '../../hooks/useLeagueData';

// Shared data for the Top 5 area. Real data only (football-data.org);
// anything that source does not provide is null and shows as "–".

export type StatValue = string | number | null;

export interface Top5Entry {
  key: string;
  /** Club name for Clubs; player name for the player categories. */
  name: string;
  /** The club shown with the shield (the club itself, or the player's club). */
  club: string;
  league: string;
  /** Top5 Score: not calculated yet, so always null for now. */
  top5Score: number | null;
  /** Opponents faced: not calculated yet, so always null for now. */
  opponentsFaced: string | null;
  /** Exactly five values, in the order of the category's statLabels. */
  stats: StatValue[];
}

export interface CategoryData {
  entries: Top5Entry[];
  loading: boolean;
  lastUpdated: Date | null;
}

export type CategoryId = 'clubs' | 'strikers' | 'creators' | 'defenders' | 'goalkeepers';

export interface Category {
  id: CategoryId;
  label: string;
  /** Singular label for the leader card, e.g. "Top club". */
  leaderLabel: string;
  statLabels: [string, string, string, string, string];
}

export const CATEGORIES: Record<CategoryId, Category> = {
  clubs: {
    id: 'clubs', label: 'Clubs', leaderLabel: 'Clubs',
    statLabels: ['Points', 'Won–drawn–lost', 'Goals scored', 'Goals conceded', 'Clean sheets'],
  },
  strikers: {
    id: 'strikers', label: 'Strikers', leaderLabel: 'Strikers',
    statLabels: ['Goals', 'Minutes per goal', 'Shots on target', 'Assists', 'Minutes played'],
  },
  creators: {
    id: 'creators', label: 'Creators', leaderLabel: 'Creators',
    statLabels: ['Assists', 'Key passes', 'Pass accuracy', 'Successful dribbles', 'Minutes played'],
  },
  defenders: {
    id: 'defenders', label: 'Defenders', leaderLabel: 'Defenders',
    statLabels: ['Tackles', 'Interceptions', 'Duels won %', 'Blocks', 'Team clean sheets'],
  },
  goalkeepers: {
    id: 'goalkeepers', label: 'Goalkeepers', leaderLabel: 'Goalkeepers',
    statLabels: ['Saves', 'Save %', 'Clean sheets', 'Goals conceded per match', 'Penalties saved'],
  },
};

export const CATEGORY_ORDER: CategoryId[] = ['clubs', 'strikers', 'creators', 'defenders', 'goalkeepers'];

const TOP_N = 5;


/** Remember when real rows last arrived for a category. */
function useLastUpdated(loading: boolean, entries: Top5Entry[]): Date | null {
  const [time, setTime] = useState<Date | null>(null);
  const signature = entries.map(e => `${e.key}:${e.stats.join('|')}`).join(',');
  useEffect(() => {
    if (!loading && signature) setTime(new Date());
  }, [loading, signature]);
  return time;
}

/** A single competition to show instead of the five leagues combined. */
export interface Top5League {
  id: string;
  /** Short name used by the league text chip, e.g. "EPL" or "UCL". */
  name: string;
  /** Full name for headings, e.g. "Premier League". */
  label?: string;
}

const FIVE_LEAGUES: Top5League[] = [
  { id: 'la-liga',    name: 'La Liga' },
  { id: 'epl',        name: 'EPL' },
  { id: 'serie-a',    name: 'Serie A' },
  { id: 'bundesliga', name: 'Bundesliga' },
  { id: 'ligue-1',    name: 'Ligue 1' },
];

/**
 * Everything the Top 5 tabs show. With no league: the five domestic leagues
 * combined. With a league (including the Champions League): only that
 * competition, and the Clubs tab lists its full table.
 */
export function useTop5Data(league?: Top5League): Record<CategoryId, CategoryData> {
  // Always five slots so React sees the same hooks every time; unused slots
  // get an empty id, which makes useLeagueData do nothing.
  const slots = league ? [league, null, null, null, null] : FIVE_LEAGUES;
  const results = [
    useLeagueData(slots[0]?.id ?? ''),
    useLeagueData(slots[1]?.id ?? ''),
    useLeagueData(slots[2]?.id ?? ''),
    useLeagueData(slots[3]?.id ?? ''),
    useLeagueData(slots[4]?.id ?? ''),
  ];
  const leagues = slots.flatMap((l, i) => (l ? [{ name: l.name, result: results[i] }] : []));

  const loadingStandings = leagues.some(l => l.result.loadingStandings);
  const loadingScorers = leagues.some(l => l.result.loadingScorers);

  // Clubs: home page = top five by points per game across the five leagues;
  // league page = the competition's full table, in table order.
  const clubRows = league
    ? leagues.flatMap(l => l.result.data.standings.map(s => ({ league: l.name, s })))
    : leagues
      .flatMap(l => l.result.data.standings
        .filter(s => s.played > 0)
        .map(s => ({ league: l.name, s, ppg: s.points / s.played })))
      .sort((a, b) => b.ppg - a.ppg || b.s.gd - a.s.gd)
      .slice(0, TOP_N);
  const clubs: Top5Entry[] = clubRows
      .map(({ league: leagueName, s }) => ({
        key: `${leagueName}-${s.team}`,
        name: s.team,
        club: s.team,
        league: leagueName,
        top5Score: null,
        opponentsFaced: null,
        stats: [s.points, `${s.won}–${s.drawn}–${s.lost}`, s.gf, s.ga, null],
      }));

  // Players from the football-data.org scorers lists (goals and assists only).
  const players = leagues.flatMap(l =>
    [...l.result.data.topScorers, ...l.result.data.topAssisters].map(p => ({ ...p, league: l.name })));
  const uniquePlayers = [...new Map(players.map(p => [`${p.league}-${p.team}-${p.name}`, p])).values()];

  const strikers: Top5Entry[] = [...uniquePlayers]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, TOP_N)
    .map(p => ({
      key: `${p.league}-${p.team}-${p.name}`,
      name: p.name, club: p.team, league: p.league,
      top5Score: null, opponentsFaced: null,
      stats: [p.goals, null, null, p.assists, null],
    }));

  const creators: Top5Entry[] = [...uniquePlayers]
    .filter(p => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
    .slice(0, TOP_N)
    .map(p => ({
      key: `${p.league}-${p.team}-${p.name}`,
      name: p.name, club: p.team, league: p.league,
      top5Score: null, opponentsFaced: null,
      stats: [p.assists, null, null, null, null],
    }));

  const clubsUpdated = useLastUpdated(loadingStandings, clubs);
  const strikersUpdated = useLastUpdated(loadingScorers, strikers);
  const creatorsUpdated = useLastUpdated(loadingScorers, creators);

  return {
    clubs:       { entries: clubs,    loading: loadingStandings, lastUpdated: clubsUpdated },
    strikers:    { entries: strikers, loading: loadingScorers,   lastUpdated: strikersUpdated },
    creators:    { entries: creators, loading: loadingScorers,   lastUpdated: creatorsUpdated },
    // No free source for these yet: the tabs say "No current data".
    defenders:   { entries: [], loading: false, lastUpdated: null },
    goalkeepers: { entries: [], loading: false, lastUpdated: null },
  };
}

import { useLeagueData } from '../../hooks/useLeagueData';
import {
  DOMESTIC_LISTS, FILE_CATEGORY, chipForCompetition, clubScoreIndex, findClubScore, listForLeague, scoreList, useScores,
  type ScoreEntry,
} from '../../services/scoresService';

// Shared data for the Top 5 area. Rankings, Top5 Scores and player stats come
// from the site's scores file (see scoresService.ts); the full league table
// comes from football-data.org. Anything missing is null and shows as "–",
// and an empty list shows "No current data".

export type StatValue = string | number | null;

export interface Top5Entry {
  key: string;
  /** Club name for Clubs; player name for the player categories. */
  name: string;
  /** The club shown with the shield (the club itself, or the player's club). */
  club: string;
  league: string;
  /** Top5 Score from the scores file; null when the club has none. */
  top5Score: number | null;
  /** Opponents faced (Easy, Average or Hard); null when there is no score. */
  opponentsFaced: string | null;
  /** Exactly five values, in the order of the category's statLabels. */
  stats: StatValue[];
}

export interface CategoryData {
  entries: Top5Entry[];
  loading: boolean;
  lastUpdated: Date | null;
  /** Set on a league or Champions League page; undefined on the home page. */
  league?: Top5League;
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
    statLabels: ['Assists', 'Key passes', 'Pass accuracy %', 'Successful dribbles', 'Minutes played'],
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

/** The stat keys in the scores file, in the order of each category's statLabels. */
const STAT_KEYS: Record<CategoryId, [string, string, string, string, string]> = {
  clubs:       ['points', 'wonDrawnLost', 'goalsScored', 'goalsConceded', 'cleanSheets'],
  strikers:    ['goals', 'minutesPerGoal', 'shotsOnTarget', 'assists', 'minutesPlayed'],
  creators:    ['assists', 'keyPasses', 'passAccuracyPct', 'successfulDribbles', 'minutesPlayed'],
  defenders:   ['tackles', 'interceptions', 'duelsWonPct', 'blocks', 'teamCleanSheets'],
  goalkeepers: ['saves', 'savePct', 'cleanSheets', 'goalsConcededPerMatch', 'penaltiesSaved'],
};

/** A single competition to show instead of the five leagues combined. */
export interface Top5League {
  id: string;
  /** Short name used by the league text chip, e.g. "EPL" or "UCL". */
  name: string;
  /** Full name for headings, e.g. "Premier League". */
  label?: string;
}

function entryFromFile(id: CategoryId, e: ScoreEntry, listKey: string): Top5Entry {
  return {
    key: `${listKey}-${id}-${e.rank}-${e.name}`,
    name: e.name,
    club: e.club,
    league: chipForCompetition(e.competition),
    top5Score: e.score,
    opponentsFaced: e.opponentsFaced ?? null,
    stats: STAT_KEYS[id].map(k => e.stats?.[k] ?? null),
  };
}

/**
 * Everything the Top 5 tabs show. Home page (no league): the file's "overall"
 * lists. League page: that competition's lists, and the Clubs tab lists the
 * full football-data.org table with each club's Top5 Score added from the file.
 */
export function useTop5Data(league?: Top5League): Record<CategoryId, CategoryData> {
  const { scores, loading: loadingScores } = useScores();
  // Only league pages need the football-data.org table. With no league the
  // hook is given an empty id and does nothing (so its loading flag is ignored).
  const table = useLeagueData(league?.id ?? '');

  const listKey = listForLeague(league?.id);
  const generatedAt = scores ? new Date(scores.generatedAt) : null;
  const lastUpdated = generatedAt && !Number.isNaN(generatedAt.getTime()) ? generatedAt : null;

  const fromFile = (id: CategoryId): Top5Entry[] =>
    scoreList(scores, FILE_CATEGORY[id], listKey).slice(0, TOP_N).map(e => entryFromFile(id, e, listKey));

  // Clubs on a league page: the whole table, in table order. The Champions
  // League table also holds clubs from outside the five leagues; they have no
  // score, so they are matched against all five leagues and otherwise left blank.
  let clubs: Top5Entry[];
  if (league) {
    const index = clubScoreIndex(scores, league.id === 'ucl' ? DOMESTIC_LISTS : [listKey]);
    clubs = table.data.standings.map(s => {
      const hit = findClubScore(index, s.team);
      return {
        key: `${league.id}-${s.team}`,
        name: s.team,
        club: s.team,
        league: league.name,
        top5Score: hit?.score ?? null,
        opponentsFaced: hit?.opponentsFaced ?? null,
        stats: [s.points, `${s.won}–${s.drawn}–${s.lost}`, s.gf, s.ga, null],
      };
    });
  } else {
    clubs = fromFile('clubs');
  }

  const clubsLoading = league ? table.loadingStandings || loadingScores : loadingScores;
  const data = (entries: Top5Entry[], loading: boolean): CategoryData => ({ entries, loading, lastUpdated, league });

  return {
    clubs:       data(clubs, clubsLoading),
    strikers:    data(fromFile('strikers'), loadingScores),
    creators:    data(fromFile('creators'), loadingScores),
    defenders:   data(fromFile('defenders'), loadingScores),
    goalkeepers: data(fromFile('goalkeepers'), loadingScores),
  };
}

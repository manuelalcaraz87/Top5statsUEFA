// Data for the match panel, built only from the site's scores file
// (/data/scores.json, already loaded for the strength bars). Nothing here
// makes a network request.
import type { NormalizedMatch } from './footballDataService';
import {
  findByClubName, getLoadedScores, listForLeague, sameClubName, scoreList,
  type ClubLeader, type ScoreList, type ScoresFile,
} from './scoresService';

export type PlayerCategory = 'striker' | 'creator' | 'defender' | 'goalkeeper';

/** Category -> the matching tab id, for its colour, label and stat labels in top5Data. */
export const PLAYER_CATEGORIES: PlayerCategory[] = ['striker', 'creator', 'defender', 'goalkeeper'];

/** The first three stat keys of each category, in the same order as the category tabs' stat labels. */
export const FIRST_STAT_KEYS: Record<PlayerCategory, [string, string, string]> = {
  striker:    ['goals', 'minutesPerGoal', 'shotsOnTarget'],
  creator:    ['assists', 'keyPasses', 'passAccuracyPct'],
  defender:   ['tackles', 'interceptions', 'duelsWonPct'],
  goalkeeper: ['saves', 'savePct', 'cleanSheets'],
};

/** What the visitor reads for each view, e.g. "12th in La Liga" and "Ranked in the La Liga top 20". */
const VIEW_NAMES: Partial<Record<ScoreList, string>> = {
  england: 'Premier League',
  spain: 'La Liga',
  italy: 'Serie A',
  germany: 'Bundesliga',
  france: 'Ligue 1',
  'champions-league': 'Champions League',
};

export interface PanelPlayer {
  category: PlayerCategory;
  name: string;
  /** The card's club name (as shown on the card). */
  club: string;
  score: number;
  rank: number;
  /** The first three stats, raw from the file (null when missing). */
  stats: (string | number | null)[];
}

export type ClubLeadersOnCard = Record<PlayerCategory, PanelPlayer | null>;

export interface RankedPlayer {
  category: PlayerCategory;
  name: string;
  rank: number;
  score: number;
}

export interface MatchPanelData {
  /** Competition name for this view, e.g. "La Liga"; null when the view is unknown. */
  viewName: string | null;
  home: ClubLeadersOnCard;
  away: ClubLeadersOnCard;
  /** Ranked players of each club, in category order then rank order. */
  homeRanked: RankedPlayer[];
  awayRanked: RankedPlayer[];
}

/** 1 -> "1st", 2 -> "2nd", 12 -> "12th". */
export function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  const suffix = ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/** A Champions League match uses the champions-league lists; a league match uses its own league's. */
export function viewForMatch(match: Pick<NormalizedMatch, 'leagueId'>): ScoreList {
  return listForLeague(match.leagueId);
}

function toPlayer(category: PlayerCategory, club: string, leader: ClubLeader): PanelPlayer {
  return {
    category,
    name: leader.name,
    club,
    score: leader.score,
    rank: leader.rank,
    stats: FIRST_STAT_KEYS[category].map(key => leader.stats?.[key] ?? null),
  };
}

/** Every entry of the view's published list for a category that belongs to the club. */
function rankedFor(scores: ScoresFile | null, view: ScoreList, category: PlayerCategory, club: string) {
  return scoreList(scores, category, view).filter(e => sameClubName(e.club, club));
}

function leadersFor(scores: ScoresFile, view: ScoreList, club: string): ClubLeadersOnCard {
  const fromFile = scores.clubLeaders ? findByClubName(scores.clubLeaders[view], club) : undefined;
  const result = {} as ClubLeadersOnCard;
  for (const category of PLAYER_CATEGORIES) {
    if (fromFile) {
      // The file names this club's leader (or says it has none: null).
      const leader = fromFile[category];
      result[category] = leader ? toPlayer(category, club, leader) : null;
    } else {
      // No clubLeaders in the file (or none for this club): the best-ranked
      // player of the club in the view's published list, if there is one.
      const best = rankedFor(scores, view, category, club).sort((a, b) => a.rank - b.rank)[0];
      result[category] = best ? toPlayer(category, club, best) : null;
    }
  }
  return result;
}

function rankedPlayers(scores: ScoresFile, view: ScoreList, club: string): RankedPlayer[] {
  return PLAYER_CATEGORIES.flatMap(category =>
    rankedFor(scores, view, category, club)
      .sort((a, b) => a.rank - b.rank)
      .map(e => ({ category, name: e.name, rank: e.rank, score: e.score })),
  );
}

const NO_LEADERS: ClubLeadersOnCard = { striker: null, creator: null, defender: null, goalkeeper: null };

/** Everything the panel shows for a match, from the already-loaded scores file. */
export function buildMatchPanelData(match: Pick<NormalizedMatch, 'leagueId' | 'homeTeam' | 'awayTeam'>): MatchPanelData {
  const scores = getLoadedScores();
  const view = viewForMatch(match);
  const viewName = VIEW_NAMES[view] ?? null;
  if (!scores || !viewName) {
    return { viewName, home: NO_LEADERS, away: NO_LEADERS, homeRanked: [], awayRanked: [] };
  }
  return {
    viewName,
    home: leadersFor(scores, view, match.homeTeam),
    away: leadersFor(scores, view, match.awayTeam),
    homeRanked: rankedPlayers(scores, view, match.homeTeam),
    awayRanked: rankedPlayers(scores, view, match.awayTeam),
  };
}

/**
 * The short note under "Key matchups" about whether the scores include this
 * match, or null for no note. `through` is the scores file's matchesThrough.
 */
export function scoresNote(match: Pick<NormalizedMatch, 'status' | 'utcDate'>, through: Date | null): string | null {
  if (match.status === 'live') return 'Scores are from before this match.';
  if (match.status === 'finished' && through) {
    const kickoff = new Date(match.utcDate);
    if (!Number.isNaN(kickoff.getTime()) && through.getTime() < kickoff.getTime()) {
      return "Scores don't include this match yet. They update within about two hours of full time.";
    }
  }
  return null;
}

// Club strength: one number from 0 to 100 per club, shown as a bar on the
// match cards. It is the club's Top5 Score from the site's scores file.
//
// Which list the number comes from depends on the match:
//  - Champions League match: the file's champions-league club list (all 36
//    clubs), so both clubs are scored in the same competition.
//  - League match: the club's own league list, as before.
// A club the file has no score for gets no number, so no bar is shown for it.
import type { NormalizedMatch } from './footballDataService';
import { DOMESTIC_LISTS, clubScoreIndex, findClubScore, getLoadedScores } from './scoresService';

export interface MatchStrength { home?: number; away?: number }

type MatchClubs = Pick<NormalizedMatch, 'id' | 'leagueId' | 'homeTeam' | 'awayTeam'>;

/**
 * Strength of both clubs for each match, keyed by match id. The scores file
 * must already be loaded (see useClubStrengths); if it is not, nobody gets a number.
 */
export function calculateMatchStrengths(matches: MatchClubs[]): Record<number, MatchStrength> {
  const scores = getLoadedScores();
  const leagueIndex = clubScoreIndex(scores, DOMESTIC_LISTS);
  const championsLeagueIndex = clubScoreIndex(scores, ['champions-league']);

  const strengths: Record<number, MatchStrength> = {};
  for (const match of matches) {
    const index = match.leagueId === 'ucl' ? championsLeagueIndex : leagueIndex;
    const home = findClubScore(index, match.homeTeam);
    const away = findClubScore(index, match.awayTeam);
    strengths[match.id] = {
      home: home ? Math.round(home.score) : undefined,
      away: away ? Math.round(away.score) : undefined,
    };
  }
  return strengths;
}

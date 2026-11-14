// Club strength: one number from 0 to 100 per club, shown as a bar on the
// match cards. It is the club's Top5 Score from the site's scores file.
// Clubs with no score (for example Champions League clubs from outside the
// five leagues) get no number, so no bar is shown for them.
import type { NormalizedStanding } from './footballDataService';
import { DOMESTIC_LISTS, clubScoreIndex, findClubScore, getLoadedScores } from './scoresService';

/**
 * Strength for every club in one competition's table, keyed by club name
 * (the same normalised names used on match cards). The scores file must
 * already be loaded (see useClubStrengths); if it is not, nobody gets a number.
 */
export function calculateClubStrengths(standings: NormalizedStanding[]): Record<string, number> {
  const index = clubScoreIndex(getLoadedScores(), DOMESTIC_LISTS);
  const strengths: Record<string, number> = {};
  for (const s of standings) {
    const hit = findClubScore(index, s.team);
    if (hit) strengths[s.team] = Math.round(hit.score);
  }
  return strengths;
}

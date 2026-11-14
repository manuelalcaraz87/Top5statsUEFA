// Club strength: one number from 0 to 100 per club, shown as a bar on the
// match cards. It is the club's Top5 Score from the site's scores file.
// Clubs with no score (for example Champions League clubs from outside the
// five leagues) get no number, so no bar is shown for them.
import { DOMESTIC_LISTS, clubScoreIndex, findClubScore, getLoadedScores } from './scoresService';

/**
 * Strength for the given club names (the normalised names used on match
 * cards), keyed by that same name. The scores file must already be loaded
 * (see useClubStrengths); if it is not, nobody gets a number.
 */
export function calculateClubStrengths(teamNames: string[]): Record<string, number> {
  const index = clubScoreIndex(getLoadedScores(), DOMESTIC_LISTS);
  const strengths: Record<string, number> = {};
  for (const name of teamNames) {
    const hit = findClubScore(index, name);
    if (hit) strengths[name] = Math.round(hit.score);
  }
  return strengths;
}

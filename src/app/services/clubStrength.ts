// Club strength: one number from 0 to 100 per club, shown as a bar on the
// match cards.
//
// For now it is the club's position by points per game within its own
// competition, scaled so the best club is 100 and the worst is 0.
// This function is the single place to change when it is replaced by the
// club's Top5 Score: keep the same input and output and nothing else changes.
import type { NormalizedStanding } from './footballDataService';

/**
 * Strength for every club in one competition's table, keyed by club name
 * (the same normalised names used on match cards).
 * Clubs that have not played yet get no number (shown as "No current data").
 */
export function calculateClubStrengths(standings: NormalizedStanding[]): Record<string, number> {
  const ranked = standings
    .filter(s => s.played > 0)
    .map(s => ({ team: s.team, ppg: s.points / s.played }))
    .sort((a, b) => b.ppg - a.ppg);

  const strengths: Record<string, number> = {};
  const n = ranked.length;
  if (n === 0) return strengths;
  if (n === 1) {
    strengths[ranked[0].team] = 100;
    return strengths;
  }

  ranked.forEach((club, i) => {
    // Clubs level on points per game share the higher position.
    let position = i;
    while (position > 0 && ranked[position - 1].ppg === club.ppg) position--;
    strengths[club.team] = Math.round((100 * (n - 1 - position)) / (n - 1));
  });
  return strengths;
}

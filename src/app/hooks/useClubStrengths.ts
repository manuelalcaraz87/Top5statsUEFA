import { useEffect, useState } from 'react';
import { calculateClubStrengths } from '../services/clubStrength';
import { loadScores } from '../services/scoresService';

// Strength numbers (Top5 Scores) for the clubs in the match strip. They come
// straight from the site's scores file, so no football-data.org requests are
// made here. A club the file has no score for simply has no bar.

/** Club name -> strength (0-100). */
export type ClubStrengths = Record<string, number>;

export function useClubStrengths(teamNames: string[]): ClubStrengths {
  const [strengths, setStrengths] = useState<ClubStrengths>({});
  const key = [...new Set(teamNames.filter(Boolean))].sort().join('|');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    loadScores()
      .then(() => { if (!cancelled) setStrengths(calculateClubStrengths(key.split('|'))); })
      .catch(e => console.warn('[useClubStrengths] scores.json could not be loaded:', e));
    return () => { cancelled = true; };
  }, [key]);

  return strengths;
}

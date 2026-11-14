import { useEffect, useState } from 'react';
import { calculateMatchStrengths, type MatchStrength } from '../services/clubStrength';
import { loadScores } from '../services/scoresService';
import type { NormalizedMatch } from '../services/footballDataService';

// Strength numbers (Top5 Scores) for the clubs in the match strip. They come
// straight from the site's scores file, so no football-data.org requests are
// made here. A club the file has no score for simply has no bar.

type MatchClubs = Pick<NormalizedMatch, 'id' | 'leagueId' | 'homeTeam' | 'awayTeam'>;

/** Match id -> strength of the home and away club. */
export type MatchStrengths = Record<number, MatchStrength>;

export function useClubStrengths(matches: MatchClubs[]): MatchStrengths {
  const [strengths, setStrengths] = useState<MatchStrengths>({});
  // Only re-run when the matches or clubs actually change.
  const key = JSON.stringify(matches.map(m => [m.id, m.leagueId, m.homeTeam, m.awayTeam]));

  useEffect(() => {
    const list: MatchClubs[] = (JSON.parse(key) as [number, string, string, string][])
      .map(([id, leagueId, homeTeam, awayTeam]) => ({ id, leagueId, homeTeam, awayTeam }));
    if (list.length === 0) return;
    let cancelled = false;
    loadScores()
      .then(() => { if (!cancelled) setStrengths(calculateMatchStrengths(list)); })
      .catch(e => console.warn('[useClubStrengths] scores.json could not be loaded:', e));
    return () => { cancelled = true; };
  }, [key]);

  return strengths;
}

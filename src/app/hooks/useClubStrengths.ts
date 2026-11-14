import { useEffect, useState } from 'react';
import { fetchStandings, type StandingsResult } from '../services/footballDataService';
import { calculateClubStrengths } from '../services/clubStrength';

// Standings for the competitions shown in the match strip, turned into club
// strength numbers. Uses real football-data.org tables only; a competition
// whose table can't be loaded simply has no numbers ("No current data").

const TTL = 10 * 60_000; // 10 min, same as the league pages
const cache = new Map<string, { data: StandingsResult; timestamp: number }>();
const inFlight = new Map<string, Promise<StandingsResult>>();

function loadStandings(leagueId: string): Promise<StandingsResult> {
  const cached = cache.get(leagueId);
  if (cached && Date.now() - cached.timestamp < TTL) return Promise.resolve(cached.data);
  if (!inFlight.has(leagueId)) {
    inFlight.set(
      leagueId,
      fetchStandings(leagueId)
        .then(data => {
          cache.set(leagueId, { data, timestamp: Date.now() });
          return data;
        })
        .finally(() => inFlight.delete(leagueId)),
    );
  }
  return inFlight.get(leagueId)!;
}

/** leagueId -> club name -> strength (0-100). */
export type ClubStrengthsByLeague = Record<string, Record<string, number>>;

export function useClubStrengths(leagueIds: string[]): ClubStrengthsByLeague {
  const [strengths, setStrengths] = useState<ClubStrengthsByLeague>({});
  const key = [...new Set(leagueIds.filter(Boolean))].sort().join(',');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    for (const leagueId of key.split(',')) {
      loadStandings(leagueId)
        .then(result => {
          if (cancelled) return;
          const forLeague = calculateClubStrengths(result.standings);
          setStrengths(prev => ({ ...prev, [leagueId]: forLeague }));
        })
        .catch(e => console.warn('[useClubStrengths] standings failed for', leagueId, e));
    }
    return () => { cancelled = true; };
  }, [key]);

  return strengths;
}

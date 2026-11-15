import { useState, useEffect, useMemo } from 'react';
import { getStandings, type NormalizedStanding, type StandingsResult } from '../services/footballDataService';
import { EMPTY_LEAGUE_DATA, type LeagueData, type Standing } from '../data/leagueData';

// Live league table (football-data.org). A league page asks for the table
// only: top scorers and other player lists come from the scores file, so
// they are not requested here. When the request fails or has not answered
// yet, `data.standings` stays empty and the caller shows its own fallback.

// A failed request is retried every 10 s for 2 minutes (the server can take
// about a minute to wake up). Only successful answers are remembered, and the
// shared request in getStandings() also keeps the match strip and this table
// from asking the server for the same standings twice.
const RETRY_DELAY = 10_000;
const MAX_RETRIES = 12;

// ── Adapter: API → leagueData.ts type ────────────────────────────────────────

function toStanding(s: NormalizedStanding): Standing {
  const zone: Standing['zone'] =
    s.position === 1     ? 'title'
    : s.position <= 4    ? 'ucl'
    : s.position <= 6    ? 'europa'
    : s.position <= 7    ? 'conference'
    : s.position >= 18   ? 'relegation'
    : undefined;
  return {
    position: s.position,
    team:     s.team,
    played:   s.played,
    won:      s.won,
    drawn:    s.drawn,
    lost:     s.lost,
    gf:       s.gf,
    ga:       s.ga,
    gd:       s.gd,
    points:   s.points,
    form:     s.form,
    zone,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseLeagueDataResult {
  data: LeagueData;
  loadingStandings: boolean;
  /** True once the live table has arrived. */
  isLive: boolean;
}

export function useLeagueData(leagueId: string): UseLeagueDataResult {
  const [standings, setStandings]        = useState<StandingsResult | null>(null);
  const [loadingStandings, setLoadingSt] = useState(true);

  useEffect(() => {
    if (!leagueId) return;
    setLoadingSt(true);
    setStandings(null);

    // Ignore late answers after the league changes or the page unmounts.
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retriesLeft = MAX_RETRIES;

    const attempt = () => {
      getStandings(leagueId)
        .then(data => {
          if (cancelled) return;
          setStandings(data);
          setLoadingSt(false);
        })
        .catch(e => {
          if (cancelled) return;
          console.warn(`[useLeagueData] standings failed for ${leagueId}${retriesLeft > 0 ? ', retrying' : ''}:`, e);
          if (retriesLeft-- > 0) retryTimer = setTimeout(attempt, RETRY_DELAY);
          else setLoadingSt(false);
        });
    };
    attempt();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [leagueId]);

  const data = useMemo<LeagueData>(() => {
    const liveStandings = standings ? standings.standings.map(toStanding) : [];

    // Totals derived from the live table (each match counted once)
    const totalPlayed = liveStandings.reduce((sum, r) => sum + r.played, 0) / 2;
    const totalGoals  = liveStandings.reduce((sum, r) => sum + r.gf, 0) / 2;
    const stats = totalPlayed > 0 ? {
      totalGoals:    Math.round(totalGoals),
      goalsPerGame:  Math.round((totalGoals / totalPlayed) * 100) / 100,
      matchesPlayed: Math.round(totalPlayed),
    } : null;

    return {
      ...EMPTY_LEAGUE_DATA,
      currentMatchday: standings?.currentMatchday ?? null,
      stats,
      standings: liveStandings,
    };
  }, [standings]);

  return {
    data,
    loadingStandings,
    isLive: data.standings.length > 0,
  };
}

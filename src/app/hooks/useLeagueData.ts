import { useState, useEffect, useMemo } from 'react';
import {
  fetchStandings,
  fetchTopScorers,
  type NormalizedStanding,
  type NormalizedScorer,
  type StandingsResult,
} from '../services/footballDataService';
import { EMPTY_LEAGUE_DATA, type LeagueData, type Player, type Standing } from '../data/leagueData';

// Live data only (football-data.org). When a request fails or returns
// nothing, the matching list stays empty and the UI shows "No current data".

// ── Per-league in-memory cache ────────────────────────────────────────────────

interface StandingsCache { data: StandingsResult; timestamp: number }
interface ScorersCache   { data: NormalizedScorer[]; timestamp: number }

const standingsCache = new Map<string, StandingsCache>();
const scorersCache   = new Map<string, ScorersCache>();

const STANDINGS_TTL = 10 * 60_000; // 10 min
const SCORERS_TTL   = 30 * 60_000; // 30 min

const MAX_RETRIES = 3;      // after a failed request
const RETRY_DELAY = 30_000; // 30 s between retries

// ── Adapters: API → leagueData.ts types ──────────────────────────────────────

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

function toScorer(s: NormalizedScorer): Player {
  return {
    rank:    s.rank,
    name:    s.name,
    team:    s.team,
    goals:   s.goals,
    assists: s.assists,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseLeagueDataResult {
  data: LeagueData;
  loadingStandings: boolean;
  loadingScorers: boolean;
  isLive: boolean;
  /** Top scorer from the league leader's club, if live data has one. */
  topTeamScorer: Player | null;
}

export function useLeagueData(leagueId: string): UseLeagueDataResult {
  const [standings, setStandings]        = useState<StandingsResult | null>(null);
  const [scorers,   setScorers]          = useState<NormalizedScorer[] | null>(null);
  const [loadingStandings, setLoadingSt] = useState(true);
  const [loadingScorers,   setLoadingSc] = useState(true);

  useEffect(() => {
    if (!leagueId) return;
    setLoadingSt(true);
    setLoadingSc(true);
    setStandings(null);
    setScorers(null);

    // Ignore late answers after the league changes or the page unmounts.
    let cancelled = false;
    const retryTimers: ReturnType<typeof setTimeout>[] = [];

    // Only successful answers are cached. A failed request is retried a few
    // times (the UI keeps saying "Loading…"); after that it shows
    // "No current data" until the next visit.
    function load<T>(
      label: string,
      cache: Map<string, { data: T; timestamp: number }>,
      ttl: number,
      fetcher: () => Promise<T>,
      setData: (data: T) => void,
      setLoading: (loading: boolean) => void,
    ) {
      const cached = cache.get(leagueId);
      if (cached && Date.now() - cached.timestamp < ttl) {
        setData(cached.data);
        setLoading(false);
        return;
      }
      let retriesLeft = MAX_RETRIES;
      const attempt = () => {
        fetcher()
          .then(data => {
            if (cancelled) return;
            cache.set(leagueId, { data, timestamp: Date.now() });
            setData(data);
            setLoading(false);
          })
          .catch(e => {
            if (cancelled) return;
            console.warn(`[useLeagueData] ${label} failed for ${leagueId}${retriesLeft > 0 ? ', retrying' : ''}:`, e);
            if (retriesLeft-- > 0) retryTimers.push(setTimeout(attempt, RETRY_DELAY));
            else setLoading(false);
          });
      };
      attempt();
    }

    load('standings', standingsCache, STANDINGS_TTL, () => fetchStandings(leagueId), setStandings, setLoadingSt);
    load('scorers', scorersCache, SCORERS_TTL, () => fetchTopScorers(leagueId, 100), setScorers, setLoadingSc);

    return () => {
      cancelled = true;
      retryTimers.forEach(clearTimeout);
    };
  }, [leagueId]);

  const data = useMemo<LeagueData>(() => {
    const liveStandings = standings ? standings.standings.map(toStanding) : [];

    // Scorers sorted by goals; assisters derived by re-sorting the same data by assists
    const liveScorers   = scorers ? scorers.slice(0, 10).map(toScorer) : [];
    const liveAssisters = scorers
      ? [...scorers]
        .filter(s => s.assists > 0)
        .sort((a, b) => b.assists - a.assists)
        .map((s, i) => toScorer({ ...s, rank: i + 1 }))
      : [];

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
      standings:    liveStandings,
      topScorers:   liveScorers,
      topAssisters: liveAssisters,
    };
  }, [standings, scorers]);

  const leaderTeam = data.standings[0]?.team;
  const leaderScorer = leaderTeam ? scorers?.find(s => s.team === leaderTeam) : undefined;

  return {
    data,
    loadingStandings,
    loadingScorers,
    isLive: data.standings.length > 0 || data.topScorers.length > 0,
    topTeamScorer: leaderScorer ? toScorer(leaderScorer) : null,
  };
}

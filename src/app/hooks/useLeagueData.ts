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

    const cachedSt = standingsCache.get(leagueId);
    if (cachedSt && Date.now() - cachedSt.timestamp < STANDINGS_TTL) {
      setStandings(cachedSt.data);
      setLoadingSt(false);
    } else {
      fetchStandings(leagueId)
        .then(data => {
          standingsCache.set(leagueId, { data, timestamp: Date.now() });
          setStandings(data);
        })
        .catch(e => console.warn('[useLeagueData] standings failed:', e))
        .finally(() => setLoadingSt(false));
    }

    const cachedSc = scorersCache.get(leagueId);
    if (cachedSc && Date.now() - cachedSc.timestamp < SCORERS_TTL) {
      setScorers(cachedSc.data);
      setLoadingSc(false);
    } else {
      fetchTopScorers(leagueId, 100)
        .then(data => {
          scorersCache.set(leagueId, { data, timestamp: Date.now() });
          setScorers(data);
        })
        .catch(e => console.warn('[useLeagueData] scorers failed:', e))
        .finally(() => setLoadingSc(false));
    }
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

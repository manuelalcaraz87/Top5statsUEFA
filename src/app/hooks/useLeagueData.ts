import { useState, useEffect, useMemo } from 'react';
import {
  fetchStandings,
  fetchTopScorers,
  type NormalizedStanding,
  type NormalizedScorer,
} from '../services/footballDataService';
import { LEAGUE_DATA, type LeagueData, type Player, type Standing } from '../data/leagueData';

// ── Per-league in-memory cache ────────────────────────────────────────────────

interface StandingsCache { data: NormalizedStanding[]; timestamp: number }
interface ScorersCache   { data: NormalizedScorer[];   timestamp: number }

const standingsCache = new Map<string, StandingsCache>();
const scorersCache   = new Map<string, ScorersCache>();

const STANDINGS_TTL = 10 * 60_000; // 10 min
const SCORERS_TTL   = 30 * 60_000; // 30 min

// ── Adapters: API → leagueData.ts internal types ─────────────────────────────

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
  /** Merged LeagueData: live standings/scorers overlaid on static fallback */
  data: LeagueData;
  loadingStandings: boolean;
  loadingScorers: boolean;
  isLive: boolean;
  topTeamScorer: Player | null;
}

export function useLeagueData(leagueId: string): UseLeagueDataResult {
  const staticData = LEAGUE_DATA[leagueId] as LeagueData | undefined;

  const [standings, setStandings]           = useState<NormalizedStanding[] | null>(null);
  const [scorers,   setScorers]             = useState<NormalizedScorer[]   | null>(null);
  const [loadingStandings, setLoadingSt]    = useState(true);
  const [loadingScorers,   setLoadingSc]    = useState(true);

  useEffect(() => {
    if (!leagueId) return;
    setLoadingSt(true);
    setLoadingSc(true);
    setStandings(null);
    setScorers(null);

    // Standings
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

    // Scorers
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
    const base = staticData ?? LEAGUE_DATA['epl'];

    const liveStandings = standings ? standings.map(toStanding) : null;

    // Scorers sorted by goals; assisters derived by re-sorting the same data by assists
    const liveScorers   = scorers !== null ? scorers.slice(0, 10).map(toScorer) : null;
    const liveAssisters = scorers !== null
      ? [...scorers]
        .filter(s => s.assists > 0)
        .sort((a, b) => b.assists - a.assists)
        .map((s, i) => toScorer({ ...s, rank: i + 1 }))
      : null;

    return {
      ...base,
      standings:    liveStandings    ?? base.standings,
      topScorers:   liveScorers      ?? base.topScorers,
      topAssisters: liveAssisters    ?? base.topAssisters,
    };
  }, [staticData, standings, scorers]);

  const leaderTeam = standings?.[0]?.team ?? data.standings[0]?.team;
  const topTeamScorer = scorers !== null
    ? (scorers.find(s => s.team === leaderTeam) ? toScorer(scorers.find(s => s.team === leaderTeam)!) : null)
    : data.topScorers.find(s => s.team === leaderTeam) ?? data.topScorers[0] ?? null;

  return {
    data,
    loadingStandings,
    loadingScorers,
    isLive: standings !== null || scorers !== null,
    topTeamScorer,
  };
}

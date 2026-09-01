import { useState, useEffect, useMemo } from 'react';
import {
  fetchStandings,
  fetchTopScorers,
  type NormalizedStanding,
  type NormalizedScorer,
  type StandingsResult,
} from '../services/footballDataService';
import {
  fetchDefendersAndKeepers,
  fetchTeamLogoMap,
  fetchTeamVenueMap,
  type TeamVenueInfo,
  type NormalizedDefender,
  type NormalizedKeeper,
} from '../services/sportmonksService';
import { registerSportmonksLogos, normalizeSportmonksVenues } from '../services/logoService';
import { LEAGUE_DATA, type LeagueData, type Player, type Standing } from '../data/leagueData';

// ── Per-league in-memory cache ────────────────────────────────────────────────

interface StandingsCache { data: StandingsResult; timestamp: number }
interface ScorersCache   { data: NormalizedScorer[];   timestamp: number }
interface DefendersCache {
  data: { defenders: NormalizedDefender[]; keepers: NormalizedKeeper[] };
  timestamp: number;
}
interface VenueCache {
  data: Record<string, TeamVenueInfo>;
  timestamp: number;
}
interface LogoCache {
  data: Record<string, string>;
  timestamp: number;
}

const standingsCache = new Map<string, StandingsCache>();
const scorersCache   = new Map<string, ScorersCache>();
const defendersCache = new Map<string, DefendersCache>();
const venueCache     = new Map<string, VenueCache>();
const logoCache      = new Map<string, LogoCache>();

const STANDINGS_TTL  = 10 * 60_000;  // 10 min
const SCORERS_TTL    = 30 * 60_000;  // 30 min
const DEFENDERS_TTL  = 60 * 60_000;  // 1 hour
const VENUE_TTL      = 24 * 60 * 60_000; // 24 hours — stadium images change rarely

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

/** Round a 0-10 rating to 1 decimal for clean display everywhere it's rendered. */
function roundRating(rating: number): number {
  return Math.round(rating * 10) / 10;
}

function toDefenderPlayer(d: NormalizedDefender): Player {
  return {
    rank:          d.rank,
    name:          d.name,
    team:          d.team,
    goals:         roundRating(d.rating), // Rating (0-10) — see LeaguePlayersList "Rating / Clean Sheets"
    assists:       d.cleanSheets,         // Clean Sheets
    photo:         d.photo,
    minutesPlayed: d.minutesPlayed,
    tacklesWon:    d.tacklesWon,
    interceptions: d.interceptions,
    clearances:    d.clearances,
  };
}

function toKeeperPlayer(k: NormalizedKeeper): Player {
  return {
    rank:           k.rank,
    name:           k.name,
    team:           k.team,
    goals:          k.cleanSheets,        // Clean Sheets — see LeaguePlayersList "Clean Sheets / Rating"
    assists:        roundRating(k.rating),// Rating (0-10)
    photo:          k.photo,
    minutesPlayed:  k.minutesPlayed,
    saves:          k.saves,
    goalsConceded:  k.goalsConceded,
    savePercentage: k.savePercentage,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseLeagueDataResult {
  /** Merged LeagueData: live standings/scorers/defenders/keepers overlaid on static fallback */
  data: LeagueData;
  loadingStandings: boolean;
  loadingScorers: boolean;
  loadingDefenders: boolean;
  isLive: boolean;
  topTeamScorer: Player | null;
}

export function useLeagueData(leagueId: string): UseLeagueDataResult {
  const staticData = LEAGUE_DATA[leagueId] as LeagueData | undefined;

  const [standings, setStandings]           = useState<StandingsResult | null>(null);
  const [scorers,   setScorers]             = useState<NormalizedScorer[]   | null>(null);
  const [defenders, setDefenders]           = useState<NormalizedDefender[] | null>(null);
  const [keepers,   setKeepers]             = useState<NormalizedKeeper[]   | null>(null);
  const [venues,    setVenues]              = useState<Record<string, TeamVenueInfo> | null>(null);
  const [loadingStandings, setLoadingSt]    = useState(true);
  const [loadingScorers,   setLoadingSc]    = useState(true);
  const [loadingDefenders, setLoadingDef]   = useState(true);

  useEffect(() => {
    if (!leagueId) return;
    setLoadingSt(true);
    setLoadingSc(true);
    setLoadingDef(true);
    setStandings(null);
    setScorers(null);
    setDefenders(null);
    setKeepers(null);
    setVenues(null);

    // Standings (also returns currentMatchday)
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

    // Defenders + goalkeepers (Sportmonks — not available for every league, see sportmonksService.ts)
    const cachedDef = defendersCache.get(leagueId);
    if (cachedDef && Date.now() - cachedDef.timestamp < DEFENDERS_TTL) {
      setDefenders(cachedDef.data.defenders);
      setKeepers(cachedDef.data.keepers);
      setLoadingDef(false);
    } else {
      fetchDefendersAndKeepers(leagueId)
        .then(data => {
          if (data.defenders.length > 0 || data.keepers.length > 0) {
            defendersCache.set(leagueId, { data, timestamp: Date.now() });
            setDefenders(data.defenders);
            setKeepers(data.keepers);
          }
        })
        .catch(e => console.warn('[useLeagueData] defenders/keepers failed:', e))
        .finally(() => setLoadingDef(false));
    }

    // Team logos + venue images from Sportmonks (cached 24h — rarely changes)
    const cachedVenue = venueCache.get(leagueId);
    if (cachedVenue && Date.now() - cachedVenue.timestamp < VENUE_TTL) {
      setVenues(cachedVenue.data);
    } else {
      // Fetch logos and venues in parallel; logos are registered globally so
      // ClubCrest picks them up without re-rendering the entire tree.
      Promise.all([
        fetchTeamLogoMap(leagueId),
        fetchTeamVenueMap(leagueId),
      ]).then(([logos, venueMap]) => {
        if (Object.keys(logos).length > 0) {
          registerSportmonksLogos(logos);
          logoCache.set(leagueId, { data: logos, timestamp: Date.now() });
        }
        if (Object.keys(venueMap).length > 0) {
          // Normalize SM team names to display names so venue lookup works
          const normalizedVenues = normalizeSportmonksVenues(venueMap);
          venueCache.set(leagueId, { data: normalizedVenues, timestamp: Date.now() });
          setVenues(normalizedVenues);
        }
      }).catch(e => console.warn('[useLeagueData] logos/venues failed:', e));
    }
  }, [leagueId]);

  const data = useMemo<LeagueData>(() => {
    const base = staticData ?? LEAGUE_DATA['epl'];

    const liveStandings = standings ? standings.standings.map(toStanding) : null;

    // Scorers sorted by goals; assisters derived by re-sorting the same data by assists
    const liveScorers   = scorers !== null ? scorers.slice(0, 10).map(toScorer) : null;
    const liveAssisters = scorers !== null
      ? [...scorers]
        .filter(s => s.assists > 0)
        .sort((a, b) => b.assists - a.assists)
        .map((s, i) => toScorer({ ...s, rank: i + 1 }))
      : null;

    const liveDefenders = defenders ? defenders.map(toDefenderPlayer) : null;
    const liveKeepers   = keepers   ? keepers.map(toKeeperPlayer)     : null;

    // Derive live aggregate stats from standings data
    const liveStandingRows = standings?.standings ?? null;
    const liveStats = liveStandingRows && liveStandingRows.length > 0 ? (() => {
      const totalPlayed = liveStandingRows.reduce((s, r) => s + r.played, 0) / 2;
      const totalGoals  = liveStandingRows.reduce((s, r) => s + r.gf, 0) / 2;
      const totalHomeWins = liveStandingRows.reduce((s, r) => s + r.won, 0) / 2;
      return {
        totalGoals: Math.round(totalGoals),
        goalsPerGame: totalPlayed > 0 ? Math.round((totalGoals / totalPlayed) * 100) / 100 : base.stats.goalsPerGame,
        matchesPlayed: Math.round(totalPlayed),
        homeWinPct: totalPlayed > 0 ? Math.round((totalHomeWins / totalPlayed) * 100) : base.stats.homeWinPct,
        topVenue: base.stats.topVenue,
      };
    })() : null;

    return {
      ...base,
      standings:       liveStandings  ?? base.standings,
      topScorers:      liveScorers    ?? base.topScorers,
      topAssisters:    liveAssisters  ?? base.topAssisters,
      topDefenders:    liveDefenders  ?? base.topDefenders,
      topKeepers:      liveKeepers    ?? base.topKeepers,
      currentMatchday: standings?.currentMatchday ?? base.currentMatchday,
      stats:           liveStats      ?? base.stats,
      // Stadium: use leader team's venue if available from Sportmonks
      stadiumImage: (() => {
        const leader = (liveStandings ?? base.standings)[0]?.team;
        return (leader && venues?.[leader]?.venueImage) || base.stadiumImage;
      })(),
      stadiumName: (() => {
        const leader = (liveStandings ?? base.standings)[0]?.team;
        return (leader && venues?.[leader]?.venueName) || base.stadiumName;
      })(),
    };
  }, [staticData, standings, scorers, defenders, keepers, venues]);

  const leaderTeam = standings?.standings?.[0]?.team ?? data.standings[0]?.team;
  const topTeamScorer = scorers !== null
    ? (scorers.find(s => s.team === leaderTeam) ? toScorer(scorers.find(s => s.team === leaderTeam)!) : null)
    : data.topScorers.find(s => s.team === leaderTeam) ?? data.topScorers[0] ?? null;

  return {
    data,
    loadingStandings,
    loadingScorers,
    loadingDefenders,
    isLive: standings !== null || scorers !== null || defenders !== null || keepers !== null,
    topTeamScorer,
  };
}

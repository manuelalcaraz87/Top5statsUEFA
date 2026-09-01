// Sportmonks Football API — powers live defender/goalkeeper stats
// (tackles, interceptions, clearances, saves, clean sheets, rating).
//
// Using backend proxy server to handle CORS and keep the token secure,
// same pattern as footballDataService.ts / apiFootballService.ts.
//
// Starter plan limitation: Sportmonks Starter only covers 5 leagues at a
// time. UCL is not currently included in the subscription, so it's left
// out of SM_SEASON_IDS below and keeps static/fallback defender & keeper
// data (see leagueData.ts).
const API_BASE = import.meta.env.VITE_API_PROXY_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

// Sportmonks league season id for each supported league (2026/27 season).
// These are season-specific ids, not league ids, and will need updating
// once a season ends — there's no per-request "current season" lookup
// wired in here to avoid an extra API round trip on every page load.
const SM_SEASON_IDS: Record<string, number> = {
  'la-liga':    27965,
  'epl':        28083,
  'serie-a':    27895,
  'bundesliga': 28321,
  'ligue-1':    28082,
};

const POSITION_GOALKEEPER = 24;
const POSITION_DEFENDER = 25;

// Player statistic detail type ids — see Sportmonks "Statistics types" docs.
const TYPE_SAVES = 57;
const TYPE_TACKLES = 78;
const TYPE_GOALS_CONCEDED = 88;
const TYPE_INTERCEPTIONS = 100;
const TYPE_CLEARANCES = 101;
const TYPE_RATING = 118;
const TYPE_MINUTES_PLAYED = 119;
const TYPE_CLEAN_SHEETS = 194;
const TYPE_APPEARANCES = 321;

const DETAIL_TYPE_IDS = [
  TYPE_SAVES, TYPE_TACKLES, TYPE_GOALS_CONCEDED, TYPE_INTERCEPTIONS,
  TYPE_CLEARANCES, TYPE_RATING, TYPE_MINUTES_PLAYED, TYPE_CLEAN_SHEETS,
  TYPE_APPEARANCES,
].join(',');

// Require at least one full match's worth of minutes before a player is
// eligible to be ranked, so a single substitute cameo can't top the list.
const MIN_MINUTES = 90;

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!API_BASE) {
    throw new Error('VITE_API_PROXY_URL is not configured for this deployment.');
  }

  const url = new URL(`${API_BASE}/api/sm/${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const res = await fetch(url.toString());

  if (res.status === 429) {
    throw new Error('Rate limited by Sportmonks. Please try again later.');
  }

  if (!res.ok) {
    throw new Error(`Sportmonks API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

interface SmTeam {
  id: number;
  name: string;
}

interface SmStatDetail {
  type_id: number;
  value: Record<string, number>;
}

interface SmSquadEntry {
  player_id: number;
  position_id: number;
  player?: { display_name?: string; name?: string; image_path?: string };
  details: SmStatDetail[];
}

function statValue(details: SmStatDetail[], typeId: number, key: 'total' | 'average' = 'total'): number {
  const stat = details.find(d => d.type_id === typeId);
  return stat?.value?.[key] ?? 0;
}

export interface NormalizedDefender {
  rank: number;
  name: string;
  team: string;
  photo?: string;
  rating: number;
  cleanSheets: number;
  tacklesWon: number;
  interceptions: number;
  clearances: number;
  minutesPlayed: number;
}

export interface NormalizedKeeper {
  rank: number;
  name: string;
  team: string;
  photo?: string;
  rating: number;
  cleanSheets: number;
  saves: number;
  goalsConceded: number;
  savePercentage: number;
  minutesPlayed: number;
}

/**
 * Fetches live defender + goalkeeper stats for a league, aggregated across
 * every team's squad for the current season.
 *
 * Budget: 1 request for the season's team list + 1 request per team squad
 * (~20 requests for a typical 20-team league). Cached on the backend
 * (shared across all users, see server/index.js), so repeated page loads
 * within the cache window are free — only a cache miss pays the full cost.
 */
export async function fetchDefendersAndKeepers(leagueId: string): Promise<{
  defenders: NormalizedDefender[];
  keepers: NormalizedKeeper[];
}> {
  const seasonId = SM_SEASON_IDS[leagueId];
  if (!seasonId) return { defenders: [], keepers: [] };

  try {
    const season = await get<{ data: { teams?: SmTeam[] } }>(`seasons/${seasonId}`, {
      include: 'teams',
    });
    const teams = season.data.teams ?? [];

    const squadsByTeam = await Promise.all(
      teams.map(team =>
        get<{ data: SmSquadEntry[] }>(`squads/seasons/${seasonId}/teams/${team.id}`, {
          include: 'player;details',
          filters: `playerstatisticdetailTypes:${DETAIL_TYPE_IDS}`,
        })
          .then(res => res.data.map(entry => ({ entry, teamName: team.name })))
          .catch(e => {
            console.warn(`[sportmonksService] squad failed for team ${team.id} (${team.name}):`, e);
            return [];
          })
      )
    );

    const allEntries = squadsByTeam.flat();

    const defenders: NormalizedDefender[] = allEntries
      .filter(({ entry }) => entry.position_id === POSITION_DEFENDER)
      .map(({ entry, teamName }) => ({
        name: entry.player?.display_name ?? entry.player?.name ?? 'Unknown',
        team: teamName,
        photo: entry.player?.image_path,
        rating: statValue(entry.details, TYPE_RATING, 'average'),
        cleanSheets: statValue(entry.details, TYPE_CLEAN_SHEETS),
        tacklesWon: statValue(entry.details, TYPE_TACKLES),
        interceptions: statValue(entry.details, TYPE_INTERCEPTIONS),
        clearances: statValue(entry.details, TYPE_CLEARANCES),
        minutesPlayed: statValue(entry.details, TYPE_MINUTES_PLAYED),
      }))
      .filter(d => d.minutesPlayed >= MIN_MINUTES)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map((d, i) => ({ rank: i + 1, ...d }));

    const keepers: NormalizedKeeper[] = allEntries
      .filter(({ entry }) => entry.position_id === POSITION_GOALKEEPER)
      .map(({ entry, teamName }) => {
        const saves = statValue(entry.details, TYPE_SAVES);
        const goalsConceded = statValue(entry.details, TYPE_GOALS_CONCEDED);
        // Sportmonks doesn't expose a direct "save percentage" stat on the
        // Starter plan, so this is approximated as saves / shots faced
        // (saves + goals conceded), which is the standard estimate when
        // shots-on-target-faced isn't available.
        const savePercentage = saves + goalsConceded > 0
          ? Math.round((saves / (saves + goalsConceded)) * 100)
          : 0;
        return {
          name: entry.player?.display_name ?? entry.player?.name ?? 'Unknown',
          team: teamName,
          photo: entry.player?.image_path,
          rating: statValue(entry.details, TYPE_RATING, 'average'),
          cleanSheets: statValue(entry.details, TYPE_CLEAN_SHEETS),
          saves,
          goalsConceded,
          savePercentage,
          minutesPlayed: statValue(entry.details, TYPE_MINUTES_PLAYED),
        };
      })
      .filter(k => k.minutesPlayed >= MIN_MINUTES)
      .sort((a, b) => b.cleanSheets - a.cleanSheets || b.saves - a.saves)
      .slice(0, 10)
      .map((k, i) => ({ rank: i + 1, ...k }));

    return { defenders, keepers };
  } catch (error) {
    console.error(`Failed to fetch defenders/keepers from Sportmonks for league: ${leagueId}`, error);
    return { defenders: [], keepers: [] };
  }
}

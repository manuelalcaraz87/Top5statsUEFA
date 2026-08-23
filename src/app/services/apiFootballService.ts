// api-football.com v3 — secondary/supplementary source
// Free tier: ~100 requests/day. Used sparingly: live fixtures + player photos.
//
// Using backend proxy server to handle CORS and keep tokens secure.
// The proxy server routes requests to the real API with proper authentication.

const API_BASE = import.meta.env.VITE_API_PROXY_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

export const AF_LEAGUE_IDS: Record<string, number> = {
  'la-liga':    140,
  'epl':        39,
  'serie-a':    135,
  'bundesliga': 78,
  'ligue-1':    61,
  'ucl':        2,
};

export const CURRENT_SEASON = 2026; // 2026/27 season

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  try {
    if (!API_BASE) {
      throw new Error('VITE_API_PROXY_URL is not configured for this deployment.');
    }

    const url = new URL(`${API_BASE}/api/af/${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const res = await fetch(url.toString());

    if (res.status === 429) {
      throw new Error('Rate limited by API Football. Please try again later.');
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    console.error(`API Football Error (${path}):`, error);
    throw error;
  }
}

export interface AFScorer {
  rank: number;
  name: string;
  photo: string;
  team: string;
  goals: number;
  assists: number;
  appearances: number;
}

/**
 * Top scorers from api-football — richer than FD (includes photos).
 * Budget: 1 req per league page load, cached for 1 hour on the backend.
 */
export async function fetchTopScorersAF(leagueId: string, limit = 10): Promise<AFScorer[]> {
  try {
    const lid = AF_LEAGUE_IDS[leagueId];
    if (!lid) return [];

    type RawEntry = {
      player: { name: string; photo: string };
      statistics: { team: { name: string }; goals: { total: number; assists: number }; games: { appearences: number } }[];
    };

    const data = await get<{ response: RawEntry[] }>(
      'players/topscorers',
      {
        league: lid.toString(),
        season: CURRENT_SEASON.toString(),
      }
    );

    return (data.response ?? []).slice(0, limit).map((e, i) => {
      const s = e.statistics[0];
      return {
        rank:        i + 1,
        name:        e.player.name,
        photo:       e.player.photo,
        team:        s?.team?.name ?? '',
        goals:       s?.goals?.total ?? 0,
        assists:     s?.goals?.assists ?? 0,
        appearances: s?.games?.appearences ?? 0,
      };
    });
  } catch (error) {
    console.error('Failed to fetch top scorers from API Football for league:', leagueId, error);
    return [];
  }
}

export interface AFFixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'finished' | 'upcoming';
  minute: number | null;
  leagueId: number;
}

/** Live fixtures across all tracked leagues. Budget: called only when needed. */
export async function fetchLiveFixtures(): Promise<AFFixture[]> {
  try {
    type Raw = {
      fixture: { id: number; status: { short: string; elapsed: number | null } };
      teams: { home: { name: string }; away: { name: string } };
      goals: { home: number | null; away: number | null };
      league: { id: number };
    };

    const liveIds = Object.values(AF_LEAGUE_IDS).join('-');
    const data = await get<{ response: Raw[] }>(
      'fixtures',
      { live: liveIds }
    );

    const LIVE_CODES = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE']);
    const DONE_CODES = new Set(['FT', 'AET', 'PEN', 'AWD']);

    return (data.response ?? []).map(f => {
      const s = f.fixture.status.short;
      const status: AFFixture['status'] = LIVE_CODES.has(s) ? 'live' : DONE_CODES.has(s) ? 'finished' : 'upcoming';
      return {
        id:        f.fixture.id,
        homeTeam:  f.teams.home.name,
        awayTeam:  f.teams.away.name,
        homeScore: f.goals.home,
        awayScore: f.goals.away,
        status,
        minute:    f.fixture.status.elapsed,
        leagueId:  f.league.id,
      };
    });
  } catch (error) {
    console.error('Failed to fetch live fixtures:', error);
    return [];
  }
}

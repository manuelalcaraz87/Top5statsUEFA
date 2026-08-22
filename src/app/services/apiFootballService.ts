// api-football.com v3 (direct) — secondary/supplementary source
// Free tier: ~100 requests/day. Used sparingly: live fixtures + player photos.
//
// Same CORS issue as football-data.org: x-apisports-key triggers preflight.
// Route through corsproxy.io to handle the CORS handshake.

const AF_ORIGIN  = 'https://v3.football.api-sports.io';
const CORS_PROXY = 'https://corsproxy.io/?';
const TOKEN = (import.meta.env.VITE_AF_TOKEN as string) || 'ab7c585203d52982798cc08ce0b53d58';

export const AF_LEAGUE_IDS: Record<string, number> = {
  'la-liga':    140,
  'epl':        39,
  'serie-a':    135,
  'bundesliga': 78,
  'ligue-1':    61,
  'ucl':        2,
};

// Current season: e.g. Aug 2026 → season 2026 (2026/27)
export const CURRENT_SEASON = (() => {
  const d = new Date();
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
})();

async function get<T>(path: string): Promise<T> {
  const target = encodeURIComponent(`${AF_ORIGIN}${path}`);
  const res = await fetch(`${CORS_PROXY}${target}`, {
    headers: { 'x-apisports-key': TOKEN },
  });
  if (res.status === 429) throw new Error('af-rate-limited');
  if (!res.ok) throw new Error(`AF ${res.status} ${path}`);
  return res.json() as Promise<T>;
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
 * Budget: 1 req per league page load, cached for 1 hour.
 */
export async function fetchTopScorersAF(leagueId: string, limit = 10): Promise<AFScorer[]> {
  const lid = AF_LEAGUE_IDS[leagueId];
  if (!lid) return [];

  type RawEntry = {
    player: { name: string; photo: string };
    statistics: { team: { name: string }; goals: { total: number; assists: number }; games: { appearences: number } }[];
  };

  const data = await get<{ response: RawEntry[] }>(
    `/players/topscorers?league=${lid}&season=${CURRENT_SEASON}`
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
  type Raw = {
    fixture: { id: number; status: { short: string; elapsed: number | null } };
    teams: { home: { name: string }; away: { name: string } };
    goals: { home: number | null; away: number | null };
    league: { id: number };
  };

  const liveIds = Object.values(AF_LEAGUE_IDS).join('-');
  const data = await get<{ response: Raw[] }>(`/fixtures?live=${liveIds}`);

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
}

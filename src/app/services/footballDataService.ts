// football-data.org v4 — primary data source
// Free tier: top 5 European leagues + UCL, 10 req/min, no daily cap
//
// Using backend proxy server to handle CORS and keep tokens secure.
// The proxy server routes requests to the real API with proper authentication.

const API_BASE = import.meta.env.VITE_API_PROXY_URL || 'http://localhost:3001';

// ── League mapping ─────────────────────────────────────────────────────────

export const LEAGUE_CODES: Record<string, string> = {
  'la-liga':    'PD',
  'epl':        'PL',
  'serie-a':    'SA',
  'bundesliga': 'BL1',
  'ligue-1':    'FL1',
  'ucl':        'CL',
};

export const COMP_CODE_TO_LEAGUE: Record<string, { name: string; id: string; color: string }> = {
  'PL':  { name: 'EPL',        id: 'epl',        color: '#3d195b' },
  'PD':  { name: 'La Liga',    id: 'la-liga',    color: '#ee8707' },
  'SA':  { name: 'Serie A',    id: 'serie-a',    color: '#024494' },
  'BL1': { name: 'Bundesliga', id: 'bundesliga', color: '#d20515' },
  'FL1': { name: 'Ligue 1',   id: 'ligue-1',    color: '#dae025' },
  'CL':  { name: 'UCL',        id: 'ucl',        color: '#003b7a' },
};

// ── Team name normalization ────────────────────────────────────────────────────

const TEAM_MAP: Record<string, string> = {
  // La Liga
  'Real Madrid CF': 'Real Madrid',
  'FC Barcelona': 'Barcelona',
  'Club Atlético de Madrid': 'Atletico Madrid',
  'Atlético de Madrid': 'Atletico Madrid',
  'Villarreal CF': 'Villarreal',
  'Real Sociedad de Fútbol': 'Real Sociedad',
  'Real Betis Balompié': 'Betis',
  'Real Betis': 'Betis',
  'Sevilla FC': 'Sevilla',
  'Valencia CF': 'Valencia',
  'Athletic Club': 'Athletic Bilbao',
  'Girona FC': 'Girona',
  'Getafe CF': 'Getafe',
  'Rayo Vallecano': 'Rayo',
  'UD Las Palmas': 'Las Palmas',
  'Deportivo Alavés': 'Alaves',
  'RCD Mallorca': 'Mallorca',
  'CA Osasuna': 'Osasuna',
  'Celta de Vigo': 'Celta Vigo',
  'RC Celta de Vigo': 'Celta Vigo',
  // EPL
  'Manchester City FC': 'Man City',
  'Manchester City': 'Man City',
  'Arsenal FC': 'Arsenal',
  'Liverpool FC': 'Liverpool',
  'Chelsea FC': 'Chelsea',
  'Tottenham Hotspur FC': 'Tottenham',
  'Tottenham Hotspur': 'Tottenham',
  'Manchester United FC': 'Man United',
  'Manchester United': 'Man United',
  'Newcastle United FC': 'Newcastle',
  'Newcastle United': 'Newcastle',
  'Aston Villa FC': 'Aston Villa',
  'West Ham United FC': 'West Ham',
  'West Ham United': 'West Ham',
  'Brighton & Hove Albion FC': 'Brighton',
  'Brighton & Hove Albion': 'Brighton',
  'Wolverhampton Wanderers FC': 'Wolves',
  'Wolverhampton Wanderers': 'Wolves',
  'Fulham FC': 'Fulham',
  'Brentford FC': 'Brentford',
  'Crystal Palace FC': 'Crystal Palace',
  'AFC Bournemouth': 'Bournemouth',
  'Everton FC': 'Everton',
  'Nottingham Forest FC': 'Nottm Forest',
  'Leicester City FC': 'Leicester',
  'Southampton FC': 'Southampton',
  'Ipswich Town FC': 'Ipswich',
  // Serie A
  'FC Internazionale Milano': 'Inter Milan',
  'Inter': 'Inter Milan',
  'Internazionale': 'Inter Milan',
  'AC Milan': 'AC Milan',
  'Juventus FC': 'Juventus',
  'SSC Napoli': 'Napoli',
  'AS Roma': 'Roma',
  'SS Lazio': 'Lazio',
  'Atalanta BC': 'Atalanta',
  'ACF Fiorentina': 'Fiorentina',
  'Bologna FC 1909': 'Bologna',
  'Torino FC': 'Torino',
  'Udinese Calcio': 'Udinese',
  'Genoa CFC': 'Genoa',
  'Empoli FC': 'Empoli',
  'Hellas Verona FC': 'Verona',
  'Cagliari Calcio': 'Cagliari',
  'US Lecce': 'Lecce',
  'Venezia FC': 'Venezia',
  'Parma Calcio 1913': 'Parma',
  'Como 1907': 'Como',
  'Monza': 'Monza',
  // Bundesliga
  'FC Bayern München': 'Bayern',
  'Bayern München': 'Bayern',
  'FC Bayern Munich': 'Bayern',
  'Borussia Dortmund': 'Dortmund',
  'Bayer 04 Leverkusen': 'Leverkusen',
  'RB Leipzig': 'RB Leipzig',
  'Eintracht Frankfurt': 'Frankfurt',
  'VfB Stuttgart': 'Stuttgart',
  'VfL Wolfsburg': 'Wolfsburg',
  'Borussia Mönchengladbach': 'Gladbach',
  'SC Freiburg': 'Freiburg',
  '1. FC Union Berlin': 'Union Berlin',
  'Union Berlin': 'Union Berlin',
  'TSG 1899 Hoffenheim': 'Hoffenheim',
  'SV Werder Bremen': 'Werder Bremen',
  'FC Augsburg': 'Augsburg',
  'VfL Bochum 1848': 'Bochum',
  '1. FSV Mainz 05': 'Mainz',
  'FC Heidenheim 1846': 'Heidenheim',
  'Holstein Kiel': 'Kiel',
  'FC St. Pauli 1910': 'St. Pauli',
  // Ligue 1
  'Paris Saint-Germain FC': 'PSG',
  'Paris Saint-Germain': 'PSG',
  'AS Monaco FC': 'Monaco',
  'AS Monaco': 'Monaco',
  'Olympique Lyonnais': 'Lyon',
  'LOSC Lille': 'Lille',
  'OGC Nice': 'Nice',
  'Olympique de Marseille': 'Marseille',
  'RC Lens': 'Lens',
  'Stade Rennais FC 1901': 'Rennes',
  'Stade Rennais FC': 'Rennes',
  'Stade Brestois 29': 'Brest',
  'Toulouse FC': 'Toulouse',
  'RC Strasbourg Alsace': 'Strasbourg',
  'FC Nantes': 'Nantes',
  'Stade de Reims': 'Reims',
  'Le Havre AC': 'Le Havre',
  'Montpellier HSC': 'Montpellier',
};

export function normalizeTeamName(raw: string, shortName?: string): string {
  // Try full name first, then short name, then raw
  return TEAM_MAP[raw] || (shortName ? TEAM_MAP[shortName] || shortName : raw);
}

// ── Types ───────────────────────────────────────────────────────────

export interface NormalizedMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'finished' | 'upcoming';
  minute: number | null;
  time: string | undefined;
  leagueCode: string;
  leagueName: string;
  leagueColor: string;
  leagueId: string;
  utcDate: string;
}

export interface NormalizedStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface NormalizedScorer {
  rank: number;
  name: string;
  team: string;
  goals: number;
  assists: number;
}

// ── HTTP helper with error handling ─────────────────────────────────────────

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  try {
    const url = new URL(`${API_BASE}/api/fd/${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const res = await fetch(url.toString());

    if (res.status === 429) {
      throw new Error('Rate limited by Football Data API. Please try again later.');
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    console.error(`Football Data API Error (${path}):`, error);
    throw error;
  }
}

// ── Date helpers ─────────────────────────────────────────────────────────

function isoDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().split('T')[0];
}

function formatKickoff(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function parseForm(form: string | null | undefined): ('W' | 'D' | 'L')[] {
  if (!form) return [];
  return form.split(',').slice(-5).map(f => f.trim() as 'W' | 'D' | 'L');
}

// ── Normalizers ─────────────────────────────────────────────────────────

function normalizeMatch(m: Record<string, unknown>): NormalizedMatch {
  const statusRaw = m.status as string;
  const status: NormalizedMatch['status'] =
    statusRaw === 'IN_PLAY' || statusRaw === 'PAUSED' ? 'live'
    : statusRaw === 'FINISHED' || statusRaw === 'AWARDED' ? 'finished'
    : 'upcoming';

  const score = m.score as Record<string, Record<string, number | null>> | undefined;
  const comp = m.competition as Record<string, string> | undefined;
  const home = m.homeTeam as Record<string, string> | undefined;
  const away = m.awayTeam as Record<string, string> | undefined;
  const code = comp?.code ?? '';
  const leagueInfo = COMP_CODE_TO_LEAGUE[code] ?? { name: code, id: '', color: '#666' };

  const homeScore = score?.fullTime?.home ?? null;
  const awayScore = score?.fullTime?.away ?? null;

  return {
    id: m.id as number,
    homeTeam: normalizeTeamName(home?.name ?? '', home?.shortName),
    awayTeam: normalizeTeamName(away?.name ?? '', away?.shortName),
    homeScore,
    awayScore,
    status,
    minute: (m.minute as number | null) ?? null,
    time: status === 'upcoming' ? formatKickoff(m.utcDate as string) : undefined,
    leagueCode: code,
    leagueName: leagueInfo.name,
    leagueColor: leagueInfo.color,
    leagueId: leagueInfo.id,
    utcDate: m.utcDate as string,
  };
}

// ── Public API ──────────────────────────────────────────────────────────

const ALL_CODES = Object.values(LEAGUE_CODES).join(',');

/**
 * Fetch matches in a rolling window covering the nearest match round.
 * Tries today ± 2 days to ensure we always show something even mid-week.
 */
export async function fetchMatchWindow(): Promise<NormalizedMatch[]> {
  try {
    const from = isoDate(-1);
    const to = isoDate(2);
    const data = await get<{ matches: Record<string, unknown>[] }>(
      'matches',
      {
        dateFrom: from,
        dateTo: to,
        competitions: ALL_CODES,
      }
    );
    return (data.matches ?? []).map(normalizeMatch);
  } catch (error) {
    console.error('Failed to fetch match window:', error);
    return [];
  }
}

/** Fetch standings for one league. */
export async function fetchStandings(leagueId: string): Promise<NormalizedStanding[]> {
  try {
    const code = LEAGUE_CODES[leagueId];
    if (!code) return [];

    const data = await get<{ standings: { type: string; table: Record<string, unknown>[] }[] }>(
      `competitions/${code}/standings`
    );

    const table = data.standings?.find(s => s.type === 'TOTAL')?.table ?? [];
    return table.map(r => {
      const team = r.team as Record<string, string>;
      return {
        position: r.position as number,
        team: normalizeTeamName(team?.name ?? '', team?.shortName),
        played: r.playedGames as number,
        won:    r.won as number,
        drawn:  r.draw as number,
        lost:   r.lost as number,
        gf:     r.goalsFor as number,
        ga:     r.goalsAgainst as number,
        gd:     r.goalDifference as number,
        points: r.points as number,
        form:   parseForm(r.form as string),
      };
    });
  } catch (error) {
    console.error('Failed to fetch standings for league:', leagueId, error);
    return [];
  }
}

/** Fetch top scorers for one league (also includes assists). */
export async function fetchTopScorers(leagueId: string, limit = 10): Promise<NormalizedScorer[]> {
  try {
    const code = LEAGUE_CODES[leagueId];
    if (!code) return [];

    const data = await get<{ scorers: Record<string, unknown>[] }>(
      `competitions/${code}/scorers`,
      { limit: limit.toString() }
    );

    return (data.scorers ?? []).map((s, i) => {
      const player = s.player as Record<string, string>;
      const team   = s.team   as Record<string, string>;
      return {
        rank:    i + 1,
        name:    player?.name ?? 'Unknown',
        team:    normalizeTeamName(team?.name ?? '', team?.shortName),
        goals:   (s.goals   as number) ?? 0,
        assists: (s.assists as number) ?? 0,
      };
    });
  } catch (error) {
    console.error('Failed to fetch top scorers for league:', leagueId, error);
    return [];
  }
}

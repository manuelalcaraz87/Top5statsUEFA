const CACHE_KEY = 'football_logos_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheStore {
  [key: string]: { url: string; ts: number };
}

function readStore(): CacheStore {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeEntry(key: string, url: string) {
  try {
    const store = readStore();
    store[key] = { url, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {}
}

function readEntry(key: string): string | null {
  const store = readStore();
  const entry = store[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
  return entry.url;
}

// In-memory registry populated from Sportmonks API (via useLeagueData) —
// higher quality than TheSportsDB so we check this first.
const smLogoRegistry = new Map<string, string>();

// Subscribers that want to be notified when new logos are registered
// (used by ClubCrest to re-render when logos arrive after mount).
type LogoListener = () => void;
const logoListeners = new Set<LogoListener>();

export function subscribeToLogoUpdates(fn: LogoListener): () => void {
  logoListeners.add(fn);
  return () => logoListeners.delete(fn);
}

// Sportmonks returns full official club names (e.g. "FC Barcelona", "Real Madrid CF").
// Normalize them to the short display names used in standings/scorers.
const SM_NAME_NORMALIZE: Record<string, string> = {
  // La Liga
  'FC Barcelona':              'Barcelona',
  'Real Madrid CF':            'Real Madrid',
  'Club Atlético de Madrid':   'Atletico Madrid',
  'Atlético de Madrid':        'Atletico Madrid',
  'Villarreal CF':             'Villarreal',
  'Real Betis Balompié':       'Betis',
  'Real Betis':                'Betis',
  'Sevilla FC':                'Sevilla',
  'Valencia CF':               'Valencia',
  'Real Sociedad':             'Real Sociedad',
  'Athletic Club':             'Athletic Bilbao',
  'Girona FC':                 'Girona',
  'Getafe CF':                 'Getafe',
  'Rayo Vallecano':            'Rayo',
  'UD Las Palmas':             'Las Palmas',
  'Deportivo Alavés':          'Alaves',
  'RCD Mallorca':              'Mallorca',
  'CA Osasuna':                'Osasuna',
  'Celta de Vigo':             'Celta Vigo',
  'RC Celta de Vigo':          'Celta Vigo',
  // EPL
  'Arsenal FC':                'Arsenal',
  'Manchester City FC':        'Man City',
  'Manchester City':           'Man City',
  'Liverpool FC':              'Liverpool',
  'Chelsea FC':                'Chelsea',
  'Tottenham Hotspur FC':      'Tottenham',
  'Tottenham Hotspur':         'Tottenham',
  'Manchester United FC':      'Man United',
  'Manchester United':         'Man United',
  'Newcastle United FC':       'Newcastle',
  'Newcastle United':          'Newcastle',
  'Aston Villa FC':            'Aston Villa',
  'West Ham United FC':        'West Ham',
  'West Ham United':           'West Ham',
  'Brighton & Hove Albion FC': 'Brighton',
  'Brighton & Hove Albion':    'Brighton',
  'Wolverhampton Wanderers FC':'Wolves',
  'Wolverhampton Wanderers':   'Wolves',
  'Fulham FC':                 'Fulham',
  'Brentford FC':              'Brentford',
  'Crystal Palace FC':         'Crystal Palace',
  'AFC Bournemouth':           'Bournemouth',
  'Everton FC':                'Everton',
  'Nottingham Forest FC':      'Nottm Forest',
  'Leicester City FC':         'Leicester',
  'Southampton FC':            'Southampton',
  'Ipswich Town FC':           'Ipswich',
  // Serie A
  'FC Internazionale Milano':  'Inter Milan',
  'Inter':                     'Inter Milan',
  'Internazionale':            'Inter Milan',
  'AC Milan':                  'AC Milan',
  'Juventus FC':               'Juventus',
  'SSC Napoli':                'Napoli',
  'AS Roma':                   'Roma',
  'SS Lazio':                  'Lazio',
  'Atalanta BC':               'Atalanta',
  'ACF Fiorentina':            'Fiorentina',
  'Bologna FC 1909':           'Bologna',
  'Torino FC':                 'Torino',
  'Udinese Calcio':            'Udinese',
  'Genoa CFC':                 'Genoa',
  'Empoli FC':                 'Empoli',
  'Hellas Verona FC':          'Verona',
  'Cagliari Calcio':           'Cagliari',
  'US Lecce':                  'Lecce',
  'Venezia FC':                'Venezia',
  'Parma Calcio 1913':         'Parma',
  'Como 1907':                 'Como',
  'Monza':                     'Monza',
  // Bundesliga
  'FC Bayern München':         'Bayern Munich',
  'Bayern München':            'Bayern Munich',
  'FC Bayern Munich':          'Bayern Munich',
  'Borussia Dortmund':         'Dortmund',
  'Bayer 04 Leverkusen':       'Leverkusen',
  'RB Leipzig':                'RB Leipzig',
  'Eintracht Frankfurt':       'Frankfurt',
  'VfB Stuttgart':             'Stuttgart',
  'VfL Wolfsburg':             'Wolfsburg',
  'Borussia Mönchengladbach':  'Gladbach',
  'SC Freiburg':               'Freiburg',
  '1. FC Union Berlin':        'Union Berlin',
  'TSG 1899 Hoffenheim':       'Hoffenheim',
  'SV Werder Bremen':          'Werder Bremen',
  'FC Augsburg':               'Augsburg',
  'VfL Bochum 1848':           'Bochum',
  '1. FSV Mainz 05':           'Mainz',
  'FC Heidenheim 1846':        'Heidenheim',
  'Holstein Kiel':             'Kiel',
  'FC St. Pauli 1910':         'St. Pauli',
  // Ligue 1
  'Paris Saint-Germain FC':    'PSG',
  'Paris Saint-Germain':       'PSG',
  'AS Monaco FC':              'Monaco',
  'AS Monaco':                 'Monaco',
  'Olympique Lyonnais':        'Lyon',
  'LOSC Lille':                'Lille',
  'OGC Nice':                  'Nice',
  'Olympique de Marseille':    'Marseille',
  'RC Lens':                   'Lens',
  'Stade Rennais FC 1901':     'Rennes',
  'Stade Rennais FC':          'Rennes',
  'Stade Brestois 29':         'Brest',
  'Toulouse FC':               'Toulouse',
  'RC Strasbourg Alsace':      'Strasbourg',
  'FC Nantes':                 'Nantes',
  'Stade de Reims':            'Reims',
  'Le Havre AC':               'Le Havre',
  'Montpellier HSC':           'Montpellier',
};

function normalizeSmName(smName: string): string {
  return SM_NAME_NORMALIZE[smName] ?? smName;
}

/** Register Sportmonks logos in bulk (called from useLeagueData after fetch). */
export function registerSportmonksLogos(map: Record<string, string>) {
  for (const [smName, url] of Object.entries(map)) {
    const displayName = normalizeSmName(smName);
    smLogoRegistry.set(displayName, url);
    // Also index by the raw SM name in case any component uses it
    smLogoRegistry.set(smName, url);
    writeEntry(`team:${displayName}`, url);
  }
  // Notify all mounted ClubCrest instances that new logos are available
  logoListeners.forEach(fn => fn());
}

/** Register Sportmonks venues in bulk — returns normalized map for useLeagueData. */
export function normalizeSportmonksVenues<T>(map: Record<string, T>): Record<string, T> {
  const normalized: Record<string, T> = {};
  for (const [smName, value] of Object.entries(map)) {
    normalized[normalizeSmName(smName)] = value;
    normalized[smName] = value; // keep raw name too
  }
  return normalized;
}

/** Look up a pre-registered Sportmonks logo synchronously (no fetch needed). */
export function getSportmonksLogo(teamName: string): string | null {
  return smLogoRegistry.get(teamName) ?? null;
}

// TheSportsDB league IDs
export const LEAGUE_IDS: Record<string, string> = {
  'La Liga':    '4335',
  'EPL':        '4328',
  'Serie A':    '4332',
  'Bundesliga': '4331',
  'Ligue 1':    '4334',
  'UCL':        '4480',
};

// Name aliases for teams whose TheSportsDB search name differs from our display name
const TEAM_ALIASES: Record<string, string> = {
  'Bayern':    'Bayern Munich',
  'Man City':  'Manchester City',
  'Man United':'Manchester United',
  'PSG':       'Paris Saint-Germain',
  'Dortmund':  'Borussia Dortmund',
  'Leverkusen':'Bayer Leverkusen',
  'RB Leipzig':'RasenBallsport Leipzig',
  'Frankfurt': 'Eintracht Frankfurt',
  'Stuttgart': 'VfB Stuttgart',
  'Lyon':      'Olympique Lyonnais',
  'Monaco':    'AS Monaco',
  'Marseille': 'Olympique de Marseille',
  'Nice':      'OGC Nice',
  'Lille':     'LOSC Lille',
  'Betis':     'Real Betis',
  'Sevilla':   'Sevilla FC',
  'Villarreal':'Villarreal CF',
};

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

export async function fetchTeamLogo(teamName: string): Promise<string | null> {
  // Check Sportmonks registry first (higher-quality official club crests)
  const smLogo = smLogoRegistry.get(teamName);
  if (smLogo) return smLogo;

  const searchName = TEAM_ALIASES[teamName] ?? teamName;
  const cacheKey = `team:${searchName}`;

  const cached = readEntry(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${BASE}/searchteams.php?t=${encodeURIComponent(searchName)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const badge: string | undefined = data.teams?.[0]?.strTeamBadge;
    if (badge) {
      writeEntry(cacheKey, badge);
      return badge;
    }
  } catch {}
  return null;
}

export async function fetchLeagueLogo(leagueName: string): Promise<string | null> {
  const id = LEAGUE_IDS[leagueName];
  if (!id) return null;

  const cacheKey = `league:${leagueName}`;
  const cached = readEntry(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${BASE}/lookupleague.php?id=${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    const badge: string | undefined =
      data.leagues?.[0]?.strBadge ?? data.leagues?.[0]?.strLogo;
    if (badge) {
      writeEntry(cacheKey, badge);
      return badge;
    }
  } catch {}
  return null;
}

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

/** Register Sportmonks logos in bulk (called from useLeagueData after fetch). */
export function registerSportmonksLogos(map: Record<string, string>) {
  for (const [name, url] of Object.entries(map)) {
    smLogoRegistry.set(name, url);
    writeEntry(`team:${name}`, url); // also persist to localStorage cache
  }
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

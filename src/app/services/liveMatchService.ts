// Live matches from API-Football, read from the site's own server at /api/live.
// Any failure means "no live data": nothing here ever throws to the page.
import { API_BASE, type LivePhase, type NormalizedMatch } from './footballDataService';
import { clubScoreIndex, findClubScore, type ScoreEntry, type ScoresFile } from './scoresService';

const LIVE_TIMEOUT_MS = 10_000;
const PAIR_WITHIN_MS = 10 * 60_000;

/** One match from /api/live (the server's own shape). */
export interface LiveEntry {
  id?: number;                  // API-Football's fixture id
  competition: string;          // competition code, e.g. "PL", "CL"
  kickoff: string | null;       // ISO time
  home: string | null;
  away: string | null;
  phase: LivePhase;
  minute: number | null;
  extraMinute: number | null;
  homeGoals: number | null;
  awayGoals: number | null;
}

/** The live list, or null when there is no live data. Never throws. */
export async function fetchLiveMatches(): Promise<LiveEntry[] | null> {
  try {
    if (!API_BASE) return null;
    const res = await fetch(`${API_BASE}/api/live`, { signal: AbortSignal.timeout(LIVE_TIMEOUT_MS) });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || body.available !== true || !Array.isArray(body.matches)) return null;
    return body.matches as LiveEntry[];
  } catch {
    return null;
  }
}

// ── Pairing live entries with match cards ────────────────────────────────────

/**
 * True when a card's club name and a live club name are the same club. Uses
 * the scores file's matching code (findClubScore), because scores.json and
 * /api/live both use API-Football's spellings.
 */
function sameClub(cardName: string, liveName: string): boolean {
  const entry = { name: liveName } as ScoreEntry;
  const file = { categories: { club: { overall: [entry] } } } as unknown as ScoresFile;
  return findClubScore(clubScoreIndex(file, ['overall']), cardName) === entry;
}

function pairs(card: NormalizedMatch, live: LiveEntry): boolean {
  if (live.competition !== card.leagueCode || !live.kickoff || !live.home || !live.away) return false;
  const gap = Math.abs(new Date(live.kickoff).getTime() - new Date(card.utcDate).getTime());
  if (!(gap <= PAIR_WITHIN_MS)) return false;
  return sameClub(card.homeTeam, live.home) && sameClub(card.awayTeam, live.away);
}

/** Each live entry with the card it belongs to (undefined when no card fits). */
export function pairLiveEntries(cards: NormalizedMatch[], entries: LiveEntry[]) {
  const taken = new Set<number>();
  return entries.map(live => {
    const card = cards.find(c => !taken.has(c.id) && pairs(c, live));
    if (card) taken.add(card.id);
    return { live, card };
  });
}

// ── Match details (timeline and team stats) ──────────────────────────────────

export type EventKind = 'goal' | 'penalty_goal' | 'own_goal' | 'missed_penalty' | 'red_card';

export interface MatchEvent {
  minute: number | null;
  extraMinute: number | null;
  side: 'home' | 'away';
  kind: EventKind;
  player: string | null;
}

export type StatKey = 'possession' | 'shots' | 'shotsOnTarget' | 'corners' | 'fouls' | 'saves';
export type TeamStats = Record<StatKey, number | null>;

export interface MatchDetails {
  events: MatchEvent[];
  stats: { home: TeamStats; away: TeamStats };
}

const EVENT_KINDS: EventKind[] = ['goal', 'penalty_goal', 'own_goal', 'missed_penalty', 'red_card'];
const STAT_KEYS: StatKey[] = ['possession', 'shots', 'shotsOnTarget', 'corners', 'fouls', 'saves'];

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function cleanStats(raw: unknown): TeamStats {
  const out = {} as TeamStats;
  for (const key of STAT_KEYS) out[key] = num((raw as Record<string, unknown> | null)?.[key]);
  return out;
}

/** Fixtures of one competition on one UTC date, shaped like live entries so the existing pairing code can use them. */
async function fetchFixturesOn(code: string, date: string): Promise<LiveEntry[] | null> {
  try {
    if (!API_BASE) return null;
    const url = `${API_BASE}/api/fixtures-on?competition=${encodeURIComponent(code)}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(LIVE_TIMEOUT_MS) });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || body.available !== true || !Array.isArray(body.fixtures)) return null;
    return body.fixtures.map((f: { id: number; kickoff: string | null; home: string | null; away: string | null; phase: LivePhase }) => ({
      id: f.id, competition: code, kickoff: f.kickoff, home: f.home, away: f.away, phase: f.phase,
      minute: null, extraMinute: null, homeGoals: null, awayGoals: null,
    }));
  } catch {
    return null;
  }
}

/** API-Football's id for a card, found through /api/fixtures-on. Null when not found. Never throws. */
export async function findFixtureId(card: NormalizedMatch): Promise<number | null> {
  const date = new Date(card.utcDate);
  if (Number.isNaN(date.getTime())) return null;
  const fixtures = await fetchFixturesOn(card.leagueCode, date.toISOString().slice(0, 10));
  if (!fixtures) return null;
  const hit = pairLiveEntries([card], fixtures).find(p => p.card);
  return hit && typeof hit.live.id === 'number' ? hit.live.id : null;
}

export type DetailsAnswer =
  | { kind: 'ok'; details: MatchDetails }
  | { kind: 'not-found' }
  | { kind: 'none' };

/** The timeline and stats for one fixture id. Never throws. */
export async function fetchMatchDetails(id: number): Promise<DetailsAnswer> {
  try {
    if (!API_BASE) return { kind: 'none' };
    const res = await fetch(`${API_BASE}/api/match/${id}`, { signal: AbortSignal.timeout(LIVE_TIMEOUT_MS) });
    if (res.status === 404) return { kind: 'not-found' };
    if (!res.ok) return { kind: 'none' };
    const body = await res.json();
    if (!body || body.available !== true) return { kind: 'none' };
    const events: MatchEvent[] = (Array.isArray(body.events) ? body.events : [])
      .filter((e: MatchEvent) => e && EVENT_KINDS.includes(e.kind) && (e.side === 'home' || e.side === 'away') && num(e.minute) !== null)
      .map((e: MatchEvent) => ({
        minute: num(e.minute), extraMinute: num(e.extraMinute), side: e.side, kind: e.kind,
        player: typeof e.player === 'string' && e.player.trim() ? e.player : null,
      }));
    return { kind: 'ok', details: { events, stats: { home: cleanStats(body.stats?.home), away: cleanStats(body.stats?.away) } } };
  } catch {
    return { kind: 'none' };
  }
}

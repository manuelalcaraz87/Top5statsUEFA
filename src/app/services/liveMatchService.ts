// Live matches from API-Football, read from the site's own server at /api/live.
// Any failure means "no live data": nothing here ever throws to the page.
import { API_BASE, type LivePhase, type NormalizedMatch } from './footballDataService';
import { clubScoreIndex, findClubScore, type ScoreEntry, type ScoresFile } from './scoresService';

const LIVE_TIMEOUT_MS = 10_000;
const PAIR_WITHIN_MS = 10 * 60_000;

/** One match from /api/live (the server's own shape). */
export interface LiveEntry {
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

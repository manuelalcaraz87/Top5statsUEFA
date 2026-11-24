import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCurrentMatchdays, fetchHomeMatches, LEAGUE_CODES, type NormalizedMatch } from '../services/footballDataService';
import { fetchLiveMatches, pairLiveEntries, findFixtureId, fetchMatchDetails, type LiveEntry, type MatchDetails } from '../services/liveMatchService';

// Matches for the strip. The home page asks for every competition ("all") in
// one request and never asks for standings; a league or Champions League page
// asks only for its own competition (its standings and matches).

// ── Module-level caches, one per scope (survive re-renders, not HMR reloads) ──

interface Cache {
  data: NormalizedMatch[];
  timestamp: number;
}

const ALL = 'all';
const caches = new Map<string, Cache>();
const inflight = new Map<string, Promise<void>>();
const lastFailed = new Map<string, boolean>(); // last request failed: poll again sooner

const LIVE_TTL   = 40_000;
const IDLE_TTL   = 5 * 60_000;
const LIVE_POLL  = 45_000;
const IDLE_POLL  = 5 * 60_000;
const RETRY_POLL = 30_000;

// "Match window": fast timings apply while a match is live, or while an
// unfinished match kicks off between 5 minutes from now and 3 hours ago.
const WINDOW_AHEAD_MS  = 5 * 60_000;
const WINDOW_BEHIND_MS = 3 * 60 * 60_000;

// The Render server sleeps when nobody visits and takes up to about a minute
// to wake. While the very first request is waiting we say so, and keep trying
// every 10 s for 2 minutes before giving up with "No current data".
const WAKING_MESSAGE_AFTER_MS = 3_000;
const PATIENT_RETRY_EVERY_MS  = 10_000;
const PATIENT_GIVE_UP_AFTER_MS = 120_000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── Live list from API-Football (one shared copy for every page) ─────────────

let liveCache: { entries: LiveEntry[] | null; timestamp: number } | null = null; // null entries = no live data
let liveInflight: Promise<void> | null = null;
const warnedUnpaired = new Set<string>();
const liveFixtureIds = new Map<number, number>(); // card id -> API-Football fixture id

/** Fetches /api/live unless the shared copy is under 40 seconds old. Never throws. */
async function refreshLive(): Promise<void> {
  if (liveCache && Date.now() - liveCache.timestamp < LIVE_TTL) return;
  if (!liveInflight) {
    liveInflight = fetchLiveMatches()
      .then(entries => { liveCache = { entries, timestamp: Date.now() }; })
      .finally(() => { liveInflight = null; });
  }
  await liveInflight;
}

/**
 * The cards with API-Football's status, minute and score put on the ones that
 * pair with a live entry. Outside a match window the live list is not used.
 * Cards with no live entry are returned exactly as they are.
 */
function withLive(key: string, cards: NormalizedMatch[]): NormalizedMatch[] {
  const entries = liveCache?.entries;
  if (!entries || entries.length === 0 || !inMatchWindow(cards, Date.now())) return cards;

  const code = key === ALL ? null : LEAGUE_CODES[key];
  const ours = code ? entries.filter(e => e.competition === code) : entries;
  const overlay = new Map<number, LiveEntry>();
  for (const { live, card } of pairLiveEntries(cards, ours)) {
    if (card) {
      overlay.set(card.id, live);
      if (typeof live.id === 'number') liveFixtureIds.set(card.id, live.id);
    } else {
      const label = `${live.competition} ${live.kickoff} ${live.home} v ${live.away}`;
      if (!warnedUnpaired.has(label)) {
        warnedUnpaired.add(label);
        console.warn(`[useMatches] live match has no card, ignored: ${label}`);
      }
    }
  }
  if (overlay.size === 0) return cards;

  return cards.map(card => {
    const live = overlay.get(card.id);
    if (!live) return card;
    const status: NormalizedMatch['status'] =
      live.phase === 'finished' ? 'finished'
      : live.phase === 'suspended' || live.phase === 'postponed' || live.phase === 'cancelled' ? 'upcoming'
      : 'live';
    return {
      ...card,
      status,
      livePhase: live.phase,
      minute: live.minute,
      injuryTime: live.extraMinute,
      minuteSource: live.phase === 'in_play' ? (live.minute != null ? 'provider' : 'estimate') : null,
      homeScore: live.homeGoals ?? card.homeScore,
      awayScore: live.awayGoals ?? card.awayScore,
    };
  });
}

/** True when any match is live, or an unfinished match is inside the window around kick-off. */
function inMatchWindow(data: NormalizedMatch[], now: number): boolean {
  return data.some(m => {
    if (m.status === 'live') return true;
    if (m.status === 'finished') return false;
    const kickoff = new Date(m.utcDate).getTime();
    return kickoff <= now + WINDOW_AHEAD_MS && kickoff >= now - WINDOW_BEHIND_MS;
  });
}

/** Milliseconds until the next upcoming match enters the match window, or null if none is due. */
function msUntilWindowOpens(data: NormalizedMatch[], now: number): number | null {
  let opensAt: number | null = null;
  for (const m of data) {
    if (m.status !== 'upcoming') continue;
    const opens = new Date(m.utcDate).getTime() - WINDOW_AHEAD_MS;
    if (opens > now && (opensAt === null || opens < opensAt)) opensAt = opens;
  }
  return opensAt === null ? null : opensAt - now;
}

/**
 * The matches a scope should show right now, with the time they were saved.
 * A league or Champions League page uses the home page's list (filtered by
 * leagueId) when that list is newer than its own and has matches for it.
 */
function getCache(key: string): Cache | undefined {
  const own = caches.get(key);
  if (key === ALL) return own;
  const home = caches.get(ALL);
  if (!home || (own && own.timestamp >= home.timestamp)) return own;
  const data = home.data.filter(m => m.leagueId === key);
  if (data.length === 0) return own;
  return { data, timestamp: home.timestamp };
}

function nextPollDelay(key: string): number {
  if (lastFailed.get(key)) return RETRY_POLL;
  const cache = getCache(key);
  if (!cache) return IDLE_POLL;
  const now = Date.now();
  if (inMatchWindow(cache.data, now)) return LIVE_POLL;
  // Wake up when the next kick-off enters the window, rather than waiting out a full idle poll.
  const opensIn = msUntilWindowOpens(cache.data, now);
  return opensIn === null ? IDLE_POLL : Math.min(IDLE_POLL, Math.max(opensIn, 1_000));
}

async function fetchScope(key: string, patient: boolean): Promise<NormalizedMatch[]> {
  const started = Date.now();
  for (;;) {
    try {
      return await (key === ALL ? fetchHomeMatches() : fetchCurrentMatchdays([key]));
    } catch (e) {
      if (!patient || Date.now() - started >= PATIENT_GIVE_UP_AFTER_MS) throw e;
      console.warn(`[useMatches] not answered yet, trying again in ${PATIENT_RETRY_EVERY_MS / 1000} s:`, e);
      await sleep(PATIENT_RETRY_EVERY_MS);
    }
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/** `leagueId`: a league or Champions League page's id; leave out on the home page. */
export function useMatches(leagueId?: string) {
  const key = leagueId || ALL;

  // Always initialize with constant values — never derive initial state from
  // module-level mutable cache so hook order is stable across HMR reloads.
  const [allMatches,   setAllMatches]   = useState<NormalizedMatch[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [waking,       setWaking]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [hasLive,      setHasLive]      = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeKey = useRef(key);

  const applyCache = useCallback(() => {
    const cache = getCache(key);
    if (!cache) return;
    const cards = withLive(key, cache.data);
    setAllMatches(cards);
    setHasLive(cards.some(m => m.status === 'live'));
    setLastUpdated(new Date(cache.timestamp));
    setLoading(false);
    setWaking(false);
    setError(null);
  }, [key]);

  const load = useCallback(async (force = false) => {
    const now = Date.now();
    const cache = getCache(key);
    const ttl = cache && inMatchWindow(cache.data, now) ? LIVE_TTL : IDLE_TTL;

    // Inside a match window only: bring in the shared live list (at most one
    // call per 40 s for all pages) and redraw if it changed.
    const addLive = async () => {
      const current = getCache(key);
      if (!current || !inMatchWindow(current.data, Date.now())) return;
      const before = liveCache;
      await refreshLive();
      if (liveCache !== before && activeKey.current === key) applyCache();
    };

    if (!force && cache && now - cache.timestamp < ttl) {
      applyCache();
      await addLive();
      return;
    }

    if (!inflight.has(key)) {
      // Patient retries only while there is nothing on screen yet.
      const request = fetchScope(key, !cache)
        .then(data => {
          caches.set(key, { data, timestamp: Date.now() });
          lastFailed.set(key, false);
        })
        .catch(e => {
          // Keep any earlier real data on screen; just try again sooner.
          lastFailed.set(key, true);
          console.warn('[useMatches]', e);
        })
        .finally(() => { inflight.delete(key); });
      inflight.set(key, request);
    }

    await inflight.get(key);
    if (activeKey.current !== key) return; // the visitor moved to another page meanwhile

    if (getCache(key)) {
      applyCache();
      await addLive();
    } else {
      setError('Could not load match data');
      setLoading(false);
      setWaking(false);
    }
  }, [key, applyCache]);

  useEffect(() => {
    activeKey.current = key;
    let wakingTimer: ReturnType<typeof setTimeout> | undefined;

    if (getCache(key)) {
      // Hydrate from cache immediately (avoids flash of empty state on re-mounts)
      applyCache();
    } else {
      setAllMatches([]);
      setHasLive(false);
      setLastUpdated(null);
      setError(null);
      setLoading(true);
      setWaking(false);
      wakingTimer = setTimeout(() => { if (!getCache(key)) setWaking(true); }, WAKING_MESSAGE_AFTER_MS);
    }

    let stopped = false;

    // Adaptive polling: re-evaluates delay after each fetch
    function schedule() {
      const delay = nextPollDelay(key);
      timerRef.current = setTimeout(async () => {
        await load();
        if (!stopped) schedule();
      }, delay);
    }

    load().then(() => { if (!stopped) schedule(); });

    // When the tab comes back, check for new data straight away (same timings as polling).
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') load();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopped = true;
      if (wakingTimer) clearTimeout(wakingTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [key, load, applyCache]);

  const refresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    load(true).then(() => {
      function tick() {
        const delay = nextPollDelay(key);
        timerRef.current = setTimeout(async () => { await load(); tick(); }, delay);
      }
      tick();
    });
  }, [key, load]);

  const matchesByLeague = allMatches.reduce<Record<string, NormalizedMatch[]>>((acc, m) => {
    if (!acc[m.leagueName]) acc[m.leagueName] = [];
    acc[m.leagueName].push(m);
    return acc;
  }, {});

  return { matchesByLeague, allMatches, hasLive, loading, waking, error, lastUpdated, refresh };
}

// ── Details for the match panel (timeline and team stats) ─────────────────────

const DETAILS_POLL = 60_000;

/**
 * Timeline and team stats for an open panel. Returns null when there is nothing
 * to show (upcoming match, no details, or any failure). Refreshes every 60 s
 * while the match is live; stops when the panel closes or the match finishes.
 */
export function useMatchDetails(match: NormalizedMatch): MatchDetails | null {
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const cardRef = useRef(match);
  cardRef.current = match;
  const idRef = useRef<number | null>(null);
  const status = match.status;
  const cardId = match.id;

  useEffect(() => {
    if (status === 'upcoming') { setDetails(null); return; }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function loadOnce() {
      if (idRef.current === null) idRef.current = liveFixtureIds.get(cardId) ?? await findFixtureId(cardRef.current);
      if (stopped || idRef.current === null) return;
      let answer = await fetchMatchDetails(idRef.current);
      if (answer.kind === 'not-found') {
        idRef.current = await findFixtureId(cardRef.current);
        if (stopped || idRef.current === null) return;
        answer = await fetchMatchDetails(idRef.current);
      }
      if (stopped) return;
      if (answer.kind === 'ok') setDetails(answer.details);
      // On a failed refresh the last good details stay on screen.
    }

    async function run() {
      await loadOnce();
      if (!stopped && status === 'live') timer = setTimeout(run, DETAILS_POLL);
    }

    idRef.current = null;
    run();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [cardId, status]);

  return details;
}

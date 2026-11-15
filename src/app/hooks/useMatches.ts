import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCurrentMatchdays, type NormalizedMatch } from '../services/footballDataService';

// Matches for the strip. The home page asks for every competition ("all");
// a league or Champions League page asks only for its own, so it makes only
// the requests it needs.

// ── Module-level caches, one per scope (survive re-renders, not HMR reloads) ──

interface Cache {
  data: NormalizedMatch[];
  timestamp: number;
  hasLive: boolean;
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

// The Render server sleeps when nobody visits and takes up to about a minute
// to wake. While the very first request is waiting we say so, and keep trying
// every 10 s for 2 minutes before giving up with "No current data".
const WAKING_MESSAGE_AFTER_MS = 3_000;
const PATIENT_RETRY_EVERY_MS  = 10_000;
const PATIENT_GIVE_UP_AFTER_MS = 120_000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** The cache for a scope. A league scope can also be cut out of the "all" cache. */
function getCache(key: string): Cache | undefined {
  const own = caches.get(key);
  if (own) return own;
  const all = caches.get(ALL);
  if (key === ALL || !all) return undefined;
  const data = all.data.filter(m => m.leagueId === key);
  return { data, timestamp: all.timestamp, hasLive: data.some(m => m.status === 'live') };
}

function nextPollDelay(key: string): number {
  if (lastFailed.get(key)) return RETRY_POLL;
  return getCache(key)?.hasLive ? LIVE_POLL : IDLE_POLL;
}

async function fetchScope(key: string, patient: boolean): Promise<NormalizedMatch[]> {
  const started = Date.now();
  for (;;) {
    try {
      return await fetchCurrentMatchdays(key === ALL ? undefined : [key]);
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
    setAllMatches(cache.data);
    setHasLive(cache.hasLive);
    setLastUpdated(new Date(cache.timestamp));
    setLoading(false);
    setWaking(false);
    setError(null);
  }, [key]);

  const load = useCallback(async (force = false) => {
    const now = Date.now();
    const cache = getCache(key);
    const ttl = cache?.hasLive ? LIVE_TTL : IDLE_TTL;

    if (!force && cache && now - cache.timestamp < ttl) {
      applyCache();
      return;
    }

    if (!inflight.has(key)) {
      // Patient retries only while there is nothing on screen yet.
      const request = fetchScope(key, !cache)
        .then(data => {
          caches.set(key, { data, timestamp: Date.now(), hasLive: data.some(m => m.status === 'live') });
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
    return () => {
      stopped = true;
      if (wakingTimer) clearTimeout(wakingTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
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

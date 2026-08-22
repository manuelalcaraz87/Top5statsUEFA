import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMatchWindow, type NormalizedMatch } from '../services/footballDataService';

// ── Module-level cache (survives re-renders, not HMR reloads) ─────────────────

interface Cache {
  data: NormalizedMatch[];
  timestamp: number;
  hasLive: boolean;
}

let _cache: Cache | null = null;
let _inflight: Promise<void> | null = null;

const LIVE_TTL  = 40_000;
const IDLE_TTL  = 5 * 60_000;
const LIVE_POLL = 45_000;
const IDLE_POLL = 5 * 60_000;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMatches() {
  // Always initialize with constant values — never derive initial state from
  // module-level mutable cache so hook order is stable across HMR reloads.
  const [allMatches,   setAllMatches]   = useState<NormalizedMatch[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [hasLive,      setHasLive]      = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyCache = useCallback(() => {
    if (!_cache) return;
    setAllMatches(_cache.data);
    setHasLive(_cache.hasLive);
    setLastUpdated(new Date(_cache.timestamp));
    setLoading(false);
    setError(null);
  }, []);

  const load = useCallback(async (force = false) => {
    const now = Date.now();
    const ttl = _cache?.hasLive ? LIVE_TTL : IDLE_TTL;

    if (!force && _cache && now - _cache.timestamp < ttl) {
      applyCache();
      return;
    }

    if (!_inflight) {
      _inflight = fetchMatchWindow()
        .then(data => {
          _cache = { data, timestamp: Date.now(), hasLive: data.some(m => m.status === 'live') };
        })
        .catch(e => console.warn('[useMatches]', e))
        .finally(() => { _inflight = null; });
    }

    await _inflight;

    if (_cache) {
      applyCache();
    } else {
      setError('Could not load match data');
      setLoading(false);
    }
  }, [applyCache]);

  useEffect(() => {
    // Hydrate from cache immediately (avoids flash of empty state on re-mounts)
    applyCache();

    // Adaptive polling: re-evaluates delay after each fetch
    function schedule() {
      const delay = _cache?.hasLive ? LIVE_POLL : IDLE_POLL;
      timerRef.current = setTimeout(async () => {
        await load();
        schedule();
      }, delay);
    }

    load().then(schedule);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [load, applyCache]);

  const refresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    load(true).then(() => {
      function tick() {
        const delay = _cache?.hasLive ? LIVE_POLL : IDLE_POLL;
        timerRef.current = setTimeout(async () => { await load(); tick(); }, delay);
      }
      tick();
    });
  }, [load]);

  const matchesByLeague = allMatches.reduce<Record<string, NormalizedMatch[]>>((acc, m) => {
    if (!acc[m.leagueName]) acc[m.leagueName] = [];
    acc[m.leagueName].push(m);
    return acc;
  }, {});

  return { matchesByLeague, allMatches, hasLive, loading, error, lastUpdated, refresh };
}

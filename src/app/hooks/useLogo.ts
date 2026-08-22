import { useState, useEffect } from 'react';
import { fetchTeamLogo, fetchLeagueLogo } from '../services/logoService';

// Module-level caches so concurrent instances share a single in-flight request
const memCache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();

function subscribe(key: string, fetcher: () => Promise<string | null>, setter: (v: string | null) => void) {
  if (memCache.has(key)) {
    setter(memCache.get(key) ?? null);
    return;
  }

  if (!inFlight.has(key)) {
    inFlight.set(
      key,
      fetcher().then(result => {
        memCache.set(key, result);
        inFlight.delete(key);
        return result;
      }),
    );
  }

  inFlight.get(key)!.then(setter);
}

export function useTeamLogo(teamName: string): string | null {
  const key = `t:${teamName}`;
  const [url, setUrl] = useState<string | null>(() => memCache.get(key) ?? null);

  useEffect(() => {
    subscribe(key, () => fetchTeamLogo(teamName), setUrl);
  }, [key, teamName]);

  return url;
}

export function useLeagueLogo(leagueName: string): string | null {
  const key = `l:${leagueName}`;
  const [url, setUrl] = useState<string | null>(() => memCache.get(key) ?? null);

  useEffect(() => {
    subscribe(key, () => fetchLeagueLogo(leagueName), setUrl);
  }, [key, leagueName]);

  return url;
}

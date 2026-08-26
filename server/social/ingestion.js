// Ingestion service: periodically pulls posts for all leagues from X.com,
// scores them with the trending algorithm, and keeps an in-memory cache
// that the /api/social/* routes serve from (avoiding hitting X's rate
// limits on every client request).

import { fetchRecentPostsForHandles } from './xClient.js';
import { getLeagueHandles, getAllLeagueIds, LEAGUE_SOURCES } from './sources.js';
import { rankPosts, computeTrending } from './trending.js';

const LEAGUE_META = {
  'la-liga': { id: 'la-liga', name: 'La Liga' },
  epl: { id: 'epl', name: 'EPL' },
  'serie-a': { id: 'serie-a', name: 'Serie A' },
  bundesliga: { id: 'bundesliga', name: 'Bundesliga' },
  'ligue-1': { id: 'ligue-1', name: 'Ligue 1' },
  ucl: { id: 'ucl', name: 'UCL' },
};

const state = {
  postsByLeague: {}, // leagueId -> ranked posts[]
  trending: [],
  lastUpdated: null,
  lastError: null,
};

let refreshTimer = null;
let refreshing = false;

async function refreshLeague(leagueId) {
  const handles = getLeagueHandles(leagueId);
  if (!handles.length) return [];
  const { posts, users } = await fetchRecentPostsForHandles(handles, { maxResults: 50 });
  return rankPosts(leagueId, posts, users, LEAGUE_META[leagueId]);
}

/** Pulls fresh data for every configured league and rebuilds trending. */
export async function refreshAll() {
  if (refreshing) return; // avoid overlapping refresh cycles
  refreshing = true;
  try {
    const leagueIds = getAllLeagueIds();
    const results = await Promise.allSettled(leagueIds.map(refreshLeague));

    const postsByLeague = {};
    results.forEach((result, i) => {
      const leagueId = leagueIds[i];
      if (result.status === 'fulfilled') {
        postsByLeague[leagueId] = result.value;
      } else {
        console.error(`[social] Failed to refresh ${leagueId}:`, result.reason?.message ?? result.reason);
        postsByLeague[leagueId] = state.postsByLeague[leagueId] ?? [];
      }
    });

    state.postsByLeague = postsByLeague;
    state.trending = computeTrending(postsByLeague, { limit: 8 });
    state.lastUpdated = new Date().toISOString();
    state.lastError = null;
  } catch (error) {
    state.lastError = error.message;
    console.error('[social] refreshAll failed:', error);
  } finally {
    refreshing = false;
  }
}

export function getLeagueFeed(leagueId, { limit = 20 } = {}) {
  return (state.postsByLeague[leagueId] ?? []).slice(0, limit);
}

export function getTrending() {
  return state.trending;
}

export function getStatus() {
  return {
    lastUpdated: state.lastUpdated,
    lastError: state.lastError,
    leagues: Object.fromEntries(
      Object.entries(state.postsByLeague).map(([id, posts]) => [id, posts.length])
    ),
  };
}

/** Starts the background polling loop. Safe to call multiple times. */
export function startSocialIngestion({ intervalMinutes = 5 } = {}) {
  if (!process.env.X_BEARER_TOKEN) {
    console.warn('[social] X_BEARER_TOKEN not set — social feed ingestion disabled.');
    return;
  }
  if (refreshTimer) return;

  refreshAll(); // kick off immediately
  refreshTimer = setInterval(refreshAll, Math.max(intervalMinutes, 1) * 60_000);
}

export function stopSocialIngestion() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  getLeagueFeed,
  getTrending,
  getStatus,
} from './social/ingestion.js';
import { getAllLeagueIds } from './social/sources.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Simple in-memory cache, with a separate lifetime per data provider.
// football-data.org: at least 5 minutes (it allows 10 requests a minute).
// API-Football: at least 6 hours (the free plan allows 100 requests a day).
// The .env values can make these longer, never shorter.
const cache = new Map();
const MINUTE_MS = 60 * 1000;
const FD_CACHE_TTL = Math.max(Number(process.env.FD_CACHE_TTL_MINUTES) || 5, 5) * MINUTE_MS;
const AF_CACHE_TTL = Math.max(Number(process.env.AF_CACHE_TTL_MINUTES) || 360, 360) * MINUTE_MS;

function getCacheKey(path, query) {
  return `${path}?${new URLSearchParams(query).toString()}`;
}

function getFromCache(key, ttl) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ── football-data.org rate limiting ───────────────────────────────────────────
// The free plan allows FD_REQUESTS_PER_MINUTE requests per rolling minute.
// Every upstream call goes through fdQueued(), which waits for a free slot
// instead of letting football-data.org refuse the request. Identical requests
// that arrive while one is already in flight share that single call.
const FD_REQUESTS_PER_MINUTE = Number(process.env.FD_REQUESTS_PER_MINUTE) || 10;
const FD_WINDOW_MS = 60_000;
const fdSentAt = [];          // timestamps of recent upstream calls
let fdQueue = Promise.resolve();
const fdInFlight = new Map(); // url -> Promise<{ status, data }>

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForFdSlot() {
  for (;;) {
    const now = Date.now();
    while (fdSentAt.length && now - fdSentAt[0] >= FD_WINDOW_MS) fdSentAt.shift();
    if (fdSentAt.length < FD_REQUESTS_PER_MINUTE) {
      fdSentAt.push(now);
      return;
    }
    await sleep(fdSentAt[0] + FD_WINDOW_MS - now + 50);
  }
}

async function fdFetchOnce(url) {
  // Queue slots one at a time so concurrent requests never exceed the limit.
  const slot = fdQueue.then(waitForFdSlot);
  fdQueue = slot.catch(() => {});
  await slot;
  const response = await fetch(url, { headers: { 'X-Auth-Token': process.env.FD_TOKEN } });
  const data = await response.json().catch(() => null);
  return { status: response.status, statusText: response.statusText, headers: response.headers, data };
}

async function fdFetch(url) {
  let result = await fdFetchOnce(url);
  if (result.status === 429) {
    // Our count drifted from football-data.org's (e.g. after a restart):
    // wait for their counter to reset, then try once more.
    const resetSeconds = Number(result.headers.get('x-requestcounter-reset')) || 60;
    console.warn(`[fd] rate limited upstream; retrying in ${resetSeconds}s`);
    await sleep(resetSeconds * 1000 + 250);
    result = await fdFetchOnce(url);
  }
  return result;
}

function fdFetchShared(url) {
  if (!fdInFlight.has(url)) {
    fdInFlight.set(url, fdFetch(url).finally(() => fdInFlight.delete(url)));
  }
  return fdInFlight.get(url);
}

const afInFlight = new Map(); // url -> Promise<{ status, data }>

async function afFetchOnce(url) {
  const response = await fetch(url, { headers: { 'x-apisports-key': process.env.AF_TOKEN } });
  const data = await response.json().catch(() => null);
  return { status: response.status, statusText: response.statusText, data };
}

function afFetchShared(url) {
  if (!afInFlight.has(url)) {
    afInFlight.set(url, afFetchOnce(url).finally(() => afInFlight.delete(url)));
  }
  return afInFlight.get(url);
}

// Football Data API Proxy
app.get('/api/fd/*', async (req, res) => {
  try {
    const path = req.params[0];
    const cacheKey = getCacheKey(`fd/${path}`, req.query);

    // Check cache first
    const cached = getFromCache(cacheKey, FD_CACHE_TTL);
    if (cached) {
      return res.json(cached);
    }

    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://api.football-data.org/v4/${path}${queryString ? '?' + queryString : ''}`;

    const { status, statusText, data } = await fdFetchShared(url);

    if (status === 429) {
      return res.status(429).json({ error: 'Rate limited by Football Data API' });
    }

    if (status < 200 || status >= 300) {
      return res.status(status).json({
        error: `Football Data API error: ${statusText}`
      });
    }

    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('FD Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from Football Data API' });
  }
});

// API Football Proxy
app.get('/api/af/*', async (req, res) => {
  try {
    const path = req.params[0];
    const cacheKey = getCacheKey(`af/${path}`, req.query);

    // Check cache first
    const cached = getFromCache(cacheKey, AF_CACHE_TTL);
    if (cached) {
      // Refusals are cached too (see below), so they don't use up requests.
      return cached.afRefusal ? res.status(502).json(cached.afRefusal) : res.json(cached);
    }

    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://v3.football.api-sports.io/${path}${queryString ? '?' + queryString : ''}`;

    // Identical requests that arrive together share one upstream call,
    // so they use up only one of the 100 daily requests.
    const { status, statusText, data } = await afFetchShared(url);

    if (status === 429) {
      return res.status(429).json({ error: 'Rate limited by API Football' });
    }

    if (status < 200 || status >= 300 || !data) {
      return res.status(status >= 400 ? status : 502).json({
        error: `API Football error: ${statusText}`
      });
    }

    // API-Football reports problems (daily limit reached, plan does not
    // cover this season, bad key) with HTTP 200 and an "errors" field.
    const errors = data.errors;
    const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0;
    if (hasErrors) {
      console.warn('[af] upstream reported errors:', JSON.stringify(errors));
      // Cache the refusal for the same 6+ hours: asking again would give the
      // same answer and still count against the 100-a-day limit.
      const refusal = { error: 'API Football error', details: errors };
      setCache(cacheKey, { afRefusal: refusal });
      return res.status(502).json(refusal);
    }

    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('AF Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from API Football' });
  }
});

// Social feed: posts scraped from X.com for a league's players, clubs,
// league accounts and top commentators, ranked by the trending algorithm.
app.get('/api/social/feed/:leagueId', (req, res) => {
  const { leagueId } = req.params;
  if (!getAllLeagueIds().includes(leagueId)) {
    return res.status(404).json({ error: `Unknown league: ${leagueId}` });
  }
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  res.json({ posts: getLeagueFeed(leagueId, { limit }) });
});

// Trending hashtags/topics aggregated across all leagues.
app.get('/api/social/trending', (req, res) => {
  res.json({ trending: getTrending() });
});

// Ingestion status/diagnostics.
app.get('/api/social/status', (req, res) => {
  res.json(getStatus());
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend proxy server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Social feed ingestion is disabled pending redesign (see server/social/ingestion.js).
// It is intentionally not started here, so no X.com requests are made.

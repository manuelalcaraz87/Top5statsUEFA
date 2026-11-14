import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const MINUTE_MS = 60 * 1000;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Render puts a proxy in front of this server; trust it so each visitor is
// counted by their own IP address and not by Render's.
app.set('trust proxy', 1);

// ── Per-visitor rate limit ────────────────────────────────────────────────────
// At most RATE_LIMIT_PER_MINUTE requests a minute per IP address; anything
// above that gets a 429 until the minute is over.
const RATE_LIMIT_PER_MINUTE = 60;
const rateHits = new Map(); // ip -> { count, resetAt }

app.use((req, res, next) => {
  const now = Date.now();
  let entry = rateHits.get(req.ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + MINUTE_MS };
    rateHits.set(req.ip, entry);
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_PER_MINUTE) {
    res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  next();
});

// Forget visitors whose minute is over, so the table cannot grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateHits) if (now >= entry.resetAt) rateHits.delete(ip);
}, MINUTE_MS).unref();

// Simple in-memory cache for football-data.org responses: at least 5 minutes
// (the free plan allows 10 requests a minute). The .env value can make this
// longer, never shorter.
const cache = new Map();
const FD_CACHE_TTL = Math.max(Number(process.env.FD_CACHE_TTL_MINUTES) || 5, 5) * MINUTE_MS;

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

// Football Data API Proxy
// Only GET requests for exactly the pages the site uses are passed on:
//   competitions/{PL|PD|SA|BL1|FL1|CL}/{standings|matches|scorers}
// with only the options the site sends (season, matchday, limit), each a plain
// number. Everything else is answered with 404.
const FD_PATH = /^competitions\/(PL|PD|SA|BL1|FL1|CL)\/(standings|matches|scorers)$/;
const FD_ALLOWED_PARAMS = ['season', 'matchday', 'limit'];

function cleanFdQuery(query) {
  const clean = {};
  for (const [key, value] of Object.entries(query)) {
    if (!FD_ALLOWED_PARAMS.includes(key)) return null;
    if (typeof value !== 'string' || !/^\d{1,4}$/.test(value)) return null;
    clean[key] = value;
  }
  return clean;
}

app.get('/api/fd/*', async (req, res) => {
  try {
    const path = req.params[0];
    const query = FD_PATH.test(path) ? cleanFdQuery(req.query) : null;
    if (!query) return res.status(404).json({ error: 'Not found' });
    const cacheKey = getCacheKey(`fd/${path}`, query);

    // Check cache first
    const cached = getFromCache(cacheKey, FD_CACHE_TTL);
    if (cached) {
      return res.json(cached);
    }

    const queryString = new URLSearchParams(query).toString();
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Anything else (wrong method, unknown address, the disabled social routes) is a 404.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend proxy server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Social feed ingestion is disabled pending redesign (see server/social/ingestion.js).
// It is intentionally not started here, so no X.com requests are made.

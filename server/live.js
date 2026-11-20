// Live matches from API-Football (v3), served at GET /api/live.
//
// Only the six competitions below are asked for. Each answer is cut down to
// plain text and numbers: logos, crests, flags, photos and anything else from
// the upstream answer are never passed on.

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

const AF_BASE = 'https://v3.football.api-sports.io';
const ANSWER_TTL_MS = 60 * 1000;            // one answer is shared for 60 seconds
const FINISHED_MEMORY_MS = 3 * HOUR_MS;     // finished matches are kept for 3 hours
const DEFAULT_DAILY_BUDGET = 3000;

// API-Football league id -> our competition code.
const LEAGUES = new Map([
  [39, 'PL'],   // England, Premier League
  [140, 'PD'],  // Spain, La Liga
  [135, 'SA'],  // Italy, Serie A
  [78, 'BL1'],  // Germany, Bundesliga
  [61, 'FL1'],  // France, Ligue 1
  [2, 'CL'],    // UEFA Champions League
]);
const LEAGUE_IDS = [...LEAGUES.keys()];

// API-Football status short code -> our phase.
const PHASE_BY_STATUS = new Map([
  ['1H', 'in_play'], ['2H', 'in_play'], ['LIVE', 'in_play'],
  ['HT', 'half_time'],
  ['ET', 'extra_time'],
  ['BT', 'extra_time_break'],
  ['P', 'penalties'],
  ['FT', 'finished'], ['AET', 'finished'], ['PEN', 'finished'],
  ['SUSP', 'suspended'], ['INT', 'suspended'],
  ['PST', 'postponed'],
  ['CANC', 'cancelled'], ['ABD', 'cancelled'], ['AWD', 'cancelled'], ['WO', 'cancelled'],
]);
const LIVE_PHASES = new Set(['in_play', 'half_time', 'extra_time', 'extra_time_break', 'penalties']);

// ── Turning one API-Football fixture into our match shape ─────────────────────
function plainNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function plainText(value) {
  return typeof value === 'string' ? value : null;
}

// Returns { id, match } or null when the fixture is not one of ours or has a
// status we do not show.
function toEntry(fixture) {
  const competition = LEAGUES.get(fixture?.league?.id);
  const phase = PHASE_BY_STATUS.get(fixture?.fixture?.status?.short);
  if (!competition || !phase) return null;

  const date = new Date(fixture.fixture.date);
  return {
    id: fixture.fixture.id,
    match: {
      competition,
      kickoff: Number.isNaN(date.getTime()) ? null : date.toISOString(),
      home: plainText(fixture.teams?.home?.name),
      away: plainText(fixture.teams?.away?.name),
      phase,
      minute: plainNumber(fixture.fixture.status.elapsed),
      extraMinute: plainNumber(fixture.fixture.status.extra),
      homeGoals: plainNumber(fixture.goals?.home),
      awayGoals: plainNumber(fixture.goals?.away),
    },
  };
}

// ── Daily budget ──────────────────────────────────────────────────────────────
// Counts every call to API-Football per UTC day. Read at call time, because
// dotenv loads the .env file after this module is imported.
function dailyBudget() {
  const raw = process.env.AF_DAILY_BUDGET;
  const value = raw === undefined || raw.trim() === '' ? DEFAULT_DAILY_BUDGET : Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : DEFAULT_DAILY_BUDGET;
}

let usage = { day: '', count: 0 };

function takeUpstreamCall() {
  const day = new Date().toISOString().slice(0, 10);
  if (usage.day !== day) usage = { day, count: 0 };
  if (usage.count >= dailyBudget()) return false;
  usage.count += 1;
  return true;
}

// ── Upstream calls ────────────────────────────────────────────────────────────
class Unavailable extends Error {}

async function callApiFootball(label, query) {
  if (!takeUpstreamCall()) {
    throw new Unavailable(`daily budget of ${dailyBudget()} calls used up for today (UTC)`);
  }
  console.log(`[live] API-Football call ${usage.count} of ${dailyBudget()} today (UTC): ${label}`);

  const response = await fetch(`${AF_BASE}/fixtures?${new URLSearchParams(query)}`, {
    headers: { 'x-apisports-key': process.env.AF_TOKEN },
  });
  if (!response.ok) throw new Unavailable(`API-Football answered HTTP ${response.status}`);

  const body = await response.json().catch(() => null);
  if (!body) throw new Unavailable('API-Football answer was not JSON');

  // API-Football reports problems (such as a bad key) inside a 200 answer.
  const errors = body.errors;
  const errorCount = Array.isArray(errors) ? errors.length : Object.keys(errors || {}).length;
  if (errorCount > 0) throw new Unavailable(`API-Football reported an error: ${JSON.stringify(errors)}`);

  return Array.isArray(body.response) ? body.response : [];
}

// ── Remembered state ──────────────────────────────────────────────────────────
let previousLiveIds = null;        // ids in the last successful live list
const finishedMemory = new Map();  // fixture id -> { match, until }
let answerCache = null;            // { answer, at }
let inFlight = null;               // one shared upstream refresh at a time

// Sorts fixtures into the live list or the finished memory.
function sortFixtures(fixtures, liveNow, returnedIds) {
  for (const fixture of fixtures) {
    const entry = toEntry(fixture);
    if (!entry) continue;
    if (returnedIds) returnedIds.add(entry.id);
    if (LIVE_PHASES.has(entry.match.phase)) {
      liveNow.set(entry.id, entry.match);
    } else {
      finishedMemory.set(entry.id, { match: entry.match, until: Date.now() + FINISHED_MEMORY_MS });
    }
  }
}

function sortByKickoff(a, b) {
  return (a.kickoff || '').localeCompare(b.kickoff || '');
}

// One full refresh: the live list, plus one lookup for any match that left the
// live list since last time.
async function refresh() {
  if (!process.env.AF_TOKEN) throw new Unavailable('AF_TOKEN is not set in server/.env');

  const liveNow = new Map();      // fixture id -> match, still live
  const returnedIds = new Set();  // every fixture id in the live answer
  const liveFixtures = await callApiFootball('live list', { live: LEAGUE_IDS.join('-') });
  sortFixtures(liveFixtures, liveNow, returnedIds);

  const now = Date.now();
  for (const [id, entry] of finishedMemory) if (now >= entry.until) finishedMemory.delete(id);

  const missing = previousLiveIds
    ? [...previousLiveIds].filter(id => !returnedIds.has(id) && !finishedMemory.has(id))
    : [];
  if (missing.length) {
    const fixtures = await callApiFootball('final status of matches that left the live list', {
      ids: missing.join('-'),
    });
    sortFixtures(fixtures, liveNow, null);
  }

  previousLiveIds = returnedIds;

  const matches = [...liveNow.values()];
  for (const [id, entry] of finishedMemory) if (!liveNow.has(id)) matches.push(entry.match);

  return {
    available: true,
    updatedAt: new Date(now).toISOString(),
    matches: matches.sort(sortByKickoff),
  };
}

// Never throws: any failure becomes the quiet fallback answer.
async function refreshSafely() {
  try {
    return await refresh();
  } catch (error) {
    const reason = error instanceof Unavailable ? error.message : `unexpected error: ${error.message}`;
    console.warn(`[live] live matches switched off for this answer: ${reason}`);
    return { available: false, matches: [] };
  }
}

function currentAnswer() {
  if (answerCache && Date.now() - answerCache.at < ANSWER_TTL_MS) {
    return Promise.resolve(answerCache.answer);
  }
  if (!inFlight) {
    inFlight = refreshSafely()
      .then(answer => {
        answerCache = { answer, at: Date.now() };
        return answer;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// GET /api/live
export async function handleLive(req, res) {
  try {
    res.json(await currentAnswer());
  } catch (error) {
    console.error('[live] Unexpected error:', error);
    res.json({ available: false, matches: [] });
  }
}

// Exported for tests.
export { toEntry as mapFixture };

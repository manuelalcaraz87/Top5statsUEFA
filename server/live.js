// Live matches from API-Football (v3), served at GET /api/live.
//
// Only the six competitions in apiFootball.js are asked for. Each answer is cut
// down to plain text and numbers: logos, crests, flags, photos and anything else
// from the upstream answer are never passed on.

import {
  MINUTE_MS,
  HOUR_MS,
  LEAGUES,
  LEAGUE_IDS,
  PHASE_BY_STATUS,
  LIVE_PHASES,
  plainNumber,
  plainText,
  callApiFootball,
  Unavailable,
  rememberFixtureId,
} from './apiFootball.js';

const ANSWER_TTL_MS = 60 * 1000;            // one answer is shared for 60 seconds
const FINISHED_MEMORY_MS = 3 * HOUR_MS;     // finished matches are kept for 3 hours

// ── Turning one API-Football fixture into our match shape ─────────────────────
// Returns { id, match } or null when the fixture is not one of ours or has a
// status we do not show.
function toEntry(fixture) {
  const competition = LEAGUES.get(fixture?.league?.id);
  const phase = PHASE_BY_STATUS.get(fixture?.fixture?.status?.short);
  if (!competition || !phase) return null;

  const id = fixture.fixture.id;
  const date = new Date(fixture.fixture.date);
  return {
    id,
    match: {
      id,
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
    rememberFixtureId(entry.id);
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
  const liveFixtures = await callApiFootball('live list', 'fixtures', { live: LEAGUE_IDS.join('-') });
  sortFixtures(liveFixtures, liveNow, returnedIds);

  const now = Date.now();
  for (const [id, entry] of finishedMemory) if (now >= entry.until) finishedMemory.delete(id);

  const missing = previousLiveIds
    ? [...previousLiveIds].filter(id => !returnedIds.has(id) && !finishedMemory.has(id))
    : [];
  if (missing.length) {
    const fixtures = await callApiFootball('final status of matches that left the live list', 'fixtures', {
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

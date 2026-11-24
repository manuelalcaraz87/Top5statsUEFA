// Match details from API-Football (v3):
//   GET /api/fixtures-on?competition=<PL|PD|SA|BL1|FL1|CL>&date=YYYY-MM-DD
//   GET /api/match/<id>
//
// Only plain text and numbers are passed on. Anything else in the upstream
// answer (logos, crests, flags, photos) is dropped.

import {
  MINUTE_MS,
  HOUR_MS,
  SEASON,
  LEAGUES,
  LEAGUE_ID_BY_CODE,
  phaseOf,
  plainNumber,
  plainText,
  callApiFootball,
  Unavailable,
  rememberFixtureId,
  hasHandedOutFixtureId,
} from './apiFootball.js';

const FIXTURES_TTL_PAST_MS = 6 * HOUR_MS;      // dates before today (UTC)
const FIXTURES_TTL_TODAY_MS = 10 * MINUTE_MS;  // today and later
const MATCH_TTL_LIVE_MS = MINUTE_MS;           // live, or not yet finished
const MATCH_TTL_FINISHED_RECENT_MS = 10 * MINUTE_MS; // first 3 hours after finish
const MATCH_TTL_FINISHED_LATER_MS = 24 * HOUR_MS;
const FINISHED_RECENT_MS = 3 * HOUR_MS;

const COMPETITION_CODES = new Set(LEAGUES.values());

const inFlight = new Map();     // key -> Promise, so identical lookups share one call
const fixturesCache = new Map(); // "CODE|date" -> { answer, at }
const matchCache = new Map();    // fixture id -> { answer, at }
const finishedSince = new Map(); // fixture id -> time we first saw it finished

// Runs load() once for a key at a time; callers asking meanwhile share its answer.
function shared(key, load) {
  if (!inFlight.has(key)) inFlight.set(key, load().finally(() => inFlight.delete(key)));
  return inFlight.get(key);
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// A real calendar date written as YYYY-MM-DD.
function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toIsoOrNull(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// ── GET /api/fixtures-on ──────────────────────────────────────────────────────
async function loadFixtures(code, date) {
  const body = await callApiFootball(`fixtures of ${code} on ${date}`, 'fixtures', {
    league: String(LEAGUE_ID_BY_CODE.get(code)),
    season: String(SEASON),
    date,
    timezone: 'UTC',
  });

  const fixtures = [];
  for (const fixture of body) {
    const id = fixture?.fixture?.id;
    if (!Number.isSafeInteger(id)) continue;
    rememberFixtureId(id);
    fixtures.push({
      id,
      kickoff: toIsoOrNull(fixture.fixture.date),
      home: plainText(fixture.teams?.home?.name),
      away: plainText(fixture.teams?.away?.name),
      phase: phaseOf(fixture.fixture?.status?.short),
    });
  }
  return fixtures.sort((a, b) => (a.kickoff || '').localeCompare(b.kickoff || ''));
}

// GET /api/fixtures-on?competition=PL&date=2026-11-24
export async function handleFixturesOn(req, res) {
  const { competition, date } = req.query;
  if (!COMPETITION_CODES.has(competition) || !isCalendarDate(date)) {
    return res.status(400).json({ error: 'Use competition=<PL|PD|SA|BL1|FL1|CL> and date=YYYY-MM-DD' });
  }

  const key = `${competition}|${date}`;
  const ttl = date < todayUtc() ? FIXTURES_TTL_PAST_MS : FIXTURES_TTL_TODAY_MS;
  const cached = fixturesCache.get(key);
  if (cached && Date.now() - cached.at < ttl) return res.json(cached.answer);

  const answer = await shared(`fixtures:${key}`, async () => {
    try {
      const fixtures = await loadFixtures(competition, date);
      const answer = { available: true, fixtures };
      fixturesCache.set(key, { answer, at: Date.now() });
      return answer;
    } catch (error) {
      const reason = error instanceof Unavailable ? error.message : `unexpected error: ${error.message}`;
      console.warn(`[match] fixtures for ${key} switched off for this answer: ${reason}`);
      return { available: false };
    }
  });
  res.json(answer);
}

// ── GET /api/match/<id> ───────────────────────────────────────────────────────
const EVENT_KIND = new Map([
  ['Goal|Normal Goal', 'goal'],
  ['Goal|Penalty', 'penalty_goal'],
  ['Goal|Own Goal', 'own_goal'],
  ['Goal|Missed Penalty', 'missed_penalty'],
  ['Card|Red Card', 'red_card'],
  ['Card|Second Yellow card', 'red_card'],
]);

// Our event kind for an upstream event, or null when we do not show it.
function eventKind(event) {
  return EVENT_KIND.get(`${event?.type}|${event?.detail}`) ?? null;
}

// Team statistics come as text such as "72%" or "7"; returns a number or null.
function toStatNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && /^\d+(\.\d+)?%?$/.test(value.trim())) {
    return Number(value.replace('%', '').trim());
  }
  return null;
}

const STAT_NAMES = {
  possession: 'Ball Possession',
  shots: 'Total Shots',
  shotsOnTarget: 'Shots on Goal',
  corners: 'Corner Kicks',
  fouls: 'Fouls',
  saves: 'Goalkeeper Saves',
};

function statsFor(statistics, teamId) {
  const out = Object.fromEntries(Object.keys(STAT_NAMES).map(key => [key, null]));
  if (teamId === null || teamId === undefined) return out;
  const entry = (statistics || []).find(s => s?.team?.id === teamId);
  const values = new Map((entry?.statistics || []).map(s => [s?.type, s?.value]));
  for (const [key, name] of Object.entries(STAT_NAMES)) out[key] = toStatNumber(values.get(name));
  return out;
}

// Turns one upstream fixture (with events and statistics) into our answer.
function toMatchAnswer(fixture) {
  const homeId = fixture.teams?.home?.id ?? null;
  const awayId = fixture.teams?.away?.id ?? null;
  const sideOf = teamId => (teamId !== null && teamId === homeId ? 'home'
    : teamId !== null && teamId === awayId ? 'away' : null);

  const events = [];
  for (const event of fixture.events || []) {
    const kind = eventKind(event);
    const side = sideOf(event?.team?.id ?? null);
    if (!kind || !side) continue;
    events.push({
      minute: plainNumber(event.time?.elapsed),
      extraMinute: plainNumber(event.time?.extra),
      side,
      kind,
      player: plainText(event.player?.name),
    });
  }

  return {
    available: true,
    phase: phaseOf(fixture.fixture?.status?.short),
    minute: plainNumber(fixture.fixture?.status?.elapsed),
    extraMinute: plainNumber(fixture.fixture?.status?.extra),
    homeGoals: plainNumber(fixture.goals?.home),
    awayGoals: plainNumber(fixture.goals?.away),
    events,
    stats: {
      home: statsFor(fixture.statistics, homeId),
      away: statsFor(fixture.statistics, awayId),
    },
  };
}

async function loadMatch(id) {
  const body = await callApiFootball(`match ${id}`, 'fixtures', { id: String(id) });
  if (!body[0]) throw new Unavailable(`API-Football had no fixture ${id}`);
  return toMatchAnswer(body[0]);
}

// How long a match answer may be reused, based on its phase.
function matchTtl(id, answer) {
  if (answer.phase === 'finished') {
    const since = finishedSince.get(id) ?? Date.now();
    return Date.now() - since < FINISHED_RECENT_MS
      ? MATCH_TTL_FINISHED_RECENT_MS
      : MATCH_TTL_FINISHED_LATER_MS;
  }
  return MATCH_TTL_LIVE_MS;
}

// GET /api/match/<id>
export async function handleMatch(req, res) {
  const raw = req.params.id;
  const id = /^\d{1,12}$/.test(raw) ? Number(raw) : NaN;
  if (!hasHandedOutFixtureId(id)) return res.status(404).json({ error: 'Not found' });

  const cached = matchCache.get(id);
  if (cached && Date.now() - cached.at < matchTtl(id, cached.answer)) return res.json(cached.answer);

  const answer = await shared(`match:${id}`, async () => {
    try {
      const answer = await loadMatch(id);
      if (answer.phase === 'finished' && !finishedSince.has(id)) finishedSince.set(id, Date.now());
      matchCache.set(id, { answer, at: Date.now() });
      return answer;
    } catch (error) {
      const reason = error instanceof Unavailable ? error.message : `unexpected error: ${error.message}`;
      console.warn(`[match] match ${id} switched off for this answer: ${reason}`);
      return { available: false };
    }
  });
  res.json(answer);
}

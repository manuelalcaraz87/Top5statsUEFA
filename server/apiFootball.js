// Shared helpers for talking to API-Football (v3): the league and status
// tables, the daily call budget, the one function that makes upstream calls,
// and the list of fixture ids this server has handed out.
//
// Everything passed on from API-Football goes through plainText or plainNumber,
// so logos, crests, flags, photos and any other field are never forwarded.

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;

const AF_BASE = 'https://v3.football.api-sports.io';
const DEFAULT_DAILY_BUDGET = 3000;

// Season used for every API-Football request. The site uses the same value in
// src/app/services/season.ts (CURRENT_SEASON); keep the two in step.
export const SEASON = 2026;

// API-Football league id -> our competition code.
export const LEAGUES = new Map([
  [39, 'PL'],   // England, Premier League
  [140, 'PD'],  // Spain, La Liga
  [135, 'SA'],  // Italy, Serie A
  [78, 'BL1'],  // Germany, Bundesliga
  [61, 'FL1'],  // France, Ligue 1
  [2, 'CL'],    // UEFA Champions League
]);
export const LEAGUE_IDS = [...LEAGUES.keys()];
export const LEAGUE_ID_BY_CODE = new Map([...LEAGUES].map(([id, code]) => [code, id]));

// API-Football status short code -> our phase. Only matches that have started
// or finished appear here; the live list uses this table on its own.
export const PHASE_BY_STATUS = new Map([
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
export const LIVE_PHASES = new Set(['in_play', 'half_time', 'extra_time', 'extra_time_break', 'penalties']);

// Phase for a single match, including matches not yet played (listed by date
// and by id). Returns null for a status we do not know.
export function phaseOf(statusShort) {
  if (statusShort === 'NS' || statusShort === 'TBD') return 'not_started';
  return PHASE_BY_STATUS.get(statusShort) ?? null;
}

export function plainNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function plainText(value) {
  return typeof value === 'string' ? value : null;
}

// ── Daily budget ──────────────────────────────────────────────────────────────
// Counts every call to API-Football per UTC day. Read at call time, because
// dotenv loads the .env file after the modules are imported.
export function dailyBudget() {
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
// Thrown when API-Football cannot give an answer. Callers turn it into
// { available: false }.
export class Unavailable extends Error {}

// Makes one call to GET /{path} on API-Football and returns its list of results.
export async function callApiFootball(label, path, query) {
  if (!takeUpstreamCall()) {
    throw new Unavailable(`daily budget of ${dailyBudget()} calls used up for today (UTC)`);
  }
  console.log(`[af] API-Football call ${usage.count} of ${dailyBudget()} today (UTC): ${label}`);

  const response = await fetch(`${AF_BASE}/${path}?${new URLSearchParams(query)}`, {
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

// ── Fixture ids this server has handed out ────────────────────────────────────
// Only ids in this set may be looked up at /api/match/<id>. Every id is added
// when it goes out in an /api/live or /api/fixtures-on answer.
const handedOutIds = new Set();

export function rememberFixtureId(id) {
  handedOutIds.add(id);
}

export function hasHandedOutFixtureId(id) {
  return handedOutIds.has(id);
}

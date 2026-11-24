// Top5 Scores: loads the site's own scores file (/data/scores.json), keeps it in
// memory and, while the page is open, picks up a newer file by itself. This is the only place that knows the file's
// shape, how site ids map to the file's keys, and how club names are matched.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { normalizeTeamName } from './footballDataService';

// ── The file's shape ─────────────────────────────────────────────────────────

export type ScoreCategory = 'club' | 'striker' | 'creator' | 'defender' | 'goalkeeper';
export type ScoreList = 'overall' | 'england' | 'spain' | 'italy' | 'germany' | 'france' | 'champions-league';

/** One ingredient of a Top5 Score: its weight (% of the score) and its own 0-100 score. */
export interface Ingredient {
  key: string;
  label: string;
  weight: number;
  score: number;
}

/** A weight as shown on the site: "40%" when whole, otherwise one decimal, e.g. "12.5%". */
export function formatWeight(weight: number): string {
  const rounded = Math.round(weight * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

/**
 * What a club's, or a player's, latest match changed. Every field is optional
 * and the whole thing may be null or missing: older copies of the file have none.
 */
export interface ScoreChange {
  /** UTC ISO kick-off of the match this change belongs to. */
  matchKickoff?: string;
  opponent?: string;
  /** True when the entry's own club was at home in that match. */
  home?: boolean;
  goalsFor?: number;
  goalsAgainst?: number;
  /** Rank in the same list before that match; null when not ranked then. */
  rankBefore?: number | null;
  scoreBefore?: number | null;
  /** Players only: false when he did not play. */
  played?: boolean;
  /** Players only: his numbers in that match (also holds minutesPlayed); null when he did not play. */
  matchStats?: Record<string, number | null> | null;
}

export interface ScoreEntry {
  rank: number;
  name: string;
  club: string;
  /** Full competition name as written in the file, e.g. "Premier League". */
  competition: string;
  score: number;
  opponentsFaced: 'Easy' | 'Average' | 'Hard' | string;
  stats: Record<string, string | number | null>;
  /** What the score is made of. Missing in older copies of the file. */
  ingredients?: Ingredient[];
  /** Clubs in the "overall" list only: Champions League points added or removed; null when none. */
  championsLeagueAdjustment?: number | null;
  /** Current streak badges. Missing in older copies of the file. */
  /** Clubs only: last results, oldest first, most recent last. Missing in older copies of the file. */
  form?: ('W' | 'D' | 'L')[];
  badges?: { key: string; count: number; label: string; detail: string }[];
  /** What the latest match changed. Missing or null when the file has none. */
  change?: ScoreChange | null;
}

/** One club's best player in a category, as listed in the file's optional clubLeaders. */
export interface ClubLeader {
  name: string;
  score: number;
  /** Rank in the view's published list (e.g. 12 = 12th in La Liga). */
  rank: number;
  opponentsFaced: 'Easy' | 'Average' | 'Hard' | string;
  stats: Record<string, string | number | null>;
  /** What the latest match changed for this player. Missing or null when the file has none. */
  change?: ScoreChange | null;
  /** The club's best player in this category before that match; null when it is the same player. */
  previousLeader?: string | null;
}

/** A club's best striker, creator, defender and goalkeeper; null where the file has none. */
export interface ClubLeaders {
  striker: ClubLeader | null;
  creator: ClubLeader | null;
  defender: ClubLeader | null;
  goalkeeper: ClubLeader | null;
}

export interface ScoresFile {
  generatedAt: string;
  /** UTC ISO time of the kick-off of the latest match included. Missing in older copies of the file. */
  matchesThrough?: string;
  season: string;
  categories: Record<ScoreCategory, Partial<Record<ScoreList, ScoreEntry[]>>>;
  /** Each club's best players, per view, then by club name. Missing in older copies of the file. */
  clubLeaders?: Partial<Record<ScoreList, Record<string, ClubLeaders>>>;
}

// ── Site ids -> the file's keys (the one place this mapping lives) ───────────

/** Site tab id -> category key in the file. */
export const FILE_CATEGORY: Record<string, ScoreCategory> = {
  clubs: 'club',
  strikers: 'striker',
  creators: 'creator',
  defenders: 'defender',
  goalkeepers: 'goalkeeper',
};

/** Site league id -> list key in the file. No league (home page) = "overall". */
export function listForLeague(leagueId?: string): ScoreList {
  const lists: Record<string, ScoreList> = {
    'epl': 'england',
    'la-liga': 'spain',
    'serie-a': 'italy',
    'bundesliga': 'germany',
    'ligue-1': 'france',
    'ucl': 'champions-league',
  };
  return (leagueId && lists[leagueId]) || 'overall';
}

/** The five domestic lists together cover every club in the five leagues. */
export const DOMESTIC_LISTS: ScoreList[] = ['england', 'spain', 'italy', 'germany', 'france'];

/** Competition name in the file -> the short name the site's league chip uses. */
export function chipForCompetition(competition: string): string {
  return competition;
}

// ── Loading, and picking up new files while the page stays open ─────────────

const SCORES_URL = import.meta.env.DEV
  ? 'https://top5stats.com/data/scores.json'
  : '/data/scores.json';

const CHECK_EVERY_MS = 10 * 60_000;      // normal: look for a new file at most this often
const FAST_CHECK_EVERY_MS = 5 * 60_000;  // while a finished match is waiting to be included
const TICK_MS = 30_000;                  // how often the timer asks "is a check due?"

let loaded: ScoresFile | null = null;
let inFlight: Promise<ScoresFile> | null = null;
let lastCheckAt = 0;
let refreshing = false;
let fastRequests = 0;
let subscribers = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function isScoresFile(file: unknown): file is ScoresFile {
  return !!file && typeof file === 'object' && !!(file as ScoresFile).categories;
}

export function loadScores(): Promise<ScoresFile> {
  if (loaded) return Promise.resolve(loaded);
  if (!inFlight) {
    lastCheckAt = Date.now();
    inFlight = fetch(SCORES_URL)
      .then(res => {
        if (!res.ok) throw new Error(`scores.json: ${res.status} ${res.statusText}`);
        return res.json() as Promise<ScoresFile>;
      })
      .then(file => {
        if (!isScoresFile(file)) throw new Error('scores.json: unexpected shape');
        loaded = file;
        listeners.forEach(l => l());
        return file;
      })
      .finally(() => { inFlight = null; }); // a failure is not remembered: the next visit to a page retries
  }
  return inFlight;
}

/** Asks the server for the file again, skipping the browser's saved copy. A failure keeps the current file. */
async function recheckScores(): Promise<void> {
  if (!loaded || refreshing) return;
  refreshing = true;
  lastCheckAt = Date.now();
  try {
    const res = await fetch(SCORES_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const file: unknown = await res.json();
    if (!isScoresFile(file) || file.generatedAt === loaded?.generatedAt) return;
    loaded = file;
    listeners.forEach(l => l());
  } catch {
    // Silent: the file already on the page stays.
  } finally {
    refreshing = false;
  }
}

function checkIfDue() {
  if (!loaded || document.hidden) return;
  const every = fastRequests > 0 ? FAST_CHECK_EVERY_MS : CHECK_EVERY_MS;
  if (Date.now() - lastCheckAt >= every) void recheckScores();
}

function startChecking() {
  timer = setInterval(checkIfDue, TICK_MS);
  document.addEventListener('visibilitychange', checkIfDue);
}

function stopChecking() {
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener('visibilitychange', checkIfDue);
}

/** Called by React for every part of the page that shows scores; the checks only run while at least one exists. */
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (++subscribers === 1) startChecking();
  return () => {
    listeners.delete(listener);
    if (--subscribers === 0) stopChecking();
  };
}

/** The file if it has already been loaded, otherwise null. */
export function getLoadedScores(): ScoresFile | null {
  return loaded;
}

/** Kick-off of the latest match included in the scores, or null when the file doesn't say. */
export function getMatchesThrough(): Date | null {
  return matchesThroughOf(loaded);
}

/** Same as getMatchesThrough, for a file you already hold. */
export function matchesThroughOf(file: ScoresFile | null): Date | null {
  const raw = file?.matchesThrough;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Re-check every 5 minutes (instead of 10) while `active` is true. */
export function useFastScoresChecks(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    fastRequests++;
    return () => { fastRequests--; };
  }, [active]);
}

export function useScores(): { scores: ScoresFile | null; loading: boolean } {
  // Re-renders whenever a new file replaces the loaded one.
  const scores = useSyncExternalStore(subscribe, getLoadedScores);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (loaded) return;
    loadScores().catch(e => {
      console.warn('[scores] could not load scores.json:', e);
      setFailed(true);
    });
  }, []);

  return { scores, loading: !scores && !failed };
}

export function scoreList(scores: ScoresFile | null, category: ScoreCategory, list: ScoreList): ScoreEntry[] {
  return scores?.categories?.[category]?.[list] ?? [];
}

// ── Matching club names between football-data.org and the scores file ────────
// The two sources spell clubs differently ("Man City" / "Manchester City",
// "PSG" / "Paris Saint Germain", "Bayern Munich" / "Bayern München").
// Names are simplified (no accents, punctuation or words like "FC"), then
// known alternative spellings are folded together. Nothing is guessed beyond
// that: a club with no match simply gets no score.

const NOISE = new Set([
  'fc', 'cf', 'afc', 'sc', 'sv', 'vfb', 'vfl', 'fsv', 'tsg', 'ac', 'acf', 'as', 'ss', 'ssc', 'us', 'ud', 'rcd', 'ca',
  'rc', 'ogc', 'losc', 'hsc', 'aj', 'sco', 'bc', 'cfc', 'calcio', 'de', 'ev', '1',
]);

// Alternative spelling (already simplified) -> the spelling used as the key.
const ALIASES: Record<string, string> = {
  'man city': 'manchester city',
  'man united': 'manchester united',
  'man utd': 'manchester united',
  'nottm forest': 'nottingham forest',
  'tottenham hotspur': 'tottenham',
  'wolverhampton wanderers': 'wolves',
  'brighton and hove albion': 'brighton',
  'newcastle united': 'newcastle',
  'west ham united': 'west ham',
  'leeds united': 'leeds',
  'leicester city': 'leicester',
  'ipswich town': 'ipswich',
  'coventry city': 'coventry',
  'hull city': 'hull',
  'inter milan': 'inter',
  'internazionale': 'inter',
  'internazionale milano': 'inter',
  'hellas verona': 'verona',
  'psg': 'paris saint germain',
  'bayern munich': 'bayern munchen',
  'borussia dortmund': 'dortmund',
  'bayer leverkusen': 'leverkusen',
  'borussia monchengladbach': 'gladbach',
  'eintracht frankfurt': 'frankfurt',
  'cologne': 'koln',
  'hamburger': 'hamburg',
  'atletico de madrid': 'atletico madrid',
  'club atletico madrid': 'atletico madrid',
  'athletic bilbao': 'athletic club',
  'real betis': 'betis',
  'real betis balompie': 'betis',
  'rc celta vigo': 'celta vigo',
  'celta': 'celta vigo',
  'deportivo alaves': 'alaves',
  'rayo vallecano': 'rayo',
  'deportivo la coruna': 'la coruna',
  'real sociedad futbol': 'real sociedad',
  'espanyol barcelona': 'espanyol',
  'olympique marseille': 'marseille',
  'olympique lyonnais': 'lyon',
  'stade rennais': 'rennes',
  'stade brestois': 'brest',
  'rc strasbourg alsace': 'strasbourg',
  'estac troyes': 'troyes',
  'es troyes': 'troyes',
  'real racing club santander': 'racing santander',
  'racing club santander': 'racing santander',

  // Explicit aliases for names that cannot be matched by rule. Each line folds
  // one spelling onto the other so football-data.org's and scores.json's
  // spellings end up with the same key (the comment shows both spellings).
  'deportivo': 'la coruna',                  // Deportivo         = Deportivo La Coruna
  'santander': 'racing santander',           // Santander         = Racing Santander
  'hsv': 'hamburg',                          // HSV               = Hamburger SV
  'club brugge kv': 'club brugge',           // Club Brugge KV    = Club Brugge
  'lask linz': 'lask',                       // Lask Linz         = LASK
  'shaktar': 'shakhtar donetsk',             // Shaktar           = Shakhtar Donetsk
  'psv': 'psv eindhoven',                    // PSV               = PSV Eindhoven
  'bod glimt': 'bodo glimt',                 // Bodø/Glimt        = Bodo/Glimt (ø is not an accent)
  'aek athens': 'pae aek',                   // AEK Athens FC     = PAE AEK
  'sabah fa': 'sabah fk',                    // Sabah FA          = Sabah FK
  'slovan bratislava': 'sl bratislava',      // Slovan Bratislava = Sl. Bratislava
};

function simplify(name: string): string {
  const plain = name
    .normalize('NFD').replace(/\p{M}/gu, '') // accents: ü -> u
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9 ]+/g, ' ');
  const words = plain.split(/\s+/).filter(Boolean).filter(w => !NOISE.has(w) && !/^\d{2,4}$/.test(w));
  const simple = words.join(' ');
  return ALIASES[simple] ?? simple;
}

/** Comparable keys for a club name: as written, and after the site's own name tidy-up. */
function clubKeys(name: string): string[] {
  return [...new Set([simplify(name), simplify(normalizeTeamName(name))].filter(Boolean))];
}

/** Club entries from the chosen lists, searchable by any spelling of the name. */
export function clubScoreIndex(scores: ScoresFile | null, lists: ScoreList[]): Map<string, ScoreEntry> {
  const index = new Map<string, ScoreEntry>();
  for (const list of lists) {
    for (const entry of scoreList(scores, 'club', list)) {
      for (const key of clubKeys(entry.name)) if (!index.has(key)) index.set(key, entry);
    }
  }
  return index;
}

/** The score entry for a club name from football-data.org, or undefined. */
export function findClubScore(index: Map<string, ScoreEntry>, name: string): ScoreEntry | undefined {
  for (const key of clubKeys(name)) {
    const hit = index.get(key);
    if (hit) return hit;
  }
  return undefined;
}

/** True when two club names (from any source) are the same club, using the same matching as club scores. */
export function sameClubName(a: string, b: string): boolean {
  const keys = clubKeys(a);
  return clubKeys(b).some(k => keys.includes(k));
}

/** The value stored under a club's name in a record keyed by club name, found by any spelling, or undefined. */
export function findByClubName<T>(byClub: Record<string, T> | undefined, name: string): T | undefined {
  if (!byClub) return undefined;
  for (const [key, value] of Object.entries(byClub)) {
    if (sameClubName(key, name)) return value;
  }
  return undefined;
}

// ── What a club's latest match changed (ranks) ──────────────────────────────

/** Which list of the file a top-5 entry came from, read from the entry's key (null when it can't be told). */
export function listFromEntryKey(key: string): ScoreList | null {
  const leagueIds = ['epl', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1', 'ucl'];
  const lists: ScoreList[] = ['overall', 'england', 'spain', 'italy', 'germany', 'france', 'champions-league'];
  for (const list of lists) if (key.startsWith(`${list}-`)) return list;
  for (const id of leagueIds) if (key.startsWith(`${id}-`)) return listForLeague(id);
  return null;
}

/** The file's own entry for a row shown on the site, found by name (and club, for players). */
export function findFileEntry(
  scores: ScoresFile | null, category: ScoreCategory, list: ScoreList, name: string, club: string,
): ScoreEntry | undefined {
  const entries = scoreList(scores, category, list);
  if (category === 'club') return entries.find(e => sameClubName(e.name, name));
  return entries.find(e => e.name === name && sameClubName(e.club, club));
}

/** What the rank marker needs: how far a row moved and the sentence that explains it. */
export interface RankMove {
  /** Places moved up (positive) or down (negative); null when it was not ranked before. */
  places: number | null;
  /** E.g. "Was 8th before Arsenal v Newcastle on 24 Nov". */
  sentence: string;
}

function ordinalOf(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  const suffix = ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/** The marker for a rank, or null when nothing should be shown (no change info, or the rank did not move). */
export function rankMove(entry: ScoreEntry | undefined, club: string): RankMove | null {
  const change = entry?.change;
  if (!entry || !change) return null;
  const before = change.rankBefore;
  if (before === undefined) return null;
  if (before === entry.rank) return null;

  let match = 'the latest match';
  if (change.opponent) {
    const home = change.home === false ? change.opponent : club;
    const away = change.home === false ? club : change.opponent;
    match = `${home} v ${away}`;
    const kickoff = change.matchKickoff ? new Date(change.matchKickoff) : null;
    if (kickoff && !Number.isNaN(kickoff.getTime())) {
      match += ` on ${kickoff.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    }
  }
  return before === null
    ? { places: null, sentence: `Not ranked before ${match}` }
    : { places: before - entry.rank, sentence: `Was ${ordinalOf(before)} before ${match}` };
}

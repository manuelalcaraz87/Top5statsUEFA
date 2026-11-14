// Top5 Scores: loads the site's own scores file (/data/scores.json) once per
// visit and keeps it in memory. This is the only place that knows the file's
// shape, how site ids map to the file's keys, and how club names are matched.
import { useEffect, useState } from 'react';
import { normalizeTeamName } from './footballDataService';

// ── The file's shape ─────────────────────────────────────────────────────────

export type ScoreCategory = 'club' | 'striker' | 'creator' | 'defender' | 'goalkeeper';
export type ScoreList = 'overall' | 'england' | 'spain' | 'italy' | 'germany' | 'france' | 'champions-league';

export interface ScoreEntry {
  rank: number;
  name: string;
  club: string;
  /** Full competition name as written in the file, e.g. "Premier League". */
  competition: string;
  score: number;
  opponentsFaced: 'Easy' | 'Average' | 'Hard' | string;
  stats: Record<string, string | number | null>;
}

export interface ScoresFile {
  generatedAt: string;
  season: string;
  categories: Record<ScoreCategory, Partial<Record<ScoreList, ScoreEntry[]>>>;
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
  return competition === 'Premier League' ? 'EPL' : competition;
}

// ── Loading (once per visit) ─────────────────────────────────────────────────

const SCORES_URL = import.meta.env.DEV
  ? 'https://top5stats.com/data/scores.json'
  : '/data/scores.json';

let loaded: ScoresFile | null = null;
let inFlight: Promise<ScoresFile> | null = null;

export function loadScores(): Promise<ScoresFile> {
  if (loaded) return Promise.resolve(loaded);
  if (!inFlight) {
    inFlight = fetch(SCORES_URL)
      .then(res => {
        if (!res.ok) throw new Error(`scores.json: ${res.status} ${res.statusText}`);
        return res.json() as Promise<ScoresFile>;
      })
      .then(file => {
        if (!file || typeof file !== 'object' || !file.categories) throw new Error('scores.json: unexpected shape');
        loaded = file;
        return file;
      })
      .finally(() => { inFlight = null; }); // a failure is not remembered: the next visit to a page retries
  }
  return inFlight;
}

/** The file if it has already been loaded, otherwise null. */
export function getLoadedScores(): ScoresFile | null {
  return loaded;
}

export function useScores(): { scores: ScoresFile | null; loading: boolean } {
  const [scores, setScores] = useState<ScoresFile | null>(loaded);
  const [loading, setLoading] = useState(!loaded);

  useEffect(() => {
    if (loaded) return;
    let cancelled = false;
    loadScores()
      .then(file => { if (!cancelled) setScores(file); })
      .catch(e => console.warn('[scores] could not load scores.json:', e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { scores, loading };
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

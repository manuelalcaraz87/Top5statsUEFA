// League ids and names, plus the shapes of the live data shown on the site.
// There is deliberately no sample data here: everything shown comes from
// football-data.org or API-Football, or the page shows "No current data".

export type FormResult = 'W' | 'D' | 'L';
export type Zone = 'title' | 'ucl' | 'europa' | 'conference' | 'relegation' | 'r16' | 'playoffs';

export interface League {
  id: string;
  name: string;
}

export const LEAGUES: League[] = [
  { id: 'la-liga',    name: 'La Liga' },
  { id: 'epl',        name: 'EPL' },
  { id: 'serie-a',    name: 'Serie A' },
  { id: 'bundesliga', name: 'Bundesliga' },
  { id: 'ligue-1',    name: 'Ligue 1' },
  { id: 'ucl',        name: 'UCL' },
];

export interface Standing {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: FormResult[];
  zone?: Zone;
}

export interface Player {
  rank: number;
  name: string;
  team: string;
  goals: number;
  assists: number;
}

/** Totals derived from the live standings table. */
export interface LeagueStats {
  totalGoals: number;
  goalsPerGame: number;
  matchesPlayed: number;
}

export interface LeagueData {
  currentMatchday: number | null;
  stats: LeagueStats | null;
  standings: Standing[];
  topScorers: Player[];
  topAssisters: Player[];
}

export const EMPTY_LEAGUE_DATA: LeagueData = {
  currentMatchday: null,
  stats: null,
  standings: [],
  topScorers: [],
  topAssisters: [],
};

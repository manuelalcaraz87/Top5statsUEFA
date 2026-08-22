export type FormResult = 'W' | 'D' | 'L';
export type Zone = 'title' | 'ucl' | 'europa' | 'conference' | 'relegation' | 'r16' | 'playoffs';

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

export interface LeagueMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  status: 'live' | 'finished' | 'upcoming';
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  time?: string;
}

export interface LeagueStats {
  totalGoals: number;
  goalsPerGame: number;
  matchesPlayed: number;
  homeWinPct: number;
  topVenue: string;
}

export interface LeagueData {
  stadiumImage: string;
  stadiumName: string;
  totalClubs: number;
  currentMatchday: number;
  totalMatchdays: number;
  stats: LeagueStats;
  standings: Standing[];
  topScorers: Player[];
  topAssisters: Player[];
  topDefenders: Player[];
  topKeepers: Player[];
  matches: LeagueMatch[];
}

export const LEAGUE_DATA: Record<string, LeagueData> = {
  'la-liga': {
    stadiumImage: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?w=1400&q=80&fit=crop&auto=format',
    stadiumName: 'Santiago Bernabéu',
    totalClubs: 20,
    currentMatchday: 17,
    totalMatchdays: 38,
    stats: { totalGoals: 364, goalsPerGame: 2.71, matchesPlayed: 134, homeWinPct: 44, topVenue: 'Bernabéu' },
    standings: [
      { position: 1, team: 'Real Madrid',     played: 17, won: 14, drawn: 3, lost: 0, gf: 38, ga: 12, gd: 26, points: 45, form: ['W','W','D','W','W'], zone: 'title' },
      { position: 2, team: 'Barcelona',        played: 17, won: 12, drawn: 2, lost: 3, gf: 35, ga: 18, gd: 17, points: 38, form: ['W','L','W','W','D'], zone: 'ucl' },
      { position: 3, team: 'Atletico Madrid',  played: 17, won: 11, drawn: 3, lost: 3, gf: 29, ga: 16, gd: 13, points: 36, form: ['W','W','D','L','W'], zone: 'ucl' },
      { position: 4, team: 'Villarreal',       played: 17, won: 9,  drawn: 4, lost: 4, gf: 25, ga: 20, gd: 5,  points: 31, form: ['D','W','W','L','W'], zone: 'ucl' },
      { position: 5, team: 'Real Sociedad',    played: 17, won: 8,  drawn: 4, lost: 5, gf: 22, ga: 19, gd: 3,  points: 28, form: ['L','W','D','W','L'], zone: 'europa' },
      { position: 6, team: 'Betis',            played: 17, won: 7,  drawn: 5, lost: 5, gf: 20, ga: 20, gd: 0,  points: 26, form: ['D','D','W','L','W'], zone: 'conference' },
      { position: 7, team: 'Sevilla',          played: 17, won: 6,  drawn: 4, lost: 7, gf: 18, ga: 22, gd: -4, points: 22, form: ['L','W','L','D','W'] },
      { position: 8, team: 'Valencia',         played: 17, won: 4,  drawn: 5, lost: 8, gf: 15, ga: 26, gd: -11,points: 17, form: ['L','L','D','W','L'], zone: 'relegation' },
    ],
    topScorers: [
      { rank: 1, name: 'Kylian Mbappé',       team: 'Real Madrid',     goals: 18, assists: 7 },
      { rank: 2, name: 'Robert Lewandowski',  team: 'Barcelona',       goals: 16, assists: 5 },
      { rank: 3, name: 'Antoine Griezmann',   team: 'Atletico Madrid', goals: 13, assists: 8 },
      { rank: 4, name: 'Alexander Sørloth',   team: 'Villarreal',      goals: 11, assists: 3 },
      { rank: 5, name: 'Mikel Oyarzabal',     team: 'Real Sociedad',   goals: 10, assists: 4 },
    ],
    topAssisters: [
      { rank: 1, name: 'Vinícius Jr',         team: 'Real Madrid',     goals: 9,  assists: 12 },
      { rank: 2, name: 'Pedri',               team: 'Barcelona',       goals: 5,  assists: 10 },
      { rank: 3, name: 'Antoine Griezmann',   team: 'Atletico Madrid', goals: 13, assists: 8 },
      { rank: 4, name: 'Kylian Mbappé',       team: 'Real Madrid',     goals: 18, assists: 7 },
      { rank: 5, name: 'Isco',                team: 'Betis',           goals: 4,  assists: 7 },
    ],
    topDefenders: [
      { rank: 1, name: 'Antonio Rüdiger',    team: 'Real Madrid',     goals: 95, assists: 9 },
      { rank: 2, name: 'Jules Koundé',       team: 'Barcelona',       goals: 93, assists: 8 },
      { rank: 3, name: 'José Giménez',       team: 'Atletico Madrid', goals: 91, assists: 7 },
      { rank: 4, name: 'Pau Torres',         team: 'Villarreal',      goals: 89, assists: 6 },
      { rank: 5, name: 'Robin Le Normand',   team: 'Atletico Madrid', goals: 87, assists: 5 },
    ],
    topKeepers: [
      { rank: 1, name: 'Thibaut Courtois',   team: 'Real Madrid',     goals: 11, assists: 91 },
      { rank: 2, name: 'Ter Stegen',         team: 'Barcelona',       goals: 9,  assists: 88 },
      { rank: 3, name: 'Jan Oblak',          team: 'Atletico Madrid', goals: 8,  assists: 87 },
      { rank: 4, name: 'Giorgi Mamardashvili',team: 'Valencia',       goals: 7,  assists: 85 },
      { rank: 5, name: 'Álex Remiro',        team: 'Real Sociedad',   goals: 6,  assists: 84 },
    ],
    matches: [
      { id: 1,  homeTeam: 'Real Madrid',     awayTeam: 'Barcelona',     status: 'live',     homeScore: 2, awayScore: 1, minute: 67 },
      { id: 2,  homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla',       status: 'finished', homeScore: 2, awayScore: 0 },
      { id: 3,  homeTeam: 'Valencia',        awayTeam: 'Real Sociedad', status: 'upcoming', time: '18:30' },
      { id: 4,  homeTeam: 'Betis',           awayTeam: 'Villarreal',    status: 'live',     homeScore: 1, awayScore: 1, minute: 55 },
    ],
  },

  'epl': {
    stadiumImage: 'https://images.unsplash.com/photo-1623793478409-50c0c0478d26?w=1400&q=80&fit=crop&auto=format',
    stadiumName: 'Anfield',
    totalClubs: 20,
    currentMatchday: 19,
    totalMatchdays: 38,
    stats: { totalGoals: 398, goalsPerGame: 2.62, matchesPlayed: 152, homeWinPct: 43, topVenue: 'Anfield' },
    standings: [
      { position: 1, team: 'Liverpool',    played: 19, won: 15, drawn: 2, lost: 2, gf: 44, ga: 18, gd: 26, points: 47, form: ['W','W','W','D','W'], zone: 'title' },
      { position: 2, team: 'Arsenal',      played: 19, won: 14, drawn: 2, lost: 3, gf: 40, ga: 20, gd: 20, points: 44, form: ['W','W','D','W','L'], zone: 'ucl' },
      { position: 3, team: 'Man City',     played: 19, won: 13, drawn: 3, lost: 3, gf: 42, ga: 22, gd: 20, points: 42, form: ['W','D','W','W','D'], zone: 'ucl' },
      { position: 4, team: 'Chelsea',      played: 19, won: 11, drawn: 5, lost: 3, gf: 36, ga: 22, gd: 14, points: 38, form: ['D','W','W','L','W'], zone: 'ucl' },
      { position: 5, team: 'Aston Villa',  played: 19, won: 10, drawn: 5, lost: 4, gf: 33, ga: 24, gd: 9,  points: 35, form: ['W','L','W','D','W'], zone: 'europa' },
      { position: 6, team: 'Tottenham',    played: 19, won: 9,  drawn: 6, lost: 4, gf: 30, ga: 26, gd: 4,  points: 33, form: ['D','W','D','W','L'], zone: 'conference' },
      { position: 7, team: 'Man United',   played: 19, won: 8,  drawn: 6, lost: 5, gf: 28, ga: 28, gd: 0,  points: 30, form: ['L','D','W','D','W'] },
      { position: 8, team: 'Newcastle',    played: 19, won: 7,  drawn: 7, lost: 5, gf: 26, ga: 24, gd: 2,  points: 28, form: ['D','W','L','D','W'] },
    ],
    topScorers: [
      { rank: 1, name: 'Erling Haaland',    team: 'Man City',    goals: 22, assists: 5 },
      { rank: 2, name: 'Alexander Isak',    team: 'Newcastle',   goals: 17, assists: 4 },
      { rank: 3, name: 'Dominic Solanke',   team: 'Tottenham',   goals: 16, assists: 5 },
      { rank: 4, name: 'Ollie Watkins',     team: 'Aston Villa', goals: 15, assists: 7 },
      { rank: 5, name: 'Gabriel Magalhães', team: 'Arsenal',     goals: 12, assists: 1 },
    ],
    topAssisters: [
      { rank: 1, name: 'Kevin De Bruyne',   team: 'Man City',    goals: 8,  assists: 14 },
      { rank: 2, name: 'Bukayo Saka',       team: 'Arsenal',     goals: 10, assists: 12 },
      { rank: 3, name: 'Mohamed Salah',     team: 'Liverpool',   goals: 12, assists: 11 },
      { rank: 4, name: 'Ollie Watkins',     team: 'Aston Villa', goals: 15, assists: 7 },
      { rank: 5, name: 'Son Heung-min',     team: 'Tottenham',   goals: 9,  assists: 9 },
    ],
    topDefenders: [
      { rank: 1, name: 'Rúben Dias',         team: 'Man City',    goals: 95, assists: 11 },
      { rank: 2, name: 'Virgil van Dijk',    team: 'Liverpool',   goals: 93, assists: 9 },
      { rank: 3, name: 'William Saliba',     team: 'Arsenal',     goals: 92, assists: 10 },
      { rank: 4, name: 'Levi Colwill',       team: 'Chelsea',     goals: 89, assists: 8 },
      { rank: 5, name: 'Pau Torres',         team: 'Aston Villa', goals: 87, assists: 7 },
    ],
    topKeepers: [
      { rank: 1, name: 'Ederson',            team: 'Man City',    goals: 11, assists: 92 },
      { rank: 2, name: 'Alisson',            team: 'Liverpool',   goals: 10, assists: 90 },
      { rank: 3, name: 'David Raya',         team: 'Arsenal',     goals: 9,  assists: 88 },
      { rank: 4, name: 'Emiliano Martínez',  team: 'Aston Villa', goals: 9,  assists: 87 },
      { rank: 5, name: 'Robert Sánchez',     team: 'Chelsea',     goals: 7,  assists: 85 },
    ],
    matches: [
      { id: 5,  homeTeam: 'Man City',   awayTeam: 'Arsenal',     status: 'live',     homeScore: 1, awayScore: 1, minute: 45 },
      { id: 6,  homeTeam: 'Liverpool',  awayTeam: 'Chelsea',     status: 'upcoming', time: '17:30' },
      { id: 7,  homeTeam: 'Tottenham',  awayTeam: 'Man United',  status: 'finished', homeScore: 2, awayScore: 0 },
      { id: 8,  homeTeam: 'Newcastle',  awayTeam: 'Aston Villa', status: 'upcoming', time: '15:00' },
    ],
  },

  'serie-a': {
    stadiumImage: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1400&q=80&fit=crop&auto=format',
    stadiumName: 'San Siro',
    totalClubs: 20,
    currentMatchday: 17,
    totalMatchdays: 38,
    stats: { totalGoals: 342, goalsPerGame: 2.53, matchesPlayed: 135, homeWinPct: 42, topVenue: 'San Siro' },
    standings: [
      { position: 1, team: 'Napoli',      played: 17, won: 13, drawn: 3, lost: 1, gf: 36, ga: 14, gd: 22, points: 42, form: ['W','W','W','D','W'], zone: 'title' },
      { position: 2, team: 'Inter Milan', played: 17, won: 13, drawn: 2, lost: 2, gf: 38, ga: 16, gd: 22, points: 41, form: ['W','D','W','W','W'], zone: 'ucl' },
      { position: 3, team: 'Lazio',       played: 17, won: 12, drawn: 2, lost: 3, gf: 33, ga: 18, gd: 15, points: 38, form: ['W','W','D','L','W'], zone: 'ucl' },
      { position: 4, team: 'Juventus',    played: 17, won: 11, drawn: 4, lost: 2, gf: 28, ga: 15, gd: 13, points: 37, form: ['D','W','W','D','W'], zone: 'ucl' },
      { position: 5, team: 'AC Milan',    played: 17, won: 11, drawn: 3, lost: 3, gf: 30, ga: 18, gd: 12, points: 36, form: ['W','L','W','W','D'], zone: 'europa' },
      { position: 6, team: 'Atalanta',    played: 17, won: 10, drawn: 4, lost: 3, gf: 35, ga: 20, gd: 15, points: 34, form: ['W','W','L','D','W'], zone: 'conference' },
      { position: 7, team: 'Roma',        played: 17, won: 9,  drawn: 3, lost: 5, gf: 26, ga: 22, gd: 4,  points: 30, form: ['W','L','W','L','W'] },
      { position: 8, team: 'Fiorentina',  played: 17, won: 8,  drawn: 5, lost: 4, gf: 24, ga: 22, gd: 2,  points: 29, form: ['D','W','D','W','L'] },
    ],
    topScorers: [
      { rank: 1, name: 'Mateo Retegui',     team: 'Atalanta',   goals: 19, assists: 3 },
      { rank: 2, name: 'Romelu Lukaku',     team: 'Napoli',     goals: 15, assists: 5 },
      { rank: 3, name: 'Lautaro Martínez',  team: 'Inter Milan',goals: 14, assists: 6 },
      { rank: 4, name: 'Marcus Thuram',     team: 'Inter Milan',goals: 13, assists: 7 },
      { rank: 5, name: 'Rafael Leão',       team: 'AC Milan',   goals: 11, assists: 8 },
    ],
    topAssisters: [
      { rank: 1, name: 'Marcus Thuram',     team: 'Inter Milan',goals: 13, assists: 7 },
      { rank: 2, name: 'Rafael Leão',       team: 'AC Milan',   goals: 11, assists: 8 },
      { rank: 3, name: 'Ademola Lookman',   team: 'Atalanta',   goals: 10, assists: 6 },
      { rank: 4, name: 'Paulo Dybala',      team: 'Roma',       goals: 8,  assists: 6 },
      { rank: 5, name: 'Ciro Immobile',     team: 'Lazio',      goals: 9,  assists: 5 },
    ],
    topDefenders: [
      { rank: 1, name: 'Alessandro Bastoni',  team: 'Inter Milan', goals: 94, assists: 10 },
      { rank: 2, name: 'Theo Hernández',      team: 'AC Milan',    goals: 92, assists: 8 },
      { rank: 3, name: 'Gleison Bremer',      team: 'Juventus',    goals: 90, assists: 9 },
      { rank: 4, name: 'Berat Djimsiti',      team: 'Atalanta',    goals: 88, assists: 7 },
      { rank: 5, name: 'Mario Rui',           team: 'Napoli',      goals: 85, assists: 6 },
    ],
    topKeepers: [
      { rank: 1, name: 'Yann Sommer',         team: 'Inter Milan', goals: 10, assists: 91 },
      { rank: 2, name: 'Mike Maignan',        team: 'AC Milan',    goals: 9,  assists: 89 },
      { rank: 3, name: 'Guglielmo Vicario',   team: 'Napoli',      goals: 8,  assists: 88 },
      { rank: 4, name: 'Juan Musso',          team: 'Atalanta',    goals: 7,  assists: 86 },
      { rank: 5, name: 'Michele Di Gregorio', team: 'Juventus',    goals: 7,  assists: 85 },
    ],
    matches: [
      { id: 9,  homeTeam: 'Inter Milan', awayTeam: 'AC Milan',   status: 'upcoming', time: '19:45' },
      { id: 10, homeTeam: 'Juventus',    awayTeam: 'Napoli',     status: 'live',     homeScore: 1, awayScore: 1, minute: 82 },
      { id: 11, homeTeam: 'Roma',        awayTeam: 'Lazio',      status: 'finished', homeScore: 2, awayScore: 1 },
      { id: 12, homeTeam: 'Atalanta',    awayTeam: 'Fiorentina', status: 'upcoming', time: '17:00' },
    ],
  },

  'bundesliga': {
    stadiumImage: 'https://images.unsplash.com/photo-1573559055341-51c1ced2b864?w=1400&q=80&fit=crop&auto=format',
    stadiumName: 'Allianz Arena',
    totalClubs: 18,
    currentMatchday: 17,
    totalMatchdays: 34,
    stats: { totalGoals: 421, goalsPerGame: 3.01, matchesPlayed: 140, homeWinPct: 45, topVenue: 'Allianz Arena' },
    standings: [
      { position: 1, team: 'Bayern',     played: 17, won: 15, drawn: 1, lost: 1, gf: 50, ga: 18, gd: 32, points: 46, form: ['W','W','W','W','D'], zone: 'title' },
      { position: 2, team: 'Leverkusen', played: 17, won: 13, drawn: 2, lost: 2, gf: 40, ga: 18, gd: 22, points: 41, form: ['W','D','W','W','W'], zone: 'ucl' },
      { position: 3, team: 'Dortmund',   played: 17, won: 11, drawn: 3, lost: 3, gf: 35, ga: 22, gd: 13, points: 36, form: ['W','L','W','D','W'], zone: 'ucl' },
      { position: 4, team: 'RB Leipzig', played: 17, won: 11, drawn: 2, lost: 4, gf: 32, ga: 22, gd: 10, points: 35, form: ['D','W','W','L','W'], zone: 'ucl' },
      { position: 5, team: 'Frankfurt',  played: 17, won: 9,  drawn: 4, lost: 4, gf: 28, ga: 22, gd: 6,  points: 31, form: ['W','D','L','W','W'], zone: 'europa' },
      { position: 6, team: 'Stuttgart',  played: 17, won: 8,  drawn: 5, lost: 4, gf: 26, ga: 22, gd: 4,  points: 29, form: ['D','W','D','W','L'], zone: 'conference' },
      { position: 7, team: 'Wolfsburg',  played: 17, won: 6,  drawn: 5, lost: 6, gf: 22, ga: 26, gd: -4, points: 23, form: ['L','D','W','L','D'] },
      { position: 8, team: 'Gladbach',   played: 17, won: 5,  drawn: 6, lost: 6, gf: 20, ga: 28, gd: -8, points: 21, form: ['D','L','D','W','L'] },
    ],
    topScorers: [
      { rank: 1, name: 'Harry Kane',      team: 'Bayern',     goals: 22, assists: 9 },
      { rank: 2, name: 'Serhou Guirassy', team: 'Dortmund',   goals: 15, assists: 4 },
      { rank: 3, name: 'Victor Boniface', team: 'Leverkusen', goals: 13, assists: 6 },
      { rank: 4, name: 'Lois Openda',     team: 'RB Leipzig', goals: 12, assists: 5 },
      { rank: 5, name: 'Deniz Undav',     team: 'Stuttgart',  goals: 11, assists: 8 },
    ],
    topAssisters: [
      { rank: 1, name: 'Harry Kane',      team: 'Bayern',     goals: 22, assists: 9 },
      { rank: 2, name: 'Florian Wirtz',   team: 'Leverkusen', goals: 9,  assists: 12 },
      { rank: 3, name: 'Jamal Musiala',   team: 'Bayern',     goals: 10, assists: 11 },
      { rank: 4, name: 'Deniz Undav',     team: 'Stuttgart',  goals: 11, assists: 8 },
      { rank: 5, name: 'Granit Xhaka',    team: 'Leverkusen', goals: 4,  assists: 8 },
    ],
    topDefenders: [
      { rank: 1, name: 'Kim Min-jae',      team: 'Bayern',     goals: 94, assists: 10 },
      { rank: 2, name: 'Jonathan Tah',     team: 'Leverkusen', goals: 93, assists: 9 },
      { rank: 3, name: 'Mats Hummels',     team: 'Dortmund',   goals: 91, assists: 8 },
      { rank: 4, name: 'Willi Orbán',      team: 'RB Leipzig', goals: 89, assists: 7 },
      { rank: 5, name: 'Timothy Chandler', team: 'Frankfurt',  goals: 86, assists: 6 },
    ],
    topKeepers: [
      { rank: 1, name: 'Manuel Neuer',     team: 'Bayern',     goals: 10, assists: 90 },
      { rank: 2, name: 'Lukáš Hrádecký',   team: 'Leverkusen', goals: 9,  assists: 88 },
      { rank: 3, name: 'Gregor Kobel',     team: 'Dortmund',   goals: 8,  assists: 87 },
      { rank: 4, name: 'Peter Gulácsi',    team: 'RB Leipzig', goals: 7,  assists: 85 },
      { rank: 5, name: 'Kevin Trapp',      team: 'Frankfurt',  goals: 7,  assists: 84 },
    ],
    matches: [
      { id: 13, homeTeam: 'Bayern',     awayTeam: 'Dortmund',   status: 'finished', homeScore: 3, awayScore: 2 },
      { id: 14, homeTeam: 'Leverkusen', awayTeam: 'RB Leipzig', status: 'upcoming', time: '16:30' },
      { id: 15, homeTeam: 'Frankfurt',  awayTeam: 'Stuttgart',  status: 'live',     homeScore: 1, awayScore: 0, minute: 34 },
      { id: 16, homeTeam: 'Wolfsburg',  awayTeam: 'Gladbach',   status: 'upcoming', time: '15:30' },
    ],
  },

  'ligue-1': {
    stadiumImage: 'https://images.unsplash.com/photo-1676746610993-fa0c050d1f6d?w=1400&q=80&fit=crop&auto=format',
    stadiumName: 'Parc des Princes',
    totalClubs: 18,
    currentMatchday: 15,
    totalMatchdays: 34,
    stats: { totalGoals: 298, goalsPerGame: 2.49, matchesPlayed: 119, homeWinPct: 41, topVenue: 'Parc des Princes' },
    standings: [
      { position: 1, team: 'PSG',       played: 15, won: 13, drawn: 2, lost: 0, gf: 42, ga: 10, gd: 32, points: 41, form: ['W','W','W','W','W'], zone: 'title' },
      { position: 2, team: 'Monaco',    played: 15, won: 12, drawn: 2, lost: 1, gf: 33, ga: 14, gd: 19, points: 38, form: ['W','W','D','W','W'], zone: 'ucl' },
      { position: 3, team: 'Lyon',      played: 15, won: 10, drawn: 3, lost: 2, gf: 28, ga: 16, gd: 12, points: 33, form: ['W','D','W','L','W'], zone: 'ucl' },
      { position: 4, team: 'Lille',     played: 15, won: 10, drawn: 2, lost: 3, gf: 26, ga: 16, gd: 10, points: 32, form: ['D','W','W','W','L'], zone: 'ucl' },
      { position: 5, team: 'Nice',      played: 15, won: 9,  drawn: 2, lost: 4, gf: 24, ga: 18, gd: 6,  points: 29, form: ['W','L','W','D','W'], zone: 'europa' },
      { position: 6, team: 'Marseille', played: 15, won: 8,  drawn: 3, lost: 4, gf: 22, ga: 19, gd: 3,  points: 27, form: ['L','W','W','D','L'], zone: 'conference' },
      { position: 7, team: 'Lens',      played: 15, won: 7,  drawn: 4, lost: 4, gf: 20, ga: 19, gd: 1,  points: 25, form: ['D','W','L','W','D'] },
      { position: 8, team: 'Rennes',    played: 15, won: 6,  drawn: 4, lost: 5, gf: 18, ga: 20, gd: -2, points: 22, form: ['L','D','W','L','W'] },
    ],
    topScorers: [
      { rank: 1, name: 'Bradley Barcola',     team: 'PSG',     goals: 18, assists: 8 },
      { rank: 2, name: 'Folarin Balogun',     team: 'Monaco',  goals: 14, assists: 5 },
      { rank: 3, name: 'Alexandre Lacazette', team: 'Lyon',    goals: 12, assists: 4 },
      { rank: 4, name: 'Jonathan David',      team: 'Lille',   goals: 11, assists: 6 },
      { rank: 5, name: 'Terem Moffi',         team: 'Nice',    goals: 10, assists: 3 },
    ],
    topAssisters: [
      { rank: 1, name: 'Vitinha',             team: 'PSG',     goals: 5,  assists: 12 },
      { rank: 2, name: 'Bradley Barcola',     team: 'PSG',     goals: 18, assists: 8 },
      { rank: 3, name: 'Wissam Ben Yedder',   team: 'Monaco',  goals: 8,  assists: 7 },
      { rank: 4, name: 'Jonathan David',      team: 'Lille',   goals: 11, assists: 6 },
      { rank: 5, name: 'Gift Orban',          team: 'Lyon',    goals: 9,  assists: 5 },
    ],
    topDefenders: [
      { rank: 1, name: 'Lucas Hernández',  team: 'PSG',      goals: 93, assists: 9 },
      { rank: 2, name: 'Wilfried Singo',   team: 'Monaco',   goals: 90, assists: 8 },
      { rank: 3, name: 'Clinton Mata',     team: 'Lyon',     goals: 88, assists: 7 },
      { rank: 4, name: 'Leny Yoro',        team: 'Lille',    goals: 87, assists: 7 },
      { rank: 5, name: 'Jean-Clair Todibo',team: 'Nice',     goals: 85, assists: 6 },
    ],
    topKeepers: [
      { rank: 1, name: 'Gianluigi Donnarumma', team: 'PSG',    goals: 9,  assists: 91 },
      { rank: 2, name: 'Philipp Köhn',         team: 'Monaco', goals: 8,  assists: 88 },
      { rank: 3, name: 'Lucas Chevalier',      team: 'Lille',  goals: 7,  assists: 86 },
      { rank: 4, name: 'Anthony Lopes',        team: 'Lyon',   goals: 6,  assists: 84 },
      { rank: 5, name: 'Marcin Bułka',         team: 'Nice',   goals: 6,  assists: 83 },
    ],
    matches: [
      { id: 17, homeTeam: 'PSG',    awayTeam: 'Lyon',      status: 'upcoming', time: '20:00' },
      { id: 18, homeTeam: 'Monaco', awayTeam: 'Marseille', status: 'live',     homeScore: 2, awayScore: 2, minute: 78 },
      { id: 19, homeTeam: 'Lille',  awayTeam: 'Nice',      status: 'finished', homeScore: 1, awayScore: 0 },
      { id: 20, homeTeam: 'Lens',   awayTeam: 'Rennes',    status: 'upcoming', time: '16:00' },
    ],
  },

  'ucl': {
    stadiumImage: 'https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=1400&q=80&fit=crop&auto=format',
    stadiumName: 'Wembley Stadium',
    totalClubs: 36,
    currentMatchday: 6,
    totalMatchdays: 8,
    stats: { totalGoals: 265, goalsPerGame: 3.04, matchesPlayed: 87, homeWinPct: 43, topVenue: 'Santiago Bernabéu' },
    standings: [
      { position: 1, team: 'Liverpool',      played: 6, won: 6, drawn: 0, lost: 0, gf: 22, ga: 5,  gd: 17, points: 18, form: ['W','W','W','W','W'], zone: 'r16' },
      { position: 2, team: 'Barcelona',      played: 6, won: 6, drawn: 0, lost: 0, gf: 20, ga: 6,  gd: 14, points: 18, form: ['W','W','W','W','W'], zone: 'r16' },
      { position: 3, team: 'Arsenal',        played: 6, won: 5, drawn: 1, lost: 0, gf: 17, ga: 6,  gd: 11, points: 16, form: ['W','W','D','W','W'], zone: 'r16' },
      { position: 4, team: 'Inter Milan',    played: 6, won: 5, drawn: 1, lost: 0, gf: 16, ga: 7,  gd: 9,  points: 16, form: ['W','D','W','W','W'], zone: 'r16' },
      { position: 5, team: 'Atletico Madrid',played: 6, won: 4, drawn: 1, lost: 1, gf: 14, ga: 8,  gd: 6,  points: 13, form: ['W','W','L','D','W'], zone: 'r16' },
      { position: 6, team: 'Leverkusen',     played: 6, won: 4, drawn: 1, lost: 1, gf: 14, ga: 9,  gd: 5,  points: 13, form: ['D','W','W','L','W'], zone: 'r16' },
      { position: 7, team: 'Real Madrid',    played: 6, won: 4, drawn: 1, lost: 1, gf: 13, ga: 8,  gd: 5,  points: 13, form: ['W','L','W','W','D'], zone: 'r16' },
      { position: 8, team: 'Juventus',       played: 6, won: 4, drawn: 2, lost: 0, gf: 12, ga: 5,  gd: 7,  points: 14, form: ['W','W','D','W','D'], zone: 'r16' },
    ],
    topScorers: [
      { rank: 1, name: 'Erling Haaland',     team: 'Man City',    goals: 8, assists: 3 },
      { rank: 2, name: 'Robert Lewandowski', team: 'Barcelona',   goals: 7, assists: 2 },
      { rank: 3, name: 'Kylian Mbappé',      team: 'Real Madrid', goals: 7, assists: 4 },
      { rank: 4, name: 'Lautaro Martínez',   team: 'Inter Milan', goals: 6, assists: 2 },
      { rank: 5, name: 'Bukayo Saka',        team: 'Arsenal',     goals: 5, assists: 5 },
    ],
    topAssisters: [
      { rank: 1, name: 'Kevin De Bruyne',    team: 'Man City',    goals: 2, assists: 7 },
      { rank: 2, name: 'Florian Wirtz',      team: 'Leverkusen',  goals: 3, assists: 6 },
      { rank: 3, name: 'Bukayo Saka',        team: 'Arsenal',     goals: 5, assists: 5 },
      { rank: 4, name: 'Vinícius Jr',        team: 'Real Madrid', goals: 4, assists: 5 },
      { rank: 5, name: 'Kylian Mbappé',      team: 'Real Madrid', goals: 7, assists: 4 },
    ],
    topDefenders: [
      { rank: 1, name: 'Virgil van Dijk',     team: 'Liverpool',      goals: 95, assists: 9 },
      { rank: 2, name: 'William Saliba',      team: 'Arsenal',        goals: 93, assists: 8 },
      { rank: 3, name: 'Alessandro Bastoni',  team: 'Inter Milan',    goals: 92, assists: 9 },
      { rank: 4, name: 'Antonio Rüdiger',     team: 'Real Madrid',    goals: 91, assists: 7 },
      { rank: 5, name: 'Jonathan Tah',        team: 'Leverkusen',     goals: 89, assists: 6 },
    ],
    topKeepers: [
      { rank: 1, name: 'Alisson',             team: 'Liverpool',      goals: 9,  assists: 92 },
      { rank: 2, name: 'David Raya',          team: 'Arsenal',        goals: 8,  assists: 90 },
      { rank: 3, name: 'Yann Sommer',         team: 'Inter Milan',    goals: 8,  assists: 89 },
      { rank: 4, name: 'Thibaut Courtois',    team: 'Real Madrid',    goals: 7,  assists: 88 },
      { rank: 5, name: 'Lukáš Hrádecký',       team: 'Leverkusen',     goals: 6,  assists: 86 },
    ],
    matches: [
      { id: 21, homeTeam: 'Real Madrid', awayTeam: 'Inter Milan', status: 'live',     homeScore: 1, awayScore: 0, minute: 55 },
      { id: 22, homeTeam: 'Arsenal',     awayTeam: 'Bayern',      status: 'upcoming', time: '20:00' },
      { id: 23, homeTeam: 'Barcelona',   awayTeam: 'Dortmund',    status: 'finished', homeScore: 3, awayScore: 1 },
      { id: 24, homeTeam: 'Liverpool',   awayTeam: 'Leverkusen',  status: 'upcoming', time: '20:00' },
    ],
  },
};

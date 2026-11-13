// Sportmonks returns full official club names (e.g. "FC Barcelona", "Real Madrid CF").
// Normalize them to the short display names used in lookups/fallbacks.
const SM_NAME_NORMALIZE: Record<string, string> = {
  // La Liga
  'FC Barcelona':              'Barcelona',
  'Real Madrid CF':            'Real Madrid',
  'Club Atlético de Madrid':   'Atletico Madrid',
  'Atlético de Madrid':        'Atletico Madrid',
  'Villarreal CF':             'Villarreal',
  'Real Betis Balompié':       'Betis',
  'Real Betis':                'Betis',
  'Sevilla FC':                'Sevilla',
  'Valencia CF':               'Valencia',
  'Real Sociedad':             'Real Sociedad',
  'Athletic Club':             'Athletic Bilbao',
  'Girona FC':                 'Girona',
  'Getafe CF':                 'Getafe',
  'Rayo Vallecano':            'Rayo',
  'UD Las Palmas':             'Las Palmas',
  'Deportivo Alavés':          'Alaves',
  'RCD Mallorca':              'Mallorca',
  'CA Osasuna':                'Osasuna',
  'Celta de Vigo':             'Celta Vigo',
  'RC Celta de Vigo':          'Celta Vigo',
  // EPL
  'Arsenal FC':                'Arsenal',
  'Manchester City FC':        'Man City',
  'Manchester City':           'Man City',
  'Liverpool FC':              'Liverpool',
  'Chelsea FC':                'Chelsea',
  'Tottenham Hotspur FC':      'Tottenham',
  'Tottenham Hotspur':         'Tottenham',
  'Manchester United FC':      'Man United',
  'Manchester United':         'Man United',
  'Newcastle United FC':       'Newcastle',
  'Newcastle United':          'Newcastle',
  'Aston Villa FC':            'Aston Villa',
  'West Ham United FC':        'West Ham',
  'West Ham United':           'West Ham',
  'Brighton & Hove Albion FC': 'Brighton',
  'Brighton & Hove Albion':    'Brighton',
  'Wolverhampton Wanderers FC':'Wolves',
  'Wolverhampton Wanderers':   'Wolves',
  'Fulham FC':                 'Fulham',
  'Brentford FC':              'Brentford',
  'Crystal Palace FC':         'Crystal Palace',
  'AFC Bournemouth':           'Bournemouth',
  'Everton FC':                'Everton',
  'Nottingham Forest FC':      'Nottm Forest',
  'Leicester City FC':         'Leicester',
  'Southampton FC':            'Southampton',
  'Ipswich Town FC':           'Ipswich',
  // Serie A
  'FC Internazionale Milano':  'Inter Milan',
  'Inter':                     'Inter Milan',
  'Internazionale':            'Inter Milan',
  'AC Milan':                  'AC Milan',
  'Juventus FC':               'Juventus',
  'SSC Napoli':                'Napoli',
  'AS Roma':                   'Roma',
  'SS Lazio':                  'Lazio',
  'Atalanta BC':               'Atalanta',
  'ACF Fiorentina':            'Fiorentina',
  'Bologna FC 1909':           'Bologna',
  'Torino FC':                 'Torino',
  'Udinese Calcio':            'Udinese',
  'Genoa CFC':                 'Genoa',
  'Empoli FC':                 'Empoli',
  'Hellas Verona FC':          'Verona',
  'Cagliari Calcio':           'Cagliari',
  'US Lecce':                  'Lecce',
  'Venezia FC':                'Venezia',
  'Parma Calcio 1913':         'Parma',
  'Como 1907':                 'Como',
  'Monza':                     'Monza',
  // Bundesliga
  'FC Bayern München':         'Bayern Munich',
  'Bayern München':            'Bayern Munich',
  'FC Bayern Munich':          'Bayern Munich',
  'Borussia Dortmund':         'Dortmund',
  'Bayer 04 Leverkusen':       'Leverkusen',
  'RB Leipzig':                'RB Leipzig',
  'Eintracht Frankfurt':       'Frankfurt',
  'VfB Stuttgart':             'Stuttgart',
  'VfL Wolfsburg':             'Wolfsburg',
  'Borussia Mönchengladbach':  'Gladbach',
  'SC Freiburg':               'Freiburg',
  '1. FC Union Berlin':        'Union Berlin',
  'TSG 1899 Hoffenheim':       'Hoffenheim',
  'SV Werder Bremen':          'Werder Bremen',
  'FC Augsburg':               'Augsburg',
  'VfL Bochum 1848':           'Bochum',
  '1. FSV Mainz 05':           'Mainz',
  'FC Heidenheim 1846':        'Heidenheim',
  'Holstein Kiel':             'Kiel',
  'FC St. Pauli 1910':         'St. Pauli',
  // Ligue 1
  'Paris Saint-Germain FC':    'PSG',
  'Paris Saint-Germain':       'PSG',
  'AS Monaco FC':              'Monaco',
  'AS Monaco':                 'Monaco',
  'Olympique Lyonnais':        'Lyon',
  'LOSC Lille':                'Lille',
  'OGC Nice':                  'Nice',
  'Olympique de Marseille':    'Marseille',
  'RC Lens':                   'Lens',
  'Stade Rennais FC 1901':     'Rennes',
  'Stade Rennais FC':          'Rennes',
  'Stade Brestois 29':         'Brest',
  'Toulouse FC':               'Toulouse',
  'RC Strasbourg Alsace':      'Strasbourg',
  'FC Nantes':                 'Nantes',
  'Stade de Reims':            'Reims',
  'Le Havre AC':               'Le Havre',
  'Montpellier HSC':           'Montpellier',
};

function normalizeSmName(smName: string): string {
  return SM_NAME_NORMALIZE[smName] ?? smName;
}

export function normalizeSportmonksClubName(name: string): string {
  return normalizeSmName(name);
}

/** Re-key a Sportmonks team-name map by both display name and raw name. */
export function normalizeSportmonksVenues<T>(map: Record<string, T>): Record<string, T> {
  const normalized: Record<string, T> = {};
  for (const [smName, value] of Object.entries(map)) {
    normalized[normalizeSmName(smName)] = value;
    normalized[smName] = value; // keep raw name too
  }
  return normalized;
}

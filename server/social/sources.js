// Curated X.com (Twitter) source list per league.
// Each league has three source "tiers" that the trending algorithm weighs
// differently: official league/club accounts, players, and commentators
// (journalists/insiders). Handles are stored without the leading '@'.

// Weighting applied to a source tier when computing a post's base engagement
// score. Commentators/insiders (breaking news, transfers) tend to drive the
// most engagement and virality, so they carry the highest multiplier.
export const TIER_WEIGHTS = {
  league: 1,
  player: 1.15,
  commentator: 1.35,
};

export const LEAGUE_SOURCES = {
  'la-liga': {
    league: ['LaLiga', 'RealMadrid', 'FCBarcelona'],
    player: ['Benzema', 'ThibautCourtois', 'Militao_04'],
    commentator: ['FabrizioRomano', 'marca', 'AS_English', 'guillemBalague'],
  },
  epl: {
    league: ['PremierLeague', 'ManUtd', 'LFC', 'Arsenal', 'ChelseaFC', 'ManCity'],
    player: ['HKane', 'BrunoFernandes8', 'ErlingHaaland'],
    commentator: ['FabrizioRomano', 'OptaJoe', 'SkySportsNews', 'David_Ornstein'],
  },
  'serie-a': {
    league: ['SerieA', 'juventusfc', 'Inter', 'ACMilan'],
    player: ['Vlahovic9', 'LautaroMartinez'],
    commentator: ['FabrizioRomano', 'OptaPaolo', 'DiMarzio'],
  },
  bundesliga: {
    league: ['Bundesliga', 'FCBayern', 'BVB'],
    player: ['JMuller', 'ManuelNeuer'],
    commentator: ['FabrizioRomano', 'OptaFranz', 'ChrisWheatley_'],
  },
  'ligue-1': {
    league: ['Ligue1', 'PSG_English', 'OM_Officiel'],
    player: ['Mbappe', 'NeymarJr'],
    commentator: ['FabrizioRomano', 'OptaJean', 'JulienLaurens'],
  },
  ucl: {
    league: ['ChampionsLeague', 'UEFA'],
    player: [],
    commentator: ['FabrizioRomano', 'OptaJoe', 'SamiMokbel81_DM'],
  },
};

/** Returns the flat, deduplicated list of handles tracked for a league. */
export function getLeagueHandles(leagueId) {
  const cfg = LEAGUE_SOURCES[leagueId];
  if (!cfg) return [];
  const all = [...cfg.league, ...cfg.player, ...cfg.commentator];
  return [...new Set(all)];
}

/** Returns the tier ('league' | 'player' | 'commentator') for a handle within a league, defaulting to 'commentator'. */
export function getHandleTier(leagueId, handle) {
  const cfg = LEAGUE_SOURCES[leagueId];
  if (!cfg) return 'commentator';
  const lower = handle.toLowerCase();
  if (cfg.league.some((h) => h.toLowerCase() === lower)) return 'league';
  if (cfg.player.some((h) => h.toLowerCase() === lower)) return 'player';
  return 'commentator';
}

export function getAllLeagueIds() {
  return Object.keys(LEAGUE_SOURCES);
}

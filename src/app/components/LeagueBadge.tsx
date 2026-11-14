// Neutral text chip used to label a league. Same grey style for every league:
// no logos, drawings or league colours (see CLAUDE.md "Hard rules").

const LEAGUE_CODES: Record<string, string> = {
  'La Liga':    'ESP',
  'EPL':        'ENG',
  'Serie A':    'ITA',
  'Bundesliga': 'GER',
  'Ligue 1':    'FRA',
  'UCL':        'EUR',
};

interface LeagueBadgeProps {
  league: string;
  size?: number;
}

export function LeagueBadge({ league, size = 32 }: LeagueBadgeProps) {
  const code = LEAGUE_CODES[league];
  if (!code) return null;

  const height = Math.max(14, Math.round(size * 0.7));
  const fontSize = Math.max(8, Math.round(size * 0.34));

  return (
    <span
      role="img"
      aria-label={league}
      title={league}
      className="inline-flex flex-shrink-0 items-center justify-center rounded-md border border-[#3a3a3a] bg-[#2a2a2a] font-semibold tracking-wide text-gray-300"
      style={{ height, minWidth: height, fontSize, lineHeight: 1, padding: `0 ${Math.max(3, Math.round(size * 0.15))}px` }}
    >
      {code}
    </span>
  );
}

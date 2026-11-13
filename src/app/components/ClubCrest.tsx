import { normalizeSportmonksClubName } from '../services/clubNames';

// Neutral placeholder badge: the same plain shield and slate/grey colours for
// every club, with a short text code. No real crests, logos or club colours.

const SHIELD = 'M24,2 L44,9 L44,27 Q44,42 24,47 Q4,42 4,27 L4,9 Z';
const FILL = '#334155';   // slate-700
const BORDER = '#64748B'; // slate-500
const TEXT = '#F1F5F9';   // slate-100

/** Build a 2-3 letter code from a club name, e.g. "Real Madrid" -> "RM", "Arsenal" -> "ARS". */
function shortCode(club: string): string {
  const name = normalizeSportmonksClubName(club)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // strip accents
  const words = name.split(/[^A-Za-z0-9]+/).filter(w => /[A-Za-z]/.test(w));
  if (words.length === 0) return '?';
  if (words.length === 1) {
    const w = words[0];
    // Keep existing all-caps abbreviations like "PSG" as they are.
    return (w.length <= 3 ? w : w.slice(0, 3)).toUpperCase();
  }
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
}

export function ClubCrest({ club, size = 32 }: { club: string; size?: number }) {
  const code = shortCode(club);
  const fontSize = code.length >= 3 ? 12 : 15;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={club}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path d={SHIELD} fill={FILL} stroke={BORDER} strokeWidth="2" />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={TEXT}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {code}
      </text>
    </svg>
  );
}

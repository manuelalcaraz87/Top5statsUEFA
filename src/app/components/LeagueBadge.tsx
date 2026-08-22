import { useState } from 'react';
import { useLeagueLogo } from '../hooks/useLogo';

// ─── SVG fallbacks ────────────────────────────────────────────────────────────

function LaLigaSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="19" fill="#FF7900" />
      <path d="M1,20 L20,1 L20,39 Q10,38 4.5,31 Q1,26 1,20 Z" fill="#003DA5" />
      <text x="27" y="17" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="900" fontFamily="Arial Narrow, Arial, sans-serif">La</text>
      <text x="27" y="27" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="900" fontFamily="Arial Narrow, Arial, sans-serif">Liga</text>
      <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

function EPLbadgeSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="19" fill="#37003C" />
      <path d="M11,22 L13,14 L16,18 L20,11 L24,18 L27,14 L29,22 Z" fill="#E90052" />
      <rect x="11" y="22" width="18" height="3.5" rx="1.5" fill="#E90052" />
      <circle cx="20" cy="31" r="4" fill="none" stroke="#00FF87" strokeWidth="1.5" />
      <line x1="16" y1="31" x2="24" y2="31" stroke="#00FF87" strokeWidth="1" />
      <line x1="20" y1="27" x2="20" y2="35" stroke="#00FF87" strokeWidth="1" />
      <circle cx="20" cy="20" r="19" fill="none" stroke="#6c1d6e" strokeWidth="1.5" />
    </svg>
  );
}

function SerieASVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="19" fill="#024494" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#0066CC" strokeWidth="1.5" />
      <text x="20" y="17" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="400" fontFamily="Arial, sans-serif" letterSpacing="1">SERIE</text>
      <text x="20" y="29" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial Narrow, Arial, sans-serif">A</text>
      <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    </svg>
  );
}

function BundesligaSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="19" fill="#D20515" />
      <circle cx="20" cy="17" r="9" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M20,8 L20,26" stroke="white" strokeWidth="1" />
      <path d="M11.2,12 L28.8,12" stroke="white" strokeWidth="1" />
      <path d="M11.2,22 L28.8,22" stroke="white" strokeWidth="1" />
      <text x="20" y="34" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="0.5">BUNDESLIGA</text>
      <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
  );
}

function Ligue1SVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="19" fill="#14181E" />
      <circle cx="20" cy="20" r="13" fill="#DAE025" />
      <path d="M14,13 Q16,9 20,11 Q24,9 26,13" fill="none" stroke="#14181E" strokeWidth="1.5" />
      <text x="20" y="26" textAnchor="middle" fill="#14181E" fontSize="13" fontWeight="900" fontFamily="Arial Narrow, Arial, sans-serif">L1</text>
      <circle cx="20" cy="20" r="19" fill="none" stroke="#DAE025" strokeWidth="2" />
    </svg>
  );
}

function UCLSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="19" fill="#003B7A" />
      <text x="20" y="11" textAnchor="middle" fill="#FFD700" fontSize="6" fontFamily="Arial">★ ★ ★</text>
      <circle cx="20" cy="22" r="10" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M20,12 L20,32" stroke="white" strokeWidth="1" opacity="0.7" />
      <path d="M10.5,17 L29.5,17" stroke="white" strokeWidth="1" opacity="0.7" />
      <path d="M10.5,27 L29.5,27" stroke="white" strokeWidth="1" opacity="0.7" />
      <circle cx="20" cy="20" r="19" fill="none" stroke="#0056B3" strokeWidth="2" />
    </svg>
  );
}

const SVG_MAP: Record<string, (size: number) => JSX.Element> = {
  'La Liga':    s => <LaLigaSVG size={s} />,
  'EPL':        s => <EPLbadgeSVG size={s} />,
  'Serie A':    s => <SerieASVG size={s} />,
  'Bundesliga': s => <BundesligaSVG size={s} />,
  'Ligue 1':    s => <Ligue1SVG size={s} />,
  'UCL':        s => <UCLSVG size={s} />,
};

// ─── Public component ─────────────────────────────────────────────────────────

interface LeagueBadgeProps {
  league: string;
  size?: number;
}

export function LeagueBadge({ league, size = 32 }: LeagueBadgeProps) {
  const logoUrl = useLeagueLogo(league);
  const [imgFailed, setImgFailed] = useState(false);

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={league}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        style={{ objectFit: 'contain', flexShrink: 0, display: 'block' }}
      />
    );
  }

  const svgRender = SVG_MAP[league];
  return svgRender ? svgRender(size) : null;
}

import { useId, useState } from 'react';

// ─── Static CDN map (media.api-sports.io – public image CDN, no auth needed) ──

const TEAM_IDS: Record<string, number> = {
  // La Liga
  'Real Madrid': 541, 'Barcelona': 529, 'Atletico Madrid': 530,
  'Sevilla': 536, 'Valencia': 532, 'Real Sociedad': 548,
  'Betis': 543, 'Villarreal': 533, 'Athletic Bilbao': 531,
  'Girona': 547, 'Getafe': 546, 'Rayo': 728,
  'Las Palmas': 844, 'Alaves': 724, 'Mallorca': 723,
  'Osasuna': 727, 'Celta Vigo': 558,
  // EPL
  'Man City': 50, 'Arsenal': 42, 'Liverpool': 40, 'Chelsea': 49,
  'Tottenham': 47, 'Man United': 33, 'Newcastle': 34, 'Aston Villa': 66,
  'West Ham': 48, 'Brighton': 51, 'Wolves': 39, 'Fulham': 36,
  'Brentford': 55, 'Crystal Palace': 52, 'Bournemouth': 35,
  'Everton': 45, 'Nottm Forest': 65, 'Leicester': 46,
  'Southampton': 41, 'Ipswich': 57,
  // Serie A
  'Inter Milan': 505, 'AC Milan': 489, 'Juventus': 496, 'Napoli': 492,
  'Roma': 497, 'Lazio': 487, 'Atalanta': 499, 'Fiorentina': 502,
  'Bologna': 500, 'Torino': 503, 'Udinese': 494, 'Genoa': 508,
  'Empoli': 511, 'Verona': 504, 'Cagliari': 490, 'Lecce': 867,
  'Venezia': 515, 'Parma': 516, 'Como': 450, 'Monza': 1579,
  // Bundesliga
  'Bayern': 157, 'Bayern Munich': 157, 'Dortmund': 165, 'Leverkusen': 168,
  'RB Leipzig': 173, 'Frankfurt': 169, 'Stuttgart': 172,
  'Wolfsburg': 161, 'Gladbach': 163, 'Union Berlin': 183,
  'Hoffenheim': 167, 'Werder Bremen': 162, 'Augsburg': 170,
  'Bochum': 178, 'Mainz': 164, 'Heidenheim': 2829,
  'Kiel': 2826, 'St. Pauli': 182, 'Freiburg': 160,
  // Ligue 1
  'PSG': 85, 'Lyon': 80, 'Monaco': 91, 'Marseille': 81, 'Lille': 79, 'Nice': 84,
  'Lens': 116, 'Rennes': 111, 'Strasbourg': 95, 'Nantes': 83,
  'Reims': 93, 'Le Havre': 1063, 'Montpellier': 82, 'Toulouse': 96,
  'Brest': 130,
};

function cdnUrl(club: string): string | null {
  const id = TEAM_IDS[club];
  return id ? `https://media.api-sports.io/football/teams/${id}.png` : null;
}

// ─── SVG fallback ─────────────────────────────────────────────────────────────

interface CrestDef {
  primary: string; secondary: string; textColor: string; initials: string;
  pattern?: 'vstripes' | 'half' | 'hstripes' | 'quarter'; border?: string;
}
const CRESTS: Record<string, CrestDef> = {
  'Real Madrid':    { primary: '#F8F8F8', secondary: '#004B98', textColor: '#004B98', initials: 'RM',   border: '#F9C000' },
  'Barcelona':      { primary: '#004D98', secondary: '#A50044', textColor: '#FFED00', initials: 'FCB',  pattern: 'vstripes' },
  'Atletico Madrid':{ primary: '#CB3524', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'ATM',  pattern: 'hstripes' },
  'Sevilla':        { primary: '#D72027', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'SFC' },
  'Valencia':       { primary: '#F8F8F8', secondary: '#FF6B00', textColor: '#FF6B00', initials: 'VCF',  border: '#FF6B00' },
  'Real Sociedad':  { primary: '#0067B1', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'RSO',  pattern: 'hstripes' },
  'Betis':          { primary: '#00843D', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'RBB',  pattern: 'vstripes' },
  'Villarreal':     { primary: '#F6C917', secondary: '#004899', textColor: '#004899', initials: 'VIL' },
  'Man City':       { primary: '#6CABDD', secondary: '#1C2C5B', textColor: '#FFFFFF', initials: 'MCI' },
  'Arsenal':        { primary: '#EF0107', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'AFC' },
  'Liverpool':      { primary: '#C8102E', secondary: '#00B2A9', textColor: '#FFFFFF', initials: 'LFC' },
  'Chelsea':        { primary: '#034694', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'CFC' },
  'Tottenham':      { primary: '#132257', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'THFC' },
  'Man United':     { primary: '#DA291C', secondary: '#FBE122', textColor: '#FFFFFF', initials: 'MUFC' },
  'Newcastle':      { primary: '#241F20', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'NUFC', pattern: 'vstripes' },
  'Aston Villa':    { primary: '#670E36', secondary: '#94BFE0', textColor: '#FFFFFF', initials: 'AVFC' },
  'Inter Milan':    { primary: '#003DA5', secondary: '#000000', textColor: '#FFFFFF', initials: 'FCM',  pattern: 'vstripes' },
  'AC Milan':       { primary: '#FB090B', secondary: '#000000', textColor: '#FFFFFF', initials: 'ACM',  pattern: 'vstripes' },
  'Juventus':       { primary: '#F0F0F0', secondary: '#000000', textColor: '#000000', initials: 'JFC',  pattern: 'half', border: '#000000' },
  'Napoli':         { primary: '#287FC4', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'SSN' },
  'Roma':           { primary: '#8B1C1C', secondary: '#F5BC00', textColor: '#F5BC00', initials: 'ASR' },
  'Lazio':          { primary: '#9DCFEC', secondary: '#003DA5', textColor: '#003DA5', initials: 'SSL' },
  'Atalanta':       { primary: '#1E3A8A', secondary: '#000000', textColor: '#FFFFFF', initials: 'ATA',  pattern: 'vstripes' },
  'Fiorentina':     { primary: '#7B1FA2', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'ACF' },
  'Bayern':         { primary: '#DC052D', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'FCB',  pattern: 'quarter' },
  'Bayern Munich':  { primary: '#DC052D', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'FCB',  pattern: 'quarter' },
  'Dortmund':       { primary: '#FDE100', secondary: '#000000', textColor: '#000000', initials: 'BVB' },
  'Leverkusen':     { primary: '#E32221', secondary: '#000000', textColor: '#FFFFFF', initials: 'B04' },
  'RB Leipzig':     { primary: '#DD0741', secondary: '#001C3A', textColor: '#FFFFFF', initials: 'RBL' },
  'Frankfurt':      { primary: '#E2001A', secondary: '#000000', textColor: '#FFFFFF', initials: 'SGE',  pattern: 'half' },
  'Stuttgart':      { primary: '#E3001F', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'VFB' },
  'PSG':            { primary: '#004170', secondary: '#DA291C', textColor: '#FFFFFF', initials: 'PSG',  border: '#DA291C' },
  'Lyon':           { primary: '#1C2536', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'OL' },
  'Monaco':         { primary: '#E8192C', secondary: '#F8F8F8', textColor: '#E8192C', initials: 'ASM',  pattern: 'half' },
  'Marseille':      { primary: '#2FAEE0', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'OM' },
  'Lille':          { primary: '#C8102E', secondary: '#003087', textColor: '#FFFFFF', initials: 'LOSC', pattern: 'half' },
  'Nice':           { primary: '#E72024', secondary: '#000000', textColor: '#FFFFFF', initials: 'OGC' },
  'Lens':           { primary: '#E2001A', secondary: '#F5A623', textColor: '#FFFFFF', initials: 'RCL',  pattern: 'hstripes' },
  'Rennes':         { primary: '#E2001A', secondary: '#000000', textColor: '#FFFFFF', initials: 'SRF',  pattern: 'half' },
  'Wolfsburg':      { primary: '#65B32E', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'VfL' },
  'Gladbach':       { primary: '#000000', secondary: '#FFFFFF', textColor: '#FFFFFF', initials: 'BMG',  pattern: 'half' },
};
const DEFAULT_CREST: CrestDef = { primary: '#374151', secondary: '#6B7280', textColor: '#FFFFFF', initials: '?' };
const SHIELD = 'M24,2 L44,9 L44,27 Q44,42 24,47 Q4,42 4,27 L4,9 Z';

function ClubCrestSVG({ club, size }: { club: string; size: number }) {
  const uid = useId().replace(/:/g, '');
  const clipId = `sc${uid}`;
  const crest = CRESTS[club] || DEFAULT_CREST;
  const border = crest.border || crest.secondary;
  const isLight = crest.textColor === '#FFFFFF' || crest.textColor === 'white';
  const strokeColor = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)';
  const fs = crest.initials.length >= 4 ? 7 : crest.initials.length === 3 ? 9 : 13;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs><clipPath id={clipId}><path d={SHIELD} /></clipPath></defs>
      <path d={SHIELD} fill={crest.primary} />
      {crest.pattern === 'vstripes' && <g clipPath={`url(#${clipId})`}>
        <rect x="8"  y="0" width="8" height="48" fill={crest.secondary} />
        <rect x="24" y="0" width="8" height="48" fill={crest.secondary} />
        <rect x="40" y="0" width="8" height="48" fill={crest.secondary} />
      </g>}
      {crest.pattern === 'half' && <rect clipPath={`url(#${clipId})`} x="24" y="0" width="24" height="48" fill={crest.secondary} />}
      {crest.pattern === 'hstripes' && <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="6"  width="48" height="6" fill={crest.secondary} />
        <rect x="0" y="18" width="48" height="6" fill={crest.secondary} />
        <rect x="0" y="30" width="48" height="6" fill={crest.secondary} />
        <rect x="0" y="42" width="48" height="6" fill={crest.secondary} />
      </g>}
      {crest.pattern === 'quarter' && <g clipPath={`url(#${clipId})`}>
        <rect x="0"  y="0"  width="24" height="24" fill={crest.secondary} />
        <rect x="24" y="24" width="24" height="24" fill={crest.secondary} />
      </g>}
      <text x="24" y="31" textAnchor="middle" fill={crest.textColor} stroke={strokeColor}
        strokeWidth="3" paintOrder="stroke" fontSize={fs} fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.3">{crest.initials}</text>
      <path d={SHIELD} fill="none" stroke={border} strokeWidth="2" />
    </svg>
  );
}

// ─── Public component – real logo first, SVG fallback ─────────────────────────

export function ClubCrest({ club, size = 32 }: { club: string; size?: number }) {
  const url = cdnUrl(club);
  const [failed, setFailed] = useState(false);

  if (url && !failed) {
    return (
      <img src={url} alt={club} width={size} height={size}
        onError={() => setFailed(true)}
        style={{ objectFit: 'contain', flexShrink: 0, display: 'block' }} />
    );
  }
  return <ClubCrestSVG club={club} size={size} />;
}

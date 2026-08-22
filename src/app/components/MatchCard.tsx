import { Badge } from './ui/badge';
import { ClubCrest } from './ClubCrest';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'upcoming' | 'finished';
  minute?: number;
  time?: string;
  league: string;
  leagueColor: string;
}

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  if (compact) {
    const isLive = match.status === 'live';
    return (
      <div
        className="min-w-[160px] max-w-[160px] bg-[#1a1a1a] rounded-lg overflow-hidden flex-shrink-0 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
        style={{ borderTopWidth: 3, borderTopColor: match.leagueColor }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {match.minute}&apos;
            </span>
          )}
          {match.status === 'upcoming' && (
            <span className="text-[10px] text-gray-400">{match.time}</span>
          )}
          {match.status === 'finished' && (
            <span className="text-[10px] text-green-400 font-semibold">FT</span>
          )}
        </div>

        {/* Teams */}
        <div className="px-2.5 pb-2.5 space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <ClubCrest club={match.homeTeam} size={22} />
              <span className="text-[11px] text-gray-200 truncate leading-tight">{match.homeTeam}</span>
            </div>
            <span className={`text-base font-bold ml-1 flex-shrink-0 ${isLive ? 'text-white' : 'text-gray-300'}`}>
              {match.homeScore !== null ? match.homeScore : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <ClubCrest club={match.awayTeam} size={22} />
              <span className="text-[11px] text-gray-200 truncate leading-tight">{match.awayTeam}</span>
            </div>
            <span className={`text-base font-bold ml-1 flex-shrink-0 ${isLive ? 'text-white' : 'text-gray-300'}`}>
              {match.awayScore !== null ? match.awayScore : '-'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full-size card
  return (
    <div
      className="min-w-[320px] bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      style={{ borderTopWidth: 4, borderTopColor: match.leagueColor }}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="text-sm text-slate-500">{match.league}</span>
        {match.status === 'live' && (
          <Badge variant="destructive" className="animate-pulse gap-1">
            <span className="w-2 h-2 bg-white rounded-full" />
            Live {match.minute}&apos;
          </Badge>
        )}
        {match.status === 'upcoming' && (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">{match.time}</Badge>
        )}
        {match.status === 'finished' && (
          <Badge variant="secondary" className="bg-green-50 text-green-700">FT</Badge>
        )}
      </div>

      <div className="px-5 pb-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClubCrest club={match.homeTeam} size={36} />
            <span className="text-slate-900 font-medium">{match.homeTeam}</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 ml-4">
            {match.homeScore !== null ? match.homeScore : '-'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClubCrest club={match.awayTeam} size={36} />
            <span className="text-slate-900 font-medium">{match.awayTeam}</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 ml-4">
            {match.awayScore !== null ? match.awayScore : '-'}
          </span>
        </div>

        {match.status === 'upcoming' && (
          <button
            className="w-full mt-1 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: match.leagueColor }}
          >
            Match Preview
          </button>
        )}
      </div>
    </div>
  );
}

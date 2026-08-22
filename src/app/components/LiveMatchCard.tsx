import { Badge } from './ui/badge';

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
}

interface LiveMatchCardProps {
  match: Match;
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <div className="min-w-[300px] bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">{match.league}</span>
        {match.status === 'live' && (
          <Badge variant="destructive" className="animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
            {match.minute}'
          </Badge>
        )}
        {match.status === 'upcoming' && (
          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
            {match.time}
          </Badge>
        )}
        {match.status === 'finished' && (
          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
            FT
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white truncate">{match.homeTeam}</span>
          <span className="text-white ml-3">
            {match.homeScore !== null ? match.homeScore : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white truncate">{match.awayTeam}</span>
          <span className="text-white ml-3">
            {match.awayScore !== null ? match.awayScore : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}

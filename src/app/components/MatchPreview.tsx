import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface Match {
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time?: string;
  status: 'finished' | 'upcoming';
}

interface MatchPreviewProps {
  match: Match;
  leagueColor: string;
}

export function MatchPreview({ match, leagueColor }: MatchPreviewProps) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{match.date}</span>
            {match.time && (
              <>
                <Clock className="w-3.5 h-3.5 ml-2" />
                <span>{match.time}</span>
              </>
            )}
          </div>
          <Badge
            variant={match.status === 'finished' ? 'secondary' : 'default'}
            style={match.status === 'upcoming' ? { backgroundColor: leagueColor } : {}}
          >
            {match.status === 'finished' ? 'FT' : 'Upcoming'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-900">{match.home}</span>
            <span className="text-slate-900 ml-3">
              {match.homeScore !== undefined ? match.homeScore : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-900">{match.away}</span>
            <span className="text-slate-900 ml-3">
              {match.awayScore !== undefined ? match.awayScore : '-'}
            </span>
          </div>
        </div>

        {match.status === 'upcoming' && (
          <button
            className="w-full mt-3 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: leagueColor }}
          >
            Match Preview
          </button>
        )}
      </CardContent>
    </Card>
  );
}

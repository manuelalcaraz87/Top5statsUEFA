import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from 'lucide-react';

interface MatchScheduleProps {
  sport: string;
}

const scheduleData = {
  football: [
    { home: 'Manchester City', away: 'Arsenal', date: 'Nov 12', time: '16:30', status: 'Upcoming' },
    { home: 'Liverpool', away: 'Chelsea', date: 'Nov 12', time: '14:00', status: 'Upcoming' },
    { home: 'Real Madrid', away: 'Barcelona', date: 'Nov 13', time: '20:00', status: 'Upcoming' },
    { home: 'Bayern Munich', away: 'Dortmund', date: 'Nov 13', time: '17:30', status: 'Upcoming' },
  ],
  basketball: [
    { home: 'Lakers', away: 'Warriors', date: 'Nov 11', time: '19:30', status: 'Tonight' },
    { home: 'Celtics', away: 'Heat', date: 'Nov 11', time: '20:00', status: 'Tonight' },
    { home: 'Bucks', away: 'Nets', date: 'Nov 12', time: '19:00', status: 'Upcoming' },
    { home: 'Nuggets', away: 'Suns', date: 'Nov 12', time: '21:00', status: 'Upcoming' },
  ],
  baseball: [
    { home: 'Yankees', away: 'Red Sox', date: 'Nov 15', time: '19:05', status: 'Upcoming' },
    { home: 'Dodgers', away: 'Giants', date: 'Nov 15', time: '22:10', status: 'Upcoming' },
    { home: 'Astros', away: 'Rangers', date: 'Nov 16', time: '20:10', status: 'Upcoming' },
    { home: 'Braves', away: 'Mets', date: 'Nov 16', time: '19:20', status: 'Upcoming' },
  ],
  tennis: [
    { home: 'Djokovic', away: 'Alcaraz', date: 'Nov 11', time: '14:00', status: 'Live' },
    { home: 'Medvedev', away: 'Sinner', date: 'Nov 11', time: '16:30', status: 'Upcoming' },
    { home: 'Rublev', away: 'Tsitsipas', date: 'Nov 12', time: '13:00', status: 'Upcoming' },
    { home: 'Fritz', away: 'Rune', date: 'Nov 12', time: '15:00', status: 'Upcoming' },
  ],
};

export function MatchSchedule({ sport }: MatchScheduleProps) {
  const matches = scheduleData[sport as keyof typeof scheduleData] || scheduleData.football;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {sport === 'tennis' ? 'Upcoming Matches' : 'Match Schedule'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-slate-900">{match.home}</p>
                  <span className="text-slate-400">vs</span>
                  <p className="text-slate-900">{match.away}</p>
                </div>
                <p className="text-sm text-slate-500">
                  {match.date} • {match.time}
                </p>
              </div>
              <Badge
                variant={match.status === 'Live' ? 'destructive' : match.status === 'Tonight' ? 'default' : 'secondary'}
              >
                {match.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface LeagueSnapshotProps {
  leagueName: string;
  leagueColor: string;
}

const teamsData: Record<string, any[]> = {
  'La Liga': [
    { name: 'Real Madrid', pts: 61, trend: 'up', form: 'WWWDW' },
    { name: 'Barcelona', pts: 59, trend: 'up', form: 'WDWWW' },
    { name: 'Atletico Madrid', pts: 54, trend: 'down', form: 'WLWDW' },
  ],
  'EPL': [
    { name: 'Manchester City', pts: 61, trend: 'up', form: 'WWWDW' },
    { name: 'Arsenal', pts: 59, trend: 'same', form: 'WDWWL' },
    { name: 'Liverpool', pts: 57, trend: 'up', form: 'WWWWW' },
  ],
  'Serie A': [
    { name: 'Inter Milan', pts: 59, trend: 'up', form: 'WWDWW' },
    { name: 'Juventus', pts: 57, trend: 'same', form: 'DWWDW' },
    { name: 'AC Milan', pts: 53, trend: 'up', form: 'WWLWW' },
  ],
};

export function LeagueSnapshot({ leagueName, leagueColor }: LeagueSnapshotProps) {
  const teams = teamsData[leagueName] || teamsData['La Liga'];

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="pb-3" style={{ backgroundColor: leagueColor }}>
        <CardTitle className="text-white">Top 3 teams in {leagueName}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {teams.map((team, index) => (
            <div
              key={team.name}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: leagueColor }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="text-slate-900">{team.name}</p>
                  <div className="flex gap-1 mt-1">
                    {team.form.split('').map((result: string, i: number) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] text-white ${
                          result === 'W' ? 'bg-green-500' :
                          result === 'D' ? 'bg-slate-400' :
                          'bg-red-500'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-900">{team.pts}</span>
                {team.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                {team.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
              </div>
            </div>
          ))}
        </div>

        <button
          className="w-full mt-4 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: leagueColor }}
        >
          View Full Standings
        </button>
      </CardContent>
    </Card>
  );
}
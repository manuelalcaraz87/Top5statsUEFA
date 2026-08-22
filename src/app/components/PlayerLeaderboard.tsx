import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface PlayerLeaderboardProps {
  sport: string;
}

const leaderboardData = {
  football: [
    { rank: 1, name: 'Erling Haaland', team: 'Man City', stat: '28', label: 'Goals' },
    { rank: 2, name: 'Harry Kane', team: 'Bayern', stat: '26', label: 'Goals' },
    { rank: 3, name: 'Kylian Mbappé', team: 'PSG', stat: '24', label: 'Goals' },
    { rank: 4, name: 'Victor Osimhen', team: 'Napoli', stat: '22', label: 'Goals' },
    { rank: 5, name: 'Mohamed Salah', team: 'Liverpool', stat: '21', label: 'Goals' },
  ],
  basketball: [
    { rank: 1, name: 'Luka Dončić', team: 'Mavericks', stat: '32.4', label: 'PPG' },
    { rank: 2, name: 'Joel Embiid', team: '76ers', stat: '31.8', label: 'PPG' },
    { rank: 3, name: 'Giannis', team: 'Bucks', stat: '30.5', label: 'PPG' },
    { rank: 4, name: 'Damian Lillard', team: 'Bucks', stat: '28.9', label: 'PPG' },
    { rank: 5, name: 'Kevin Durant', team: 'Suns', stat: '28.2', label: 'PPG' },
  ],
  baseball: [
    { rank: 1, name: 'Ronald Acuña Jr.', team: 'Braves', stat: '.345', label: 'AVG' },
    { rank: 2, name: 'Freddie Freeman', team: 'Dodgers', stat: '.337', label: 'AVG' },
    { rank: 3, name: 'Luis Arraez', team: 'Marlins', stat: '.331', label: 'AVG' },
    { rank: 4, name: 'Yandy Díaz', team: 'Rays', stat: '.328', label: 'AVG' },
    { rank: 5, name: 'Corey Seager', team: 'Rangers', stat: '.325', label: 'AVG' },
  ],
  tennis: [
    { rank: 1, name: 'Novak Djokovic', team: 'SRB', stat: '9,855', label: 'Points' },
    { rank: 2, name: 'Carlos Alcaraz', team: 'ESP', stat: '8,805', label: 'Points' },
    { rank: 3, name: 'Daniil Medvedev', team: 'RUS', stat: '7,555', label: 'Points' },
    { rank: 4, name: 'Jannik Sinner', team: 'ITA', stat: '6,490', label: 'Points' },
    { rank: 5, name: 'Andrey Rublev', team: 'RUS', stat: '5,315', label: 'Points' },
  ],
};

export function PlayerLeaderboard({ sport }: PlayerLeaderboardProps) {
  const players = leaderboardData[sport as keyof typeof leaderboardData] || leaderboardData.football;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Player Leaderboard</span>
          <Badge variant="secondary">{sport === 'football' ? 'Goals' : sport === 'basketball' ? 'Points' : sport === 'baseball' ? 'Batting' : 'Rankings'}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  player.rank === 1 ? 'bg-yellow-500 text-white' :
                  player.rank === 2 ? 'bg-slate-300 text-slate-700' :
                  player.rank === 3 ? 'bg-amber-600 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {player.rank}
                </div>
                <div>
                  <p className="text-slate-900">{player.name}</p>
                  <p className="text-sm text-slate-500">{player.team}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-900">{player.stat}</p>
                <p className="text-xs text-slate-500">{player.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

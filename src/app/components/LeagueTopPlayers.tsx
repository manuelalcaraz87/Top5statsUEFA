import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Target, Users, Shield } from 'lucide-react';

interface LeagueTopPlayersProps {
  leagueName: string;
  leagueColor: string;
}

const playersData: Record<string, any> = {
  'La Liga': {
    scorers: [
      { name: 'Jude Bellingham', team: 'Real Madrid', stat: 24 },
      { name: 'Robert Lewandowski', team: 'Barcelona', stat: 22 },
      { name: 'Antoine Griezmann', team: 'Atletico', stat: 18 },
    ],
    assists: [
      { name: 'Antoine Griezmann', team: 'Atletico', stat: 16 },
      { name: 'Vinicius Jr', team: 'Real Madrid', stat: 14 },
      { name: 'Isco', team: 'Betis', stat: 12 },
    ],
    goalkeepers: [
      { name: 'Jan Oblak', team: 'Atletico', stat: 16 },
      { name: 'Ter Stegen', team: 'Barcelona', stat: 14 },
      { name: 'Courtois', team: 'Real Madrid', stat: 13 },
    ],
  },
  'EPL': {
    scorers: [
      { name: 'Erling Haaland', team: 'Man City', stat: 28 },
      { name: 'Harry Kane', team: 'Tottenham', stat: 24 },
      { name: 'Mohamed Salah', team: 'Liverpool', stat: 21 },
    ],
    assists: [
      { name: 'Kevin De Bruyne', team: 'Man City', stat: 18 },
      { name: 'Bruno Fernandes', team: 'Man United', stat: 14 },
      { name: 'Martin Ødegaard', team: 'Arsenal', stat: 13 },
    ],
    goalkeepers: [
      { name: 'Ederson', team: 'Man City', stat: 18 },
      { name: 'Alisson', team: 'Liverpool', stat: 17 },
      { name: 'Aaron Ramsdale', team: 'Arsenal', stat: 15 },
    ],
  },
  'Serie A': {
    scorers: [
      { name: 'Lautaro Martinez', team: 'Inter', stat: 22 },
      { name: 'Victor Osimhen', team: 'Napoli', stat: 20 },
      { name: 'Dusan Vlahovic', team: 'Juventus', stat: 18 },
    ],
    assists: [
      { name: 'Rafael Leao', team: 'AC Milan', stat: 14 },
      { name: 'Nicolo Barella', team: 'Inter', stat: 12 },
      { name: 'Luis Alberto', team: 'Lazio', stat: 11 },
    ],
    goalkeepers: [
      { name: 'Mike Maignan', team: 'AC Milan', stat: 17 },
      { name: 'Wojciech Szczesny', team: 'Juventus', stat: 16 },
      { name: 'Samir Handanovic', team: 'Inter', stat: 15 },
    ],
  },
};

export function LeagueTopPlayers({ leagueName, leagueColor }: LeagueTopPlayersProps) {
  const players = playersData[leagueName] || playersData['La Liga'];

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="pb-3" style={{ backgroundColor: leagueColor }}>
        <CardTitle className="text-white">
          Top scorers, top assist players and top goal keepers of {leagueName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="scorers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="scorers" className="text-xs sm:text-sm">
              <Target className="w-4 h-4 mr-1.5" />
              Scorers
            </TabsTrigger>
            <TabsTrigger value="assists" className="text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-1.5" />
              Assists
            </TabsTrigger>
            <TabsTrigger value="goalkeepers" className="text-xs sm:text-sm">
              <Shield className="w-4 h-4 mr-1.5" />
              Keepers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scorers" className="space-y-2">
            {players.scorers.map((player: any, index: number) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: index === 0 ? leagueColor : '#94a3b8' }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-slate-900">{player.name}</p>
                    <p className="text-sm text-slate-500">{player.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-900">{player.stat}</p>
                  <p className="text-xs text-slate-500">goals</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="assists" className="space-y-2">
            {players.assists.map((player: any, index: number) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: index === 0 ? leagueColor : '#94a3b8' }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-slate-900">{player.name}</p>
                    <p className="text-sm text-slate-500">{player.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-900">{player.stat}</p>
                  <p className="text-xs text-slate-500">assists</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="goalkeepers" className="space-y-2">
            {players.goalkeepers.map((player: any, index: number) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: index === 0 ? leagueColor : '#94a3b8' }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-slate-900">{player.name}</p>
                    <p className="text-sm text-slate-500">{player.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-900">{player.stat}</p>
                  <p className="text-xs text-slate-500">clean sheets</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
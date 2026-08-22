import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Target, Users, Shield, TrendingUp, TrendingDown } from 'lucide-react';

interface LeagueMobileViewProps {
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

export function LeagueMobileView({ leagueName, leagueColor }: LeagueMobileViewProps) {
  const teams = teamsData[leagueName] || teamsData['La Liga'];
  const players = playersData[leagueName] || playersData['La Liga'];

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="pb-3" style={{ backgroundColor: leagueColor }}>
        <CardTitle className="text-white">{leagueName}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="teams" className="text-xs">
              <Trophy className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger value="scorers" className="text-xs">
              <Target className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="assists" className="text-xs">
              <Users className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Assists</span>
            </TabsTrigger>
            <TabsTrigger value="goalkeepers" className="text-xs">
              <Shield className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">GK</span>
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-3">
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
          </TabsContent>

          {/* Scorers Tab */}
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

          {/* Assists Tab */}
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

          {/* Goalkeepers Tab */}
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

        <button
          className="w-full mt-4 py-2 rounded-lg text-sm text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: leagueColor }}
        >
          View Full {leagueName} Stats
        </button>
      </CardContent>
    </Card>
  );
}

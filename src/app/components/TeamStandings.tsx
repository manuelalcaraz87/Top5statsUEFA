import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface TeamStandingsProps {
  sport: string;
}

const standingsData = {
  football: [
    { pos: 1, team: 'Manchester City', played: 26, won: 19, drawn: 4, lost: 3, gd: '+38', pts: 61 },
    { pos: 2, team: 'Arsenal', played: 26, won: 18, drawn: 5, lost: 3, gd: '+35', pts: 59 },
    { pos: 3, team: 'Liverpool', played: 26, won: 17, drawn: 6, lost: 3, gd: '+32', pts: 57 },
    { pos: 4, team: 'Aston Villa', played: 26, won: 16, drawn: 4, lost: 6, gd: '+18', pts: 52 },
    { pos: 5, team: 'Tottenham', played: 26, won: 15, drawn: 5, lost: 6, gd: '+15', pts: 50 },
  ],
  basketball: [
    { pos: 1, team: 'Boston Celtics', played: 58, won: 45, drawn: 0, lost: 13, gd: '+8.5', pts: 45 },
    { pos: 2, team: 'Milwaukee Bucks', played: 58, won: 42, drawn: 0, lost: 16, gd: '+6.2', pts: 42 },
    { pos: 3, team: 'Denver Nuggets', played: 58, won: 41, drawn: 0, lost: 17, gd: '+5.8', pts: 41 },
    { pos: 4, team: 'LA Clippers', played: 58, won: 39, drawn: 0, lost: 19, gd: '+4.3', pts: 39 },
    { pos: 5, team: 'Minnesota', played: 58, won: 38, drawn: 0, lost: 20, gd: '+3.7', pts: 38 },
  ],
  baseball: [
    { pos: 1, team: 'Atlanta Braves', played: 145, won: 92, drawn: 0, lost: 53, gd: '+168', pts: 92 },
    { pos: 2, team: 'LA Dodgers', played: 145, won: 88, drawn: 0, lost: 57, gd: '+142', pts: 88 },
    { pos: 3, team: 'Tampa Bay Rays', played: 145, won: 86, drawn: 0, lost: 59, gd: '+135', pts: 86 },
    { pos: 4, team: 'Baltimore', played: 145, won: 84, drawn: 0, lost: 61, gd: '+121', pts: 84 },
    { pos: 5, team: 'Texas Rangers', played: 145, won: 82, drawn: 0, lost: 63, gd: '+108', pts: 82 },
  ],
};

export function TeamStandings({ sport }: TeamStandingsProps) {
  const teams = standingsData[sport as keyof typeof standingsData] || standingsData.football;
  const isTennis = sport === 'tennis';

  if (isTennis) {
    return null;
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Team Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              {sport === 'football' && <TableHead className="text-center">D</TableHead>}
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.pos} className="hover:bg-slate-50">
                <TableCell>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    team.pos <= 4 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {team.pos}
                  </div>
                </TableCell>
                <TableCell>{team.team}</TableCell>
                <TableCell className="text-center">{team.played}</TableCell>
                <TableCell className="text-center">{team.won}</TableCell>
                {sport === 'football' && <TableCell className="text-center">{team.drawn}</TableCell>}
                <TableCell className="text-center">{team.lost}</TableCell>
                <TableCell className="text-center">{team.gd}</TableCell>
                <TableCell className="text-center">{team.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

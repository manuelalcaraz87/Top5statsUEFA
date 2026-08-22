import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Team {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  pts: number;
}

interface StandingsTableProps {
  teams: Team[];
  leagueColor: string;
}

export function StandingsTable({ teams, leagueColor }: StandingsTableProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>League Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center hidden sm:table-cell">P</TableHead>
                <TableHead className="text-center hidden md:table-cell">W</TableHead>
                <TableHead className="text-center hidden md:table-cell">D</TableHead>
                <TableHead className="text-center hidden md:table-cell">L</TableHead>
                <TableHead className="text-center hidden lg:table-cell">GF</TableHead>
                <TableHead className="text-center hidden lg:table-cell">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => {
                const gd = team.gf - team.ga;
                return (
                  <TableRow key={team.name} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{
                            backgroundColor: index < 4 ? leagueColor : index >= teams.length - 3 ? '#ef4444' : 'transparent',
                          }}
                        />
                        <span className="text-slate-900">{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 truncate max-w-[200px]">{team.name}</span>
                        {index === 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {index === teams.length - 1 && <TrendingDown className="w-4 h-4 text-red-600" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-slate-600 hidden sm:table-cell">{team.played}</TableCell>
                    <TableCell className="text-center text-slate-600 hidden md:table-cell">{team.won}</TableCell>
                    <TableCell className="text-center text-slate-600 hidden md:table-cell">{team.drawn}</TableCell>
                    <TableCell className="text-center text-slate-600 hidden md:table-cell">{team.lost}</TableCell>
                    <TableCell className="text-center text-slate-600 hidden lg:table-cell">{team.gf}</TableCell>
                    <TableCell className="text-center text-slate-600 hidden lg:table-cell">{team.ga}</TableCell>
                    <TableCell className="text-center">
                      <span className={`${gd > 0 ? 'text-green-600' : gd < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {gd > 0 ? '+' : ''}{gd}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-slate-900">{team.pts}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: leagueColor }} />
            <span>Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Relegation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

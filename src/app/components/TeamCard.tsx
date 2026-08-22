import { Card, CardContent } from './ui/card';
import { Trophy } from 'lucide-react';

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

interface TeamCardProps {
  team: Team;
  rank: number;
  leagueColor: string;
}

export function TeamCard({ team, rank, leagueColor }: TeamCardProps) {
  const winRate = ((team.won / team.played) * 100).toFixed(0);

  return (
    <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: leagueColor }}
            >
              <span className="text-sm">{rank}</span>
            </div>
            <div>
              <p className="text-slate-900">{team.name}</p>
              <p className="text-xs text-slate-500">{team.pts} points</p>
            </div>
          </div>
          {rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-slate-500 mb-1">Wins</p>
            <p className="text-slate-900">{team.won}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Draws</p>
            <p className="text-slate-900">{team.drawn}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Win %</p>
            <p className="text-slate-900">{winRate}%</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Goals Scored</span>
            <span className="text-green-600">{team.gf}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-500">Goals Conceded</span>
            <span className="text-red-600">{team.ga}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from './ui/card';
import { Target, Users, Star } from 'lucide-react';

interface Player {
  name: string;
  team: string;
  goals?: number;
  assists?: number;
  rating?: number;
}

interface PlayerHighlightProps {
  player: Player;
  stat: 'goals' | 'assists' | 'rating';
  leagueColor: string;
}

export function PlayerHighlight({ player, stat, leagueColor }: PlayerHighlightProps) {
  const getIcon = () => {
    switch (stat) {
      case 'goals':
        return <Target className="w-5 h-5" />;
      case 'assists':
        return <Users className="w-5 h-5" />;
      case 'rating':
        return <Star className="w-5 h-5" />;
    }
  };

  const getValue = () => {
    switch (stat) {
      case 'goals':
        return player.goals;
      case 'assists':
        return player.assists;
      case 'rating':
        return player.rating;
    }
  };

  const getLabel = () => {
    switch (stat) {
      case 'goals':
        return 'Goals';
      case 'assists':
        return 'Assists';
      case 'rating':
        return 'Rating';
    }
  };

  return (
    <Card className="border-slate-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-2.5 rounded-lg text-white"
            style={{ backgroundColor: leagueColor }}
          >
            {getIcon()}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">{getLabel()}</p>
            <p className="text-2xl text-slate-900">{getValue()}</p>
          </div>
        </div>

        <div>
          <p className="text-slate-900 mb-1">{player.name}</p>
          <p className="text-sm text-slate-500">{player.team}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                backgroundColor: leagueColor,
                width: stat === 'rating' ? `${(getValue() || 0) * 10}%` : '75%',
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

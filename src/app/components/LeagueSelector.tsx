import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface League {
  id: string;
  name: string;
  country: string;
  color: string;
  accentColor: string;
}

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: League;
  onSelectLeague: (league: League) => void;
}

export function LeagueSelector({ leagues, selectedLeague, onSelectLeague }: LeagueSelectorProps) {
  return (
    <Select
      value={selectedLeague.id}
      onValueChange={(value) => {
        const league = leagues.find((l) => l.id === value);
        if (league) onSelectLeague(league);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue>{selectedLeague.name}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {leagues.map((league) => (
          <SelectItem key={league.id} value={league.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: league.color }}
              />
              {league.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

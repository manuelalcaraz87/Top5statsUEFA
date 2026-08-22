interface League {
  id: string;
  name: string;
  country: string;
  color: string;
  accentColor: string;
}

interface LeagueHeaderProps {
  league: League;
}

export function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <div
      className="rounded-2xl p-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${league.color} 0%, ${league.color}dd 100%)`,
      }}
    >
      <div className="relative z-10">
        <p className="text-white/80 text-sm mb-1">{league.country}</p>
        <h2 className="text-white mb-2">{league.name}</h2>
        <p className="text-white/90">Season 2024/25 • Matchday 26</p>
      </div>
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-10"
        style={{
          background: `radial-gradient(circle, ${league.accentColor} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

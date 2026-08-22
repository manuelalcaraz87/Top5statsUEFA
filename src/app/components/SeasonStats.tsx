import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SeasonStatsProps {
  sport: string;
}

const statsData = {
  football: [
    { category: 'Goals', home: 145, away: 128 },
    { category: 'Assists', home: 98, away: 85 },
    { category: 'Clean Sheets', home: 42, away: 35 },
    { category: 'Penalties', home: 28, away: 24 },
  ],
  basketball: [
    { category: 'Points', home: 6850, away: 6420 },
    { category: 'Rebounds', home: 2580, away: 2340 },
    { category: 'Assists', home: 1890, away: 1720 },
    { category: 'Steals', home: 520, away: 485 },
  ],
  baseball: [
    { category: 'Runs', home: 485, away: 442 },
    { category: 'Hits', home: 1250, away: 1180 },
    { category: 'HRs', home: 165, away: 148 },
    { category: 'RBIs', home: 460, away: 425 },
  ],
  tennis: [
    { category: 'Aces', home: 892, away: 0 },
    { category: 'Winners', home: 2450, away: 0 },
    { category: 'Break Points', home: 345, away: 0 },
    { category: 'Matches Won', home: 68, away: 0 },
  ],
};

export function SeasonStats({ sport }: SeasonStatsProps) {
  const data = statsData[sport as keyof typeof statsData] || statsData.football;
  const isTennis = sport === 'tennis';

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Season Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="category" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            {!isTennis && <Legend />}
            <Bar dataKey="home" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            {!isTennis && <Bar dataKey="away" fill="#10b981" radius={[4, 4, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

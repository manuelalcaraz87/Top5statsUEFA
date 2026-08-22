import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceChartProps {
  sport: string;
}

const chartData = {
  football: [
    { week: 'Week 1', goals: 2.3, assists: 1.1 },
    { week: 'Week 5', goals: 2.5, assists: 1.3 },
    { week: 'Week 10', goals: 2.7, assists: 1.4 },
    { week: 'Week 15', goals: 2.9, assists: 1.6 },
    { week: 'Week 20', goals: 2.8, assists: 1.5 },
    { week: 'Week 26', goals: 3.1, assists: 1.7 },
  ],
  basketball: [
    { week: 'Week 2', points: 108, rebounds: 42 },
    { week: 'Week 6', points: 112, rebounds: 44 },
    { week: 'Week 10', points: 115, rebounds: 45 },
    { week: 'Week 14', points: 118, rebounds: 46 },
    { week: 'Week 18', points: 116, rebounds: 47 },
    { week: 'Week 22', points: 120, rebounds: 48 },
  ],
  baseball: [
    { week: 'Week 4', avg: 0.265, hrs: 1.8 },
    { week: 'Week 8', avg: 0.272, hrs: 2.0 },
    { week: 'Week 12', avg: 0.278, hrs: 2.2 },
    { week: 'Week 16', avg: 0.281, hrs: 2.4 },
    { week: 'Week 20', avg: 0.285, hrs: 2.5 },
    { week: 'Week 24', avg: 0.288, hrs: 2.6 },
  ],
  tennis: [
    { week: 'Jan', aces: 12.5, wins: 85 },
    { week: 'Mar', aces: 13.2, wins: 87 },
    { week: 'May', aces: 13.8, wins: 88 },
    { week: 'Jul', aces: 14.1, wins: 86 },
    { week: 'Sep', aces: 14.5, wins: 89 },
    { week: 'Nov', aces: 15.0, wins: 90 },
  ],
};

export function PerformanceChart({ sport }: PerformanceChartProps) {
  const data = chartData[sport as keyof typeof chartData] || chartData.football;
  
  const getConfig = () => {
    switch (sport) {
      case 'basketball':
        return { line1: 'points', line2: 'rebounds', title: 'Team Performance Trends' };
      case 'baseball':
        return { line1: 'avg', line2: 'hrs', title: 'Batting Statistics' };
      case 'tennis':
        return { line1: 'aces', line2: 'wins', title: 'Player Performance' };
      default:
        return { line1: 'goals', line2: 'assists', title: 'Scoring Trends' };
    }
  };

  const config = getConfig();

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={config.line1}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey={config.line2}
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

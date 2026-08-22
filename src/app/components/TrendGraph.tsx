import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendGraphProps {
  leagueName: string;
  leagueColor: string;
}

const trendData = [
  { week: 'Week 1', goals: 2.3 },
  { week: 'Week 5', goals: 2.5 },
  { week: 'Week 10', goals: 2.7 },
  { week: 'Week 15', goals: 2.9 },
  { week: 'Week 20', goals: 2.8 },
  { week: 'Week 26', goals: 3.1 },
];

export function TrendGraph({ leagueName, leagueColor }: TrendGraphProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Goals Per Match Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id={`colorGoals-${leagueName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={leagueColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={leagueColor} stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="goals"
              stroke={leagueColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#colorGoals-${leagueName})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Target } from 'lucide-react';

interface GoalsDistributionChartProps {
  leagueName: string;
  leagueColor: string;
}

const goalsData: Record<string, any[]> = {
  'La Liga': [
    { name: 'Top 5 Teams', value: 45, percentage: 28 },
    { name: 'Mid 5 Teams', value: 68, percentage: 42 },
    { name: 'Bottom 5 Teams', value: 48, percentage: 30 },
  ],
  'EPL': [
    { name: 'Top 5 Teams', value: 42, percentage: 25 },
    { name: 'Mid 5 Teams', value: 72, percentage: 43 },
    { name: 'Bottom 5 Teams', value: 54, percentage: 32 },
  ],
  'Serie A': [
    { name: 'Top 5 Teams', value: 38, percentage: 26 },
    { name: 'Mid 5 Teams', value: 65, percentage: 44 },
    { name: 'Bottom 5 Teams', value: 44, percentage: 30 },
  ],
  'Bundesliga': [
    { name: 'Top 5 Teams', value: 48, percentage: 27 },
    { name: 'Mid 5 Teams', value: 76, percentage: 43 },
    { name: 'Bottom 5 Teams', value: 53, percentage: 30 },
  ],
  'Ligue 1': [
    { name: 'Top 5 Teams', value: 40, percentage: 28 },
    { name: 'Mid 5 Teams', value: 60, percentage: 42 },
    { name: 'Bottom 5 Teams', value: 43, percentage: 30 },
  ],
};

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export function GoalsDistributionChart({ leagueName, leagueColor }: GoalsDistributionChartProps) {
  const data = goalsData[leagueName] || goalsData['La Liga'];
  const totalGoals = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-slate-900 mb-1">{payload[0].name}</p>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">{payload[0].value}</span> goals ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader className="pb-3" style={{ backgroundColor: leagueColor }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="w-5 h-5" />
          Goals Distribution - {leagueName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="text-center mb-6">
            <p className="text-3xl text-slate-900">{totalGoals}</p>
            <p className="text-sm text-slate-600">Total Goals</p>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3">
            {data.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-slate-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="w-full mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">Insight:</span> Most goals scored against mid-table teams, 
              indicating strong performance against moderate opposition.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

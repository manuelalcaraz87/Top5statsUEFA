import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendUp: boolean;
}

export function StatsCard({ icon, title, value, subtitle, trend, trendUp }: StatsCardProps) {
  return (
    <Card className="border-slate-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
          {trendUp ? (
            <ArrowUp className="w-4 h-4 text-green-600" />
          ) : (
            <ArrowDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-slate-500'}`}>
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

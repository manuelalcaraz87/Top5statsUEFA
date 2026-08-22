import { Card, CardContent } from './ui/card';

interface StatWidgetProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

export function StatWidget({ icon, title, value, subtitle, color }: StatWidgetProps) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg text-white" style={{ backgroundColor: color }}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-slate-900 mb-1 truncate">{value}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

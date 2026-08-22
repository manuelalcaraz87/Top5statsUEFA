import { TrendingUp, Users, Award, Activity } from 'lucide-react';

export function StatsSidebar() {
  const quickStats = [
    {
      id: 1,
      title: 'Total Matches Today',
      value: '18',
      icon: Activity,
      color: '#004976',
    },
    {
      id: 2,
      title: 'Live Matches',
      value: '6',
      icon: TrendingUp,
      color: '#ee8707',
    },
    {
      id: 3,
      title: 'Top Leagues',
      value: '5',
      icon: Award,
      color: '#3d195b',
    },
    {
      id: 4,
      title: 'Featured Players',
      value: '25',
      icon: Users,
      color: '#024494',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Highlights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-gray-900 mb-4">Upcoming Highlights</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-900 mb-1">El Clásico</p>
            <p className="text-xs text-gray-600">Real Madrid vs Barcelona</p>
            <p className="text-xs text-purple-600 mt-2">Sunday, 18:30</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-900 mb-1">Derby della Madonnina</p>
            <p className="text-xs text-gray-600">Inter vs AC Milan</p>
            <p className="text-xs text-blue-600 mt-2">Saturday, 19:45</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg border border-red-100">
            <p className="text-sm text-gray-900 mb-1">Der Klassiker</p>
            <p className="text-xs text-gray-600">Bayern vs Dortmund</p>
            <p className="text-xs text-red-600 mt-2">Saturday, 16:30</p>
          </div>
        </div>
      </div>

      {/* League Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-gray-900 mb-4">League Distribution</h3>
        <div className="space-y-2">
          {[
            { name: 'La Liga', matches: 4, color: '#ee8707' },
            { name: 'EPL', matches: 4, color: '#3d195b' },
            { name: 'Serie A', matches: 4, color: '#024494' },
            { name: 'Bundesliga', matches: 3, color: '#d20515' },
            { name: 'Ligue 1', matches: 3, color: '#dae025' },
          ].map((league) => (
            <div key={league.name} className="flex items-center gap-3">
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: league.color }}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{league.name}</p>
              </div>
              <span className="text-sm text-gray-600">{league.matches} matches</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Trophy, Goal, Users, Shield, Activity, Hand } from 'lucide-react';
import { useTop5Data } from './top5/top5Data';
import { Top5Tab } from './top5/Top5Tab';
import { ClubsTab } from './top5/ClubsTab';
import { StrikersTab } from './top5/StrikersTab';
import { CreatorsTab } from './top5/CreatorsTab';
import { DefendersTab } from './top5/DefendersTab';
import { GoalkeepersTab } from './top5/GoalkeepersTab';

// Top 5 area on the home page: the tab bar. Each tab lives in its own file
// in ./top5/.

type TabId = 'top5' | 'clubs' | 'strikers' | 'creators' | 'defenders' | 'goalkeepers';

const TABS: { id: TabId; label: string; icon: typeof Trophy }[] = [
  { id: 'top5',        label: 'Top 5',       icon: Trophy },
  { id: 'clubs',       label: 'Clubs',       icon: Users },
  { id: 'strikers',    label: 'Strikers',    icon: Goal },
  { id: 'creators',    label: 'Creators',    icon: Activity },
  { id: 'defenders',   label: 'Defenders',   icon: Shield },
  { id: 'goalkeepers', label: 'Goalkeepers', icon: Hand },
];

export function TopStatsSection() {
  const [activeTab, setActiveTab] = useState<TabId>('top5');
  const data = useTop5Data();

  return (
    <div className="bg-[#111111] rounded-lg shadow-xl border border-gray-800 overflow-hidden">
      {/* Tabs */}
      <div
        className="bg-[#0d0d0d] border-b border-gray-800 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex min-w-max sm:min-w-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-4 whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-white bg-[#2a2a2a] text-white'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'top5'        && <Top5Tab data={data} />}
        {activeTab === 'clubs'       && <ClubsTab data={data.clubs} />}
        {activeTab === 'strikers'    && <StrikersTab data={data.strikers} />}
        {activeTab === 'creators'    && <CreatorsTab data={data.creators} />}
        {activeTab === 'defenders'   && <DefendersTab data={data.defenders} />}
        {activeTab === 'goalkeepers' && <GoalkeepersTab data={data.goalkeepers} />}
      </div>
    </div>
  );
}

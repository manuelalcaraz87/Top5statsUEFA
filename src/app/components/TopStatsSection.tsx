import { useState } from 'react';
import { CATEGORIES, useTop5Data, type Top5League } from './top5/top5Data';
import { NEUTRAL_COLOUR } from './top5/categoryColours';
import { Top5Tab } from './top5/Top5Tab';
import { ClubsTab } from './top5/ClubsTab';
import { StrikersTab } from './top5/StrikersTab';
import { CreatorsTab } from './top5/CreatorsTab';
import { DefendersTab } from './top5/DefendersTab';
import { GoalkeepersTab } from './top5/GoalkeepersTab';

// Top 5 area: the tab bar. Each tab lives in its own file in ./top5/.
// Home page: no league (five leagues combined). League pages pass their
// league so every tab shows only that competition.

type TabId = 'top5' | 'clubs' | 'strikers' | 'creators' | 'defenders' | 'goalkeepers';

// Each tab has a small square in its colour; the Top 5 tab is neutral grey.
const TABS: { id: TabId; label: string; colour: string }[] = [
  { id: 'top5',        label: 'Top 5',       colour: NEUTRAL_COLOUR },
  { id: 'clubs',       label: 'Clubs',       colour: CATEGORIES.clubs.colour },
  { id: 'strikers',    label: 'Strikers',    colour: CATEGORIES.strikers.colour },
  { id: 'creators',    label: 'Creators',    colour: CATEGORIES.creators.colour },
  { id: 'defenders',   label: 'Defenders',   colour: CATEGORIES.defenders.colour },
  { id: 'goalkeepers', label: 'Goalkeepers', colour: CATEGORIES.goalkeepers.colour },
];

export function TopStatsSection({ league }: { league?: Top5League }) {
  const [activeTab, setActiveTab] = useState<TabId>('top5');
  const data = useTop5Data(league);

  return (
    <div className="bg-[#111111] rounded-lg shadow-xl border border-gray-800 overflow-clip">
      {/* Tabs */}
      <div
        className="bg-[#0d0d0d] border-b border-gray-800 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex min-w-max sm:min-w-0">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 sm:px-6 ${
                  active ? 'bg-[#1a1a1a] text-white' : 'border-transparent text-gray-300 hover:bg-[#252525] hover:text-white'
                }`}
                style={active ? { borderBottomColor: tab.colour } : undefined}
              >
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: tab.colour }} />
                <span className="text-display text-sm sm:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'top5'        && <Top5Tab data={data} league={league} />}
        {activeTab === 'clubs'       && <ClubsTab data={data.clubs} league={league} />}
        {activeTab === 'strikers'    && <StrikersTab data={data.strikers} />}
        {activeTab === 'creators'    && <CreatorsTab data={data.creators} />}
        {activeTab === 'defenders'   && <DefendersTab data={data.defenders} />}
        {activeTab === 'goalkeepers' && <GoalkeepersTab data={data.goalkeepers} />}
      </div>
    </div>
  );
}

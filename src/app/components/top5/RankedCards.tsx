import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { LeagueBadge } from '../LeagueBadge';
import { OpponentsMeter, ScoreRing, ThinBar, statBarFractions } from './charts';
import { WherePanel, WhyPanel } from './panels';
import { OpponentsInfo, formatStat } from './shared';
import type { Category, Top5Entry } from './top5Data';

// The ranked cards for a category, with the two side panels beside them (below
// them on a phone). Choosing a card (click, or Enter / Space on its name)
// switches "Why this score" to that card. The first card is chosen at first.

export function RankedCards({ category, entries }: { category: Category; entries: Top5Entry[] }) {
  const [chosenKey, setChosenKey] = useState<string | null>(null);
  const chosenIndex = Math.max(0, entries.findIndex(e => e.key === chosenKey));
  const chosen = entries[chosenIndex];
  const fractions = statBarFractions(entries.map(e => e.stats), category.lowerIsBetter);
  const { colour } = category;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <ol className="space-y-3">
        {entries.map((entry, index) => {
          const isChosen = index === chosenIndex;
          const choose = () => setChosenKey(entry.key);
          // Clicking anywhere on the card chooses it, except on the info button.
          const onCardClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('[data-keep-choice]')) choose();
          };
          const onNameKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              choose();
            }
          };
          return (
            <li
              key={entry.key}
              onClick={onCardClick}
              className="cursor-pointer rounded-xl border-2 bg-[#16181d] p-3 transition-colors hover:bg-[#1b1e24] focus-within:ring-2 focus-within:ring-white/60 sm:p-4"
              style={{ borderColor: isChosen ? colour : '#2a2c33' }}
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-4 xl:grid-cols-[auto_minmax(0,1.2fr)_auto_minmax(0,3.4fr)_auto] xl:gap-x-5">
                <span
                  className="text-display flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                  style={
                    index === 0
                      ? { backgroundColor: colour, color: '#111111', outline: '1px solid #f4c95d' }
                      : { backgroundColor: '#2a2c33', color: '#e5e7eb' }
                  }
                >
                  <span className="sr-only">Number </span>
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={isChosen}
                    onClick={e => { e.stopPropagation(); choose(); }}
                    onKeyDown={onNameKey}
                    className="block max-w-full truncate rounded text-left text-base font-bold text-white focus:outline-none focus-visible:underline"
                  >
                    {entry.name}
                    <span className="sr-only">, show why this score</span>
                  </button>
                  <div className="mt-1 flex items-center gap-1.5">
                    <LeagueBadge league={entry.league} size={18} />
                    {entry.club !== entry.name && (
                      <span className="truncate text-xs text-gray-300">{entry.club}</span>
                    )}
                  </div>
                </div>

                <ScoreRing score={entry.top5Score} colour={colour} size={68} gold={index === 0} />

                <dl className="col-span-3 grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-5 xl:col-span-1">
                  {category.statLabels.map((label, i) => (
                    <div key={label} className="min-w-0">
                      <dt className="min-h-[2.1em] text-[11px] leading-tight text-gray-400">{label}</dt>
                      <dd className="mt-0.5 text-lg font-bold tabular-nums leading-tight text-white">
                        {formatStat(entry.stats[i])}
                      </dd>
                      <div className="mt-1.5">
                        <ThinBar fraction={fractions[index][i] ?? 0} colour={colour} />
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="col-span-3 xl:col-span-1">
                  <p className="mb-1 whitespace-nowrap text-[11px] leading-tight text-gray-400">
                    Opponents faced
                    <span data-keep-choice><OpponentsInfo /></span>
                  </p>
                  <OpponentsMeter level={entry.opponentsFaced} colour={colour} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <aside className="space-y-4" aria-label="Charts for this list">
        <WherePanel entries={entries} category={category} />
        <WhyPanel entry={chosen} rank={chosenIndex + 1} category={category} />
      </aside>
    </div>
  );
}

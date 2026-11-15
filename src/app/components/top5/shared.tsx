import { useEffect, useRef, useState } from 'react';
import { ClubCrest } from '../ClubCrest';
import { LeagueBadge } from '../LeagueBadge';
import { NoCurrentData } from '../NoCurrentData';
import type { Category, CategoryData, CategoryId, StatValue } from './top5Data';

// Building blocks shared by the Top 5 tabs.

export const DASH = '–';

export function formatStat(value: StatValue): string {
  return value === null || value === '' ? DASH : String(value);
}

/** Top5 Score with one decimal; "–" when a club has no score. */
export function ScoreValue({ score, large = false }: { score: number | null; large?: boolean }) {
  return (
    <p className={`font-bold tabular-nums text-white ${large ? 'text-center text-4xl' : 'text-base'}`}>
      {score === null ? DASH : score.toFixed(1)}
    </p>
  );
}

/** When the scores file was generated, in the visitor's local time. */
export function LastUpdated({ time }: { time: Date | null }) {
  return (
    <p className="text-xs text-gray-500">
      Last updated{' '}
      {time ? time.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : DASH}
    </p>
  );
}

const OPPONENTS_INFO =
  'How tough this schedule has been so far, compared with others in this list. Hard = toughest third, Average = middle third, Easy = gentlest third. Tougher opponents make each action count for more in the score.';

/** Small info button beside "Opponents faced". Opens on click or focus; closes on Escape or clicking away. */
export function OpponentsInfo() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 256 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const show = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = Math.min(256, window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 8));
      setPos({ top: rect.bottom + 6, left, width });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !popRef.current?.contains(target)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="What does Opponents faced mean?"
        aria-expanded={open}
        onClick={show}
        onFocus={show}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-500 align-middle text-[10px] font-semibold leading-none text-gray-300 hover:border-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
      >
        i
      </button>
      {open && (
        <div
          ref={popRef}
          role="dialog"
          aria-label="Opponents faced"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
          className="z-50 rounded-lg border border-gray-700 bg-[#111111] p-3 text-left text-xs font-normal normal-case leading-snug tracking-normal text-gray-200 shadow-lg"
        >
          {OPPONENTS_INFO}
        </div>
      )}
    </>
  );
}

const PLAYER_INTRO =
  'We score every player on what he does per 90 minutes, counting actions against tougher opponents and in tougher leagues for more.';
const PLAYER_SENTENCES = [
  `${PLAYER_INTRO} 50 is an average player in that role and 98 is the best in Europe right now.`,
  "Players need at least half of their team's minutes to be ranked.",
];
const PLAYER_SENTENCES_COMPETITION = [
  `${PLAYER_INTRO} 50 is an average player in this competition and 98 is its best right now. Only matches in this competition count.`,
  "Players need at least half of their team's minutes to be ranked.",
];

const CLUB_SENTENCE =
  'We rank every club on league results, goal difference and recent form, adjusted for league strength and opponents. Champions League results then add up to 3 points or take away up to 1.5.';

const OPPONENTS_TEXT: Record<CategoryId, string> = {
  clubs:
    "We rate every opponent by the points it wins per game. This label shows whether this club's opponents so far were among the toughest, the middle or the gentlest third.",
  strikers:
    "We rate every opponent's defence by the goals it concedes and the points it wins. This label shows whether the defences this player has faced were among the toughest, the middle or the gentlest third. A goal or assist against a tough defence counts for more.",
  creators:
    "We rate every opponent's defence by the goals it concedes and the points it wins. This label shows whether the defences this player has faced were among the toughest, the middle or the gentlest third. A goal or assist against a tough defence counts for more.",
  defenders:
    "We rate every opponent's attack by the goals it scores and the points it wins. This label shows whether the attacks this player has faced were among the toughest, the middle or the gentlest third. Stopping a strong attack counts for more, and conceding to one counts for less.",
  goalkeepers:
    "We rate every opponent's attack by the goals it scores and the points it wins. This label shows whether the attacks this player has faced were among the toughest, the middle or the gentlest third. Stopping a strong attack counts for more, and conceding to one counts for less.",
};
const OPPONENTS_NOTE = 'It describes the schedule, not the performance, and it evens out as the season goes on.';

const HOW_CALCULATED: Record<CategoryId, { sentences: string[]; weights: [string, string][] }> = {
  clubs: {
    sentences: [CLUB_SENTENCE],
    weights: [['League points per game', '50%'], ['Goal difference per game', '31%'], ['Last five league matches', '19%']],
  },
  strikers: {
    sentences: PLAYER_SENTENCES,
    weights: [
      ['Goals per 90 (a penalty counts as half)', '50%'], ['Shots on target per 90', '20%'],
      ['Assists per 90', '15%'], ['Key passes per 90', '15%'],
    ],
  },
  creators: {
    sentences: PLAYER_SENTENCES,
    weights: [['Assists per 90', '55%'], ['Key passes per 90', '45%']],
  },
  defenders: {
    sentences: PLAYER_SENTENCES,
    weights: [
      ['Team goals conceded while he plays', '35%'], ['Tackles + interceptions per 90', '25%'],
      ['Duels won %', '20%'], ['Goals + assists per 90', '10%'], ['Blocks per 90', '5%'], ['Fouls and cards', '5%'],
    ],
  },
  goalkeepers: {
    sentences: PLAYER_SENTENCES,
    weights: [['Save %', '45%'], ['Goals conceded per 90', '30%'], ['Clean-sheet rate', '15%'], ['Saves per 90', '10%']],
  },
};

function HowCalculated({ id, inCompetition }: { id: CategoryId; inCompetition: boolean }) {
  const { sentences: homeSentences, weights } = HOW_CALCULATED[id];
  let sentences = homeSentences;
  if (id === 'clubs') {
    sentences = [
      ...homeSentences,
      inCompetition
        ? "Scores here use this competition's matches only."
        : 'Scores here combine league and Champions League matches.',
    ];
  } else if (inCompetition) {
    sentences = PLAYER_SENTENCES_COMPETITION;
  } else {
    sentences = [...homeSentences, 'Scores here combine league and Champions League matches.'];
  }
  return (
    <div className="mt-6 rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <h4 className="mb-2 text-sm font-medium text-gray-200">How this score is calculated</h4>
      {sentences.map(text => (
        <p key={text} className="mb-2 text-sm text-gray-400">{text}</p>
      ))}
      <dl className="mt-3 space-y-1.5 border-t border-gray-800 pt-3">
        {weights.map(([label, pct]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="text-gray-400">{label}</dt>
            <dd className="tabular-nums text-gray-100">{pct}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 border-t border-gray-800 pt-3">
        <h5 className="mb-1 text-sm font-medium text-gray-200">Opponents faced</h5>
        <p className="mb-2 text-sm text-gray-400">{OPPONENTS_TEXT[id]}</p>
        <p className="text-sm text-gray-400">{OPPONENTS_NOTE}</p>
      </div>
    </div>
  );
}

/** One category tab: top-5 table, last-updated time and the explanation panel. */
export function CategoryTable({ category, data, title }: {
  category: Category;
  data: CategoryData;
  /** Heading above the table; defaults to "Top 5 <category>". */
  title?: string;
}) {
  const { entries, loading, lastUpdated, tableAsOf, checkingLive } = data;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-gray-100">{title ?? `Top 5 ${category.label}`}</h3>
        <LastUpdated time={lastUpdated} />
      </div>

      {entries.length === 0 ? (
        <NoCurrentData loading={loading} />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="px-2 pb-3 text-left font-normal">#</th>
                <th className="pb-3 text-left font-normal">Name</th>
                <th className="px-2 pb-3 text-center font-normal">Top5 Score</th>
                <th className="px-2 pb-3 text-center font-normal">Opponents faced<OpponentsInfo /></th>
                {category.statLabels.map(label => (
                  <th key={label} className="px-2 pb-3 text-center font-normal">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.key} className="border-b border-gray-800 transition-colors hover:bg-white/5">
                  <td className="px-2 py-3 text-sm text-gray-400">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <ClubCrest club={entry.club} size={28} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-100">{entry.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          {entry.club !== entry.name && (
                            <span className="truncate text-xs text-gray-400">{entry.club}</span>
                          )}
                          <LeagueBadge league={entry.league} size={16} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center"><ScoreValue score={entry.top5Score} /></td>
                  <td className="px-2 py-3 text-center text-sm text-gray-200">{entry.opponentsFaced ?? DASH}</td>
                  {entry.stats.map((value, i) => (
                    <td key={i} className="px-2 py-3 text-center text-sm tabular-nums text-gray-200">
                      {formatStat(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tableAsOf && entries.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          Table as of {tableAsOf.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          {checkingLive ? '. Checking for live numbers…' : ''}
        </p>
      )}

      {data.league && category.id !== 'clubs' && entries.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          A player's score here can differ from the home page, which compares all five leagues.
        </p>
      )}

      <HowCalculated id={category.id} inCompetition={Boolean(data.league)} />
    </div>
  );
}

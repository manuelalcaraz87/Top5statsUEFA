import { useEffect, useRef, useState } from 'react';
import { ClubCrest } from '../ClubCrest';
import { LeagueBadge } from '../LeagueBadge';
import { OpponentsMeter, ScoreChip } from './charts';
import { StreakBadge } from './StreakBadge';
import {
  FILE_CATEGORY, findFileEntry, formatWeight, listForLeague, listFromEntryKey, matchesThroughOf, rankMove, useScores,
} from '../../services/scoresService';
import type { Ingredient, ScoresFile } from '../../services/scoresService';
import type { Category, CategoryData, CategoryId, StatValue, Top5Entry } from './top5Data';

// Building blocks shared by the Top 5 tabs.

export const DASH = '–';

export function formatStat(value: StatValue): string {
  return value === null || value === '' ? DASH : String(value);
}

/** Which matches the scores include and when they were last checked, in the visitor's local time. */
export function LastUpdated({ time }: { time: Date | null }) {
  const { scores } = useScores(); // re-renders when a newer file arrives
  const through = matchesThroughOf(scores);
  const checked = time ? time.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : DASH;
  if (!through) {
    return (
      <p className="text-xs text-gray-300">
        Last updated{' '}
        {checked}
      </p>
    );
  }
  return (
    <p className="text-xs text-gray-300">
      <span className="block">
        Includes matches up to {through.toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
      </span>
      <span className="block">Updated hourly after matches · last check {checked}</span>
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

const HOW_CALCULATED: Record<CategoryId, { sentences: string[] }> = {
  clubs: {
    sentences: [CLUB_SENTENCE],
  },
  strikers: {
    sentences: PLAYER_SENTENCES,
  },
  creators: {
    sentences: PLAYER_SENTENCES,
  },
  defenders: {
    sentences: PLAYER_SENTENCES,
  },
  goalkeepers: {
    sentences: PLAYER_SENTENCES,
  },
};

/** The ingredients (name + weight) of the first entry of this category on this page's list in the scores file, or null if unavailable. */
function liveIngredients(scores: ScoresFile | null, id: CategoryId, leagueId?: string): Ingredient[] | null {
  const first = scores?.categories?.[FILE_CATEGORY[id]]?.[listForLeague(leagueId)]?.[0];
  return first?.ingredients?.length ? first.ingredients : null;
}

export function HowCalculated({ id, inCompetition, leagueId }: { id: CategoryId; inCompetition: boolean; leagueId?: string }) {
  const { sentences: homeSentences } = HOW_CALCULATED[id];
  const { scores } = useScores();
  const ingredients = liveIngredients(scores, id, leagueId);
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
      <h4 className="text-display mb-2 text-sm text-gray-200">How this score is calculated</h4>
      {sentences.map(text => (
        <p key={text} className="mb-2 text-sm text-gray-400">{text}</p>
      ))}
      {ingredients && (
        <dl className="mt-3 space-y-1.5 border-t border-gray-800 pt-3">
          {ingredients.map(({ key, label, weight }) => (
            <div key={key} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-gray-400">{label}</dt>
              <dd className="tabular-nums text-gray-100">{formatWeight(weight)}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-3 border-t border-gray-800 pt-3">
        <h5 className="text-display mb-1 text-sm text-gray-200">Opponents faced</h5>
        <p className="mb-2 text-sm text-gray-400">{OPPONENTS_TEXT[id]}</p>
        <p className="text-sm text-gray-400">{OPPONENTS_NOTE}</p>
      </div>
      <div className="mt-3 border-t border-gray-800 pt-3">
        <h5 className="text-display mb-1 text-sm text-gray-200">Streak badges</h5>
        <p className="text-sm text-gray-400">A badge marks a current run, such as goals in three or more appearances in a row. Badges use real match results and never change the Top5 Score.</p>
      </div>
    </div>
  );
}

/** The league / competition table (Clubs tab on a league page): a compact table with a small score chip. */
/**
 * A small marker beside a rank: "▲7" (moved up 7 places), "▼2" or "New", with
 * the explanation on hover and keyboard focus and as the screen-reader label.
 * It sits under the rank without taking any width, and uses the site's plain
 * grey text. Nothing is shown when there is no change information, when the
 * rank did not move, or when the number shown is not the file's own rank.
 */
export function RankMarker({ entry, category, rank }: { entry: Top5Entry; category: Category; rank: number }) {
  const { scores } = useScores();
  const list = listFromEntryKey(entry.key);
  if (!scores || !list) return null;
  const fileEntry = findFileEntry(scores, FILE_CATEGORY[category.id], list, entry.name, entry.club);
  if (!fileEntry || fileEntry.rank !== rank) return null;
  const move = rankMove(fileEntry, entry.club);
  if (!move) return null;
  const text = move.places === null ? 'New' : move.places > 0 ? `▲${move.places}` : `▼${Math.abs(move.places)}`;
  return (
    <span
      role="img"
      tabIndex={0}
      aria-label={move.sentence}
      className="group absolute left-1/2 top-full z-10 -translate-x-1/2 whitespace-nowrap rounded text-[10px] font-semibold leading-3 text-gray-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
    >
      <span aria-hidden="true">{text}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-0 mb-1 hidden w-max max-w-[14rem] whitespace-normal rounded border border-[#2a2c33] bg-[#0f1115] px-2 py-1 text-left text-xs font-normal leading-tight text-gray-200 group-hover:block group-focus:block"
      >
        {move.sentence}
      </span>
    </span>
  );
}

export function CategoryTable({ category, data }: { category: Category; data: CategoryData }) {
  const { entries, tableAsOf, checkingLive } = data;
  return (
    <div>
      <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[840px]">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-400">
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
                <td className="px-2 py-3">
                  <span className="relative inline-block">
                    <span
                      className="text-display inline-block min-w-[1.75rem] rounded-md px-1.5 text-center text-base text-gray-400"
                      style={index === 0 ? { outline: '1px solid #f4c95d' } : undefined}
                    >
                      {index + 1}
                    </span>
                    <RankMarker entry={entry} category={category} rank={index + 1} />
                  </span>
                </td>
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
                      {entry.badge && <div className="mt-1"><StreakBadge badge={entry.badge} colour={category.colour} /></div>}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-center"><ScoreChip score={entry.top5Score} colour={category.colour} gold={index === 0} /></td>
                <td className="px-2 py-3 text-center">
                  <OpponentsMeter level={entry.opponentsFaced} colour={category.colour} align="center" />
                </td>
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

      {tableAsOf && (
        <p className="mt-3 text-xs text-gray-400">
          Table as of {tableAsOf.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          {checkingLive ? '. Checking for live numbers…' : ''}
        </p>
      )}
    </div>
  );
}

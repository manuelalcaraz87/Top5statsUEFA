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
  const { entries, loading, lastUpdated } = data;
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
                <th className="px-2 pb-3 text-center font-normal">Opponents</th>
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

      {data.league && category.id !== 'clubs' && entries.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          A player's score here can differ from the home page, which compares all five leagues.
        </p>
      )}

      <HowCalculated id={category.id} inCompetition={Boolean(data.league)} />
    </div>
  );
}

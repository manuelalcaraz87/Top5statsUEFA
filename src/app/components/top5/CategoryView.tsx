import { NoCurrentData } from '../NoCurrentData';
import { RankedCards } from './RankedCards';
import { CategoryTable, HowCalculated, LastUpdated } from './shared';
import { withAlpha } from './categoryColours';
import type { Category, CategoryData } from './top5Data';

// One category tab: the colour-tinted header band, then the ranked cards with
// their charts (or, for the Clubs table on a league page, the compact table),
// then "How this score is calculated".
export function CategoryView({ category, data, title }: {
  category: Category;
  data: CategoryData;
  /** Heading in the band; defaults to "Top 5 <category>". */
  title?: string;
}) {
  const { entries, loading, lastUpdated, league } = data;
  const showTable = Boolean(league) && category.id === 'clubs';
  return (
    <div>
      <div
        className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-xl border px-4 py-4 sm:px-5"
        style={{ backgroundColor: withAlpha(category.colour, 0.09), borderColor: withAlpha(category.colour, 0.35) }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: category.colour }}>
            {category.label}
          </p>
          <h3 className="text-display text-xl text-white">{title ?? `Top 5 ${category.label}`}</h3>
        </div>
        <LastUpdated time={lastUpdated} />
      </div>

      {entries.length === 0 ? (
        <NoCurrentData loading={loading} />
      ) : showTable ? (
        <CategoryTable category={category} data={data} />
      ) : (
        <RankedCards category={category} entries={entries} />
      )}

      {league && category.id !== 'clubs' && entries.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          A player's score here can differ from the home page, which compares all five leagues.
        </p>
      )}

      <HowCalculated id={category.id} inCompetition={Boolean(league)} />
    </div>
  );
}

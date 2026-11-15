import { CATEGORIES, type CategoryData, type Top5League } from './top5Data';
import { CategoryView } from './CategoryView';

// Clubs tab. Home page: top 5 clubs across the five leagues.
// League page: the competition's full table (every club), same columns.
export function ClubsTab({ data, league }: { data: CategoryData; league?: Top5League }) {
  return (
    <CategoryView
      category={CATEGORIES.clubs}
      data={data}
      title={league ? `${league.label ?? league.name} table` : undefined}
    />
  );
}

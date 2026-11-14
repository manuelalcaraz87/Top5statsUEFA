import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryTable } from './shared';

// Clubs tab: top 5 clubs table, then "How this score is calculated".
export function ClubsTab({ data }: { data: CategoryData }) {
  return <CategoryTable category={CATEGORIES.clubs} data={data} />;
}

import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryTable } from './shared';

// Defenders tab: top 5 defenders table, then "How this score is calculated".
export function DefendersTab({ data }: { data: CategoryData }) {
  return <CategoryTable category={CATEGORIES.defenders} data={data} />;
}

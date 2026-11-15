import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryView } from './CategoryView';

// Defenders tab: top 5 defenders cards and charts, then "How this score is calculated".
export function DefendersTab({ data }: { data: CategoryData }) {
  return <CategoryView category={CATEGORIES.defenders} data={data} />;
}

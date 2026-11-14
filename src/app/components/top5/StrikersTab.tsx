import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryTable } from './shared';

// Strikers tab: top 5 strikers table, then "How this score is calculated".
export function StrikersTab({ data }: { data: CategoryData }) {
  return <CategoryTable category={CATEGORIES.strikers} data={data} />;
}

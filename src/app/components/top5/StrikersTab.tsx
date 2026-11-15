import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryView } from './CategoryView';

// Strikers tab: top 5 strikers cards and charts, then "How this score is calculated".
export function StrikersTab({ data }: { data: CategoryData }) {
  return <CategoryView category={CATEGORIES.strikers} data={data} />;
}

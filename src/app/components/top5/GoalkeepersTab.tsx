import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryView } from './CategoryView';

// Goalkeepers tab: top 5 goalkeepers cards and charts, then "How this score is calculated".
export function GoalkeepersTab({ data }: { data: CategoryData }) {
  return <CategoryView category={CATEGORIES.goalkeepers} data={data} />;
}

import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryTable } from './shared';

// Goalkeepers tab: top 5 goalkeepers table, then "How this score is calculated".
export function GoalkeepersTab({ data }: { data: CategoryData }) {
  return <CategoryTable category={CATEGORIES.goalkeepers} data={data} />;
}

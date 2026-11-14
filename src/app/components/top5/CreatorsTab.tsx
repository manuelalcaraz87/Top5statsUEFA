import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryTable } from './shared';

// Creators tab: top 5 creators table, then "How this score is calculated".
export function CreatorsTab({ data }: { data: CategoryData }) {
  return <CategoryTable category={CATEGORIES.creators} data={data} />;
}

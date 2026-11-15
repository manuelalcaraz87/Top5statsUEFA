import { CATEGORIES, type CategoryData } from './top5Data';
import { CategoryView } from './CategoryView';

// Creators tab: top 5 creators cards and charts, then "How this score is calculated".
export function CreatorsTab({ data }: { data: CategoryData }) {
  return <CategoryView category={CATEGORIES.creators} data={data} />;
}

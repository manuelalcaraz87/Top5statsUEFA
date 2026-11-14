// Honest empty state: shown wherever real data is missing (see CLAUDE.md
// "Hard rules"). While a request is still in flight it says "Loading…".

export const NO_CURRENT_DATA = 'No current data';

export function NoCurrentData({ title, loading = false, compact = false }: {
  title?: string;
  loading?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`bg-[#1a1a1a] rounded-lg border border-gray-800 ${compact ? 'p-3' : 'p-5'}`}>
      {title && <p className="text-gray-300 font-medium text-sm mb-1">{title}</p>}
      <p className={`text-sm ${loading ? 'text-gray-600 italic' : 'text-gray-500'}`}>
        {loading ? 'Loading…' : NO_CURRENT_DATA}
      </p>
    </div>
  );
}

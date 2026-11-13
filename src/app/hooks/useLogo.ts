// League logo fetching has been removed (see CLAUDE.md "Hard rules").
// useLeagueLogo is kept so LeagueBadge still compiles; it always returns null,
// which makes LeagueBadge use its built-in fallback. It will be removed in a
// follow-up task.
export function useLeagueLogo(_leagueName: string): string | null {
  return null;
}

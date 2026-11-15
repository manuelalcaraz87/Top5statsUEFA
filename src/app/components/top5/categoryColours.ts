// The site's own category colours, defined once. Never league or club colours.
// Everything that needs a category colour (tabs, bands, rings, bars, dots)
// reads it from here.

export const CATEGORY_COLOURS = {
  clubs: '#7FA8E8',
  strikers: '#F5B83D',
  creators: '#B79CF2',
  defenders: '#5FD0B5',
  goalkeepers: '#F28B82',
} as const;

/** Neutral grey used for the "Top 5" tab, which belongs to no category. */
export const NEUTRAL_COLOUR = '#9CA3AF';

/** The colour with a transparency (0-1), for tinted backgrounds and borders. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

import type { Top5Entry } from './top5Data';

const WORDS: Record<string, string> = { W: 'won', D: 'drew', L: 'lost' };

/** A club's last five results and (home page) Champions League record. Nothing when it has neither. */
export function ClubExtras({ entry, lastFiveLabel }: { entry: Top5Entry; lastFiveLabel: string }) {
  const form = entry.form && entry.form.length > 0 ? entry.form : null;
  const cl = entry.championsLeague;
  if (!form && !cl) return null;
  const adj = typeof entry.clAdjustment === 'number' ? entry.clAdjustment : null;
  return (
    <div className="space-y-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
      {form && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span style={{ color: '#94a3b8' }}>{lastFiveLabel}</span>
          <span className="inline-flex gap-1" aria-hidden="true">
            {form.map((r, i) => (
              <span
                key={i}
                className="inline-flex h-[18px] w-[18px] items-center justify-center rounded text-[11px] font-semibold leading-none"
                style={
                  r === 'W'
                    ? { color: '#f1f5f9', backgroundColor: '#2a2a2a' }
                    : { color: '#94a3b8', border: '1px solid #2a2a2a' }
                }
              >
                {r}
              </span>
            ))}
          </span>
          <span className="sr-only">{form.map(r => WORDS[r] ?? r).join(', ')}, most recent last</span>
        </div>
      )}
      {cl && (
        <p className="text-xs">
          <span style={{ color: '#94a3b8' }}>Champions League</span>{' '}
          <span style={{ color: '#f1f5f9' }}>
            {cl.record} · {cl.points} pts
            {adj !== null && (
              <span title="Champions League results add up to 3 points to the score or take away up to 1.5.">
                {' '}· score {adj >= 0 ? '+' : '\u2212'}{Math.abs(adj).toFixed(1)}
              </span>
            )}
          </span>
        </p>
      )}
    </div>
  );
}

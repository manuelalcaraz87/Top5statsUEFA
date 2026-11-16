import { Flame } from 'lucide-react';

/** A small pill for a current streak. Shows nothing when there is no badge. */
export function StreakBadge({ badge, colour }: { badge: { label: string; detail: string } | null; colour: string }) {
  if (!badge) return null;
  return (
    <span
      title={badge.detail}
      className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border border-[#2a2a2a] px-2 py-0.5 text-[11px] font-semibold leading-tight text-[#f1f5f9]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <Flame size={12} color={colour} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{badge.label}</span>
      <span className="sr-only">. {badge.detail}</span>
    </span>
  );
}

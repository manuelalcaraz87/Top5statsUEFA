import { useEffect, useState } from 'react';
import { ClubCrest } from './ClubCrest';
import type { NormalizedMatch } from '../services/footballDataService';

// One match in the match strip. Neutral colours only: every league and club
// looks the same. No predictions, win chances or "favourite" labels.

interface MatchCardProps {
  match: NormalizedMatch;
  /** Club strength (0-100) for each side; undefined when there's no data. */
  homeStrength?: number;
  awayStrength?: number;
}

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Kick-off day and time in the visitor's own time zone, e.g. "Today 20:00" or "Sat 21 Nov 15:00". */
export function formatKickoff(utcDate: string, now = new Date()): string {
  const kickoff = new Date(utcDate);
  const time = kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (sameLocalDay(kickoff, now)) return `Today ${time}`;
  if (sameLocalDay(kickoff, tomorrow)) return `Tomorrow ${time}`;
  const day = kickoff.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day} ${time}`;
}

/**
 * The text after "Live": the provider's minute ("67'" or "45+2'"), or a
 * minute worked out from the kick-off time when the provider sends none.
 */
export function liveMinuteLabel(match: NormalizedMatch, now = new Date()): string {
  if (match.minute != null) {
    return match.injuryTime != null ? `${match.minute}+${match.injuryTime}'` : `${match.minute}'`;
  }
  const elapsed = Math.floor((now.getTime() - new Date(match.utcDate).getTime()) / 60_000) + 1;
  if (elapsed < 1) return "1'";
  if (elapsed <= 45) return `${elapsed}'`;
  if (elapsed <= 62) return "45+'";
  const secondHalf = elapsed - 17;
  return secondHalf <= 90 ? `${secondHalf}'` : "90+'";
}

function LiveStatus({ match }: { match: NormalizedMatch }) {
  const phase = match.livePhase;
  const estimated = phase === 'in_play' && match.minute == null;
  const [now, setNow] = useState(() => new Date());

  // Without a provider minute, refresh the worked-out minute every 20 seconds.
  useEffect(() => {
    if (!estimated) return;
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(timer);
  }, [estimated]);

  if (phase === 'half_time') {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-red-300">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Half time
      </span>
    );
  }
  const text =
    phase === 'extra_time' ? 'Extra time'
    : phase === 'penalties' ? 'Penalties'
    : `Live ${liveMinuteLabel(match, now)}`;
  return (
    <span
      className="flex items-center gap-1 text-[11px] font-semibold text-red-400"
      title={estimated ? 'Minute worked out from the kick-off time' : undefined}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
      {text}
    </span>
  );
}

function StatusLine({ match }: { match: NormalizedMatch }) {
  if (match.status === 'live') return <LiveStatus match={match} />;
  if (match.status === 'finished') {
    return <span className="text-[11px] font-semibold text-gray-300">Full time</span>;
  }
  return <span className="text-[11px] text-gray-400">{formatKickoff(match.utcDate)}</span>;
}

function StrengthBar({ value }: { value?: number }) {
  if (value === undefined) {
    return <p className="mt-1 text-[9px] leading-none text-[#94a3b8]">No current data</p>;
  }
  return (
    <div className="mt-1 flex items-center gap-1.5" title={`Strength ${value} of 100`}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
        <div className="h-full rounded-full bg-slate-400" style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right text-[10px] tabular-nums leading-none text-gray-400">{value}</span>
    </div>
  );
}

function TeamRow({ name, score, strength, highlight }: {
  name: string;
  score: number | null;
  strength?: number;
  highlight: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <ClubCrest club={name} size={22} />
          <span className="truncate text-xs leading-tight text-gray-200">{name}</span>
        </div>
        <span className={`ml-1 flex-shrink-0 text-base font-bold tabular-nums ${highlight ? 'text-white' : 'text-gray-300'}`}>
          {score ?? '-'}
        </span>
      </div>
      <StrengthBar value={strength} />
    </div>
  );
}

export function MatchCard({ match, homeStrength, awayStrength }: MatchCardProps) {
  const isLive = match.status === 'live';
  return (
    <div className="h-full w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 pb-2.5 pt-2 transition-colors hover:border-[#3a3a3a]">
      <div className="mb-1.5 h-4">
        <StatusLine match={match} />
      </div>
      <div className="space-y-2">
        <TeamRow name={match.homeTeam} score={match.homeScore} strength={homeStrength} highlight={isLive} />
        <TeamRow name={match.awayTeam} score={match.awayScore} strength={awayStrength} highlight={isLive} />
      </div>
    </div>
  );
}

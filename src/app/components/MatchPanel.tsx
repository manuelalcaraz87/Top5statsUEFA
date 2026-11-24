import { ClubCrest } from './ClubCrest';
import { StatusLine } from './MatchCard';
import { ScoreChip } from './top5/charts';
import { CATEGORIES, type CategoryId } from './top5/top5Data';
import { formatStat } from './top5/shared';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import {
  buildMatchPanelData, ordinal, scoresNote,
  type ClubLeadersOnCard, type PanelPlayer, type PlayerCategory, type RankedPlayer,
} from '../services/matchPanelData';
import type { NormalizedMatch } from '../services/footballDataService';
import type { EventKind, MatchEvent, MatchDetails, StatKey } from '../services/liveMatchService';
import { matchesThroughOf, useFastScoresChecks, useScores } from '../services/scoresService';
import { useMatchDetails } from '../hooks/useMatches';

// The panel that opens from a match card: both clubs' strength, four key
// matchups and the ranked players of the two clubs. Everything comes from the
// scores file that is already loaded, so opening it makes no request. The
// header follows the card's live data because the panel is given the current
// match on every render. No predictions, winners, percentages or "favourite".

const TAB_ID: Record<PlayerCategory, CategoryId> = {
  striker: 'strikers',
  creator: 'creators',
  defender: 'defenders',
  goalkeeper: 'goalkeepers',
};

interface MatchPanelProps {
  /** The match as the card currently shows it (kept up to date by the caller). */
  match: NormalizedMatch;
  homeStrength?: number;
  awayStrength?: number;
  onClose: () => void;
}

function Strength({ value }: { value?: number }) {
  return value === undefined ? (
    <p className="text-[11px] text-[#94a3b8]">No current data</p>
  ) : (
    <p className="text-[11px] text-gray-300">
      Strength <span className="font-bold tabular-nums text-white">{value}</span>
    </p>
  );
}

function ClubHeader({ name, strength, align }: { name: string; strength?: number; align: 'left' | 'right' }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
      <ClubCrest club={name} size={36} />
      <p className="max-w-full break-words text-sm font-bold leading-tight text-white">{name}</p>
      <Strength value={strength} />
    </div>
  );
}

function hasScore(match: NormalizedMatch): boolean {
  return match.homeScore !== null && match.awayScore !== null;
}

function PlayerSide({ category, player, align, viewName }: { category: PlayerCategory; player: PanelPlayer | null; align: 'left' | 'right'; viewName: string | null }) {
  const tab = CATEGORIES[TAB_ID[category]];
  const right = align === 'right';
  const alignment = right ? 'sm:items-end sm:text-right' : '';
  return (
    <div className={`flex min-w-0 flex-col items-start gap-1 text-left ${alignment}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: tab.colour }}>{tab.leaderLabel}</p>
      {player === null ? (
        <p className="text-sm text-[#94a3b8]">No current data</p>
      ) : (
        <>
          <p className="break-words text-base font-bold leading-tight text-white">{player.name}</p>
          <p className="text-xs text-gray-300">{player.club}</p>
          <div className={`mt-1 flex flex-col items-start gap-0.5 ${right ? 'sm:items-end' : ''}`}>
            <ScoreChip score={player.score} colour={tab.colour} gold={player.rank === 1} />
            <span className="text-[11px] leading-tight text-gray-400">Top5 Score</span>
          </div>
          <p className="text-xs text-gray-200">{ordinal(player.rank)}{viewName ? ` in ${viewName}` : ''}</p>
          <dl className="mt-1 grid w-full grid-cols-3 gap-2">
            {tab.statLabels.slice(0, 3).map((label, i) => (
              <div key={label} className="min-w-0">
                <dt className="text-[10px] leading-tight text-gray-400">{label}</dt>
                <dd className="text-sm font-bold tabular-nums leading-tight text-white">{formatStat(player.stats[i] ?? null)}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}

function MatchupRow({ label, left, right, viewName }: {
  label: string;
  viewName: string | null;
  left: { category: PlayerCategory; player: PanelPlayer | null };
  right: { category: PlayerCategory; player: PanelPlayer | null };
}) {
  return (
    <li
      aria-label={label}
      className="grid grid-cols-1 gap-3 rounded-xl border border-[#2a2c33] bg-[#16181d] p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start sm:gap-4 sm:p-4"
    >
      <PlayerSide category={left.category} player={left.player} align="left" viewName={viewName} />
      <span className="text-display self-center text-center text-xs text-gray-400" aria-hidden="true">v</span>
      <PlayerSide category={right.category} player={right.player} align="right" viewName={viewName} />
    </li>
  );
}

function RankedGroup({ club, players }: { club: string; players: RankedPlayer[] }) {
  if (players.length === 0) return null;
  return (
    <div className="rounded-xl border border-[#2a2c33] bg-[#16181d] p-3">
      <div className="mb-2 flex items-center gap-2">
        <ClubCrest club={club} size={22} />
        <h4 className="text-sm font-bold text-white">{club}</h4>
      </div>
      <ul className="divide-y divide-[#2a2c33]">
        {players.map(p => {
          const tab = CATEGORIES[TAB_ID[p.category]];
          return (
            <li key={`${p.category}-${p.name}`} className="flex items-center justify-between gap-3 py-1.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                <p className="text-[11px] text-gray-400">
                  <span style={{ color: tab.colour }}>{tab.leaderLabel}</span> · {ordinal(p.rank)}
                </p>
              </div>
              <ScoreChip score={p.score} colour={tab.colour} gold={p.rank === 1} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const EVENT_LABEL: Record<EventKind, string> = {
  goal: 'Goal',
  penalty_goal: 'Penalty goal',
  own_goal: 'Own goal',
  missed_penalty: 'Penalty missed',
  red_card: 'Red card',
};

function eventText(e: MatchEvent): string {
  const time = `${e.minute}${e.extraMinute ? `+${e.extraMinute}` : ''}'`;
  return `${time} ${EVENT_LABEL[e.kind]}${e.player ? ` · ${e.player}` : ''}`;
}

function Timeline({ events, live }: { events: MatchEvent[]; live: boolean }) {
  if (events.length === 0 && !live) return null;
  const sorted = [...events].sort((a, b) =>
    (a.minute ?? 0) - (b.minute ?? 0) || (a.extraMinute ?? 0) - (b.extraMinute ?? 0));
  return (
    <section aria-label="Timeline">
      <h3 className="text-display mb-2 text-sm text-white">Timeline</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-300">No goals or red cards yet</p>
      ) : (
        <ul className="space-y-1.5 rounded-xl border border-[#2a2c33] bg-[#16181d] p-3">
          {sorted.map((e, i) => (
            <li key={i} className="grid grid-cols-2 gap-3 text-sm text-gray-200">
              {e.side === 'home'
                ? <><span className="min-w-0 break-words text-left">{eventText(e)}</span><span /></>
                : <><span /><span className="min-w-0 break-words text-right">{eventText(e)}</span></>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const STAT_ROWS: { key: StatKey; label: string; percent?: boolean }[] = [
  { key: 'possession', label: 'Possession', percent: true },
  { key: 'shots', label: 'Shots' },
  { key: 'shotsOnTarget', label: 'Shots on target' },
  { key: 'corners', label: 'Corners' },
  { key: 'fouls', label: 'Fouls' },
  { key: 'saves', label: 'Saves' },
];

function MatchStats({ stats }: { stats: MatchDetails['stats'] }) {
  const rows = STAT_ROWS.flatMap(r => {
    const home = stats.home[r.key];
    const away = stats.away[r.key];
    return home === null || away === null ? [] : [{ ...r, home, away }];
  });
  if (rows.length === 0) return null;
  return (
    <section aria-label="Match stats">
      <h3 className="text-display mb-2 text-sm text-white">Match stats</h3>
      <ul className="space-y-3 rounded-xl border border-[#2a2c33] bg-[#16181d] p-3">
        {rows.map(r => {
          const total = r.home + r.away;
          const homeShare = r.percent ? r.home : total > 0 ? (r.home / total) * 100 : 50;
          const awayShare = r.percent ? r.away : total > 0 ? (r.away / total) * 100 : 50;
          const suffix = r.percent ? '%' : '';
          return (
            <li key={r.key}>
              <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline gap-2 text-xs">
                <span className="text-sm font-bold tabular-nums text-white">{r.home}{suffix}</span>
                <span className="text-center text-gray-400">{r.label}</span>
                <span className="text-right text-sm font-bold tabular-nums text-white">{r.away}{suffix}</span>
              </div>
              <div className="flex gap-1" aria-hidden="true">
                <span className="flex h-1 flex-1 justify-end overflow-hidden rounded-full bg-[#2a2a2a]">
                  <span className="block h-full rounded-full bg-slate-400" style={{ width: `${homeShare}%` }} />
                </span>
                <span className="flex h-1 flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
                  <span className="block h-full rounded-full bg-slate-400" style={{ width: `${awayShare}%` }} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function pick(leaders: ClubLeadersOnCard, category: PlayerCategory) {
  return { category, player: leaders[category] };
}

export function MatchPanel({ match, homeStrength, awayStrength, onClose }: MatchPanelProps) {
  // Re-renders when a newer scores file arrives, so the note and players stay current.
  const { scores } = useScores();
  const through = matchesThroughOf(scores);
  const note = scoresNote(match, through);
  // A finished match that the scores don't include yet: look for the new file every 5 minutes.
  useFastScoresChecks(match.status === 'finished' && note !== null);
  const data = buildMatchPanelData(match);
  const { home, away } = data;
  const rankedAny = data.homeRanked.length > 0 || data.awayRanked.length > 0;
  const summary = `${match.homeTeam} v ${match.awayTeam}`;
  const details = useMatchDetails(match);
  const showDetails = match.status !== 'upcoming' && details !== null;

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        // Focus goes back to the card that opened the panel (it may have moved in the list).
        onCloseAutoFocus={e => {
          const card = document.querySelector<HTMLElement>(`[data-match-card="${match.id}"]`);
          if (card) { e.preventDefault(); card.focus(); }
        }}
        className="left-0 top-0 h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 content-start gap-5 overflow-y-auto rounded-none border-0 border-[#2a2a2a] bg-[#141414] p-4 text-white sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:p-6"
      >
        <div className="pr-8">
          <DialogTitle className="sr-only">{summary}</DialogTitle>
          <DialogDescription className="sr-only">
            Key matchups and ranked players for {summary}{data.viewName ? `, from the ${data.viewName} lists` : ''}.
          </DialogDescription>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
            <ClubHeader name={match.homeTeam} strength={homeStrength} align="left" />
            <div className="flex flex-col items-center gap-1 pt-1 text-center">
              <StatusLine match={match} />
              {hasScore(match) && (
                <p className="text-display text-2xl tabular-nums text-white">
                  {match.homeScore}<span className="px-1.5 text-gray-400">–</span>{match.awayScore}
                </p>
              )}
            </div>
            <ClubHeader name={match.awayTeam} strength={awayStrength} align="right" />
          </div>
        </div>

        {showDetails && <Timeline events={details.events} live={match.status === 'live'} />}
        {showDetails && <MatchStats stats={details.stats} />}

        <section aria-label="Key matchups">
          <h3 className="text-display mb-2 text-sm text-white">Key matchups</h3>
          {match.leagueCode === 'CL' && <p className="mb-2 text-xs text-gray-400">Champions League matches only</p>}
          {note && <p className="mb-2 text-xs text-gray-400">{note}</p>}
          <ul className="space-y-3">
            <MatchupRow viewName={data.viewName} label="Home striker against away defender" left={pick(home, 'striker')} right={pick(away, 'defender')} />
            {/* The home club's player is always on the left, so here the home defender comes first. */}
            <MatchupRow viewName={data.viewName} label="Home defender against away striker" left={pick(home, 'defender')} right={pick(away, 'striker')} />
            <MatchupRow viewName={data.viewName} label="Creators" left={pick(home, 'creator')} right={pick(away, 'creator')} />
            <MatchupRow viewName={data.viewName} label="Goalkeepers" left={pick(home, 'goalkeeper')} right={pick(away, 'goalkeeper')} />
          </ul>
        </section>

        {rankedAny && (
          <section aria-label={`Ranked in the ${data.viewName} top 20`}>
            <h3 className="text-display mb-2 text-sm text-white">Ranked in the {data.viewName} top 20</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <RankedGroup club={match.homeTeam} players={data.homeRanked} />
              <RankedGroup club={match.awayTeam} players={data.awayRanked} />
            </div>
          </section>
        )}

        <p className="text-xs text-gray-400">
          Best player means the highest Top5 Score at the club this season, not tonight's lineup.
        </p>
      </DialogContent>
    </Dialog>
  );
}

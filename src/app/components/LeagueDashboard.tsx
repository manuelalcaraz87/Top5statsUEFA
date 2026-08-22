import { LeagueHeader } from './LeagueHeader';
import { StandingsTable } from './StandingsTable';
import { TeamCard } from './TeamCard';
import { MatchPreview } from './MatchPreview';
import { PlayerHighlight } from './PlayerHighlight';
import { StatWidget } from './StatWidget';
import { TrendGraph } from './TrendGraph';
import { GoalsDistributionChart } from './GoalsDistributionChart';
import { TrendingUp, Target, Users, Award } from 'lucide-react';

interface League {
  id: string;
  name: string;
  country: string;
  color: string;
  accentColor: string;
}

interface LeagueDashboardProps {
  league: League;
}

const leagueData: Record<string, any> = {
  'premier-league': {
    topScorer: { name: 'Erling Haaland', team: 'Man City', goals: 28 },
    topAssists: { name: 'Kevin De Bruyne', team: 'Man City', assists: 18 },
    avgGoals: 2.8,
    totalMatches: 312,
    teams: [
      { name: 'Manchester City', played: 26, won: 19, drawn: 4, lost: 3, gf: 62, ga: 24, pts: 61 },
      { name: 'Arsenal', played: 26, won: 18, drawn: 5, lost: 3, gf: 59, ga: 24, pts: 59 },
      { name: 'Liverpool', played: 26, won: 17, drawn: 6, lost: 3, gf: 58, ga: 26, pts: 57 },
      { name: 'Aston Villa', played: 26, won: 16, drawn: 4, lost: 6, gf: 52, ga: 34, pts: 52 },
      { name: 'Tottenham', played: 26, won: 15, drawn: 5, lost: 6, gf: 51, ga: 36, pts: 50 },
    ],
    recentMatches: [
      { home: 'Manchester City', away: 'Arsenal', homeScore: 2, awayScore: 2, date: 'Nov 10' },
      { home: 'Liverpool', away: 'Chelsea', homeScore: 3, awayScore: 1, date: 'Nov 10' },
      { home: 'Tottenham', away: 'Aston Villa', homeScore: 2, awayScore: 0, date: 'Nov 9' },
    ],
    upcomingMatches: [
      { home: 'Arsenal', away: 'Liverpool', date: 'Nov 12', time: '16:30' },
      { home: 'Chelsea', away: 'Man City', date: 'Nov 13', time: '14:00' },
    ],
  },
  'la-liga': {
    topScorer: { name: 'Jude Bellingham', team: 'Real Madrid', goals: 24 },
    topAssists: { name: 'Antoine Griezmann', team: 'Atletico', assists: 16 },
    avgGoals: 2.6,
    totalMatches: 300,
    teams: [
      { name: 'Real Madrid', played: 25, won: 19, drawn: 4, lost: 2, gf: 58, ga: 20, pts: 61 },
      { name: 'Barcelona', played: 25, won: 18, drawn: 5, lost: 2, gf: 55, ga: 22, pts: 59 },
      { name: 'Atletico Madrid', played: 25, won: 16, drawn: 6, lost: 3, gf: 48, ga: 24, pts: 54 },
      { name: 'Athletic Bilbao', played: 25, won: 14, drawn: 7, lost: 4, gf: 42, ga: 28, pts: 49 },
      { name: 'Real Sociedad', played: 25, won: 13, drawn: 8, lost: 4, gf: 40, ga: 26, pts: 47 },
    ],
    recentMatches: [
      { home: 'Real Madrid', away: 'Barcelona', homeScore: 1, awayScore: 0, date: 'Nov 10' },
      { home: 'Atletico Madrid', away: 'Sevilla', homeScore: 2, awayScore: 1, date: 'Nov 9' },
      { home: 'Valencia', away: 'Real Sociedad', homeScore: 1, awayScore: 1, date: 'Nov 9' },
    ],
    upcomingMatches: [
      { home: 'Barcelona', away: 'Atletico', date: 'Nov 12', time: '20:00' },
      { home: 'Sevilla', away: 'Real Madrid', date: 'Nov 13', time: '18:30' },
    ],
  },
  'bundesliga': {
    topScorer: { name: 'Harry Kane', team: 'Bayern', goals: 26 },
    topAssists: { name: 'Jamal Musiala', team: 'Bayern', assists: 15 },
    avgGoals: 3.1,
    totalMatches: 270,
    teams: [
      { name: 'Bayern Munich', played: 24, won: 18, drawn: 4, lost: 2, gf: 64, ga: 22, pts: 58 },
      { name: 'Bayer Leverkusen', played: 24, won: 17, drawn: 5, lost: 2, gf: 58, ga: 24, pts: 56 },
      { name: 'Dortmund', played: 24, won: 15, drawn: 6, lost: 3, gf: 52, ga: 28, pts: 51 },
      { name: 'RB Leipzig', played: 24, won: 14, drawn: 5, lost: 5, gf: 48, ga: 30, pts: 47 },
      { name: 'Stuttgart', played: 24, won: 13, drawn: 6, lost: 5, gf: 45, ga: 32, pts: 45 },
    ],
    recentMatches: [
      { home: 'Bayern Munich', away: 'Dortmund', homeScore: 3, awayScore: 2, date: 'Nov 10' },
      { home: 'Leverkusen', away: 'Leipzig', homeScore: 2, awayScore: 0, date: 'Nov 9' },
      { home: 'Stuttgart', away: 'Frankfurt', homeScore: 1, awayScore: 1, date: 'Nov 9' },
    ],
    upcomingMatches: [
      { home: 'Dortmund', away: 'Leverkusen', date: 'Nov 12', time: '17:30' },
      { home: 'Leipzig', away: 'Bayern', date: 'Nov 13', time: '15:30' },
    ],
  },
  'serie-a': {
    topScorer: { name: 'Lautaro Martinez', team: 'Inter', goals: 22 },
    topAssists: { name: 'Rafael Leao', team: 'AC Milan', assists: 14 },
    avgGoals: 2.5,
    totalMatches: 290,
    teams: [
      { name: 'Inter Milan', played: 25, won: 18, drawn: 5, lost: 2, gf: 56, ga: 20, pts: 59 },
      { name: 'Juventus', played: 25, won: 17, drawn: 6, lost: 2, gf: 48, ga: 18, pts: 57 },
      { name: 'AC Milan', played: 25, won: 16, drawn: 5, lost: 4, gf: 50, ga: 26, pts: 53 },
      { name: 'Napoli', played: 25, won: 14, drawn: 7, lost: 4, gf: 45, ga: 28, pts: 49 },
      { name: 'Atalanta', played: 25, won: 13, drawn: 8, lost: 4, gf: 52, ga: 32, pts: 47 },
    ],
    recentMatches: [
      { home: 'Inter Milan', away: 'Juventus', homeScore: 1, awayScore: 1, date: 'Nov 10' },
      { home: 'AC Milan', away: 'Napoli', homeScore: 3, awayScore: 2, date: 'Nov 9' },
      { home: 'Atalanta', away: 'Roma', homeScore: 2, awayScore: 0, date: 'Nov 9' },
    ],
    upcomingMatches: [
      { home: 'Juventus', away: 'AC Milan', date: 'Nov 12', time: '19:45' },
      { home: 'Napoli', away: 'Inter', date: 'Nov 13', time: '19:45' },
    ],
  },
  'ligue-1': {
    topScorer: { name: 'Kylian Mbappé', team: 'PSG', goals: 25 },
    topAssists: { name: 'Ousmane Dembélé', team: 'PSG', assists: 13 },
    avgGoals: 2.4,
    totalMatches: 280,
    teams: [
      { name: 'PSG', played: 24, won: 19, drawn: 3, lost: 2, gf: 60, ga: 18, pts: 60 },
      { name: 'Monaco', played: 24, won: 15, drawn: 6, lost: 3, gf: 48, ga: 24, pts: 51 },
      { name: 'Lille', played: 24, won: 14, drawn: 7, lost: 3, gf: 42, ga: 22, pts: 49 },
      { name: 'Lyon', played: 24, won: 13, drawn: 6, lost: 5, gf: 40, ga: 28, pts: 45 },
      { name: 'Marseille', played: 24, won: 12, drawn: 7, lost: 5, gf: 38, ga: 26, pts: 43 },
    ],
    recentMatches: [
      { home: 'PSG', away: 'Monaco', homeScore: 2, awayScore: 1, date: 'Nov 10' },
      { home: 'Lille', away: 'Lyon', homeScore: 1, awayScore: 0, date: 'Nov 9' },
      { home: 'Marseille', away: 'Nice', homeScore: 2, awayScore: 2, date: 'Nov 9' },
    ],
    upcomingMatches: [
      { home: 'Monaco', away: 'Lille', date: 'Nov 12', time: '20:00' },
      { home: 'Lyon', away: 'PSG', date: 'Nov 13', time: '20:45' },
    ],
  },
};

export function LeagueDashboard({ league }: LeagueDashboardProps) {
  const data = leagueData[league.id] || leagueData['premier-league'];

  return (
    <div className="space-y-6">
      {/* League Header */}
      <LeagueHeader league={league} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          icon={<Award className="w-5 h-5" />}
          title="Top Scorer"
          value={data.topScorer.name}
          subtitle={`${data.topScorer.goals} Goals`}
          color={league.color}
        />
        <StatWidget
          icon={<Users className="w-5 h-5" />}
          title="Most Assists"
          value={data.topAssists.name}
          subtitle={`${data.topAssists.assists} Assists`}
          color={league.color}
        />
        <StatWidget
          icon={<Target className="w-5 h-5" />}
          title="Avg Goals/Match"
          value={data.avgGoals.toString()}
          subtitle="League Average"
          color={league.color}
        />
        <StatWidget
          icon={<TrendingUp className="w-5 h-5" />}
          title="Total Matches"
          value={data.totalMatches.toString()}
          subtitle="Season 2024/25"
          color={league.color}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Standings */}
        <div className="lg:col-span-2">
          <StandingsTable teams={data.teams} leagueColor={league.color} />
        </div>

        {/* Right Column - Top Teams */}
        <div className="space-y-4">
          <h3 className="text-slate-900">Top Teams</h3>
          <div className="space-y-3">
            {data.teams.slice(0, 3).map((team: any, index: number) => (
              <TeamCard
                key={team.name}
                team={team}
                rank={index + 1}
                leagueColor={league.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <TrendGraph leagueName={league.name} leagueColor={league.color} />

      {/* Matches Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div>
          <h3 className="text-slate-900 mb-4">Recent Results</h3>
          <div className="space-y-3">
            {data.recentMatches.map((match: any, index: number) => (
              <MatchPreview
                key={index}
                match={{ ...match, status: 'finished' }}
                leagueColor={league.color}
              />
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div>
          <h3 className="text-slate-900 mb-4">Upcoming Fixtures</h3>
          <div className="space-y-3">
            {data.upcomingMatches.map((match: any, index: number) => (
              <MatchPreview
                key={index}
                match={{ ...match, status: 'upcoming' }}
                leagueColor={league.color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Player Highlights */}
      <div>
        <h3 className="text-slate-900 mb-4">Player Highlights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PlayerHighlight
            player={data.topScorer}
            stat="goals"
            leagueColor={league.color}
          />
          <PlayerHighlight
            player={data.topAssists}
            stat="assists"
            leagueColor={league.color}
          />
          <PlayerHighlight
            player={{ name: 'Top Performer', team: data.teams[0].name, rating: 8.9 }}
            stat="rating"
            leagueColor={league.color}
          />
        </div>
      </div>

      {/* Goals Distribution Chart */}
      <div>
        <h3 className="text-slate-900 mb-4">Goals Distribution</h3>
        <GoalsDistributionChart leagueName={league.name} leagueColor={league.color} />
      </div>
    </div>
  );
}
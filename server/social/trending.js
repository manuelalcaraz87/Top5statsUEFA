// Trending algorithm: turns raw X.com posts into a ranked social feed and a
// ranked list of trending hashtags/topics, per league.
//
// Scoring approach (a simplified, transparent version of the classic
// "Hacker News" time-decay formula, adapted for social engagement):
//
//   score = weightedEngagement / (ageInHours + 2) ^ GRAVITY
//
// where weightedEngagement combines likes/retweets/replies/quotes with
// tunable weights, and is multiplied by the source-tier weight (league
// account vs. player vs. commentator) so that, e.g., a breaking-news post
// from a top insider ranks above a routine club post with similar raw
// engagement.

import { getHandleTier, TIER_WEIGHTS } from './sources.js';

const GRAVITY = 1.6; // higher = faster decay of older posts
const ENGAGEMENT_WEIGHTS = {
  like_count: 1,
  retweet_count: 2.5, // reposts spread reach the most
  reply_count: 1.5,
  quote_count: 2,
};

function weightedEngagement(metrics = {}) {
  return Object.entries(ENGAGEMENT_WEIGHTS).reduce(
    (sum, [key, weight]) => sum + (metrics[key] ?? 0) * weight,
    0
  );
}

function ageInHours(createdAt) {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(ms / 36e5, 0);
}

/** Classifies a post into a UI "tag" based on simple keyword heuristics. */
function classifyTag(text) {
  const t = text.toLowerCase();
  if (/(here we go|signs for|signing|transfer|medical|loan move|here-we-go)/.test(t)) return { tag: 'TRANSFER', color: '#f59e0b' };
  if (/(injury|injured|ruled out|setback|scan)/.test(t)) return { tag: 'INJURY', color: '#ef4444' };
  if (/\b(ft|full[- ]?time|final score|wins?|beat)\b/.test(t)) return { tag: 'RESULT', color: '#22c55e' };
  if (/(preview|kick[- ]?off|starting xi|lineup|team news)/.test(t)) return { tag: 'PREVIEW', color: '#8b5cf6' };
  if (/(highlights|watch|goal of the)/.test(t)) return { tag: 'HIGHLIGHTS', color: '#06b6d4' };
  if (/\d+\s*(goals|assists|appearances|record)/.test(t)) return { tag: 'STAT', color: '#3b82f6' };
  return { tag: 'NEWS', color: '#6b7280' };
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relativeTime(createdAt) {
  const hours = ageInHours(createdAt);
  if (hours < 1) return `${Math.max(Math.round(hours * 60), 1)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

/**
 * Ranks raw posts for a league into a feed sorted by trending score.
 *
 * @param {string} leagueId
 * @param {Array} rawPosts - Output of xClient.fetchRecentPostsForHandles().posts
 * @param {Record<string, object>} usersById - Output ...users, keyed by author id
 * @param {{ id: string; name: string }} leagueMeta
 */
export function rankPosts(leagueId, rawPosts, usersById, leagueMeta) {
  const scored = rawPosts.map((post) => {
    const author = usersById[post.authorId];
    const handle = author?.username ?? 'unknown';
    const tier = getHandleTier(leagueId, handle);
    const tierWeight = TIER_WEIGHTS[tier] ?? 1;

    const engagement = weightedEngagement(post.metrics);
    const decay = Math.pow(ageInHours(post.createdAt) + 2, GRAVITY);
    const score = (engagement * tierWeight) / decay;

    const { tag, color } = classifyTag(post.text);

    return {
      id: post.id,
      source: 'X',
      sourceHandle: `@${handle}`,
      sourceName: author?.name ?? handle,
      sourceVerified: !!author?.verified,
      tier,
      league: leagueMeta.name,
      tag,
      tagColor: color,
      content: post.text,
      time: relativeTime(post.createdAt),
      likes: formatCount(post.metrics.like_count ?? 0),
      comments: formatCount(post.metrics.reply_count ?? 0),
      shares: formatCount((post.metrics.retweet_count ?? 0) + (post.metrics.quote_count ?? 0)),
      image: post.image,
      hashtags: post.hashtags,
      url: `https://x.com/${handle}/status/${post.id}`,
      score,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Aggregates hashtags across all leagues' ranked posts into a single
 * trending list, scored by decayed, tier-weighted post scores summed per
 * tag ("mentions" volume proxy) plus a bonus for velocity (how many
 * distinct posts recently used the tag).
 */
export function computeTrending(rankedPostsByLeague, { limit = 8 } = {}) {
  const tagStats = new Map(); // tag -> { score, count }

  for (const posts of Object.values(rankedPostsByLeague)) {
    for (const post of posts) {
      for (const rawTag of post.hashtags ?? []) {
        const tag = `#${rawTag}`;
        const existing = tagStats.get(tag) ?? { score: 0, count: 0 };
        existing.score += post.score;
        existing.count += 1;
        tagStats.set(tag, existing);
      }
    }
  }

  const ranked = [...tagStats.entries()]
    .map(([tag, stats]) => ({
      tag,
      posts: formatCount(stats.count),
      rawScore: stats.score,
      mentions: stats.count,
      hot: stats.count >= 3,
    }))
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, limit)
    .map(({ rawScore, ...rest }) => rest);

  return ranked;
}

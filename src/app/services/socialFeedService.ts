// Frontend service for the Social Feed / Trending backend routes.
// Backed by real X.com posts curated & ranked by the server's trending
// algorithm (see server/social/). Falls back gracefully if the proxy is
// unavailable or ingestion hasn't produced data yet (e.g. no X API token
// configured), so the UI can show mock/static content in that case.

const API_BASE =
  import.meta.env.VITE_API_PROXY_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export interface SocialPost {
  id: string;
  source: 'X';
  sourceHandle: string;
  sourceName: string;
  sourceVerified: boolean;
  tier: 'league' | 'player' | 'commentator';
  league: string;
  tag: string;
  tagColor: string;
  content: string;
  time: string;
  likes: string;
  comments: string;
  shares: string;
  image: string | null;
  hashtags: string[];
  url: string;
}

export interface TrendingTopic {
  tag: string;
  posts: string;
  mentions: number;
  hot: boolean;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Social API error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSocialFeed(leagueId: string, limit = 20): Promise<SocialPost[]> {
  const data = await get<{ posts: SocialPost[] }>(
    `/api/social/feed/${leagueId}?limit=${limit}`
  );
  return data.posts;
}

export async function fetchTrending(): Promise<TrendingTopic[]> {
  const data = await get<{ trending: TrendingTopic[] }>('/api/social/trending');
  return data.trending;
}

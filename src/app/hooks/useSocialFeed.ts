import { useEffect, useState } from 'react';
import { fetchSocialFeed, fetchTrending, type SocialPost, type TrendingTopic } from '../services/socialFeedService';

const FEED_TTL = 2 * 60_000; // 2 min
const TRENDING_TTL = 2 * 60_000;

const feedCache = new Map<string, { data: SocialPost[]; timestamp: number }>();
let trendingCache: { data: TrendingTopic[]; timestamp: number } | null = null;

export interface UseSocialFeedResult {
  posts: SocialPost[] | null;
  trending: TrendingTopic[] | null;
  loading: boolean;
  isLive: boolean;
  error: string | null;
}

/** Fetches the live, algorithm-ranked social feed + trending topics for a league, with in-memory caching. */
export function useSocialFeed(leagueId: string): UseSocialFeedResult {
  const [posts, setPosts] = useState<SocialPost[] | null>(null);
  const [trending, setTrending] = useState<TrendingTopic[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leagueId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const cachedFeed = feedCache.get(leagueId);
    if (cachedFeed && Date.now() - cachedFeed.timestamp < FEED_TTL) {
      setPosts(cachedFeed.data);
    } else {
      fetchSocialFeed(leagueId)
        .then((data) => {
          if (cancelled) return;
          feedCache.set(leagueId, { data, timestamp: Date.now() });
          setPosts(data);
        })
        .catch((e) => {
          if (!cancelled) setError(e.message);
        });
    }

    if (trendingCache && Date.now() - trendingCache.timestamp < TRENDING_TTL) {
      setTrending(trendingCache.data);
    } else {
      fetchTrending()
        .then((data) => {
          if (cancelled) return;
          trendingCache = { data, timestamp: Date.now() };
          setTrending(data);
        })
        .catch((e) => {
          if (!cancelled) setError((prev) => prev ?? e.message);
        });
    }

    setLoading(false);
    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  return {
    posts,
    trending,
    loading,
    isLive: (posts?.length ?? 0) > 0,
    error,
  };
}

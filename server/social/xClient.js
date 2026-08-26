// Thin client for the X.com (Twitter) API v2.
// Docs: https://developer.twitter.com/en/docs/twitter-api
//
// Uses the recent-search endpoint scoped to a set of handles (via `from:`)
// so we only pull posts by curated league/club/player/commentator accounts,
// rather than doing a broad public search.

const X_API_BASE = 'https://api.twitter.com/2';

function bearerHeaders() {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    throw new Error('X_BEARER_TOKEN is not configured');
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Fetches recent posts (last 7 days, free-tier window) authored by any of
 * the given handles, matching optional keywords/hashtags.
 *
 * @param {string[]} handles - X.com usernames (no leading '@').
 * @param {object} [opts]
 * @param {string[]} [opts.keywords] - Extra OR'd keywords/hashtags to require.
 * @param {number} [opts.maxResults] - 10-100, per X API constraints.
 * @param {string} [opts.sinceId] - Only return posts newer than this ID.
 */
export async function fetchRecentPostsForHandles(handles, opts = {}) {
  if (!handles.length) return { posts: [], users: {} };
  const { maxResults = 50, sinceId } = opts;

  // X API recent search caps query length; chunk `from:` clauses in groups.
  const CHUNK_SIZE = 25;
  const chunks = [];
  for (let i = 0; i < handles.length; i += CHUNK_SIZE) {
    chunks.push(handles.slice(i, i + CHUNK_SIZE));
  }

  const allPosts = [];
  const allUsers = {};

  for (const chunk of chunks) {
    const fromClause = chunk.map((h) => `from:${h}`).join(' OR ');
    const query = `(${fromClause}) -is:retweet -is:reply`;

    const url = new URL(`${X_API_BASE}/tweets/search/recent`);
    url.searchParams.set('query', query);
    url.searchParams.set('max_results', String(Math.min(Math.max(maxResults, 10), 100)));
    url.searchParams.set(
      'tweet.fields',
      'created_at,public_metrics,author_id,entities,attachments'
    );
    url.searchParams.set('expansions', 'author_id,attachments.media_keys');
    url.searchParams.set('user.fields', 'username,name,profile_image_url,verified');
    url.searchParams.set('media.fields', 'url,preview_image_url,type');
    if (sinceId) url.searchParams.set('since_id', sinceId);

    const response = await fetch(url, { headers: bearerHeaders() });

    if (response.status === 429) {
      const err = new Error('Rate limited by X API');
      err.status = 429;
      throw err;
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`X API error ${response.status}: ${body}`);
    }

    const json = await response.json();
    const users = json.includes?.users ?? [];
    const media = json.includes?.media ?? [];
    const mediaByKey = Object.fromEntries(media.map((m) => [m.media_key, m]));

    for (const u of users) {
      allUsers[u.id] = u;
    }

    for (const tweet of json.data ?? []) {
      const mediaKeys = tweet.attachments?.media_keys ?? [];
      const firstMedia = mediaKeys.map((k) => mediaByKey[k]).find((m) => m?.type === 'photo');
      allPosts.push({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        authorId: tweet.author_id,
        metrics: tweet.public_metrics ?? {},
        hashtags: (tweet.entities?.hashtags ?? []).map((h) => h.tag),
        image: firstMedia?.url ?? firstMedia?.preview_image_url ?? null,
      });
    }
  }

  return { posts: allPosts, users: allUsers };
}

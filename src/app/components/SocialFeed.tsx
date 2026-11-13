import { TrendingUp, Heart, MessageCircle, Share2, Repeat2, Flame, ExternalLink } from 'lucide-react';
import { LeagueBadge } from './LeagueBadge';
import { useSocialFeed } from '../hooks/useSocialFeed';
import type { SocialPost } from '../services/socialFeedService';

interface League {
  id: string;
  name: string;
  color: string;
  accentColor: string;
}

interface SocialFeedProps {
  selectedLeague: League;
}

const FALLBACK_TRENDING = [
  { tag: '#ElClasico',        posts: '124K', hot: true },
  { tag: '#UCLDraw',          posts: '89K',  hot: true },
  { tag: '#TransferWindow',   posts: '56K',  hot: false },
  { tag: '#Haaland',          posts: '#43K', hot: false },
  { tag: '#DerbyDellaM',      posts: '38K',  hot: false },
  { tag: '#ChampionsLeague',  posts: '31K',  hot: false },
];

export function SocialFeed({ selectedLeague }: SocialFeedProps) {
  const { posts: livePosts, trending: liveTrending, isLive } = useSocialFeed(selectedLeague.id);

  const POSTS: (SocialPost & { title?: string })[] = isLive && livePosts ? livePosts : [];
  const TRENDING = liveTrending && liveTrending.length > 0 ? liveTrending : FALLBACK_TRENDING;

  return (
    <div className="space-y-4">
      {/* Feed header */}
      <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden">
        <div
          className="px-4 py-3 flex items-center gap-2 border-b border-gray-800"
          style={{ borderTopWidth: 3, borderTopColor: selectedLeague.color }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: selectedLeague.color }} />
          <span className="text-white font-semibold text-sm">Social Feed</span>
          <span className="ml-auto text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {isLive ? 'Live' : 'Preview'}
          </span>
        </div>

        <div className="divide-y divide-gray-800/60">
          {POSTS.map((post) => (
            <article key={post.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
              {/* Post header */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <LeagueBadge league={post.league} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-xs font-medium truncate">{post.sourceHandle}</p>
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ color: post.tagColor, backgroundColor: `${post.tagColor}22` }}
                >
                  {post.tag}
                </span>
              </div>

              {/* Image thumbnail */}
              {post.image && (
                <div className="relative mb-2.5 rounded-lg overflow-hidden h-28">
                  <img src={post.image} alt={post.title ?? post.tag} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {post.title && (
                    <p className="absolute bottom-2 left-2.5 text-white text-xs font-semibold">{post.title}</p>
                  )}
                </div>
              )}

              {/* Post content */}
              {!post.image && post.title && (
                <p className="text-white text-xs font-semibold mb-1">{post.title}</p>
              )}
              <p className="text-gray-400 text-[11px] leading-relaxed mb-3 line-clamp-2">
                {post.content}
              </p>

              {/* Engagement row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-red-400 transition-colors group/btn">
                    <Heart className="w-3 h-3" />
                    <span className="text-[10px]">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-[10px]">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-green-400 transition-colors">
                    <Repeat2 className="w-3 h-3" />
                    <span className="text-[10px]">{post.shares}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-600">{post.time} ago</span>
                  {post.url ? (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button className="text-gray-700 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </article>

          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-800">
          <button
            className="w-full py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: selectedLeague.color }}
          >
            Load more posts
          </button>
        </div>
      </div>

      {/* Trending */}
      <div className="bg-[#111111] rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-white font-semibold text-sm">Trending</span>
        </div>
        <div className="p-2 space-y-0.5">
          {TRENDING.map((item, i) => (
            <button
              key={item.tag}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-gray-700 text-xs w-4">{i + 1}</span>
                <div>
                  <p className="text-gray-200 text-xs font-semibold">{item.tag}</p>
                  <p className="text-gray-600 text-[10px]">{item.posts} posts</p>
                </div>
              </div>
              {item.hot && (
                <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

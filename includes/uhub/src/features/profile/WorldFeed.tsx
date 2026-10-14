import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';

interface WorldPost {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string | null;
}

interface WorldFeedProps {
  refreshKey: number;
}

const PAGE_SIZE = 50;

const WorldFeed: React.FC<WorldFeedProps> = ({ refreshKey }) => {
  const [posts, setPosts] = useState<WorldPost[]>([]);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [error, setError] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const fetchPage = useCallback(async (cursor?: WorldPost) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor?.createdAt) {
      params.set('beforeCreatedAt', cursor.createdAt);
      params.set('beforeId', String(cursor.id));
    }
    const response = await fetch(`/api/feed/world?${params.toString()}`, { credentials: 'include' });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Could not load World Feed posts.');
    }
    return response.json() as Promise<{ items: WorldPost[]; hasMore: boolean }>;
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError('');
    setPosts([]);
    setHasPrevious(false);
    fetchPage()
      .then(page => {
        if (currentRequestId !== requestId.current) return;
        setPosts(page.items);
        setHasPrevious(page.hasMore);
        requestAnimationFrame(() => {
          if (!feedRef.current) return;
          feedRef.current.scrollTop = feedRef.current.scrollHeight;
          setIsAtTop(feedRef.current.scrollTop <= 2);
        });
      })
      .catch((fetchError: Error) => {
        if (currentRequestId === requestId.current) setError(fetchError.message);
      })
      .finally(() => {
        if (currentRequestId === requestId.current) setIsLoading(false);
      });
  }, [fetchPage, refreshKey]);

  const loadPrevious = async () => {
    const oldestPost = posts[0];
    if (!oldestPost || isLoadingPrevious || !hasPrevious) return;
    const feed = feedRef.current;
    const oldHeight = feed?.scrollHeight ?? 0;
    const oldTop = feed?.scrollTop ?? 0;
    setIsLoadingPrevious(true);
    setError('');
    try {
      const page = await fetchPage(oldestPost);
      setPosts(currentPosts => [...page.items, ...currentPosts]);
      setHasPrevious(page.hasMore);
      requestAnimationFrame(() => {
        if (!feedRef.current) return;
        feedRef.current.scrollTop = oldTop + feedRef.current.scrollHeight - oldHeight;
        setIsAtTop(false);
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Could not load earlier posts.');
    } finally {
      setIsLoadingPrevious(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-col rounded-lg border p-4" aria-label="World Feed">
      <h3 className="mb-4 font-bold">World Feed</h3>
      <div
        ref={feedRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto"
        onScroll={event => setIsAtTop(event.currentTarget.scrollTop <= 2)}
      >
        {isAtTop && hasPrevious && (
          <div className="flex justify-center">
            <Button type="button" variant="outline" size="sm" onClick={loadPrevious} disabled={isLoadingPrevious}>
              {isLoadingPrevious ? 'Loading...' : 'See Previous 50?'}
            </Button>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading World Feed...</p>
        ) : posts.length === 0 && !error ? (
          <p className="text-center text-sm text-muted-foreground">No posts yet.</p>
        ) : posts.map(post => (
          <article key={post.id} className="rounded border border-gray-700 bg-gray-900/50 p-2">
            <p className="mb-1 flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
              <span className="font-semibold text-cyan-400">{post.username}</span>
              {post.createdAt && (
                <time className="text-gray-500" dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleString()}
                </time>
              )}
            </p>
            <p className="whitespace-pre-wrap break-words text-sm text-gray-100">{post.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WorldFeed;

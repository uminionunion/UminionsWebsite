import { useEffect, useState, useCallback } from 'react';
import { mountControlHub } from '../lib/mountControlHub';

// Shared "first 3, then +30 per View More click" pagination pattern used across
// Recent MemeBox Posts, Recent Social Media Posts, My Feed, and Union Announcements.
export function usePaginatedFeed<T>(
  fetchPage: (offset: number, limit: number) => Promise<{ items: T[]; total: number }>,
  deps: any[],
  active: boolean = true,
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [visibleCount, setVisibleCount] = useState(42);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // Reset back to the first page whenever the underlying identity (user/mode) changes.
  useEffect(() => {
    setVisibleCount(42);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setIsLoading(true);
    const releaseQueue = mountControlHub.enqueue(`feed-${reloadToken}-${visibleCount}`, () => fetchPage(0, visibleCount)
      .then(({ items: newItems, total: newTotal }) => {
        if (cancelled) return;
        setItems(newItems);
        setTotal(newTotal);
      })
      .catch((error) => {
        console.error('[PAGINATED FEED] Error fetching page:', error);
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      }), 20);
    return () => {
      cancelled = true;
      releaseQueue();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, visibleCount, active, reloadToken]);

  const viewMore = useCallback(() => setVisibleCount((prev) => prev + 42), []);
  const reload = useCallback(() => setReloadToken((prev) => prev + 1), []);

  return { items, total, isLoading, hasMore: total > visibleCount, viewMore, reload };
}

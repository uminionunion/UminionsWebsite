import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import QueuedImage from '../../components/QueuedImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BroadcastItem {
  id: number;
  title: string;
  imageUrl: string;
  clickUrl: string;
  description?: string;
}

interface BroadcastCarouselProps {
  items?: BroadcastItem[];
  visibleItemCount?: number;
  maxPages?: number;
  isAdmin?: boolean;
  onReorderLeft?: (itemId: number) => Promise<void>;
  onReorderRight?: (itemId: number) => Promise<void>;
  onImageZoom?: (imageUrl: string, title: string, items: BroadcastItem[], currentIndex: number) => void;
}

export const BroadcastCarousel: React.FC<BroadcastCarouselProps> = ({
  items = [],
  visibleItemCount = 2,
  maxPages,
  isAdmin = false,
  onReorderLeft,
  onReorderRight,
  onImageZoom,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReordering, setIsReordering] = useState(false);
  const itemsPerPage = Math.max(1, Math.floor(visibleItemCount));
  const totalPages = Math.min(Math.ceil(items.length / itemsPerPage), maxPages ?? Infinity);
  const firstItemId = items[0]?.id;

  React.useEffect(() => {
    setCurrentPage(0);
  }, [firstItemId]);
  React.useEffect(() => {
    setCurrentPage(page => Math.min(page, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const handleReorder = async (itemId: number, direction: 'left' | 'right') => {
    const reorder = direction === 'left' ? onReorderLeft : onReorderRight;
    if (!reorder || isReordering) return;
    setIsReordering(true);
    try {
      await reorder(itemId);
    } catch (error) {
      console.error('[CAROUSEL] Error reordering:', error);
      alert('Failed to reorder image');
    } finally {
      setIsReordering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex w-full items-center justify-center bg-muted rounded-lg h-48">
        <div className="text-center text-muted-foreground">Coming Soon This Week!!!</div>
      </div>
    );
  }

  return (
    <section aria-label="Broadcast image carousel" className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 gap-0 w-full h-full" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
        {items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((item, index) => {
          const itemIndex = currentPage * itemsPerPage + index;
          return (
            <div key={item.id} className="relative min-w-0 min-h-0 group">
              <button
                type="button"
                className="block w-full h-full p-0 border-0 bg-transparent overflow-hidden cursor-zoom-in"
                aria-label={`Enlarge ${item.title || 'broadcast image'}`}
                onClick={() => onImageZoom?.(item.imageUrl, item.title, items, itemIndex)}
              >
                <QueuedImage
                  src={item.imageUrl}
                  alt={item.title || 'Broadcast image'}
                  className="block h-full w-full object-cover"
                  onQueueError={error => console.error('[CAROUSEL] Image failed to load:', item.id, error)}
                />
              </button>
              {item.clickUrl && (
                <a href={item.clickUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 left-1 bg-black/80 text-white text-xs rounded px-2 py-1">
                  Open link
                </a>
              )}
              {isAdmin && (
                <div className="absolute top-1 left-1 right-1 flex justify-between pointer-events-none">
                  {onReorderLeft && (
                    <Button type="button" size="icon" aria-label={`Move ${item.title || 'image'} left`} disabled={isReordering || itemIndex === 0} onClick={() => void handleReorder(item.id, 'left')} className="pointer-events-auto h-7 w-7 bg-blue-600 text-white">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  {onReorderRight && (
                    <Button type="button" size="icon" aria-label={`Move ${item.title || 'image'} right`} disabled={isReordering || itemIndex === items.length - 1} onClick={() => void handleReorder(item.id, 'right')} className="pointer-events-auto ml-auto h-7 w-7 bg-green-600 text-white">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Previous carousel page"
        disabled={totalPages <= 1}
        onClick={() => setCurrentPage(page => (page === 0 ? totalPages - 1 : page - 1))}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-black/70 text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Next carousel page"
        disabled={totalPages <= 1}
        onClick={() => setCurrentPage(page => (page + 1) % totalPages)}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-black/70 text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="sr-only" aria-live="polite">Page {currentPage + 1} of {totalPages}</span>
    </section>
  );
};

export default BroadcastCarousel;

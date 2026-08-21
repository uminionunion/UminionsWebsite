import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
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
  isAdmin?: boolean;
  onReorderLeft?: (itemId: number) => Promise<void>;
  onReorderRight?: (itemId: number) => Promise<void>;
  onImageZoom?: (imageUrl: string, title: string, items: BroadcastItem[], currentIndex: number) => void;
}

export const BroadcastCarousel: React.FC<BroadcastCarouselProps> = ({ 
  items = [], 
  isAdmin = false,
  onReorderLeft,
  onReorderRight,
  onImageZoom
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReordering, setIsReordering] = useState(false);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const getCurrentItems = () => {
    const start = currentPage * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleReorderLeft = async (item: BroadcastItem, index: number) => {
    if (!onReorderLeft || isReordering) return;
    
    setIsReordering(true);
    try {
      await onReorderLeft(item.id);
      console.log('[CAROUSEL] Reordered left:', item.id);
    } catch (error) {
      console.error('[CAROUSEL] Error reordering:', error);
      alert('Failed to reorder image');
    } finally {
      setIsReordering(false);
    }
  };

  const handleReorderRight = async (item: BroadcastItem, index: number) => {
    if (!onReorderRight || isReordering) return;
    
    setIsReordering(true);
    try {
      await onReorderRight(item.id);
      console.log('[CAROUSEL] Reordered right:', item.id);
    } catch (error) {
      console.error('[CAROUSEL] Error reordering:', error);
      alert('Failed to reorder image');
    } finally {
      setIsReordering(false);
    }
  };

  // NEW: Handle image click for zoom (UPGRADED: pass all items and index)
  const handleImageClick = (e: React.MouseEvent, item: BroadcastItem) => {
    // If image has a clickUrl, allow navigation
    if (item.clickUrl) {
      return; // Let the link handle it
    }
    
    // Otherwise, show zoom overlay
    e.preventDefault();
    e.stopPropagation();
    
    if (onImageZoom) {
      const currentIndex = items.findIndex(i => i.id === item.id);
      console.log('[CAROUSEL] Image clicked for zoom:', item.title, 'Index:', currentIndex);
      onImageZoom(item.imageUrl, item.title, items, currentIndex);
    }
  };

  const currentItems = getCurrentItems();

  // If no items, show empty state
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg h-48">
        <div className="text-center text-muted-foreground">
          No images yet. Add images to get started!
        </div>
      </div>
    );
  }

  return (
  <div
    className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg"
    style={{ position: "relative" }}
  >



    
      {/* Left Arrow */}
<Button
  variant="outline"
  size="icon"
  onClick={handlePrevious}
  className="h-8 w-8"
  style={{
    // DEFAULT (desktop)
    position: "static",

    // MOBILE OVERRIDE
    ...(window.innerWidth <= 768 && {
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 20,
    }),
  }}
>
  <ChevronLeft className="h-4 w-4" />
</Button>



    

      {/* Images with Admin Controls */}
      <div className="flex gap-4 flex-1 justify-center">
        {currentItems.map((item, index) => (
          <div
            key={item.id}
            className="cursor-pointer hover:opacity-80 transition-opacity relative group"
            title={item.title}
          >
            {/* NEW: Wrapper div instead of <a> tag for better control */}
            <div className="h-32 w-32 rounded-md overflow-hidden bg-background border relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover cursor-pointer"
                onClick={(e) => handleImageClick(e, item)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Image';
                }}
              />
              
              {/* Admin Overlay Controls - Only visible to admins */}
              {isAdmin && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-between px-2 opacity-0 group-hover:opacity-100">
                  {/* Left Arrow */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReorderLeft(item, index);
                    }}
                    disabled={isReordering}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-full p-1.5 transition"
                    title="Move left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReorderRight(item, index);
                    }}
                    disabled={isReordering}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-full p-1.5 transition"
                    title="Move right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* NEW: External link handler if URL exists */}
            {item.clickUrl && (
              <a
                href={item.clickUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 rounded-md"
                title="Open external link"
              />
            )}
          </div>
        ))}
      </div>




{/* Right Arrow */}
<Button
  variant="outline"
  size="icon"
  onClick={handleNext}
  className="h-8 w-8"
  style={{
    // DEFAULT (desktop)
    position: "static",

    // MOBILE OVERRIDE
    ...(window.innerWidth <= 768 && {
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 20,
    }),
  }}
>
  <ChevronRight className="h-4 w-4" />
</Button>





    
    </div>
  );
};

export default BroadcastCarousel;

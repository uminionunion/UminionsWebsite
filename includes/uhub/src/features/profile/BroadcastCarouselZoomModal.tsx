import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface BroadcastItem {
  id: number;
  title: string;
  imageUrl: string;
  clickUrl: string;
  description?: string;
}

interface BroadcastCarouselZoomModalProps {
  imageUrl: string;
  title: string;
  items: BroadcastItem[];
  currentIndex: number;
  onClose: () => void;
}

const BroadcastCarouselZoomModal: React.FC<BroadcastCarouselZoomModalProps> = ({
  imageUrl: initialImageUrl,
  title: initialTitle,
  items,
  currentIndex: initialIndex,
  onClose,
  currentUser
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const currentItem = items[currentIndex];
  const imageUrl = currentItem?.imageUrl || initialImageUrl;
  const title = currentItem?.title || initialTitle;
  const currentImageId = currentItem?.id;

  

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 1));
  };



  
  
const [panX, setPanX] = useState(0);
const [panY, setPanY] = useState(0);

const handlePanLeft = () => setPanX(x => x + 125);
const handlePanRight = () => setPanX(x => x - 125);
const handlePanUp = () => setPanY(y => y + 125);
const handlePanDown = () => setPanY(y => y - 125);





  

  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };










  
  return (
    <div
      className="fixed inset-0 z-[999999] !z-[999999] flex items-center justify-center bg-black/70 pointer-events-auto"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label="Zoomed broadcast image viewer"
    >
      <div className="relative bg-black rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto z-[9999999] !z-[9999999] flex flex-col gap-4 w-[95%]">
        {/* Close Button - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:bg-gray-700"
          title="Close (ESC)"
          aria-label="Close zoom"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Main Image Container — REPLACED FOR TRUE ZOOM + INFINITE PAN */}
<div
  ref={imageContainerRef}
  className="rounded bg-gray-900"
  style={{
    width: '100%',
    height: '50vh',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    cursor: zoomLevel > 1 ? 'grab' : 'default'
  }}
>
  <img
    src={imageUrl}
    alt={title}
    className="rounded select-none"
    draggable="false"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel}) translate(-50%, -50%)`,
      transformOrigin: 'center center',
      width: 'auto',
      height: 'auto',
      maxWidth: 'none',
      maxHeight: 'none',
      objectFit: 'unset',
      pointerEvents: 'none'
    }}
  />
</div>


        {/* Image Title & Counter */}
        <div className="text-center w-full">
          <p className="text-white text-sm font-semibold">{title}</p>
          <p className="text-gray-400 text-xs mt-1">
            Image {currentIndex + 1} of {items.length}
          </p>
        </div>

        {/* Control Sections */}
        <div className="flex gap-6 justify-center w-full flex-wrap">
          {/* PAGE SECTION - Image navigation and zoom */}
          <div className="flex flex-col gap-2 items-center">
            <p className="text-gray-400 text-xs font-semibold mb-1">Page</p>
            <div className="flex gap-2">
              {items.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  className="h-10 w-10 bg-black/50 hover:bg-black/80 text-white border-gray-600"
                  title="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="h-10 w-10 bg-black/50 hover:bg-black/80 disabled:bg-gray-600 text-white border-gray-600"
                title="Zoom out"
              >
                <ZoomOut className="h-6 w-6" />
              </Button>

              <div className="h-10 px-3 bg-black/50 text-white border border-gray-600 rounded flex items-center justify-center text-xs font-semibold">
                {(zoomLevel * 100).toFixed(0)}%
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="h-10 w-10 bg-black/50 hover:bg-black/80 disabled:bg-gray-600 text-white border-gray-600"
                title="Zoom in"
              >
                <ZoomIn className="h-6 w-6" />
              </Button>

              {items.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="h-10 w-10 bg-black/50 hover:bg-black/80 text-white border-gray-600"
                  title="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>

          {/* PAN SECTION - Explicit pan controls when zoomed */}
          {true && (
            <div className="flex flex-col gap-2 items-center">
              <p className="text-gray-400 text-xs font-semibold mb-1">Pan</p>
              <div className="flex flex-col gap-1 items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePanUp}
                  className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                  title="Pan up"
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePanLeft}
                    className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                    title="Pan left"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePanDown}
                    className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                    title="Pan down"
                  >
                    <ArrowDown className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePanRight}
                    className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                    title="Pan right"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* UnionNews#14's Patreon Section that appears between the comments and th uHeadlines */}
        <p className="text-gray-500 text-xs text-center">
  These uHeadlines are provided by unionNews#14. They're free — but you can find our Patreon 
  <a 
    href="https://patreon.com/uminion" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-blue-400 underline hover:text-blue-300"
  >
    here
  </a>
  ! Supporting our Patreon will help our union grow its own News Network, hiring our own people at a $36.26/hr+ rate. 
  Join the uminion union! It's free! Sign up today! & enjoy our free uHeadlines eitherway!
</p>


        
      </div>
    </div>
  );
};

export default BroadcastCarouselZoomModal;

import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';

interface BroadcastCarouselZoomModalProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

const BroadcastCarouselZoomModal: React.FC<BroadcastCarouselZoomModalProps> = ({ imageUrl, title, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent aria-describedby={undefined} className="w-[95vw] max-w-5xl p-4 pt-10" onClick={event => event.stopPropagation()}>
        <DialogTitle className="text-center">{title || 'Broadcast image'}</DialogTitle>
        {loading && <p role="status">Loading image...</p>}
        {error && <p role="alert">Unable to load this image. Close and reopen it to retry.</p>}
        <div className="w-full overflow-auto" style={{ height: '65vh' }} tabIndex={0} aria-label="Enlarged image; scroll to explore when zoomed">
          <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
            <img
              src={imageUrl}
              alt={title || 'Enlarged broadcast image'}
              className="block w-full h-full object-contain"
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="icon" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.5))}><ZoomOut className="h-4 w-4" /></Button>
          <Button type="button" variant="outline" aria-label="Reset zoom to fit" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</Button>
          <Button type="button" variant="outline" size="icon" aria-label="Zoom in" disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + 0.5))}><ZoomIn className="h-4 w-4" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastCarouselZoomModal;

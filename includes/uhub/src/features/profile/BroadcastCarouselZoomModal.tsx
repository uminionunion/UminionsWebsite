import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';

interface BroadcastCarouselZoomModalProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

const BroadcastCarouselZoomModal: React.FC<BroadcastCarouselZoomModalProps> = ({ imageUrl, title, onClose }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent aria-describedby={undefined} className="w-[95vw] max-w-5xl p-4 pt-10" onClick={event => event.stopPropagation()}>
        <DialogTitle className="text-center">{title || 'Broadcast image'}</DialogTitle>
        {loading && <p role="status">Loading image...</p>}
        {error && <p role="alert">Unable to load this image. Close and reopen it to retry.</p>}
        <img
          src={imageUrl}
          alt={title || 'Enlarged broadcast image'}
          className="block w-full max-h-[72vh] object-contain"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastCarouselZoomModal;

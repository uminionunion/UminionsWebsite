import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface BadgeZoomToastProps {
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const BadgeZoomToast: React.FC<BadgeZoomToastProps> = ({ imageUrl, altText, onClose }) => {
  return (
    <div className="fixed inset-0 z-[999999] !z-[999999] flex items-center justify-center bg-black/70 pointer-events-auto">
      <div className="relative bg-black rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto z-[9999999] !z-[9999999]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:bg-gray-700"
          title="Close"
        >
          <X className="h-6 w-6" />
        </Button>
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-auto rounded"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default BadgeZoomToast;

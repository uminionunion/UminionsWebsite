
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface MainHubUpgradeV001ForProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any; // Replace 'any' with a proper product type
}

const MainHubUpgradeV001ForProductDetailModal: React.FC<MainHubUpgradeV001ForProductDetailModalProps> = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex p-0">
        {/* Left Panel: Image */}
        <div className="w-1/2 bg-black flex items-center justify-center overflow-hidden">
          {/* Basic image display. Zoom/pan functionality would require a library like react-zoom-pan-pinch */}
          <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>

        {/* Right Panel: Details */}
        <div className="w-1/2 p-8 flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
            {product.subtitle && <DialogDescription className="text-lg text-muted-foreground">{product.subtitle}</DialogDescription>}
          </DialogHeader>
          <div className="flex-grow overflow-y-auto my-6">
            <p>{product.description || "No description available."}</p>
          </div>
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">${product.price ? product.price.toFixed(2) : '0.00'}</span>
              <Button size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </div>
            {product.website && (
              <div className="text-sm">
                <span>Website: </span>
                <a href={product.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                  {product.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainHubUpgradeV001ForProductDetailModal;

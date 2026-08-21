import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ShoppingCart, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MainUhubFeatureV001ForProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

const MainUhubFeatureV001ForProductDetailModal: React.FC<MainUhubFeatureV001ForProductDetailModalProps> = ({ isOpen, onClose, product }) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  if (!product) return null;

  // Get payment method display text
  const getPaymentMethodDisplay = () => {
  switch (product.payment_method) {
    case 'cash':
      return 'Cash';
    case 'venmo_cashapp':
      return 'Venmo / CashApp / Other Payment App';
    case 'through_site':
      return 'Purchase through user\'s website:';
    case 'through_union':
      return 'Through the Union';
    default:
      return 'Not specified';
  }
};

  const handleSendMessage = async () => {
    if (!user) {
      alert('You must be logged in to contact the seller');
      return;
    }

    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSendingMessage(true);
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: product.user_id,
          message: messageText,
          product_id: product.id,
        }),
      });

      if (response.ok) {
        setMessageText('');
        alert('Message sent to seller');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleAddToCart = () => {
    if (product.payment_url) {
      window.open(product.payment_url, '_blank');
    } else {
      alert('No purchase URL available. Please contact the seller.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex p-0 overflow-hidden">
        {/* Left side - Image */}
        <div className="w-2/5 bg-black flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        {/* Right side - Product Details */}
        <div className="w-3/5 p-8 flex flex-col overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
            {product.subtitle && <DialogDescription className="text-lg text-muted-foreground mt-2">{product.subtitle}</DialogDescription>}
          </DialogHeader>

          {/* Description */}
          <div className="mb-6">
            <div className="text-sm whitespace-pre-wrap"> {product.description || "No description available."} </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-orange-400">${product.price ? product.price.toFixed(2) : '0.00'}</p>
          </div>

       {/* Payment Method Section */}
<div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
    <Mail className="h-4 w-4 text-orange-400" />
    Payment Method
  </h3>
  <p className="text-sm text-gray-200">{getPaymentMethodDisplay()}</p>
  {product.payment_method === 'through_site' && product.payment_url && (
    <a 
      href={product.payment_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-orange-400 hover:underline text-xs mt-2 inline-block"
    >
      {product.payment_url}
    </a>
  )}
</div>

          {/* Contact Seller Section - Only show if NOT purchasing through website */}
{product.payment_method !== 'through_site' && (
  user ? (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Mail className="h-4 w-4 text-orange-400" />
        Contact Seller
      </h3>
      <Textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Send a message to the seller..."
        className="mb-2 bg-gray-900 border-gray-600 text-white"
        rows={3}
      />
      <Button
        onClick={handleSendMessage}
        disabled={isSendingMessage || !messageText.trim()}
        className="w-full bg-orange-400 hover:bg-orange-500 text-white"
      >
        {isSendingMessage ? 'Sending...' : 'Send Message'}
      </Button>
    </div>
  ) : (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <p className="text-xs text-gray-300">Log in to contact the seller</p>
    </div>
  )
)}

          {/* Add to Cart Button */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white h-12 text-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainUhubFeatureV001ForProductDetailModal;

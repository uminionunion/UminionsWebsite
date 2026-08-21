import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Search, Plus, Minus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number;
  store_id?: number;
  sku_id?: string;
}

interface EverythingProductsListProps {
  products: Product[];
  isLoading: boolean;
  onProductView: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const EverythingProductsList: React.FC<EverythingProductsListProps> = ({ 
  products = [], 
  isLoading,
  onProductView,
  onAddToCart
}) => {
  const [inCart, setInCart] = useState<{ [key: number]: boolean }>({});

  const handleCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setInCart(prev => ({ ...prev, [product.id]: !prev[product.id] }));
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No products available</div>;
  }

  // Shuffle products randomly
  const shuffledProducts = [...products].sort(() => Math.random() - 0.5);

  return (
    <div className="everything-store-scrollable" style={{ maxHeight: '500px', overflow: 'hidden', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div className="grid grid-cols-2 gap-3">
        {shuffledProducts.map((product) => (
          <div 
             key={product.id}
             className="border rounded-md p-2 cursor-pointer hover:border-orange-400 transition flex flex-col h-32 relative overflow-hidden"
             style={{ 
               backgroundImage: product.image_url ? `url('${product.image_url}')` : 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}
             onClick={() => onProductView(product)}
             title="Click to view product details"
           >
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            {/* Product Details - ON TOP OF IMAGE */}
            <div className="relative z-10 mb-2 flex-shrink-0">
              <p className="font-semibold text-xs truncate text-white">{product.name}</p>
              {product.price && <p className="text-orange-400 text-xs font-semibold">${product.price.toFixed(2)}</p>}
            </div>

            {/* Spacer for middle area */}
            <div className="flex-1"></div>

            {/* Action Buttons - ON TOP OF IMAGE */}
            <div className="relative z-10 flex gap-1 flex-shrink-0">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-white hover:text-orange-400 flex-1 bg-black bg-opacity-30 hover:bg-opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductView(product);
                }}
                title="View product details"
              >
                <Search className="h-4 w-4" />
              </Button>
              {onAddToCart && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-white hover:text-orange-400 flex-1 bg-black bg-opacity-30 hover:bg-opacity-50"
                  onClick={(e) => handleCartClick(e, product)}
                  title={inCart[product.id] ? "Remove from cart" : "Add to cart"}
                >
                  {inCart[product.id] ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EverythingProductsList;

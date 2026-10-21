import React, { useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Search, ShoppingCart, Loader2 } from 'lucide-react';
import ProductQueuedImage from '../../components/ProductQueuedImage';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number;
  store_id?: number;
  sku_id?: string;
  payment_url?: string | null;
}

interface EverythingProductsListProps {
  products: Product[];
  isLoading: boolean;
  onProductView: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  error?: string;
  onRetry?: () => void;
}

const EverythingProductsList: React.FC<EverythingProductsListProps> = ({ 
  products = [], 
  isLoading,
  onProductView,
  onAddToCart,
  error,
  onRetry
}) => {
  const shuffledProducts = useMemo(() => [...products].sort(() => Math.random() - 0.5), [products]);

  if (isLoading) {
    return <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground" role="status" aria-label="Loading products"><Loader2 className="h-4 w-4 animate-spin" />Loading products...</div>;
  }

  if (error) {
    return <div role="alert" className="py-4 text-center text-red-400">
      <p>Products could not be loaded: {error}</p>
      {onRetry && <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry</Button>}
    </div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No products available</div>;
  }

  return (
    <div className="everything-store-scrollable" style={{ maxHeight: '500px', overflow: 'hidden', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div className="grid grid-cols-2 gap-3">
        {shuffledProducts.map((product) => (
          <div 
             key={product.id}
             className="border rounded-md p-2 cursor-pointer hover:border-orange-400 transition flex flex-col h-32 relative overflow-hidden"
             style={{ 
               background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
             }}
             onClick={() => onProductView(product)}
             title="Click to view product details"
           >
            {product.image_url && <ProductQueuedImage src={product.image_url} queue="users" alt="" className="absolute inset-0 h-full w-full object-cover" />}
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
                className="uhub-store-action h-7 w-7 flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductView(product);
                }}
                title="View product details"
                aria-label={`View ${product.name} details`}
              >
                <Search className="h-4 w-4" />
              </Button>
              {onAddToCart && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="uhub-store-action h-7 w-7 flex-1"
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  title="Add to cart"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="h-4 w-4" />
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

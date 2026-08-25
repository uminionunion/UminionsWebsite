import React from 'react';
import { Button } from '../../components/ui/button';
import { Eye, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number;
  store_id?: number;
}

interface AdminProductsListProps {
  products: Product[];
  isLoading: boolean;
  onProductView: (product: Product) => void;
  onProductDelete: (productId: number) => void;
}

const AdminProductsList: React.FC<AdminProductsListProps> = ({ 
  products = [], 
  isLoading,
  onProductView,
  onProductDelete
}) => {
  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No products yet. Click 'Add Product' to get started!</div>;
  }

  // Sort alphabetically
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-2">
      {sortedProducts.map((product) => (
        <div 
          key={product.id}
          className="border rounded-lg p-3 flex items-center gap-3 hover:border-orange-400 transition"
        >
          {/* Product Image */}
          <div className="w-12 h-12 flex-shrink-0 rounded border border-gray-700 overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                No img
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-grow min-w-0">
            <p className="font-semibold text-sm truncate">{product.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>${product.price ? product.price.toFixed(2) : '0.00'}</span>
              {product.store_type === 'store' && product.store_id && (
                <span>• Store #{String(product.store_id).padStart(2, '0')}</span>
              )}
              {product.store_type === 'main' && <span>• Union Store</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-blue-400 hover:text-blue-300"
              onClick={() => onProductView(product)}
              title="View product details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-400 hover:text-red-300"
              onClick={() => {
                if (confirm('Delete this product?')) {
                  onProductDelete(product.id);
                }
              }}
              title="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminProductsList;

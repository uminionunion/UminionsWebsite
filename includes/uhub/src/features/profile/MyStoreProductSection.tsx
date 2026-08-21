import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
}

const MyStoreProductSection: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const fetchUserProducts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/user/${user.id}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (user) {
      fetch('/api/products/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      }).catch(err => console.error('Error adding to cart:', err));
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No products yet. Add your first product!</div>;
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div key={product.id} className="border rounded-md p-2 flex items-center gap-2">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover rounded" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm">{product.name}</p>
            {product.price && <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => handleAddToCart(product)}
          >
            <ShoppingCart className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default MyStoreProductSection;

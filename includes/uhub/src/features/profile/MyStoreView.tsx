import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, RefreshCw, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import MainUhubFeatureV001ForAddProductModal from './MainUhubFeatureV001ForAddProductModal';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
}

interface LookingForItem {
  id: number;
  item_name: string;
  description?: string;
}

interface MyStoreViewProps {
  storeId?: number; // For HIGH-HIGH ADMIN - which store are we managing
  onAddProduct?: () => void;
}

const MyStoreView: React.FC<MyStoreViewProps> = ({ storeId, onAddProduct }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [lookingForItems, setLookingForItems] = useState<LookingForItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingLooking, setIsLoadingLooking] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLookingFor, setNewLookingFor] = useState('');
  const [currentStoreNum, setCurrentStoreNum] = useState(storeId || 1);

  const isHighHighAdmin = user?.is_high_high_admin === 1;

  // Fetch products
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const endpoint = isHighHighAdmin 
        ? `/api/products/store/${currentStoreNum}`
        : `/api/products/user/${user?.id}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch "Looking For" items
  const fetchLookingFor = async () => {
    setIsLoadingLooking(true);
    try {
      const endpoint = isHighHighAdmin 
        ? `/api/products/looking-for/store/${currentStoreNum}`
        : `/api/products/looking-for/user/${user?.id}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      setLookingForItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching looking for items:', error);
      setLookingForItems([]);
    } finally {
      setIsLoadingLooking(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchLookingFor();
    }
  }, [user, currentStoreNum, isHighHighAdmin]);

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${productId}/trash`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddLookingFor = async () => {
    if (!newLookingFor.trim()) return;

    try {
      const res = await fetch('/api/products/looking-for/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          store_id: currentStoreNum,
          item_name: newLookingFor,
          description: ''
        })
      });

      if (res.ok) {
        setNewLookingFor('');
        fetchLookingFor();
      }
    } catch (error) {
      console.error('Error adding looking for item:', error);
    }
  };

  const handleDeleteLookingFor = async (itemId: number) => {
    try {
      const res = await fetch(`/api/products/looking-for/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setLookingForItems(lookingForItems.filter(i => i.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting looking for item:', error);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* TOP HALF - MY STORE PRODUCTS */}
      <div className="flex-1 flex flex-col border rounded-lg p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3 pb-2 border-b flex-shrink-0">
          <h3 className="font-bold">My Store</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsAddModalOpen(true)}
              title="Add product"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={fetchProducts}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {isHighHighAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCurrentStoreNum(Math.max(1, currentStoreNum - 1))}
                  disabled={currentStoreNum === 1}
                  title="Previous store"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-xs font-semibold mx-1 min-w-fit">
                  Store #{String(currentStoreNum).padStart(2, '0')}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCurrentStoreNum(Math.min(30, currentStoreNum + 1))}
                  disabled={currentStoreNum === 30}
                  title="Next store"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Trash"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoadingProducts ? (
            <div className="text-center text-muted-foreground text-sm">Loading...</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="flex items-center gap-2 p-2 bg-muted rounded border">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{product.name}</p>
                  {product.price && (
                    <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => handleDeleteProduct(product.id)}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">No products yet</div>
          )}
        </div>
      </div>

      {/* BOTTOM HALF - WHAT I'M LOOKING FOR */}
      <div className="flex-1 flex flex-col border rounded-lg p-4 overflow-hidden">
        <h3 className="font-bold mb-3 pb-2 border-b flex-shrink-0">What I'm Looking For</h3>

        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {isLoadingLooking ? (
            <div className="text-center text-muted-foreground text-sm">Loading...</div>
          ) : lookingForItems.length > 0 ? (
            lookingForItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded border text-sm">
                <span>{item.item_name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => handleDeleteLookingFor(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">No items looking for</div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={newLookingFor}
            onChange={(e) => setNewLookingFor(e.target.value)}
            placeholder="What are you looking for?"
            className="text-sm h-8"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddLookingFor();
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleAddLookingFor}
          >
            Add
          </Button>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <MainUhubFeatureV001ForAddProductModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            fetchProducts();
          }}
          storeId={isHighHighAdmin ? currentStoreNum : undefined}
        />
      )}
    </div>
  );
};

export default MyStoreView;

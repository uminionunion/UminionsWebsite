import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';

interface Product {
  id: number;
  name: string;
  price: number | null;
  image_url: string | null;
  description: string | null;
  subtitle: string | null;
}

interface UserStore {
  id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  user_id: number;
  store_owner_username: string | null;
  created_at: string | null;
  products: Product[];
}

interface UserStoresQuadrantViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserStoresQuadrantView: React.FC<UserStoresQuadrantViewProps> = ({ isOpen, onClose }) => {
  const [stores, setStores] = useState<UserStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUserStores();
    }
  }, [isOpen]);

  const fetchUserStores = async () => {
    try {
      setIsLoading(true);
      console.log('[USER_STORES_QUADRANT] Fetching user stores with products');
      
      const response = await fetch('/api/products/stores/all/with-products');
      if (!response.ok) throw new Error('Failed to fetch user stores');
      
      const data: UserStore[] = await response.json();
      console.log('[USER_STORES_QUADRANT] Fetched stores:', data);
      setStores(data);
    } catch (error) {
      console.error('[USER_STORES_QUADRANT] Error fetching stores:', error);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto">
      <div className="bg-background rounded-lg p-6 max-w-6xl w-full mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Stores</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No user stores found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stores.map((store) => (
              <Card key={store.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  {store.subtitle && (
                    <p className="text-sm text-muted-foreground">{store.subtitle}</p>
                  )}
                  {store.store_owner_username && (
                    <p className="text-xs text-muted-foreground">by {store.store_owner_username}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {store.description && (
                    <p className="text-sm mb-4">{store.description}</p>
                  )}
                  
                  {store.products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products yet</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold">Products ({store.products.length})</p>
                      {store.products.map((product) => (
                        <div key={product.id} className="border-t pt-2">
                          <p className="font-sm font-medium">{product.name}</p>
                          {product.price && (
                            <p className="text-xs text-green-600">${product.price.toFixed(2)}</p>
                          )}
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="mt-2 w-full h-20 object-cover rounded"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStoresQuadrantView;

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MainUhubFeatureV001ForAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
  editingProduct?: Product | null;
}

interface Product {
  id: number;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  payment_method?: string | null;
  payment_url?: string | null;
  sku_id?: string | null;
  store_id?: number | null;
  user_store_id?: number | null;
}

interface UserStore {
  id: number;
  name: string;
  subtitle?: string | null;
  description?: string | null;
}

const MainUhubFeatureV001ForAddProductModal: React.FC<MainUhubFeatureV001ForAddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  editingProduct = null,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [existingQrImageUrl, setExistingQrImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [wooSku, setWooSku] = useState('');
  const [storeId, setStoreId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode] = useState(!!editingProduct);

  // User Store State
  const [userStores, setUserStores] = useState<UserStore[]>([]);
  const [isLoadingUserStores, setIsLoadingUserStores] = useState(false);
  const [addToUserStore, setAddToUserStore] = useState(false);
  const [selectedUserStoreId, setSelectedUserStoreId] = useState<string>('');
  const [showCreateNewStore, setShowCreateNewStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreSubtitle, setNewStoreSubtitle] = useState('');
  const [newStoreDescription, setNewStoreDescription] = useState('');
  const [newStoreBadgeImage, setNewStoreBadgeImage] = useState<File | null>(null);
  const [newStoreBannerImage, setNewStoreBannerImage] = useState<File | null>(null);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.name || '');
      setSubtitle(editingProduct.subtitle || '');
      setDescription(editingProduct.description || '');
      setPrice((editingProduct.price || '').toString());
      setExistingImageUrl(editingProduct.image_url || '');
      setPaymentMethod(editingProduct.payment_method || '');
      setExistingQrImageUrl('');
      setWebsiteUrl(editingProduct.payment_url || '');
      setWooSku(editingProduct.sku_id || '');
      setStoreId((editingProduct.store_id || '').toString());
    } else {
      setTitle('');
      setSubtitle('');
      setDescription('');
      setPrice('');
      setExistingImageUrl('');
      setPaymentMethod('');
      setExistingQrImageUrl('');
      setWebsiteUrl('');
      setWooSku('');
      setStoreId('');
    }
  }, [editingProduct, isOpen]);

  // Fetch user stores when modal opens (regular users only)
  useEffect(() => {
    if (isOpen && user && !isHighHighHighAdmin && !isHighHighAdmin) {
      fetchUserStores();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const isHighHighHighAdmin = user.is_high_high_high_admin === 1;
  const isHighHighAdmin = user.is_high_high_admin === 1;
  const isRegularUser = !isHighHighHighAdmin && !isHighHighAdmin;

  // Fetch user stores from backend
  const fetchUserStores = async () => {
    setIsLoadingUserStores(true);
    try {
      const res = await fetch(`/api/products/user/${user.id}/stores`);
      if (!res.ok) {
        throw new Error('Failed to fetch user stores');
      }
      const data = await res.json();
      console.log('[ADD PRODUCT MODAL] Fetched user stores:', data);
      setUserStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[ADD PRODUCT MODAL] Error fetching user stores:', error);
      setUserStores([]);
    } finally {
      setIsLoadingUserStores(false);
    }
  };

  // Create a new user store
  const handleCreateNewUserStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStoreName.trim()) {
      setError('Store name is required');
      return;
    }

    setIsCreatingStore(true);
    setError('');

    try {
      console.log('[ADD PRODUCT MODAL] Creating new user store:', newStoreName);
      
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('name', newStoreName.trim());
      formData.append('subtitle', newStoreSubtitle.trim() || '');
      formData.append('description', newStoreDescription.trim() || '');
      
      // Add badge image if provided
      if (newStoreBadgeImage) {
        formData.append('badgeImage', newStoreBadgeImage);
      }
      
      // Add banner image if provided
      if (newStoreBannerImage) {
        formData.append('bannerImage', newStoreBannerImage);
      }

      const response = await fetch(`/api/products/user/${user.id}/stores`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create store');
      }

      const newStore = await response.json();
      console.log('[ADD PRODUCT MODAL] ✅ New store created:', newStore);

      // Refresh the stores list
      await fetchUserStores();

      // Auto-select the newly created store
      setSelectedUserStoreId(String(newStore.id));

       // Reset the create store form
      setShowCreateNewStore(false);
      setNewStoreName('');
      setNewStoreSubtitle('');
      setNewStoreDescription('');
      setNewStoreBadgeImage(null);
      setNewStoreBannerImage(null);
    } catch (err) {
      console.error('[ADD PRODUCT MODAL] Error creating store:', err);
      setError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setQrCodeImage(e.target.files[0]);
    }
  };

  const handleNewStoreBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewStoreBadgeImage(e.target.files[0]);
    }
  };

  const handleNewStoreBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewStoreBannerImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || price === '') {
      setError('Title and price are required');
      return;
    }

    if (!paymentMethod) {
      setError('Payment method is required');
      return;
    }

    if (paymentMethod === 'venmo_cashapp' && !qrCodeImage && !existingQrImageUrl) {
      setError('QR code image is required for Venmo/CashApp option');
      return;
    }

    if (paymentMethod === 'through_site' && !websiteUrl) {
      setError('Website URL is required for "Through Site" option');
      return;
    }

    if ((isHighHighHighAdmin || isHighHighAdmin) && !storeId) {
      setError('Store selection is required');
      return;
    }

    // For regular users: ensure they selected or created a store
    if (isRegularUser && !selectedUserStoreId) {
      setError('Please select or create a store for your product');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', title);
      formData.append('subtitle', subtitle);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('payment_method', paymentMethod);
      formData.append('payment_url', websiteUrl);
      formData.append('sku_id', wooSku);

      // For admins: add store_id
      if ((isHighHighHighAdmin || isHighHighAdmin) && storeId) {
        formData.append('store_id', storeId);
      }

      // For regular users: add user_store_id
      if (isRegularUser && selectedUserStoreId) {
        formData.append('user_store_id', selectedUserStoreId);
      }

      // Add image files
      if (image) {
        formData.append('image', image);
      }

      if (qrCodeImage) {
        formData.append('qr_code_image', qrCodeImage);
      }

      // Create or update product
      const url = isEditMode ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEditMode ? 'PATCH' : 'POST';

      console.log('[ADD PRODUCT MODAL] Submitting product:', {
        method,
        url,
        isEditMode,
        isRegularUser,
        selectedUserStoreId,
      });

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
        console.error('[ADD PRODUCT MODAL] Error response:', data);
        return;
      }

      const responseData = await response.json();
      console.log('[ADD PRODUCT MODAL] ✅ Product created/updated successfully:', responseData);

      // Reset form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setPrice('');
      setPaymentMethod('');
      setQrCodeImage(null);
      setWebsiteUrl('');
      setWooSku('');
      setStoreId('');
      setImage(null);
      setAddToUserStore(false);
      setSelectedUserStoreId('');
      setShowCreateNewStore(false);
      setNewStoreName('');
      setNewStoreSubtitle('');
      setNewStoreDescription('');

      if (onProductAdded) {
        onProductAdded();
      }

      onClose();
    } catch (error) {
      console.error('[ADD PRODUCT MODAL] Error submitting product:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-background border rounded-lg p-6 max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add Product'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Product Name (required)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g., Vintage Leather Jacket"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Subtitle</label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              maxLength={300}
              placeholder="e.g., High quality, authentic"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100000}
              rows={4}
              placeholder="Describe your product in detail..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Price (required)</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {isHighHighHighAdmin && (
            <div>
              <label className="block font-semibold mb-2">SKU ID</label>
              <Input
                value={wooSku}
                onChange={(e) => setWooSku(e.target.value)}
                placeholder="SKU code (optional)"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">
              Payment Method:{' '}
              <span
                style={{
                  color: '#ffcc00',
                  marginLeft: '4px',
                  fontSize: '0.85em',
                  verticalAlign: 'baseline',
                }}
              >
                (How would you like your customers to pay/buy your product?)
              </span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>
                  With Cash{' '}
                  <span
                    style={{
                      color: '#00e5ff',
                      fontSize: '0.85em',
                      marginLeft: '4px',
                      verticalAlign: 'baseline',
                    }}
                  >
                    (primarily for local pickup similar to Craigslist/FB-Marketplace)
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="through_site"
                  checked={paymentMethod === 'through_site'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>
                  (Preferred:) Have Customers Purchase through your own Website.{' '}
                  <span
                    style={{
                      color: '#00e5ff',
                      fontSize: '0.85em',
                      marginLeft: '4px',
                      verticalAlign: 'baseline',
                    }}
                  >
                    (You provide a link; we advertise it in the "Everything Store".)
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="through_union"
                  disabled
                  className="w-4 h-4"
                />
                <span>Through the Union (Coming Soon)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="venmo_cashapp"
                  checked={paymentMethod === 'venmo_cashapp'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>
                  (Other:) Venmo/CashApp/Crypto/OtherApp{' '}
                  <span
                    style={{
                      color: '#00e5ff',
                      fontSize: '0.85em',
                      marginLeft: '4px',
                      verticalAlign: 'baseline',
                    }}
                  >
                    (Customer messages you and you go from there.)
                  </span>
                </span>
              </label>
            </div>
          </div>

          {paymentMethod === 'venmo_cashapp' && (
            <div>
              <label className="block font-semibold mb-2">Venmo/CashApp QR Code</label>
              <div className="border-2 border-dashed border-border rounded p-4 text-center mb-3">
                {qrCodeImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={URL.createObjectURL(qrCodeImage)}
                      alt="QR Code Preview"
                      className="max-h-32 max-w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setQrCodeImage(null)}
                      className="text-xs text-orange-400 hover:underline"
                    >
                      Remove QR code
                    </button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No QR code selected</p>
                )}
              </div>
              <Input type="file" accept="image/*" onChange={handleQrCodeChange} />
            </div>
          )}

          {paymentMethod === 'through_site' && (
            <div>
              <label className="block font-semibold mb-2">Website URL</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com/product"
              />
              <div className="mt-1">
                <sub style={{ color: '#ffcc00' }}>
                  Want to learn how to create a website with step-by-step instructions? <br />
                  We provide free lessons over at:
                  (
                  <a
                    href="https://github.com/uminionunion/UminionsWebsite/discussions/14"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#00e5ff', textDecoration: 'underline' }}
                  >
                    uminion's Lesson003
                  </a>
                  ) off our GitHub.
                </sub>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">Product Image</label>
            <div className="border-2 border-dashed border-border rounded p-4 text-center mb-3">
              {image ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-32 max-w-full" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-xs text-orange-400 hover:underline"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground">Upload a product image</p>
              )}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* ADMINS: Store Number Selection #01-#30 */}
          {(isHighHighHighAdmin || isHighHighAdmin) && (
            <div>
              <label className="block font-semibold mb-2">Store Number (required)</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-background"
                required
              >
                <option value="">Select store #01-#30</option>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Store #{String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* REGULAR USERS: Custom Store Selection/Creation */}
          {isRegularUser && (
            <div className="border rounded-lg p-4 bg-gray-900">
              <label className="block font-semibold mb-3">Add to Your Store</label>

              {isLoadingUserStores ? (
                <div className="text-sm text-muted-foreground py-2">Loading your stores...</div>
              ) : userStores.length > 0 && !showCreateNewStore ? (
                <>
                  <select
                    value={selectedUserStoreId}
                    onChange={(e) => setSelectedUserStoreId(e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-gray-800 text-white border-gray-600 text-sm mb-3"
                  >
                    <option value="">Select one of your stores...</option>
                    {userStores.map((store) => (
                      <option key={store.id} value={String(store.id)}>
                        {store.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateNewStore(true)}
                    className="w-full text-sm"
                  >
                    + Create New Store
                  </Button>
                </>
              ) : (
                <>
                  {userStores.length > 0 && !showCreateNewStore && (
                    <div className="text-sm text-muted-foreground py-2 mb-3">
                      You don't have any custom stores yet. Create one below to add products.
                    </div>
                  )}

                  {!showCreateNewStore ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateNewStore(true)}
                      className="w-full text-sm"
                    >
                      + Create New Store
                    </Button>
                  ) : (
                    <div className="border rounded p-3 bg-gray-800 space-y-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Store Name (required)</label>
                        <Input
                          value={newStoreName}
                          onChange={(e) => setNewStoreName(e.target.value)}
                          placeholder="e.g., Abdou's Digitals"
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Subtitle (optional)</label>
                        <Input
                          value={newStoreSubtitle}
                          onChange={(e) => setNewStoreSubtitle(e.target.value)}
                          placeholder="e.g., Digital Products & Services"
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Description (optional)</label>
                        <Textarea
                          value={newStoreDescription}
                          onChange={(e) => setNewStoreDescription(e.target.value)}
                          placeholder="Describe your store..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Store Badge Image (Required)</label>
                        <div className="border-2 border-dashed border-border rounded p-2 text-center mb-2">
                          {newStoreBadgeImage ? (
                            <div className="flex flex-col items-center gap-1">
                              <img
                                src={URL.createObjectURL(newStoreBadgeImage)}
                                alt="Badge Preview"
                                className="max-h-16 max-w-16 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setNewStoreBadgeImage(null)}
                                className="text-xs text-orange-400 hover:underline"
                              >
                                Remove badge
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No badge selected</p>
                          )}
                        </div>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleNewStoreBadgeChange}
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Store Banner Image (optional)</label>
                        <div className="border-2 border-dashed border-border rounded p-2 text-center mb-2">
                          {newStoreBannerImage ? (
                            <div className="flex flex-col items-center gap-1">
                              <img
                                src={URL.createObjectURL(newStoreBannerImage)}
                                alt="Banner Preview"
                                className="max-h-16 max-w-32 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setNewStoreBannerImage(null)}
                                className="text-xs text-orange-400 hover:underline"
                              >
                                Remove banner
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No banner selected</p>
                          )}
                        </div>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleNewStoreBannerChange}
                          className="text-xs"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={handleCreateNewUserStore}
                          disabled={isCreatingStore || !newStoreName.trim()}
                          className="flex-1 bg-orange-400 hover:bg-orange-500 text-white text-xs h-8"
                        >
                          {isCreatingStore ? 'Creating...' : 'Create Store'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowCreateNewStore(false);
                            setNewStoreName('');
                            setNewStoreSubtitle('');
                            setNewStoreDescription('');
                          }}
                          className="text-xs h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !title ||
                price === '' ||
                !paymentMethod ||
                (isRegularUser && !selectedUserStoreId)
              }
              className="flex-1 bg-orange-400 hover:bg-orange-500 text-white"
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update Product' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainUhubFeatureV001ForAddProductModal;

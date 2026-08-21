import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { X, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MainUhubFeatureV001ForEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  userStores: any[];
  onProductUpdated?: () => void;
}

interface UserStore {
  id: number;
  name: string;
  subtitle?: string | null;
  description?: string | null;
}

const MainUhubFeatureV001ForEditProductModal: React.FC<MainUhubFeatureV001ForEditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  userStores,
  onProductUpdated,
}) => {
  const { user } = useAuth();
  
  // Form State
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
  const [selectedUserStoreId, setSelectedUserStoreId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [badgeFileInputRef, setBadgeFileInputRef] = useState<HTMLInputElement | null>(null);
  const [bannerFileInputRef, setBannerFileInputRef] = useState<HTMLInputElement | null>(null);
  const badgeInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  // Pre-fill form when product loads or modal opens
  useEffect(() => {
    if (product && isOpen) {
      setTitle(product.name || '');
      setSubtitle(product.subtitle || '');
      setDescription(product.description || '');
      setPrice((product.price || '').toString());
      setExistingImageUrl(product.image_url || '');
      setPaymentMethod(product.payment_method || '');
      setExistingQrImageUrl('');
      setWebsiteUrl(product.payment_url || '');
      setWooSku(product.sku_id || '');
      setSelectedUserStoreId(product.user_store_id ? String(product.user_store_id) : '');
      setImage(null);
      setQrCodeImage(null);
      setError('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product || !user) return null;

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

      // Add user store assignment if selected
      if (selectedUserStoreId) {
        formData.append('user_store_id', selectedUserStoreId);
      }

      // Add new image if user selected one
      if (image) {
        formData.append('image', image);
      }

      // Add QR code if user selected one
      if (qrCodeImage) {
        formData.append('qr_code_image', qrCodeImage);
      }

      console.log('[EDIT PRODUCT MODAL] Submitting product update for product ID:', product.id);

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to update product');
        console.error('[EDIT PRODUCT MODAL] Error response:', data);
        return;
      }

      const responseData = await response.json();
      console.log('[EDIT PRODUCT MODAL] ✅ Product updated successfully:', responseData);

      setError('');
      if (onProductUpdated) {
        onProductUpdated();
      }

      onClose();
    } catch (err) {
      console.error('[EDIT PRODUCT MODAL] Error updating product:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



const handleEditStoreImage = (type: 'badge' | 'banner') => {
    const inputRef = type === 'badge' ? badgeInputRef : bannerInputRef;
    inputRef.current?.click();
  };

  const handleStoreImageChange = async (type: 'badge' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, JPEG, or PNG image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log(`[EDIT PRODUCT MODAL] Uploading ${type} for uStore ${selectedUserStoreId}`);

      const response = await fetch(`/api/products/user-stores/${selectedUserStoreId}/${type}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to upload ${type}: ${errorData.message}`);
        return;
      }

      const data = await response.json();
      console.log(`[EDIT PRODUCT MODAL] ✅ ${type} uploaded:`, data.imageUrl);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
    } catch (error) {
      console.error(`[EDIT PRODUCT MODAL] Error uploading ${type}:`, error);
      alert(`Failed to upload ${type}`);
    } finally {
      setIsSubmitting(false);
      // Reset file input
      const inputRef = type === 'badge' ? badgeInputRef : bannerInputRef;
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedUserStoreId) {
      alert('No store selected');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure? This will delete both this uStore along with all of the products found within. This action cannot be undone.'
    );

    if (!confirmed) {
      console.log('[EDIT PRODUCT MODAL] Store deletion cancelled by user');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`[EDIT PRODUCT MODAL] Deleting uStore ${selectedUserStoreId} and all its products`);

      const response = await fetch(`/api/products/user-stores/${selectedUserStoreId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to delete store: ${errorData.message}`);
        console.error('[EDIT PRODUCT MODAL] Delete error:', errorData);
        return;
      }

      const data = await response.json();
      console.log(`[EDIT PRODUCT MODAL] ✅ Store deleted successfully:`, data);
      alert(`Store deleted successfully! ${data.productsDeleted} products were also removed.`);

      // Close the modal and trigger refresh
      if (onProductUpdated) {
        onProductUpdated();
      }
      onClose();
    } catch (error) {
      console.error('[EDIT PRODUCT MODAL] Error deleting store:', error);
      alert('Failed to delete store: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };



  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100001]">
      <div className="bg-background border rounded-lg p-6 max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Product</h2>
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
                ) : existingQrImageUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={existingQrImageUrl}
                      alt="Current QR Code"
                      className="max-h-32 max-w-full"
                    />
                    <p className="text-xs text-gray-400">Current QR Code</p>
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
              ) : existingImageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={existingImageUrl}
                    alt="Current Product"
                    className="max-h-32 max-w-full"
                  />
                  <p className="text-xs text-gray-400">Current Image</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Upload a product image</p>
              )}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* User Store Selection */}
          {userStores.length > 0 && (
            <div>
              <label className="block font-semibold mb-2">Your Store</label>
              <select
                value={selectedUserStoreId}
                onChange={(e) => setSelectedUserStoreId(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-gray-900 border-gray-700 text-white text-sm"
              >
                <option value="">-- Select a store --</option>
                {userStores.map((store) => (
                  <option key={store.id} value={String(store.id)}>
                    {store.name}
                  </option>
                ))}
              </select>
              {selectedUserStoreId && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-sm mt-2">
                  Selected store: <strong>{userStores.find(s => s.id === parseInt(selectedUserStoreId))?.name}</strong>
                </div>
              )}
            </div>
          )}

          {/* NEW SECTION: STORE MANAGEMENT (appears only when a store is selected or product is assigned to a store) */}
          {selectedUserStoreId && parseInt(selectedUserStoreId) > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Store Management</h3>
              
              <div className="space-y-3">
                {/* Change uBadge Button */}
                <div className="flex items-center justify-between p-3 border border-gray-700 rounded bg-gray-900/50 hover:border-cyan-400 transition">
                  <div>
                    <p className="font-semibold text-sm">Change Store Badge</p>
                    <p className="text-xs text-gray-400">Update your store's logo badge</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEditStoreImage('badge')}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition disabled:opacity-50"
                  >
                    Change Badge
                  </button>
                </div>

                {/* Change uBanner Button */}
                <div className="flex items-center justify-between p-3 border border-gray-700 rounded bg-gray-900/50 hover:border-cyan-400 transition">
                  <div>
                    <p className="font-semibold text-sm">Change Store Banner</p>
                    <p className="text-xs text-gray-400">Update your store's banner image</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEditStoreImage('banner')}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition disabled:opacity-50"
                  >
                    Change Banner
                  </button>
                </div>

                {/* Delete uStore Button */}
                <div className="flex items-center justify-between p-3 border border-red-700/50 rounded bg-red-900/20 hover:border-red-500 transition">
                  <div>
                    <p className="font-semibold text-sm text-red-400">Delete Store</p>
                    <p className="text-xs text-red-300/70">Permanently delete this store and all its products</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteStore}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition disabled:opacity-50"
                  >
                    Delete Store
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !title ||
                price === '' ||
                !paymentMethod
              }
              className="flex-1 bg-orange-400 hover:bg-orange-500 text-white"
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>



{/* Hidden file inputs for store images */}
        <input
          ref={badgeInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={(e) => handleStoreImageChange('badge', e)}
          className="hidden"
          disabled={isSubmitting}
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={(e) => handleStoreImageChange('banner', e)}
          className="hidden"
          disabled={isSubmitting}
        />



        
      </div>
    </div>
  );
};

export default MainUhubFeatureV001ForEditProductModal;

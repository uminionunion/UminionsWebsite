import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../hooks/useAuth';

interface MyStoreAddProductFormProps {
  onProductAdded?: () => void;
}

const MyStoreAddProductForm: React.FC<MyStoreAddProductFormProps> = ({ onProductAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: '',
    paymentMethod: '',
    paymentUrl: '',
    wooSku: '',
    storeId: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const isHighHighHighAdmin = user.is_high_high_high_admin === 1;
  const isHighHighAdmin = user.is_high_high_admin === 1;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price) {
      setError('Product name and price are required');
      return;
    }

    if (isHighHighAdmin && !formData.storeId) {
      setError('Store selection is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const sendFormData = new FormData();
      sendFormData.append('name', formData.name);
      sendFormData.append('subtitle', formData.subtitle);
      sendFormData.append('description', formData.description);
      sendFormData.append('price', formData.price);
      sendFormData.append('payment_method', formData.paymentMethod);
      sendFormData.append('payment_url', formData.paymentUrl);

      if (isHighHighHighAdmin && formData.wooSku) {
        sendFormData.append('woo_sku', formData.wooSku);
      }

      if (isHighHighAdmin && formData.storeId) {
        sendFormData.append('store_id', formData.storeId);
      }

      if (image) {
        sendFormData.append('image', image);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: sendFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      setFormData({
        name: '',
        subtitle: '',
        description: '',
        price: '',
        paymentMethod: '',
        paymentUrl: '',
        wooSku: '',
        storeId: '',
      });
      setImage(null);

      if (onProductAdded) onProductAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-2 rounded text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block font-semibold mb-1 text-xs">Product Name *</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Product name"
          className="h-8 text-sm"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1 text-xs">Price *</label>
        <Input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="h-8 text-sm"
          required
        />
      </div>

      {isHighHighHighAdmin && (
        <div>
          <label className="block font-semibold mb-1 text-xs">WooCommerce SKU (optional)</label>
          <Input
            name="wooSku"
            value={formData.wooSku}
            onChange={handleInputChange}
            placeholder="SKU code"
            className="h-8 text-sm"
          />
        </div>
      )}

      {isHighHighAdmin && (
        <div>
          <label className="block font-semibold mb-1 text-xs">Store Number *</label>
          <select
            name="storeId"
            value={formData.storeId}
            onChange={handleInputChange}
            className="w-full border rounded px-2 py-1 bg-background text-sm h-8"
            required
          >
            <option value="">Select Store #01-#30</option>
            {Array.from({ length: 30 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Store #{String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block font-semibold mb-1 text-xs">Product Image</label>
        <Input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="h-8 text-xs"
        />
        {image && <p className="text-xs text-muted-foreground mt-1">Image selected: {image.name}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !formData.name || !formData.price}
        className="w-full bg-orange-400 hover:bg-orange-500 text-sm h-8"
      >
        {isSubmitting ? 'Adding...' : 'Add Product'}
      </Button>
    </form>
  );
};

export default MyStoreAddProductForm;

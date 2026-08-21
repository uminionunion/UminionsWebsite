import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface EditableUStoreBadgeBannerProps {
  type: 'badge' | 'banner';
  uStoreId: number;
  currentImageUrl: string | null;
  storeName: string;
  onImageUpdate: (uStoreId: number, imageUrl: string, type: 'badge' | 'banner') => void;
  isLoading?: boolean;
}

const EditableUStoreBadgeBanner: React.FC<EditableUStoreBadgeBannerProps> = ({
  type,
  uStoreId,
  currentImageUrl,
  storeName,
  onImageUpdate,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      console.log(`[EDIT MODE] Uploading ${type} for uStore ${uStoreId}`);

      const response = await fetch(`/api/products/user-stores/${uStoreId}/${type}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to upload ${type}: ${error.message}`);
        return;
      }

      const data = await response.json();
      console.log(`[EDIT MODE] ✅ ${type} uploaded:`, data.imageUrl);
      onImageUpdate(uStoreId, data.imageUrl, type);
    } catch (error) {
      console.error(`[EDIT MODE] Error uploading ${type}:`, error);
      alert(`Failed to upload ${type}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />
      
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="ghost"
        size="icon"
        className="relative group"
        title={`Click to upload ${type}`}
      >
        {currentImageUrl ? (
          <div className="relative">
            <img
              src={currentImageUrl}
              alt={`${storeName} ${type}`}
              className={type === 'badge' ? 'w-6 h-6 rounded object-cover' : 'h-6 rounded object-cover'}
              style={type === 'banner' ? { minWidth: '80px', maxWidth: '150px' } : {}}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center">
              <Upload className="h-3 w-3 text-white" />
            </div>
          </div>
        ) : (
          <div className={type === 'badge' ? 'w-6 h-6 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center' : 'h-6 bg-gray-700 rounded flex items-center justify-center'} style={type === 'banner' ? { minWidth: '80px', maxWidth: '150px' } : {}}>
            <Upload className="h-3 w-3 text-white" />
          </div>
        )}
      </Button>
    </>
  );
};

export default EditableUStoreBadgeBanner;

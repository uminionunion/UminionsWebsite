import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { X } from 'lucide-react';

interface BroadcastItem {
  id: number;
  title?: string;
  imageUrl: string;
  clickUrl?: string;
  description?: string;
}

interface UnionNews14FrontPageAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageAdded: (newImage: BroadcastItem) => void;
}

export const UnionNews14FrontPageAdminModal: React.FC<UnionNews14FrontPageAdminModalProps> = ({
  isOpen,
  onClose,
  onImageAdded,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setImageFile(file);
      setErrorMessage('');
    } else {
      setErrorMessage('Please select a valid image (JPG, JPEG, or PNG)');
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setErrorMessage('Please select an image');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('clickUrl', clickUrl);

      console.log('[UnionNews14] Submitting image upload...');

      const response = await fetch('/api/broadcasts/union-news-14/images/add', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[UnionNews14] Upload successful:', data);

      // Call the callback with the new image
      onImageAdded({
        id: data.id,
        title: data.title || undefined,
        imageUrl: data.imageUrl,
        clickUrl: data.clickUrl || undefined,
        description: data.description || undefined,
      });

      // Reset form
      setImageFile(null);
      setTitle('');
      setDescription('');
      setClickUrl('');

      // Show success message briefly
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('[UnionNews14] Error adding image:', error);
      setErrorMessage(`Failed to add image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100001]">
      <div className="bg-background border rounded-lg p-6 max-w-md w-[90%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Image to UnionNews#14</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Image (JPG, JPEG, or PNG) *</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageSelect}
              className="w-full p-2 border rounded bg-gray-800 text-white"
              disabled={isLoading}
            />
            {imageFile && (
              <p className="text-xs text-green-400 mt-1">✓ File selected: {imageFile.name}</p>
            )}
          </div>

          {/* Title (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Visit our shop"
              className="w-full p-2 border rounded bg-gray-800 text-white placeholder-gray-500"
              disabled={isLoading}
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full p-2 border rounded bg-gray-800 text-white placeholder-gray-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Click URL (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2">URL (Optional)</label>
            <input
              type="url"
              value={clickUrl}
              onChange={(e) => setClickUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border rounded bg-gray-800 text-white placeholder-gray-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400 mt-1">If provided, image becomes clickable</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-900/30 border border-red-600 rounded text-red-200 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={!imageFile || isLoading}
              className="flex-1 bg-green-700 hover:bg-green-800"
            >
              {isLoading ? 'Adding...' : 'Add Image'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnionNews14FrontPageAdminModal;


import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MainHubUpgradeV001ForAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainHubUpgradeV001ForAddProductModal: React.FC<MainHubUpgradeV001ForAddProductModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [website, setWebsite] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    // Logic to submit the new product data
    console.log({ title, subtitle, description, price, website, image });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex p-0">
        {/* Left Panel: Form */}
        <div className="w-1/2 p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle>Add a New Product</DialogTitle>
            <DialogDescription>Fill in the details for your new product.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            <div>
              <Label htmlFor="title">Title (max 100 chars)</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label htmlFor="subtitle">Subheader (max 300 chars)</Label>
              <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={300} />
            </div>
            <div>
              <Label htmlFor="description">Description (max 1000 chars)</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={5} />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleSubmit}>Submit Product</Button>
          </DialogFooter>
        </div>

        {/* Right Panel: Image Upload */}
        <div className="w-1/2 p-6 border-l bg-muted/40 flex flex-col items-center justify-center">
          <DialogHeader className="mb-4">
            <DialogTitle>Upload Product Image</DialogTitle>
          </DialogHeader>
          <div className="w-full h-64 border-2 border-dashed border-border rounded-md flex items-center justify-center mb-4">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="Product preview" className="max-h-full max-w-full" />
            ) : (
              <p className="text-muted-foreground">Image preview</p>
            )}
          </div>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainHubUpgradeV001ForAddProductModal;

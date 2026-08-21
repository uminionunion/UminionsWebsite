import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Share2, Check } from 'lucide-react';

interface ShareProfileButtonProps {
  userId: number;
  username: string;
}

const ShareProfileButton: React.FC<ShareProfileButtonProps> = ({ userId, username }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?openProfile=${username}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="flex items-center gap-2 text-xs"
      title={`Share ${username}'s profile`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-3 w-3" />
          Share
        </>
      )}
    </Button>
  );
};

export default ShareProfileButton;

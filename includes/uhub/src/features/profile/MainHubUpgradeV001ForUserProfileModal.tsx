
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';

interface MainHubUpgradeV001ForUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Replace with a proper user type
}

const MainHubUpgradeV001ForUserProfileModal: React.FC<MainHubUpgradeV001ForUserProfileModalProps> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader>
          <DialogTitle>{user.username}'s Profile</DialogTitle>
        </DialogHeader>
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Top Section */}
          <div className="flex p-4 border-b">
            <div className="w-1/5 pr-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">List of Friends</Button>
                <Button variant="outline" className="w-full justify-start">Favorited Broadcasts</Button>
                <Button variant="outline" className="w-full justify-start">Created Chatrooms</Button>
                <Button variant="secondary" className="w-full justify-start"><MessageSquare className="mr-2 h-4 w-4"/>Direct Message</Button>
            </div>
            <div className="w-3/5 h-40 bg-cover bg-center rounded-md" style={{ backgroundImage: `url(${user.cover_photo_url || 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png'})` }}>
            </div>
            <div className="w-1/5 flex justify-end items-start pl-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.profile_image_url || 'https://uminion.com/wp-content/uploads/2025/02/iArt06532.png'} alt={user.username} />
                <AvatarFallback>{user.username.charAt(1).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Center Section */}
          <div className="flex-grow flex overflow-hidden">
            <div className="w-[33%] p-4 border-r overflow-y-auto">
              <h3 className="font-bold mb-4">Products for Sale</h3>
              {/* Placeholder for user's products */}
              <div className="text-center text-muted-foreground">No products yet.</div>
            </div>
            <div className="w-[34%] p-4 overflow-y-auto">
              <h3 className="font-bold mb-4">Hosted Broadcasts</h3>
              {/* Placeholder for user's broadcasts */}
              <div className="text-center text-muted-foreground">No broadcasts yet.</div>
            </div>
            <div className="w-[33%] p-4 border-l overflow-y-auto">
              <h3 className="font-bold mb-4">Recent Episodes</h3>
              {/* Placeholder for recent episodes */}
              <div className="text-center text-muted-foreground">No episodes yet.</div>
            </div>
          </div>

          {/* Bottom Section (Social Links) */}
          <div className="flex border-t p-4 justify-center">
            <p className="text-sm text-muted-foreground">Social links would appear here.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainHubUpgradeV001ForUserProfileModal;

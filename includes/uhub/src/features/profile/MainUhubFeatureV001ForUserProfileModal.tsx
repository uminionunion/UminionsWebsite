import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { MessageSquare, Eye } from 'lucide-react';
import ShareProfileButton from './ShareProfileButton';
import EditableUStoreBadgeBanner from './EditableUStoreBadgeBanner';

interface MainUhubFeatureV001ForUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  currentUser?: any;
  onProductView?: (product: any) => void;
  onBadgeZoom?: (badge: { url: string; name: string }) => void;
  onBadgeZoomOpen?: (badge: { url: string; name: string }) => void;
}

const MainUhubFeatureV001ForUserProfileModal: React.FC<MainUhubFeatureV001ForUserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  currentUser, 
  onProductView,
  onBadgeZoom,
  onBadgeZoomOpen 
}) => {
   const [userStoresData, setUserStoresData] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [zoomedBadge, setZoomedBadge] = useState<{ url: string; name: string } | null>(null);

  const isOwnProfile = currentUser && user.id === currentUser.id;



// Handler for badge/banner updates
  const handleBadgeBannerUpdate = async (uStoreId: number, imageUrl: string, type: 'badge' | 'banner') => {
    // Update local state to reflect new image immediately
    setUserStoresData(prevStores =>
      prevStores.map(store =>
        store.id === uStoreId
          ? { ...store, [type + '_url']: imageUrl }
          : store
      )
    );
    console.log(`[EDIT MODE] ✅ ${type} updated for uStore ${uStoreId}`);
  };



  
  // Fetch user's stores and products when modal opens
  useEffect(() => {
    if (isOpen && user && user.id) {
      setIsLoadingStores(true);
      console.log(`[FRIEND PROFILE] Fetching stores for user ${user.id} (${user.username})`);
      
      fetch(`/api/products/user/${user.id}/stores`)
        .then(res => {
          if (!res.ok) {
            console.log(`[FRIEND PROFILE] Stores fetch failed with status ${res.status}`);
            setUserStoresData([]);
            return Promise.resolve([]);
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            console.log(`[FRIEND PROFILE] ✅ Loaded ${data.length} stores for ${user.username}`, data);
            setUserStoresData(data);
          } else {
            console.log('[FRIEND PROFILE] Response was not an array:', data);
            setUserStoresData([]);
          }
        })
        .catch(error => {
          console.error('[FRIEND PROFILE] Error fetching stores:', error);
          setUserStoresData([]);
        })
        .finally(() => setIsLoadingStores(false));
    }
  }, [isOpen, user]);

  if (!user) return null;

  return (
    
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
       <DialogHeader className="flex items-center justify-between pr-4">
  <div className="flex items-center gap-2">
    <DialogTitle>{user.username}'s Profile</DialogTitle>
    <span className="text-xs text-gray-500 ml-2">#{user.id}</span>
  </div>
  <ShareProfileButton userId={user.id} username={user.username} />
</DialogHeader>
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex p-4 border-b">
            {/* AFTER - Add Edit button only for own profile */}
<div className="w-1/5 pr-4 space-y-2">
              <Button variant="outline" className="w-full justify-start">List of Friends</Button>
              <Button variant="outline" className="w-full justify-start">Favorited Broadcasts</Button>
              <Button variant="outline" className="w-full justify-start">Created Chatrooms</Button>
              <Button variant="secondary" className="w-full justify-start"><MessageSquare className="mr-2 h-4 w-4"/>Direct Message</Button>
              
              {/* NEW: Edit button (only for own profile) */}
              {isOwnProfile && !isEditMode && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={() => setIsEditMode(true)}
                >
                  Edit?
                </Button>
              )}
              
              {/* Exit edit mode button */}
              {isOwnProfile && isEditMode && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setIsEditMode(false)}
                >
                  Done Editing
                </Button>
              )}
            </div>
            <div className="w-3/5 h-40 bg-cover bg-center rounded-md" style={{ backgroundImage: `url(${user.cover_photo_url || 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png'})` }}>
            </div>
            <div className="w-1/5 flex justify-end items-start pl-4">
  <div 
    onClick={() => {
      if (user.profile_image_url) {
        onBadgeZoomOpen?.({ url: user.profile_image_url, name: user.username });
      }
    }}
    className="cursor-pointer relative group"
  >
    <Avatar className="h-32 w-32 group-hover:opacity-80 transition">
      <AvatarImage src={user.profile_image_url || 'https://uminion.com/wp-content/uploads/2025/02/iArt06532.png'} alt={user.username} />
      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  </div>
</div>
          </div>

          <div className="flex-grow flex overflow-hidden">
            <div className="w-[33%] p-4 border-r overflow-y-auto">
              <h3 className="font-bold mb-4">Products for Sale</h3>
              {isLoadingStores ? (
                <div className="text-center text-muted-foreground">Loading stores...</div>
              ) : userStoresData && userStoresData.length > 0 ? (
                <div className="space-y-3">
                  {userStoresData.map((uStore) => (
  <div key={uStore.id} className="space-y-1">
    {/* uStore Header with Badge and Banner */}
    <div className="flex items-center gap-2 py-1 px-2 rounded border border-gray-700 bg-gray-900/50">
      {/* uBadge (left) - Fixed size icon, clickable for zoom */}
                        {isEditMode && isOwnProfile ? (
                          <EditableUStoreBadgeBanner
                            type="badge"
                            uStoreId={uStore.id}
                            currentImageUrl={uStore.badge_url}
                            storeName={uStore.name}
                            onImageUpdate={handleBadgeBannerUpdate}
                            isLoading={isLoadingUpdate}
                          />
                        ) : (
                          uStore.badge_url ? (
                            <img
                              src={uStore.badge_url}
                              alt={`${uStore.name} badge`}
                              className="w-6 h-6 rounded object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                              onClick={() => {
                                 onBadgeZoomOpen?.({ url: uStore.badge_url, name: uStore.name });
                               }}
                              title="Click to zoom"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-700 rounded flex-shrink-0" />
                          )
                        )}
      
      {/* uStore Name */}
      <span className="font-semibold text-xs text-cyan-400 flex-shrink-0 whitespace-nowrap">
        {uStore.name}
      </span>
      
       
{isEditMode && isOwnProfile ? ( // uBanner (right) - Takes remaining space
  <EditableUStoreBadgeBanner
    type="banner"
    uStoreId={uStore.id}
    currentImageUrl={uStore.banner_url}
    storeName={uStore.name}
    onImageUpdate={handleBadgeBannerUpdate}
    isLoading={isLoadingUpdate}
  />
) : (
  uStore.banner_url ? (
    <img
      src={uStore.banner_url}
      alt={`${uStore.name} banner`}
      className="h-6 rounded object-cover flex-grow ml-auto cursor-pointer hover:opacity-80 transition"
      style={{ minWidth: '80px', maxWidth: '150px' }}
      onClick={() => {
        onBadgeZoomOpen?.({ url: uStore.banner_url, name: uStore.name });
      }}
      title="Click to zoom"
    />
  ) : (
    <img
      src="/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"
      alt="default banner"
      className="h-6 rounded object-cover flex-grow ml-auto cursor-pointer hover:opacity-80 transition"
      style={{ minWidth: '80px', maxWidth: '150px' }}
      onClick={() => {
        onBadgeZoomOpen?.({ url: "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg", name: uStore.name });
      }}
      title="Click to zoom"
    />
  )
)}
    </div>

    {/* Products within uStore */}
    <div className={`ml-2 space-y-1 ${
      uStore.products && uStore.products.length >= 5 
        ? 'max-h-48 overflow-y-auto' 
        : ''
    }`}>
                        {uStore.products && uStore.products.length > 0 ? (
                          uStore.products.map((product: any) => (
                            <div
                              key={product.id}
                              className="border rounded p-2 text-xs flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer bg-gray-800/30"
                              onClick={() => onProductView && onProductView(product)}
                            >
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-5 h-5 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate text-xs">{product.name}</p>
                                {product.price && (
                                  <p className="text-orange-400 text-xs">${product.price.toFixed(2)}</p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-white hover:text-orange-400 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onProductView && onProductView(product);
                                }}
                                title="View product details"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic ml-2">No products in this store</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">No stores yet.</div>
              )}
            </div>
            <div className="w-[34%] p-4 overflow-y-auto">
              <h3 className="font-bold mb-4">Hosted Broadcasts</h3>
              <div className="text-center text-muted-foreground">No broadcasts yet.</div>
            </div>
            <div className="w-[33%] p-4 border-l overflow-y-auto">
              <h3 className="font-bold mb-4">Recent Episodes</h3>
              <div className="text-center text-muted-foreground">No episodes yet.</div>
            </div>
          </div>

          <div className="flex border-t p-4 justify-center">
            <p className="text-sm text-muted-foreground">Social links would appear here.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>





    
  );
};

export default MainUhubFeatureV001ForUserProfileModal;

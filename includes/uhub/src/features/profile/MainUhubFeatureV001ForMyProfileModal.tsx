import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play, X, Mountain, Home, ChevronDown, ChevronUp, Trash2, Anvil, Pencil } from 'lucide-react';
import MainUhubFeatureV001ForChatModal from '../uminion/MainUhubFeatureV001ForChatModal';
import { useAuth } from '../../hooks/useAuth';
import MainUhubFeatureV001ForAddProductModal from './MainUhubFeatureV001ForAddProductModal';
import MainUhubFeatureV001ForProductDetailModal from './MainUhubFeatureV001ForProductDetailModal';
import MainUhubFeatureV001ForFriendsView from './MainUhubFeatureV001ForFriendsView';
import MainUhubFeatureV001ForSettingsView from './MainUhubFeatureV001ForSettingsView';
import { CreateBroadcastView } from './CreateBroadcastView';
import BroadcastCarousel from './BroadcastCarousel';
import AdminProductsList from './AdminProductsList';
import EverythingProductsList from './EverythingProductsList';
import ProductSearchDropdown from './ProductSearchDropdown';
import MainUhubFeatureV001ForEditProductModal from './MainUhubFeatureV001ForEditProductModal';
import MainUhubFeatureV001ForUserProfileModal from './MainUhubFeatureV001ForUserProfileModal';
import UserStoresQuadrantView from './UserStoresQuadrantView';
import { io, Socket } from 'socket.io-client';
import UnionNews14FrontPageAdminModal from './UnionNews14FrontPageAdminModal';
import BroadcastCarouselZoomModal from './BroadcastCarouselZoomModal';
import TheMemeBoxImplementation001 from './TheMemeBoxImplementation001';
import { renderTheMemeBox, unmountTheMemeBox } from '@/TheMemeBoxRenderer';



interface MainUhubFeatureV001ForMyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onBadgeZoom?: (badge: { url: string; name: string }) => void;
}

const ALL_STORES = [
  { id: 0, name: 'Union Main Store', number: 0, displayName: 'Union Main Store#0', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 1, name: 'NewEngland#01', number: 1, displayName: 'NewEngland#01', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 2, name: 'CentralEastCoast#02', number: 2, displayName: 'CentralEastCoast#02', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 3, name: 'SouthEast#03', number: 3, displayName: 'SouthEast#03', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 4, name: 'Appalachia&TheGreatLakes#04', number: 4, displayName: 'Appalachia&TheGreatLakes#04', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 5, name: 'CentralSouth&Mexico#05', number: 5, displayName: 'CentralSouth&Mexico#05', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 6, name: 'CentralNorth&Canada#06', number: 6, displayName: 'CentralNorth&Canada#06', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 7, name: 'SouthWest#07', number: 7, displayName: 'SouthWest#07', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 8, name: 'NorthWest#08', number: 8, displayName: 'NorthWest#08', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 9, name: 'International#09', number: 9, displayName: 'International#09', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 10, name: 'TheGreatHall#10', number: 10, displayName: 'TheGreatHall#10', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 11, name: 'UnionWaterfall#11', number: 11, displayName: 'UnionWaterfall#11', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 12, name: 'UnionEvent#12', number: 12, displayName: 'UnionEvent#12', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 13, name: 'UnionSupport#13', number: 13, displayName: 'UnionSupport#13', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 14, name: 'UnionNews#14', number: 14, displayName: 'UnionNews#14', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 15, name: 'UnionRadio#15', number: 15, displayName: 'UnionRadio#15', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 16, name: 'UnionDrive#16', number: 16, displayName: 'UnionDrive#16', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 17, name: 'UnionArchive&Education#17', number: 17, displayName: 'UnionArchive&Education#17', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 18, name: 'UnionTech#18', number: 18, displayName: 'UnionTech#18', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 19, name: 'UnionPolitic#19', number: 19, displayName: 'UnionPolitic#19', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 20, name: 'UnionSAM#20', number: 20, displayName: 'UnionSAM#20', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 21, name: 'UnionUkraine#21', number: 21, displayName: 'UnionUkraine#21', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 22, name: 'FestyLove#22', number: 22, displayName: 'FestyLove#22', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 23, name: 'UnionLegal#23', number: 23, displayName: 'UnionLegal#23', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 24, name: 'UnionMarket#24', number: 24, displayName: 'UnionMarket#24', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 25, name: 'UnionArena#25', number: 25, displayName: 'UnionArena#25', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 26, name: 'UnionTradeEnergy&CommunityWIFI#26', number: 26, displayName: 'UnionTradeEnergy&CommunityWIFI#26', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 27, name: 'UnionSecret#27', number: 27, displayName: 'UnionSecret#27', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 28, name: 'UnionSports#28', number: 28, displayName: 'UnionSports#28', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 29, name: 'UnionWheelsVehicles&eMods#29', number: 29, displayName: 'UnionWheelsVehicles&eMods#29', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
  { id: 30, name: 'UnionHousing&Healthcare#30', number: 30, displayName: 'UnionHousing&Healthcare#30', badge_url: '/defaultUminionUassets/defaultUminionUbadge.png', banner_url: '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg' },
];

const socialLinksLeft = [
  { id: 'facebook', href: 'https://www.facebook.com/groups/1615679026489537', icon: <Facebook /> },
  { id: 'bluesky', href: 'https://bsky.app/profile/uminion.bsky.social', icon: <MessageSquare /> },
  { id: 'github', href: 'https://github.com/uminionunion/uminionswebsite', icon: <Github /> },
  { id: 'youtube', href: 'https://www.youtube.com/@UminionUnion', icon: <Youtube /> },
  { id: 'twitch', href: 'https://www.twitch.tv/theuminionunion', icon: <Twitch /> },
  { id: 'discord', href: 'https://discord.com/login?redirect_to=%2Flogin%3Fredirect_to%3D%252Fchannels%252F1357919291428573204%252F1357919292280144075', icon: 'D' },
  { id: 'page2-1', href: 'https://example.com/page2-1', icon: 'L1' },
  { id: 'page2-2', href: 'https://example.com/page2-2', icon: 'L2' },
  { id: 'page2-3', href: 'https://example.com/page2-3', icon: 'L3' },
  { id: 'page2-4', href: 'https://example.com/page2-4', icon: 'L4' },
  { id: 'page2-5', href: 'https://example.com/page2-5', icon: 'L5' },
  { id: 'page2-6', href: 'https://example.com/page2-6', icon: 'L6' },
];

const socialLinksRight = [
  { id: 'instagram', href: 'https://www.instagram.com/theuminionunion/?igsh=ajdjeGUycHRmczVs&ut-m_source=qr#', icon: <Instagram /> },
  { id: 'mastodon', href: 'https://mastodon.social/@uminion', icon: 'M' },
  { id: 'githubDiscussions', href: 'https://github.com/uminionunion/UminionsWebsite/discussions', icon: <Github /> },
  { id: 'threads', href: 'https://www.threads.com/@theuminionunion', icon: '@' },
  { id: 'patreon', href: 'https://www.patreon.com/uminion', icon: 'P' },
  { id: 'githubIssues', href: 'https://github.com/uminionunion/UminionsWebsite/issues', icon: <Github /> },
  { id: 'page2-r1', href: 'https://example.com/page2-r1', icon: 'R1' },
  { id: 'page2-r2', href: 'https://example.com/page2-r2', icon: 'R2' },
  { id: 'page2-r3', href: 'https://example.com/page2-r3', icon: 'R3' },
  { id: 'page2-r4', href: 'https://example.com/page2-r4', icon: 'R4' },
  { id: 'page2-r5', href: 'https://example.com/page2-r5', icon: 'R5' },
  { id: 'page2-r6', href: 'https://example.com/page2-r6', icon: 'R6' },
];

const MainUhubFeatureV001ForSocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
    {children}
  </a>
);

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number;
  url?: string;
  time?: string;
  location?: string;
  store_id?: number;
  sku_id?: string;
  user_store_id?: number;
  user_store_name?: string;
}

const ProductBox = ({ product, onMagnify, onAddToCart }) => {
    const [inCart, setInCart] = useState(false);

    const handleCartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!inCart) {
        onAddToCart(product);
      }
      setInCart(!inCart);
    };

    if (!product) return <div className="h-36 md:h-48 border rounded-md p-2 flex items-center justify-center text-muted-foreground">No Product</div>;

    const handleImageClick = () => {
        if (product.url) {
            window.open(product.url, '_blank');
        }
    };

    return (
        <div className="border rounded-md p-2 relative h-36 md:h-48 group">
            <div className="absolute top-1 left-1 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded z-10">{product.name}</div>
            <div className="absolute top-1 right-1 z-10">
                {product.time ? (
                    <span className="text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded">{product.time}</span>
                ) : (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMagnify(product)}>
                        <Search className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="h-full bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url('${product.image_url}')` }} onClick={handleImageClick}></div>
            <div className="absolute bottom-1 left-1 z-10 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded">
                {product.location ? (
                    <span>{product.location}</span>
                ) : (
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={handleCartClick}>
                        {inCart ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {product.price && (
                <div className="absolute bottom-1 right-1 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded z-10">${product.price.toFixed(2)}</div>
            )}
        </div>
    );
};


const BroadcastView = ({ 
  broadcast, 
  user, 
  broadcastView, 
  unionNews14Images, 
  onOpenUnionNews14Modal, 
  onImageZoom,
  broadcastDividerDragging,
  setBroadcastDividerDragging,
  broadcastLeftWidth,
  setBroadcastLeftWidth,
  broadcastRightWidth,
  setBroadcastRightWidth,
  broadcastCarouselImageCount,
  setBroadcastCarouselImageCount,
  isBroadcastLeftCollapsed,
  setIsBroadcastLeftCollapsed,
  isBroadcastCarouselCollapsed,
  setIsBroadcastCarouselCollapsed,
  // NEW PROPS FOR MOBILE CHAT
  activeChatModal,
  onCloseChatModal,
  MainUhubFeatureV001ForSisterUnionPages,
  MainUhubFeatureV001ForModalColors,
}) => {
  const handleReorderLeft = async (imageId: number) => {
    try {
      const response = await fetch(`/api/broadcasts/union-news-14/images/${imageId}/move-left`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move image');
      }
      const refreshRes = await fetch('/api/broadcasts/union-news-14/images');
      const freshData = await refreshRes.json();
      setUnionNews14Images(Array.isArray(freshData) ? freshData : []);
      console.log('[BROADCAST VIEW] ✅ Image moved left, refreshed carousel');
    } catch (error) {
      console.error('[BROADCAST VIEW] Error moving image left:', error);
      throw error;
    }
  };

  const handleReorderRight = async (imageId: number) => {
    try {
      const response = await fetch(`/api/broadcasts/union-news-14/images/${imageId}/move-right`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move image');
      }
      const refreshRes = await fetch('/api/broadcasts/union-news-14/images');
      const freshData = await refreshRes.json();
      setUnionNews14Images(Array.isArray(freshData) ? freshData : []);
      console.log('[BROADCAST VIEW] ✅ Image moved right, refreshed carousel');
    } catch (error) {
      console.error('[BROADCAST VIEW] Error moving image right:', error);
      throw error;
    }
  };

  const handleCarouselImageZoom = (imageUrl: string, title: string, items: BroadcastItem[], currentIndex: number) => {
    console.log('[BROADCAST VIEW] Carousel image zoom requested:', title, 'Index:', currentIndex);
    if (onImageZoom) {
      onImageZoom(imageUrl, title, items, currentIndex);
    }
  };

  // Calculate how many images carousel can show based on width
  const calculateCarouselImageCount = (rightWidth: number): number => {
    if (rightWidth >= 67) return 3;
    if (rightWidth >= 60) return 3;
    if (rightWidth >= 50) return 2;
    if (rightWidth >= 40) return 1;
    return 0;
  };

  // Handle divider drag
  const handleDividerMouseDown = () => {
    setBroadcastDividerDragging(true);
  };

  useEffect(() => {
  if (!broadcastDividerDragging) return;

  const handleMove = (clientX: number) => {
    const container = document.querySelector('[data-broadcast-container]');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newLeftPercent = ((clientX - rect.left) / rect.width) * 100;

    // Constrain between 20% and 70%
    if (newLeftPercent >= 20 && newLeftPercent <= 70) {
      const newLeft = newLeftPercent;
      const newRight = 100 - newLeftPercent;

      setBroadcastLeftWidth(newLeft);
      setBroadcastRightWidth(newRight);

      // Update carousel image count
      const newImageCount = calculateCarouselImageCount(newRight);
      setBroadcastCarouselImageCount(newImageCount);

      // Check if carousel should collapse
      if (newImageCount === 0) {
        setIsBroadcastCarouselCollapsed(true);
      } else {
        setIsBroadcastCarouselCollapsed(false);
      }

      // Check if left should collapse (when right is too wide for meme box)
      if (newLeft <= 25) {
        setIsBroadcastLeftCollapsed(true);
      } else {
        setIsBroadcastLeftCollapsed(false);
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    }
  };

  const handleEnd = () => {
    setBroadcastDividerDragging(false);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleEnd);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleEnd);
  };
}, [broadcastDividerDragging]);

  const resetToDefaultPosition = () => {
    setBroadcastLeftWidth(33);
    setBroadcastRightWidth(67);
    setBroadcastCarouselImageCount(3);
    setIsBroadcastLeftCollapsed(false);
    setIsBroadcastCarouselCollapsed(false);
  };

  const resetToPosition002 = () => {
    setBroadcastLeftWidth(65);
    setBroadcastRightWidth(35);
    setBroadcastCarouselImageCount(1);
    setIsBroadcastLeftCollapsed(false);
    setIsBroadcastCarouselCollapsed(false);
  };

  if (broadcastView !== 'UnionNews#14') {
    // For non-UnionNews#14 broadcasts, use original layout
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-6 flex-1">
          <div className="w-1/3">
            <h4 className="font-semibold whitespace-pre-line text-center">{broadcast.subtitle}</h4>
            <div className="aspect-square bg-muted rounded-md my-2 bg-cover bg-center" style={{ backgroundImage: `url(${broadcast.logo})` }}></div>
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="icon"><ChevronLeft /></Button>
              <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
              <Button variant="ghost" size="icon"><ChevronRight /></Button>
            </div>
          </div>
          <div className="w-2/3 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="icon"><Play /></Button>
              <p className="text-sm text-muted-foreground flex-grow text-center">{broadcast.description}</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">Learn how to code (in less than 5min) for Free- over at our GitHub here:</a>
              {user?.is_high_high_high_admin === 1 && (
                <Button 
                  className="bg-green-700 hover:bg-green-800 text-white text-sm"
                  onClick={() => onOpenUnionNews14Modal()}
                >
                  Add Images?
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <BroadcastCarousel 
                items={broadcast.extraImages || []} 
                isAdmin={user?.is_high_high_high_admin === 1}
                onImageZoom={handleCarouselImageZoom}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UnionNews#14 layout with mobile-responsive stacking
  const isMobile = window.innerWidth < 768;

    
if (isMobile) {
  // MOBILE LAYOUT: Vertical stack with proper scrolling
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">      
            {/* TOP: Broadcast Carousel */}
      {!isBroadcastCarouselCollapsed && (
        <div className="flex-shrink-0 flex flex-col w-[100%] mx-auto py-4">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="icon" className="h-8 w-8"><Play className="h-4 w-4" /></Button>
            <p className="text-xs text-muted-foreground flex-grow text-center">{broadcast.description}</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-xs">Learn how to code (in less than 5min) for Free- over at our GitHub here:</a>
            {user?.is_high_high_high_admin === 1 && (
              <Button 
                className="bg-green-700 hover:bg-green-800 text-white text-xs h-8"
                onClick={() => onOpenUnionNews14Modal()}
              >
                Add
              </Button>
            )}
          </div>

          {/* CAROUSEL CONTENT - NO overflow-hidden */}
          <div className="flex-shrink-0">
            <div
  className="flex w-full overflow-hidden"
  style={{
    position: "relative",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <BroadcastCarousel 
    items={broadcastView === 'UnionNews#14' ? unionNews14Images : (broadcast.extraImages || [])}
    isAdmin={broadcastView === 'UnionNews#14' && user?.is_high_high_high_admin === 1}
    onReorderLeft={broadcastView === 'UnionNews#14' ? handleReorderLeft : undefined}
    onReorderRight={broadcastView === 'UnionNews#14' ? handleReorderRight : undefined}
    onImageZoom={handleCarouselImageZoom}
  />
</div>
          </div>
        </div>
      )}

      {isBroadcastCarouselCollapsed && (
        <button
          onClick={() => {
            setIsBroadcastCarouselCollapsed(false);
            setBroadcastCarouselImageCount(3);
          }}
          className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition m-4"
        >
          <span>📸 Carousel</span>
        </button>
      )}


      {/* MIDDLE: Memebox */}
      {!isBroadcastLeftCollapsed && (
        <div className="flex-shrink-0 flex flex-col w-full px-4 py-4">
          <h4 className="font-semibold whitespace-pre-line text-center text-sm">{broadcast.subtitle}</h4>
          <div
            id="TheReactMemeImplementationConnection001"
            className="bg-muted rounded-md my-2"
            style={{ minHeight: '400px' }}
          />
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {isBroadcastLeftCollapsed && (
        <button
          onClick={() => {
            setIsBroadcastLeftCollapsed(false);
            setTimeout(() => {
              unmountTheMemeBox();
              setTimeout(() => {
                renderTheMemeBox(broadcasts['UnionNews#14']);
              }, 100);
            }, 50);
          }}
          className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition m-4"
          title="Restore content"
        >
          🎁 Content
        </button>
      )}

      {/* BOTTOM: uHome-Hub Chat Modal (MOBILE ONLY) - NOW INTEGRATED INSIDE */}
      {activeChatModal !== null && (
        <div className="flex-shrink-0 flex flex-col w-full border-t border-gray-700 mt-4">
          <MainUhubFeatureV001ForChatModal
            isOpen={activeChatModal !== null}
            onClose={onCloseChatModal}
            pageName={MainUhubFeatureV001ForSisterUnionPages[activeChatModal - 1]}
            backgroundColor={MainUhubFeatureV001ForModalColors[activeChatModal - 1]}
            modalNumber={activeChatModal}
          />
        </div>
      )}

      {/* SPACER for bottom padding */}
      <div className="h-8 flex-shrink-0" />
    </div>
  );
}





  // DESKTOP LAYOUT: Horizontal split with draggable divider (UNCHANGED)
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2 flex-1" data-broadcast-container>
        {/* LEFT HALF - Meme Box Area */}
        {!isBroadcastLeftCollapsed && (
          <>
            <div style={{ width: `${broadcastLeftWidth}%` }} className="flex flex-col overflow-hidden">
              <h4 className="font-semibold whitespace-pre-line text-center text-sm">{broadcast.subtitle}</h4>
              <div
                id="TheReactMemeImplementationConnection001"
                className="flex-1 bg-muted rounded-md my-2 overflow-hidden"
                style={{ minHeight: '200px' }}
              />
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* DRAGGABLE DIVIDER - WITH MOBILE TOUCH SUPPORT */}
            <div
              className="w-1 bg-gray-500 hover:bg-orange-400 cursor-col-resize transition-colors active:bg-orange-400"
              onMouseDown={handleDividerMouseDown}
              onTouchStart={handleDividerMouseDown}
            />
          </>
        )}

        {/* RIGHT HALF - Carousel Area */}
        {!isBroadcastCarouselCollapsed && (
          <div style={{ width: `${broadcastRightWidth}%` }} className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="icon" className="h-8 w-8"><Play className="h-4 w-4" /></Button>
              <p className="text-xs text-muted-foreground flex-grow text-center">{broadcast.description}</p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-xs">Learn how to code (in less than 5min) for Free- over at our GitHub here:</a>
              {user?.is_high_high_high_admin === 1 && (
                <Button 
                  className="bg-green-700 hover:bg-green-800 text-white text-xs h-8"
                  onClick={() => onOpenUnionNews14Modal()}
                >
                  Add
                </Button>
              )}
            </div>

            {/* CAROUSEL - Shows limited images based on width */}
            <div className="flex-1 overflow-hidden">
              <BroadcastCarousel 
  items={broadcastView === 'UnionNews#14' ? unionNews14Images : (broadcast.extraImages || [])}
  isAdmin={broadcastView === 'UnionNews#14' && user?.is_high_high_high_admin === 1}
  onReorderLeft={broadcastView === 'UnionNews#14' ? handleReorderLeft : undefined}
  onReorderRight={broadcastView === 'UnionNews#14' ? handleReorderRight : undefined}
  onImageZoom={handleCarouselImageZoom}
/>
            </div>
          </div>
        )}
        
        {/* DIVIDER - ONLY RENDER IF CAROUSEL NOT COLLAPSED AND LEFT NOT COLLAPSED */}
        {!isBroadcastCarouselCollapsed && !isBroadcastLeftCollapsed && (
          <div
            className="w-1 bg-gray-500 hover:bg-orange-400 cursor-col-resize transition-colors active:bg-orange-400"
            onMouseDown={handleDividerMouseDown}
            onTouchStart={handleDividerMouseDown}
          />
        )}
      </div>

      {/* COLLAPSED BANNERS - Below main content */}
      <div className="flex gap-2">
        {isBroadcastCarouselCollapsed && (
          <button
            onClick={() => resetToDefaultPosition()}
            className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition"
          >
            <span>📸 Carousel</span>
          </button>
        )}
        {isBroadcastLeftCollapsed && (
          <button
            onClick={() => {
              resetToPosition002();
              // Force memebox re-render
              setTimeout(() => {
                unmountTheMemeBox();
                setTimeout(() => {
                  renderTheMemeBox(broadcasts['UnionNews#14']);
                }, 100);
              }, 50);
            }}
            className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition"
            title="Restore content"
          >
            🎁 Content
          </button>
        )}
      </div>
    </div>
  );
};

// QUADRANTS MODAL - PAGE 1 REDESIGNED
interface QuadrantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: typeof ALL_STORES;
  userStoresData?: any[];
  friendsStoresData?: any[];
  setFriendsStoresData?: (data: any[]) => void;
  isLoadingFriendsStores?: boolean;
  setIsLoadingFriendsStores?: (loading: boolean) => void;
  onSelectStore: (store: any) => void;
  user: any;
  mainStoreProducts: Product[];
  userStoreProducts: Product[];
  isLoadingProducts: boolean;
  onAddProductClick: () => void;
  getCartUrl: (product: Product | null) => string;
  storeProducts: { [key: number]: Product[] };
  onProductView: (product: Product) => void;
  onProductDelete: (productId: number) => void;
  allProducts?: Product[];
  setSelectedProduct: (product: Product | null) => void;
  setProductDetailModalOpen: (open: boolean) => void;
  setAddProductModalOpen?: (open: boolean) => void;
  allProductsForAdmin?: Product[];
  everythingProducts?: Product[];
  setEditingProduct: (product: any) => void;
  setEditProductModalOpen: (open: boolean) => void;
  setSelectedFriendForModal?: (friend: any) => void;
  setIsFriendProfileModalOpen?: (open: boolean) => void;
  onBadgeZoomOpen?: (badge: { url: string; name: string }) => void;
}

const QuadrantsModal: React.FC<QuadrantsModalProps> = ({ 
  isOpen, 
  onClose, 
  stores, 
  userStoresData = [],
  friendsStoresData = [],
  setFriendsStoresData,
  isLoadingFriendsStores = false,
  setIsLoadingFriendsStores,
  onSelectStore, 
  user, 
  mainStoreProducts = [], 
  userStoreProducts = [], 
  isLoadingProducts,
  onAddProductClick,
  getCartUrl,
  storeProducts = {},
  onProductView,
  onProductDelete,
  allProducts = [],
  allProductsForAdmin = [],
  setSelectedProduct,
  setAddProductModalOpen,
  everythingProducts = [],
  setEditingProduct,
  setEditProductModalOpen,
  setSelectedFriendForModal,
  setIsFriendProfileModalOpen,
  onBadgeZoomOpen
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [myStoreView, setMyStoreView] = useState<'list' | 'add'>('list');
  
  // Calculate total pages needed
const userStoresCount = userStoresData.length;
const userStoresPerPage = 4;
const userStorePages = userStoresCount > 0 ? Math.ceil(userStoresCount / userStoresPerPage) : 0; // 0 if no stores
const totalPages = 10 + userStorePages; // Pages 1-10 for union stores, then user store pages

// Build dynamic pages array
const buildStorePages = () => {
  const pages = [
    [], // Page 0 (not used - dummy entry for alignment)
    [stores[1], stores[2], stores[3], stores[4]],   // Page 1
    [stores[5], stores[6], stores[7], stores[8]],   // Page 2
    [stores[9], stores[10], stores[11], stores[12]], // Page 3
    [stores[13], stores[14], stores[15], stores[16]], // Page 4
    [stores[17], stores[18], stores[19], stores[20]], // Page 5
    [stores[21], stores[22], stores[23], stores[24]], // Page 6
    [stores[25], stores[26], stores[27], stores[28]], // Page 7
    [stores[29], stores[30], null, null],            // Page 8
    [null, null, null, null],                        // Page 9 - coming soon
  ];

  // Add user store pages starting from page 10
  if (userStoresCount > 0) {
    for (let i = 0; i < userStorePages; i++) {
      const start = i * userStoresPerPage;
      const end = start + userStoresPerPage;
      pages.push(userStoresData.slice(start, end));
    }
  }

  return pages;
};

const storePages = buildStorePages();

  // Check if user is logged in (to be able see the 'add product' button; yes?' -12:18am on 2/3/26
  const canAddProducts = !!user;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100000]">
      <div className="bg-background border rounded-lg p-6 max-w-6xl w-[95%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Store Quadrants (All 30 Stores)</h2>


<div className="flex justify-between items-center mt-6">
          <Button
  variant="outline"
  onClick={() => setCurrentPage(prev => prev === 1 ? totalPages : prev - 1)}
  disabled={false}
>
  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
</Button>
          <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
          <Button
  variant="outline"
  onClick={() => setCurrentPage(prev => prev === totalPages ? 1 : prev + 1)}
  disabled={false}
>
  Next <ChevronRight className="h-4 w-4 ml-2" />
</Button>

{/* Search Bar - Only on Page 1 */}
  {currentPage === 1 && (
    <div className="w-64">
      <ProductSearchDropdown
        allProducts={everythingProducts}
        onProductSelect={(product) => {
          onProductView(product);
        }}
      />
    </div>
  )}
    
        </div>


          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>          
        </div>

        {/* PAGE 1 - REDESIGNED LAYOUT */}
        {currentPage === 1 && (
          <div className="grid grid-cols-2 gap-4 h-[70vh]">
            
            {/* TOP LEFT: Union Store - WITH HEIGHT CONSTRAINT FOR 10 ITEMS */}
<div className="border rounded-lg p-4 flex flex-col h-full">
  <div className="flex justify-between items-center mb-3 sticky top-0 bg-background z-10">
    <h3 className="font-bold">Union Store</h3>
  </div>
  <div className="union-store-scrollable" style={{ maxHeight: '380px', overflow: 'hidden', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {isLoadingProducts ? (
      <div className="text-center text-muted-foreground py-4">Loading products...</div>
    ) : mainStoreProducts.length > 0 ? (
      mainStoreProducts.map((p) => (
        <div 
          key={p.id}
          className="border rounded p-2 text-xs flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer flex-shrink-0"
          onClick={() => {
            onProductView(p);
          }}
        >
          {p.image_url && (
            <img 
              src={p.image_url} 
              alt={p.name}
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{p.name}</p>
            {p.price && <p className="text-orange-400">${p.price.toFixed(2)}</p>}
          </div>
        <Button
  variant="ghost"
  size="icon"
  className="h-6 w-6 text-white hover:text-orange-400 flex-shrink-0"
  onClick={(e) => {
    e.stopPropagation();
    onProductView(p);
  }}
  title="View details"
>
  <Eye className="h-4 w-4" />
</Button>
        </div>
      ))
    ) : (
      <div className="text-center text-muted-foreground py-4">No products available</div>
    )}
  </div>
</div>

         {/* TOP RIGHT: Friends Stores */}
<div className="border rounded-lg p-4 flex flex-col h-full">
  <h3 className="font-bold mb-3 sticky top-0 bg-background">Friends' Stores</h3>
  <div 
    className="flex-1 overflow-y-auto"
    style={{
      maxHeight: '380px',
      scrollbarColor: '#a855f7 #1f2937',
      scrollbarWidth: 'thin'
    }}
  >
    <style>{`
      div[style*="scrollbarColor: #a855f7"]::-webkit-scrollbar {
        width: 8px;
      }
      div[style*="scrollbarColor: #a855f7"]::-webkit-scrollbar-track {
        background: #1f2937;
      }
      div[style*="scrollbarColor: #a855f7"]::-webkit-scrollbar-thumb {
        background: #a855f7;
        border-radius: 4px;
      }
      div[style*="scrollbarColor: #a855f7"]::-webkit-scrollbar-thumb:hover {
        background: #9333ea;
      }
      
      /* NEW: Light turquoise scrollbar for uStore products (when 5+ items) */
      .ustore-products-scrollable::-webkit-scrollbar {
        width: 8px;
      }
      .ustore-products-scrollable::-webkit-scrollbar-track {
        background: #1f2937;
      }
      .ustore-products-scrollable::-webkit-scrollbar-thumb {
        background: #14b8a6;
        border-radius: 4px;
      }
      .ustore-products-scrollable::-webkit-scrollbar-thumb:hover {
        background: #0d9488;
      }
    `}</style>
                {isLoadingFriendsStores ? (
                  <div className="text-center text-muted-foreground py-4">Loading friends' products...</div>
                ) : friendsStoresData.length > 0 ? (
                  <div className="space-y-3">
                    {friendsStoresData.map((friendData) => (
                      <div key={friendData.friend_id} className="border rounded-lg p-3 bg-gray-900/50">
                      {/* Friend Header (First Level) */}
<div 
  className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition rounded px-2 py-1"
  onClick={() => {
    setSelectedFriendForModal({
      id: friendData.friend_id,
      username: friendData.friend_username,
      profile_image_url: friendData.friend_profile_image_url,
      cover_photo_url: friendData.friend_cover_photo_url || null,
    });
    setIsFriendProfileModalOpen(true);
  }}
>
  <Avatar className="h-8 w-8 flex-shrink-0">
  <AvatarImage 
    src={friendData.friend_profile_image_url} 
    alt={friendData.friend_username} 
    onError={(e) => {
      // If image fails to load, show fallback
      (e.currentTarget as HTMLImageElement).style.display = 'none';
    }}
  />
  <AvatarFallback className="bg-purple-600 text-white text-xs font-bold">
    {friendData.friend_username.charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>
  <span className="font-semibold text-sm">{friendData.friend_username}</span>
</div>

                        {/* uStores (First Indent) */}
                        <div className="ml-2 space-y-2">
                          {friendData.uStores && friendData.uStores.length > 0 ? (
                            friendData.uStores.map((uStore) => (
                              <div key={uStore.id} className="space-y-1">
                                {/* uStore Header with Badge and Banner */}
<div className="flex items-center gap-2 py-1 px-2 rounded border border-gray-700 bg-gray-900/50">
  {/* uBadge (left) - Fixed size icon */}
  <div className="w-6 h-6 rounded flex-shrink-0 bg-gray-700 overflow-hidden flex items-center justify-center">
    {uStore.badge_url ? (
      <img
        src={uStore.badge_url}
        alt={`${uStore.name} badge`}
        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
        onClick={(e) => {
          e.stopPropagation();
          onBadgeZoomOpen?.({ url: uStore.badge_url, name: uStore.name });
        }}
        title="Click to zoom"
        onError={(e) => {
          console.log(`[FRIENDS STORES] Badge failed to load: ${uStore.badge_url}`);
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    ) : (
      <div className="w-full h-full bg-gray-700" />
    )}
  </div>

  {/* uStore Name */}
  <span className="font-semibold text-xs text-cyan-400 flex-shrink-0 whitespace-nowrap">
    {uStore.name}
  </span>

  {/* uBanner (right) - Takes remaining space */}
  <div className="h-6 rounded flex-grow ml-auto overflow-hidden flex items-center justify-center bg-gray-700" style={{ minWidth: '80px', maxWidth: '150px' }}>
    <img
      src={uStore.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"}
      alt={`${uStore.name} banner`}
      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
      onClick={(e) => {
        e.stopPropagation();
        onBadgeZoomOpen?.({ 
          url: uStore.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg", 
          name: uStore.name 
        });
      }}
      title="Click to zoom"
      onError={(e) => {
        console.log(`[FRIENDS STORES] Banner failed to load: ${uStore.banner_url}`);
        // Load default if custom fails
        (e.currentTarget as HTMLImageElement).src = "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg";
      }}
    />
  </div>
</div>

                                {/* Products within uStore (Second Indent) */}
                                <div 
                                  className={`ml-2 space-y-1 ${
                                    uStore.products.length >= 5 
                                      ? 'max-h-48 overflow-y-auto ustore-products-scrollable' 
                                      : ''
                                  }`}
                                >
                                  {uStore.products.length > 0 ? (
                                    uStore.products.map((product) => (
                                      <div
                                        key={product.id}
                                        className="border rounded p-2 text-xs flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer bg-gray-800/30"
                                        onClick={() => onProductView(product)}
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
                                            onProductView(product);
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
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic">No stores yet</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4 text-sm">
                    {user ? "No friends or friend products yet" : "Log in to see friends' products"}
                  </div>
                )}
              </div>
            </div>

       {/* BOTTOM LEFT: My Store - WITH ADD BUTTON AND SCROLLBAR */}
            <div className="border rounded-lg p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-3 sticky top-0 bg-background z-10">
                <h3 className="font-bold">My Store</h3>
                {canAddProducts && (
                  <Button 
                    size="sm" 
                    onClick={onAddProductClick}
                    className="bg-orange-400 hover:bg-orange-500 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </Button>
                )}
              </div>
              <div 
                className="flex-1 overflow-y-auto space-y-2"
                style={{
                  maxHeight: '480px',
                  scrollbarColor: '#22c55e #1f2937',
                  scrollbarWidth: 'thin'
                }}
              >
                <style>{`
                  div[style*="maxHeight: 480px"]::-webkit-scrollbar {
                    width: 8px;
                  }
                  div[style*="maxHeight: 480px"]::-webkit-scrollbar-track {
                    background: #1f2937;
                  }
                  div[style*="maxHeight: 480px"]::-webkit-scrollbar-thumb {
                    background: #22c55e;
                    border-radius: 4px;
                  }
                  div[style*="maxHeight: 480px"]::-webkit-scrollbar-thumb:hover {
                    background: #16a34a;
                  }
                `}</style>
                {!user ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Log in to manage your store
                  </div>
                ) : user.is_high_high_high_admin === 1 ? (
                  // HIGH-HIGH-HIGH admin: show all products with full details
                  allProductsForAdmin.length > 0 ? (
                    allProductsForAdmin.map((p) => (
                      <div 
                        key={p.id}
                        className="border rounded-lg p-3 flex items-center gap-3 hover:border-orange-400 transition"
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 flex-shrink-0 rounded border border-gray-700 overflow-hidden">
                          {p.image_url ? (
                            <img 
                              src={p.image_url} 
                              alt={p.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                              No img
                            </div>
                          )}
                        </div>

                      {/* Product Info */}
<div className="flex-grow min-w-0">
  <p className="font-semibold text-sm truncate">{p.name}</p>
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span>${p.price ? p.price.toFixed(2) : '0.00'}</span>
    {p.user_store_id && <span>Store #{p.user_store_id}</span>}
    {p.user_store_name && <span className="truncate">{p.user_store_name}</span>}
    {p.creator_username && <span>by {p.creator_username}</span>}
  </div>
</div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                         <Button
  size="icon"
  variant="ghost"
  className="h-8 w-8 text-blue-400 hover:text-blue-300"
  onClick={() => onProductView(p)}
  title="View product details"
>
  <Eye className="h-4 w-4" />
</Button>
                         <Button
  size="icon"
  variant="ghost"
  className="h-8 w-8 text-green-400 hover:text-green-300"
  onClick={(e) => {
  e.stopPropagation();
  setEditingProduct(p);
  setEditProductModalOpen(true);
}}
  title="Edit product"
>
  <Pencil className="h-4 w-4" />
</Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                            onClick={async () => {
                              if (confirm('Delete this product?')) {
                                try {
                                  const response = await fetch(`/api/products/${p.id}/trash`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                  });
                                  if (response.ok) {
                                    const adminRes = await fetch('/api/products/admin/all');
                                    const adminData = await adminRes.json();
                                    setAllProductsForAdmin(Array.isArray(adminData) ? adminData : []);
                                  }
                                } catch (error) {
                                  console.error('Error deleting product:', error);
                                  alert('Failed to delete product');
                                }
                              }
                            }}
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                      No products available
                    </div>
                  )
                ) : (
                  // Regular user: show only their own products with full details
                  userStoreProducts.length > 0 ? (
                    userStoreProducts.map((p) => (
                      <div 
                        key={p.id}
                        className="border rounded-lg p-3 flex items-center gap-3 hover:border-orange-400 transition"
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 flex-shrink-0 rounded border border-gray-700 overflow-hidden">
                          {p.image_url ? (
                            <img 
                              src={p.image_url} 
                              alt={p.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                              No img
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
<div className="flex-grow min-w-0">
  <p className="font-semibold text-sm truncate">{p.name}</p>
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span>${p.price ? p.price.toFixed(2) : '0.00'}</span>
    {p.user_store_id && <span>Store #{p.user_store_id}</span>}
    {p.user_store_name && <span className="truncate">{p.user_store_name}</span>}
  </div>
</div>

                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                         <Button
  size="icon"
  variant="ghost"
  className="h-8 w-8 text-blue-400 hover:text-blue-300"
  onClick={() => onProductView(p)}
  title="View product details"
>
  <Eye className="h-4 w-4" />
</Button>
<Button
  size="icon"
  variant="ghost"
  className="h-8 w-8 text-green-400 hover:text-green-300"
  onClick={(e) => {
  e.stopPropagation();
  setEditingProduct(p);
  setEditProductModalOpen(true);
}}
  title="Edit product"
>
  <Pencil className="h-4 w-4" />
</Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                            onClick={async () => {
                              if (confirm('Delete this product?')) {
                                try {
                                  const response = await fetch(`/api/products/${p.id}/trash`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                  });
                                  if (response.ok) {
                                    const userRes = await fetch(`/api/products/user/${user.id}`);
                                    const userData = await userRes.json();
                                    setUserStoreProducts(Array.isArray(userData) ? userData : []);
                                  }
                                } catch (error) {
                                  console.error('Error deleting product:', error);
                                  alert('Failed to delete product');
                                }
                              }
                            }}
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                      {canAddProducts ? "No products yet. Click 'Add Product' to get started!" : "No products yet"}
                    </div>
                  )
                )}
              </div>
            </div>
        
{/* BOTTOM RIGHT: Everything - All Products from All Sources */}
<div className="border rounded-lg p-4 flex flex-col h-full">
  <h3 className="font-bold mb-3">Everything</h3>
  <div className="flex-1 overflow-hidden">
    <EverythingProductsList
      products={allProducts}
      isLoading={isLoadingProducts}
      onProductView={onProductView}
      onAddToCart={(product) => {
        // Handle add to cart for everything products
        console.log('Added to cart:', product);
      }}
    />
  </div>
</div>



            
          </div>
        )}

        {/* PAGES 2-10 REMAIN THE SAME IN REPRESENTING UNION STORES 1-30 */}
       {currentPage > 1 && currentPage <= 9 && (
  <div className="grid grid-cols-2 gap-4 h-[70vh]">
    <style>{`
      .store-products-scrollable::-webkit-scrollbar {
        width: 10px;
      }
      .store-products-scrollable::-webkit-scrollbar-track {
        background: #1f2937;
      }
      .store-products-scrollable::-webkit-scrollbar-thumb {
        background: #10b981;
        border-radius: 5px;
      }
      .store-products-scrollable::-webkit-scrollbar-thumb:hover {
        background: #059669;
      }
    `}</style>
    {storePages[currentPage - 1].map((store) => (
  <div key={store?.id || Math.random()} className="border rounded-lg p-4 flex flex-col h-full">
    {store ? (
      <>
        {/* uStore Header with Badge and Banner - NEWLY ADDED FOR PAGES 2-9 */}
        <div className="flex items-center gap-2 py-1 px-2 rounded border border-gray-700 bg-gray-900/50 mb-3">
          {/* uBadge (left) - Fixed size icon */}
          <div className="w-6 h-6 rounded flex-shrink-0 bg-gray-700 overflow-hidden flex items-center justify-center">
            {store.badge_url ? (
              <img
                src={store.badge_url}
                alt={`${store.name} badge`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onBadgeZoomOpen?.({ url: store.badge_url, name: store.name });
                }}
                title="Click to zoom"
                onError={(e) => {
                  console.log(`[PAGES 2-9] Badge failed to load: ${store.badge_url}`);
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-700" />
            )}
          </div>

          {/* uStore Name */}
          <span className="font-semibold text-xs text-cyan-400 flex-shrink-0 whitespace-nowrap">
            {store.displayName || store.name}
          </span>

          {/* uBanner (right) - Takes remaining space */}
          <div className="h-6 rounded flex-grow ml-auto overflow-hidden flex items-center justify-center bg-gray-700" style={{ minWidth: '80px', maxWidth: '150px' }}>
            <img
              src={store.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"}
              alt={`${store.name} banner`}
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
              onClick={(e) => {
                e.stopPropagation();
                onBadgeZoomOpen?.({ 
                  url: store.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg", 
                  name: store.name 
                });
              }}
              title="Click to zoom"
              onError={(e) => {
                console.log(`[PAGES 2-9] Banner failed to load: ${store.banner_url}`);
                (e.currentTarget as HTMLImageElement).src = "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg";
              }}
            />
          </div>
        </div>

        {/* Store Products Grid */}
        <div className="store-products-scrollable flex-1 overflow-y-auto mb-3" style={{ maxHeight: '380px' }}>
          <div className="grid grid-cols-2 gap-2">
            {storeProducts[store.number] && storeProducts[store.number].length > 0 ? (
              storeProducts[store.number].map((product) => (
                <div
                  key={product.id}
                  className="border rounded-md p-2 relative h-24 group hover:border-orange-400 transition cursor-pointer"
                  style={{
                    backgroundImage: product.image_url ? `url('${product.image_url}')` : 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Clickable Overlay - Catches All Clicks Except Eye Button */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-40 rounded-md cursor-pointer"
                    onClick={() => {
                      onProductView(product);
                    }}
                  ></div>

                  {/* Product Name */}
                  <div className="relative z-10 text-xs font-semibold text-white truncate pointer-events-none">
                    {product.name}
                  </div>

                  {/* Eye Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductView(product);
                    }}
                    className="absolute bottom-1 right-1 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 p-1 rounded transition"
                    title="View product details"
                  >
                    <Eye className="h-3 w-3 text-white" />
                  </button>

                  {/* Price */}
                  {product.price && (
                    <div className="absolute bottom-1 left-1 z-10 text-xs font-semibold bg-black bg-opacity-60 text-orange-400 px-1 rounded pointer-events-none">
                      ${product.price.toFixed(2)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-4 text-sm">
                No products yet
              </div>
            )}
          </div>
        </div>

        {/* Page Navigation */}
        <div className="border-t pt-2 mt-auto">
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-xs"
            >
              ← Previous
            </Button>
            <span className="text-xs font-semibold">Page {currentPage} of 10</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(10, prev + 1))}
              disabled={currentPage === 10}
              className="text-xs"
            >
              Next →
            </Button>
          </div>
        </div>
      </>
    ) : (
      <div className="bg-muted rounded-md flex items-center justify-center text-muted-foreground flex-1">
        Coming Soon
      </div>
    )}
  </div>
))}
  </div>
)}

   {currentPage > 9 && (
  <div className="grid grid-cols-2 gap-4 h-[70vh]">
    <style>{`
      .user-store-scrollable::-webkit-scrollbar {
        width: 10px;
      }
      .user-store-scrollable::-webkit-scrollbar-track {
        background: #1f2937;
      }
      .user-store-scrollable::-webkit-scrollbar-thumb {
        background: #06b6d4;
        border-radius: 5px;
      }
      .user-store-scrollable::-webkit-scrollbar-thumb:hover {
        background: #0891b2;
      }
    `}</style>
    {storePages && storePages[currentPage - 1] && storePages[currentPage - 1].length > 0 ? (
      storePages[currentPage - 1].map((userStore, idx) => (
        userStore ? (
          <div key={userStore.id} className="border rounded-lg p-4 flex flex-col h-full">
            {/* uStore Header with Badge and Banner */}
            <div className="flex items-center gap-2 py-1 px-2 rounded border border-gray-700 bg-gray-900/50 mb-3">
              {/* uBadge (left) - Fixed size icon */}
              <div className="w-6 h-6 rounded flex-shrink-0 bg-gray-700 overflow-hidden flex items-center justify-center">
                {userStore.badge_url ? (
                  <img
                    src={userStore.badge_url}
                    alt={`${userStore.name} badge`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBadgeZoomOpen?.({ url: userStore.badge_url, name: userStore.name });
                    }}
                    title="Click to zoom"
                    onError={(e) => {
                      console.log(`[PAGE 10+] Badge failed to load: ${userStore.badge_url}`);
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700" />
                )}
              </div>

              {/* uStore Name */}
              <span className="font-semibold text-xs text-cyan-400 flex-shrink-0 whitespace-nowrap">
                {userStore.name}
              </span>

              {/* uBanner (right) - Takes remaining space */}
              <div className="h-6 rounded flex-grow ml-auto overflow-hidden flex items-center justify-center bg-gray-700" style={{ minWidth: '80px', maxWidth: '150px' }}>
                <img
                  src={userStore.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"}
                  alt={`${userStore.name} banner`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBadgeZoomOpen?.({ 
                      url: userStore.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg", 
                      name: userStore.name 
                    });
                  }}
                  title="Click to zoom"
                  onError={(e) => {
                    console.log(`[PAGE 10+] Banner failed to load: ${userStore.banner_url}`);
                    // Load default if custom fails
                    (e.currentTarget as HTMLImageElement).src = "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg";
                  }}
                />
              </div>
            </div>

            {/* Subtitle and Description */}
            <div className="mb-3">
              {userStore.subtitle && (
                <p className="text-xs text-gray-400">{userStore.subtitle}</p>
              )}
              {userStore.store_owner_username && (
                <p className="text-xs text-gray-500">by {userStore.store_owner_username}</p>
              )}
            </div>

            {userStore.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{userStore.description}</p>
            )}

            <div 
              className="user-store-scrollable flex-1 overflow-y-auto"
              style={{
                maxHeight: '380px'
              }}
            >
              {userStore.products && userStore.products.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {userStore.products.map((product) => (
  <div
    key={product.id}
    className="border rounded-md p-2 relative h-24 group hover:border-orange-400 transition cursor-pointer"
    style={{
      backgroundImage: product.image_url ? `url('${product.image_url}')` : 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}
  >
    {/* Clickable Overlay - Catches All Clicks Except Eye Button */}
    <div 
      className="absolute inset-0 bg-black bg-opacity-40 rounded-md cursor-pointer"
      onClick={() => {
        onProductView(product);
      }}
    ></div>

    {/* Product Name */}
    <div className="relative z-10 text-xs font-semibold text-white truncate pointer-events-none">
      {product.name}
    </div>

    {/* Price Badge */}
    {product.price && (
      <div className="absolute bottom-1 left-1 z-10 text-xs font-semibold bg-black bg-opacity-60 text-orange-400 px-1 rounded pointer-events-none">
        ${product.price.toFixed(2)}
      </div>
    )}

    {/* Eye Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onProductView(product);
      }}
      className="absolute bottom-1 right-1 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 p-1 rounded transition"
      title="View product details"
    >
      <Eye className="h-3 w-3 text-white" />
    </button>
  </div>
))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No products in this store yet
                </div>
              )}
            </div>
          </div>
        ) : (
          <div key={`empty-${idx}`} className="border rounded-lg p-4 flex items-center justify-center text-muted-foreground h-full">
            Coming Soon
          </div>
        )
      ))
    ) : (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4 flex items-center justify-center text-muted-foreground h-full">
            Coming Soon
          </div>
        ))}
      </>
    )}
  </div>
)}
      
      </div>
    </div>
  );
};

// HOME MODAL
const HomeModal = ({ isOpen, onClose, userProducts = [] }) => {
  const [myAccountExpanded, setMyAccountExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-background border rounded-lg p-6 max-w-4xl w-[90%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Home</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 h-[70vh]">
          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <button
              onClick={() => setMyAccountExpanded(!myAccountExpanded)}
              className="flex items-center justify-between font-bold mb-4 hover:text-orange-400 transition"
            >
              My Account{myAccountExpanded ? '-' : '+'}
              {myAccountExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {myAccountExpanded && (
              <div className="space-y-3 flex-1 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow others to see friends list</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to see posts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to see friends list</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to like and comment on posts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Only friends can see posts</span>
                </label>
              </div>
            )}
          </div>

         <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <h3 className="font-bold mb-4">My Store</h3>
            {userProducts && userProducts.length > 0 ? (
              <div className="space-y-2 overflow-y-auto flex-1">
                {userProducts.map((p) => (
                  <div 
                    key={p.id}
                    className="border rounded p-2 text-xs flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
                  >
                    {p.image_url && (
                      <img 
                        src={p.image_url} 
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{p.name}</p>
                      {p.price && <p className="text-orange-400">${p.price.toFixed(2)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 flex-1 flex items-center justify-center">
                Your store preview appears here when you add products
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <h3 className="font-bold mb-4">My Posts</h3>
            <textarea 
              className="w-full p-3 border rounded mb-2 bg-gray-800 text-white placeholder-gray-500 flex-1 resize-none" 
              placeholder="Write a post..." 
              rows={3}
            ></textarea>
            <Button className="w-full bg-orange-400 hover:bg-orange-500">Create Post</Button>
          </div>

          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <h3 className="font-bold mb-4">My Feed</h3>
            <div className="text-center text-muted-foreground py-8 flex-1 flex items-center justify-center">
              Posts from friends appear here
            </div>
          </div>
        </div>

        

        <div className="border rounded-lg p-4 mt-4 h-32 overflow-auto">
          <h3 className="font-bold mb-3">My Inventory</h3>
          <div className="text-center text-muted-foreground">
            Custom features you've purchased appear here
          </div>
        </div>
      </div>
    </div>
  );
};


const MainUhubFeatureV001ForMyProfileModal: React.FC<MainUhubFeatureV001ForMyProfileModalProps> = ({ isOpen, onClose, onOpenAuthModal, onBadgeZoom }) => {
  const { user } = useAuth();
  const MainUhubFeatureV001ForUHomeHubButtons = Array.from({ length: 30 }, (_, i) => i + 1);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [storeProducts, setStoreProducts] = useState<{ [key: number]: Product[] }>({});
  const [mainStoreProducts, setMainStoreProducts] = useState<Product[]>([]);
  const [userStoreProducts, setUserStoreProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [centerRightView, setCenterRightView] = useState(ALL_STORES[20]);
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [centerView, setCenterView] = useState('broadcasts');
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const [socialPageLeft, setSocialPageLeft] = useState(0);
  const [socialPageRight, setSocialPageRight] = useState(0);
  const [leftWidthMobile, setLeftWidthMobile] = useState(25);
  const [centerWidthMobile, setCenterWidthMobile] = useState(50);
  const [rightWidthMobile, setRightWidthMobile] = useState(25);
  const [leftWidthDesktop, setLeftWidthDesktop] = useState(20); //this is how to change uHome-Hub's 30chatrooms far left section into a smaller section or bigger section -11:25pm on 3/5/26
  const [centerWidthDesktop, setCenterWidthDesktop] = useState(60); //this is how to change broadcast section into a smaller section or bigger section -11:25pm on 3/5/26
  const [rightWidthDesktop, setRightWidthDesktop] = useState(20); //this is how to change UnionSAM#20's section into a smaller section or bigger section -11:25pm on 3/5/26
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isQuadrantsModalOpen, setIsQuadrantsModalOpen] = useState(false);
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
  //i have an error. trying to find the error. is this whats causing the error? part000002 of X ***Update:> I think error is solved; cause this might be a repeat of a working code. aka i think safe maybe to delete as of 2/10/26+maybe yes
  // const [everythingProducts, setEverythingProducts] = useState<Product[]>([]);
  const [allProductsForAdmin, setAllProductsForAdmin] = useState<Product[]>([]);
  const [everythingProducts, setEverythingProducts] = useState<Product[]>([]);
  const [userStoresData, setUserStoresData] = useState<any[]>([]); 
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditProductModalOpen, setEditProductModalOpen] = useState(false);
  const [userStores, setUserStores] = useState<any[]>([]);
  const [isLoadingUserStores, setIsLoadingUserStores] = useState(false);
  const [friendsStoresData, setFriendsStoresData] = useState<any[]>([]);
  const [isLoadingFriendsStores, setIsLoadingFriendsStores] = useState(false);  
  const [isQuadrantViewOpen, setQuadrantViewOpen] = useState(false);
  const [broadcastView, setBroadcastView] = useState('UnionNews#14');
  const [broadcastLeftWidth, setBroadcastLeftWidth] = useState(33);
  const [broadcastRightWidth, setBroadcastRightWidth] = useState(67);
  const [broadcastCarouselImageCount, setBroadcastCarouselImageCount] = useState(3);
  const [isBroadcastLeftCollapsed, setIsBroadcastLeftCollapsed] = useState(false);
  const [isBroadcastCarouselCollapsed, setIsBroadcastCarouselCollapsed] = useState(false);
  const [broadcastDividerDragging, setBroadcastDividerDragging] = useState(false);
  // NEW: Collapse state for left (uHome-Hub) and right (UnionSAM#20) sections
 const [isLeftSectionCollapsed, setIsLeftSectionCollapsed] = useState(window.innerWidth < 768);
  const [isRightSectionCollapsed, setIsRightSectionCollapsed] = useState(window.innerWidth < 768);
  const [leftDividerDragging, setLeftDividerDragging] = useState(false);
  const [rightDividerDragging, setRightDividerDragging] = useState(false);
  const broadcasts = {
      'UnionNews#14': { memeBoxId: 'TheReactMemeImplementationConnection001', title: 'UnionNews#14 & GEMMMS#25', creator: 'GEMMMS#25', subtitle: 'Got Memes? Share Memes. (Enjoy with No-Ads.)', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.15-Made-on-NC-JPEG.png', extraImages: ['https://page001.uminion.com/StoreProductsAndImagery/TapestryVersion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/Tshirtbatchversion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/UkraineLogo001.png'], description: 'Welcome to the Uminion Union! We have Rallies every 24th of the month, stores built by unionFolk, chats, voting, teach ppl how to code (for free) & even offer an ad-free- meme section below!', website: 'https://github.com/uminionunion/UminionsWebsite/discussions/13' },
      'UnionRadio#15': { title: 'Broadcasts- UnionRadio#15', creator: 'StorytellingSalem', subtitle: 'Under Construction- Union Radio #15.', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.16-Made-on-NC-JPEG.png', extraImages: [], description: 'Union Radio #15 (along with uminionClassic) is still live, but now over at our SisterPage: \"https://page001.uminion.com/\"!', website: 'https://uminion.com' },
  };
  const broadcastKeys = ['MyBroadcasts', ...Object.keys(broadcasts)];
  const [selectedFriendForModal, setSelectedFriendForModal] = useState<any>(null);
  const [isFriendProfileModalOpen, setIsFriendProfileModalOpen] = useState(false);
  const [isEditingProfileImage, setIsEditingProfileImage] = useState(false);
  const [unreadChatrooms, setUnreadChatrooms] = useState<Set<number>>(new Set());
  const socketRef = useRef<Socket | null>(null);



const [isUnionNews14ModalOpen, setIsUnionNews14ModalOpen] = useState(false);
const [unionNews14Images, setUnionNews14Images] = useState<BroadcastItem[]>([]);


  
  const [broadcastZoomState, setBroadcastZoomState] = useState<{
  isOpen: boolean;
  imageUrl: string;
  title: string;
  items: BroadcastItem[];
  currentIndex: number;
}>({
  isOpen: false,
  imageUrl: '',
  title: '',
  items: [],
  currentIndex: 0,
});

  

// Fetch UnionNews14 images from database when modal opens
useEffect(() => {
  if (isOpen && broadcastView === 'UnionNews#14') {
    const fetchUnionNews14Images = async () => {
  try {
    console.log('[PROFILE MODAL] Fetching UnionNews14 images from database...');
    const res = await fetch('/api/broadcasts/union-news-14/images');
    if (!res.ok) {
      console.error('[PROFILE MODAL] Failed to fetch images, status:', res.status);
      return;
    }
    const data = await res.json();
    console.log('[PROFILE MODAL] ✅ Fetched images:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      // FIXED: Sort by created_at descending to ensure newest images appear first
      // The backend already does this, but we re-sort to be safe
      const sortedData = data.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA; // Newest first
      });
      setUnionNews14Images(sortedData);
      console.log(`[PROFILE MODAL] ✅ Set ${sortedData.length} images to state (sorted by newest first)`);
    } else {
      console.warn('[PROFILE MODAL] No images returned from API');
      setUnionNews14Images([]);
    }
  } catch (error) {
    console.error('[PROFILE MODAL] Error fetching UnionNews14 images:', error);
    setUnionNews14Images([]);
  }
};

    fetchUnionNews14Images();
  }
}, [isOpen, broadcastView]);




  


  // Load unread chatroom status for logged-in users OR load rooms with messages for all users
useEffect(() => {
  if (isOpen) {
    // For logged-in users, get their unread status
    if (user && user.id) {
      fetch('/api/chat/unread-status')
        .then(res => {
          if (!res.ok) return Promise.resolve([]);
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            const unreadSet = new Set<number>();
            data.forEach((item: any) => {
              const match = item.chatroom_room_name.match(/chatroom-(\d+)/);
              if (match) {
                // Extract the Sister Union number from the room name
                const sisterUnionNum = parseInt(item.chatroom_room_name.split('-chatroom')[0].match(/\d+/)?.[0] || '0');
                unreadSet.add(sisterUnionNum);
              }
            });
            setUnreadChatrooms(unreadSet);
            console.log('[PROFILE] Loaded unread chatrooms for logged-in user:', Array.from(unreadSet));
          }
        })
        .catch(error => console.error('[PROFILE] Error loading unread chatrooms:', error));
    } else {
      // For non-logged-in users, show green circle for ANY room with messages
      fetch('/api/chat/rooms-with-messages')
        .then(res => {
          if (!res.ok) return Promise.resolve([]);
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            const roomsWithMessagesSet = new Set<number>(data);
            setUnreadChatrooms(roomsWithMessagesSet);
            console.log('[PROFILE] Loaded rooms with messages for non-logged-in user:', Array.from(roomsWithMessagesSet));
          }
        })
        .catch(error => console.error('[PROFILE] Error loading rooms with messages:', error));
    }
  }
}, [user, isOpen]);


// Handle left divider (uHome-Hub ↔ Broadcasts) - WITH MOBILE TOUCH SUPPORT
useEffect(() => {
  if (!leftDividerDragging) return;

  const handleMove = (clientX: number) => {
    const container = document.querySelector('[data-profile-main-container]');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newLeftPercent = ((clientX - rect.left) / rect.width) * 100;

    // ALLOW COLLAPSE - Check if should collapse (drag far left)
    if (newLeftPercent < 5) {
      // Collapse the left section completely
      setIsLeftSectionCollapsed(true);
      setLeftWidthDesktop(0);
      setCenterWidthDesktop(100 - rightWidthDesktop);
    } else if (newLeftPercent > 35) {
      // Don't allow dragging past 35%
      return;
    } else {
      // Normal drag behavior - always allow this range
      setIsLeftSectionCollapsed(false);
      setLeftWidthDesktop(newLeftPercent);
      setCenterWidthDesktop(100 - newLeftPercent - rightWidthDesktop);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    }
  };

  const handleEnd = () => {
    setLeftDividerDragging(false);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleEnd);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleEnd);
  };
}, [leftDividerDragging, rightWidthDesktop]);


  

// Handle right divider (Broadcasts ↔ UnionSAM#20) - WITH MOBILE TOUCH SUPPORT
useEffect(() => {
  if (!rightDividerDragging) return;

  const handleMove = (clientX: number) => {
    const container = document.querySelector('[data-profile-main-container]');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const rightEdgePercent = ((clientX - rect.left) / rect.width) * 100;
    const newRightPercent = 100 - rightEdgePercent;

    // ALLOW COLLAPSE - Check if should collapse (drag far right)
    if (newRightPercent < 5) {
      // Collapse the right section completely
      setIsRightSectionCollapsed(true);
      setRightWidthDesktop(0);
      setCenterWidthDesktop(rightEdgePercent - leftWidthDesktop);
    } else if (newRightPercent > 35) {
      // Don't allow dragging past 35%
      return;
    } else {
      // Normal drag behavior - always allow this range
      setIsRightSectionCollapsed(false);
      setRightWidthDesktop(newRightPercent);
      setCenterWidthDesktop(rightEdgePercent - leftWidthDesktop);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    }
  };

  const handleEnd = () => {
    setRightDividerDragging(false);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleEnd);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleEnd);
  };
}, [rightDividerDragging, leftWidthDesktop]);

  

  
useEffect(() => {
    if (user && user.id && isOpen) {
      fetch('/api/friends/requests/pending')
        .then(res => {
          if (!res.ok) {
            if (res.status === 401) {
              console.log('[PROFILE MODAL] Not authenticated, skipping pending friend requests');
            }
            return Promise.resolve([]);
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            console.log(`[PROFILE MODAL] ✅ Loaded ${data.length} pending friend requests`);
            setPendingFriendRequests(data);
          }
        })
        .catch(error => {
          console.error('[PROFILE MODAL] ❌ Error fetching friend requests:', error);
        });
    }
  }, [user, isOpen]);

 // Fetch database products for all stores
useEffect(() => {
  const fetchAllProducts = async () => {
    setIsLoadingProducts(true);
    try {
      // Fetch main store products (store #0)
      const mainRes = await fetch('/api/products/store/0');
      const mainData = await mainRes.json();
      setMainStoreProducts(Array.isArray(mainData) ? mainData : []);

      // Fetch current user's products if logged in
      if (user && user.id) {
        try {
          const userRes = await fetch(`/api/products/user/${user.id}`);
          if (!userRes.ok) {
            console.log('[PRODUCTS] User products fetch failed, likely not authenticated yet');
            setUserStoreProducts([]);
          } else {
            const userData = await userRes.json();
            setUserStoreProducts(Array.isArray(userData) ? userData : []);
          }
        } catch (error) {
          console.error('[PRODUCTS] Error fetching user products:', error);
          setUserStoreProducts([]);
        }
        
        // If HIGH-HIGH-HIGH admin, fetch all products
        if (user.is_high_high_high_admin === 1) {
          try {
            const adminRes = await fetch('/api/products/admin/all');
            const adminData = await adminRes.json();
            setAllProductsForAdmin(Array.isArray(adminData) ? adminData : []);
            console.log(`[PRODUCTS] Fetched ${adminData.length} products for admin`);
          } catch (error) {
            console.error('Error fetching admin products:', error);
            setAllProductsForAdmin([]);
          }
        }
      }

      // Fetch products for each store #01-#30
      const storeProductsMap: { [key: number]: Product[] } = {};
      for (let storeNum = 1; storeNum <= 30; storeNum++) {
        try {
          const storeRes = await fetch(`/api/products/store/${storeNum}`);
          const storeData = await storeRes.json();
          storeProductsMap[storeNum] = Array.isArray(storeData) ? storeData : [];
          console.log(`[PRODUCTS] Store ${storeNum} has ${storeProductsMap[storeNum].length} products`);
        } catch (error) {
          console.error(`Error fetching products for store ${storeNum}:`, error);
          storeProductsMap[storeNum] = [];
        }
      }
      setStoreProducts(storeProductsMap);

      // FETCH EVERYTHING PRODUCTS - ALL USERS, ALL STORES
      try {
        const everythingRes = await fetch('/api/products/everything/all');
        const everythingData = await everythingRes.json();
        setEverythingProducts(Array.isArray(everythingData) ? everythingData : []);
        console.log(`[PRODUCTS] Fetched ${everythingData.length} products for Everything store`);
      } catch (error) {
        console.error('Error fetching everything products:', error);
        setEverythingProducts([]);
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      setMainStoreProducts([]);
      setUserStoreProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  if (isOpen) {
    fetchAllProducts();
  }
}, [user, isOpen]);

  

//i have an error. trying to find the error. is this whats causing the error? part000001 of X ***Update:> I think error is solved; cause this might be a repeat of a working code. aka i think safe maybe to delete as of 2/10/26+maybe yes
  // Fetch everything products separately (all products, no duplicates)
// useEffect(() => {
 // const fetchEverythingProducts = async () => {
  //  try {
  //    const res = await fetch('/api/products/everything/all');
  //    const data = await res.json();
  //    setEverythingProducts(Array.isArray(data) ? data : []);
  //    console.log(`[PRODUCTS] Fetched ${data.length} products for Everything store`);
  //  } catch (error) {
 //     console.error('Error fetching everything products:', error);
 //     setEverythingProducts([]);
//    }
//  };
//
//  if (isOpen) {
//    fetchEverythingProducts();
//  }
// }, [isOpen]);



  

// When you want to render UnionNews#14:
useEffect(() => {
  if (isOpen && broadcasts['UnionNews#14']) {
    renderTheMemeBox(broadcasts['UnionNews#14']);
  }
  
  return () => {
    unmountTheMemeBox();
  };
}, [isOpen]);







  

// Listen for new messages in chatrooms
useEffect(() => {
  const handleChatroomNewMessage = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { chatroomNumber } = customEvent.detail;
    
    // Add to unread set if not already there
    setUnreadChatrooms(prev => {
      const newSet = new Set(prev);
      newSet.add(chatroomNumber);
      return newSet;
    });
    
    console.log('[PROFILE] Chatroom', chatroomNumber, 'has new messages');
  };
  
  window.addEventListener('chatroomNewMessage', handleChatroomNewMessage);
  
  return () => {
    window.removeEventListener('chatroomNewMessage', handleChatroomNewMessage);
  };
}, []);




  

// Fetch user stores data (all user stores with products)
  useEffect(() => {
    const fetchUserStoresData = async () => {
      try {
        const res = await fetch('/api/products/stores/all/with-products');
        if (!res.ok) {
          console.log('[PRODUCTS] User stores fetch failed, status:', res.status);
          setUserStoresData([]);
          return;
        }
        const data = await res.json();
        setUserStoresData(Array.isArray(data) ? data : []);
        console.log(`[PRODUCTS] Fetched ${data.length} user stores with products`);
      } catch (error) {
        console.error('[PRODUCTS] Error fetching user stores:', error);
        setUserStoresData([]);
      }
    };

    if (isOpen) {
      fetchUserStoresData();
    }
  }, [isOpen]);


// Initialize Socket.IO to listen for unread notifications globally
useEffect(() => {
  if (isOpen) {
    // Connect to socket server if not already connected
    const socket = io(
      process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001',
      {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      }
    );

    socketRef.current = socket;

    // Listen for unread notifications from any chatroom
    socket.on('chatroomUnreadNotification', (notification: { room: string; hasUnread: boolean }) => {
      // Extract the chatroom number from the room name
      // Room name format: "SisterUnion001NewEngland-chatroom-1"
      const match = notification.room.match(/SisterUnion(\d+)/);
      if (match) {
        const chatroomNum = parseInt(match[1], 10);
        setUnreadChatrooms(prev => {
          const newSet = new Set(prev);
          if (notification.hasUnread) {
            newSet.add(chatroomNum);
          } else {
            newSet.delete(chatroomNum);
          }
          return newSet;
        });
        console.log(`[PROFILE] Green circle updated for chatroom: ${chatroomNum}`);
      }
    });

    return () => {
      socket.off('chatroomUnreadNotification');
      socket.disconnect();
    };
  }
}, [isOpen]);


  

// Fetch user's custom stores when modal opens (for logged-in users)
useEffect(() => {
  if (user && user.id && isOpen) {
    setIsLoadingUserStores(true);
    fetch(`/api/products/user/${user.id}/stores`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            console.log('[PROFILE MODAL] Not authenticated, skipping user stores fetch');
            setUserStores([]);
            return Promise.resolve([]);
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          console.log(`[PROFILE MODAL] ✅ Fetched ${data.length} user stores`);
          setUserStores(data);
        }
      })
      .catch(error => {
        console.error('[PROFILE MODAL] ❌ Error fetching user stores:', error);
        setUserStores([]);
      })
      .finally(() => setIsLoadingUserStores(false));
  }
}, [user, isOpen]);



// Listen for badge zoom events from nested chatroom
useEffect(() => {
  const handleShowBadgeZoom = (event: Event) => {
    const customEvent = event as CustomEvent;
    const badge = customEvent.detail;
    console.log('[MY PROFILE] Badge zoom requested from chatroom:', badge);
    onBadgeZoom?.(badge);
  };

  const handleShowProductDetail = (event: Event) => {
    const customEvent = event as CustomEvent;
    const product = customEvent.detail;
    console.log('[MY PROFILE] Product view requested from chatroom:', product);
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  };

  if (isOpen) {
    window.addEventListener('showBadgeZoom', handleShowBadgeZoom);
    window.addEventListener('showProductDetail', handleShowProductDetail);
  }

  return () => {
    window.removeEventListener('showBadgeZoom', handleShowBadgeZoom);
    window.removeEventListener('showProductDetail', handleShowProductDetail);
  };
}, [isOpen, onBadgeZoom]);




  


// Fetch friends' stores and products when modal opens
useEffect(() => {
  if (isOpen && user && user.id) {
    setIsLoadingFriendsStores(true);
    fetch('/api/products/friends/stores/all')
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            console.log('[QUADRANTS] Not authenticated, skipping friends stores fetch');
            setFriendsStoresData([]);
            return Promise.resolve([]);
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setFriendsStoresData(Array.isArray(data) ? data : []);
        console.log(`[QUADRANTS] ✅ Loaded ${Array.isArray(data) ? data.length : 0} friends with products`);
      })
      .catch(error => {
        console.error('[QUADRANTS] ❌ Error fetching friends stores:', error);
        setFriendsStoresData([]);
      })
      .finally(() => setIsLoadingFriendsStores(false));
  }
}, [isOpen, user]);



  



const resetLeftSection = () => {
  setLeftWidthDesktop(20);
  setCenterWidthDesktop(60);
  setIsLeftSectionCollapsed(false);
};

const resetRightSection = () => {
  setRightWidthDesktop(20);
  setCenterWidthDesktop(60);
  setIsRightSectionCollapsed(false);
};
  
  

  
  const handleMagnify = (product: Product) => {
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    if (user) {
      fetch('/api/products/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      }).catch(err => console.error('Error adding to cart:', err));
    }
  };

  const getCartUrl = (product: Product | null): string => {
    if (!product) {
      return 'https://page001.uminion.com/cart/';
    }

    // If product has SKU, link directly to WooCommerce with SKU
    if (product.sku_id) {
      return `https://page001.uminion.com/cart/?add-to-cart=${encodeURIComponent(product.sku_id)}`;
    }

    // Default to general cart
    return 'https://page001.uminion.com/cart/';
  };

  const MainUhubFeatureV001ForSisterUnionPages = [
    'SisterUnion001NewEngland', 'SisterUnion002CentralEastCoast', 'SisterUnion003SouthEast',
    'SisterUnion004TheGreatLakesAndAppalachia', 'SisterUnion005CentralSouth', 'SisterUnion006CentralNorth',
    'SisterUnion007SouthWest', 'SisterUnion008NorthWest', 'SisterUnion009International',
    'SisterUnion010TheGreatHall', 'SisterUnion011WaterFall', 'SisterUnion012UnionEvent',
    'SisterUnion013UnionSupport', 'SisterUnion014UnionNews', 'SisterUnion015UnionRadio',
    'SisterUnion016UnionDrive', 'SisterUnion017UnionArchiveAndEducation', 'SisterUnion018UnionTech',
    'SisterUnion019UnionPolitic', 'SisterUnion020UnionSAM', 'SisterUnion021UnionUkraineAndTheCrystalPalace',
    'SisterUnion022FestyLove', 'SisterUnion023UnionLegal', 'SisterUnion024UnionMarket',
    'SisterUnion025UnionArena', 'SisterUnion026UnionTradeEnergyAndCommunityWIFI', 'SisterUnion027Secret027', 'SisterUnion028Sports', 'SisterUnion029WheelsVehiclesAndeMods', 'SisterUnion030HousingAndHealthcare',
  ];
  const MainUhubFeatureV001ForModalColors = Array.from({ length: 30 }, (_, i) => `hsl(${i * 12}, 70%, 50%)`);

  const handleUHomeHubClick = (buttonNumber: number) => {
  setActiveChatModal(buttonNumber);
  // Clear the green circle for this chatroom
  setUnreadChatrooms(prev => {
    const newSet = new Set(prev);
    newSet.delete(buttonNumber);
    return newSet;
  });
};
  const handleCloseChatModal = async () => {
  if (activeChatModal !== null) {
    // Mark chatroom as read
    try {
      await fetch('/api/chat/mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatroomNumber: activeChatModal,
        }),
      });
      
      // Remove from unread set
      const newUnread = new Set(unreadChatrooms);
      newUnread.delete(activeChatModal);
      setUnreadChatrooms(newUnread);
      console.log('[PROFILE] Chatroom', activeChatModal, 'marked as read');
    } catch (error) {
      console.error('[PROFILE] Error marking chatroom as read:', error);
    }
  }
  setActiveChatModal(null);
};

  const navigateCenterRight = (direction: 'left' | 'right') => {
    const currentIndex = ALL_STORES.findIndex(s => s.id === centerRightView.id);
    const nextIndex = (currentIndex + (direction === 'right' ? 1 : -1) + ALL_STORES.length) % ALL_STORES.length;
    setCenterRightView(ALL_STORES[nextIndex]);
  };

  const handleStartDragMobile = () => {
    setIsDraggingLeft(true);
  };

  const handleStartDragRight = () => {
    setIsDraggingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingLeft && !isDraggingRight) return;
      const container = document.querySelector('[id*="CenterLeftSection"]')?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newLeft = ((e.clientX - rect.left) / rect.width) * 100;
      if (newLeft > 15 && newLeft < 85) {
        const leftPercent = newLeft;
        const total = 100;
        const remainingPercent = total - leftPercent;
        if (isDraggingLeft) {
          setLeftWidthMobile(leftPercent);
          setCenterWidthMobile(remainingPercent * 0.6);
          setRightWidthMobile(remainingPercent * 0.4);
          setLeftWidthDesktop(leftPercent);
          setCenterWidthDesktop(remainingPercent * 0.6);
          setRightWidthDesktop(remainingPercent * 0.4);
        }
        if (isDraggingRight) {
          const centerPercent = (e.clientX - rect.left) / rect.width * 100;
          if (centerPercent > 15 && centerPercent < 85) {
            setCenterWidthMobile(centerPercent);
            const remaining = 100 - leftWidthMobile - centerPercent;
            setRightWidthMobile(remaining);
            setCenterWidthDesktop(centerPercent);
            const remainingDesktop = 100 - leftWidthDesktop - centerPercent;
            setRightWidthDesktop(remainingDesktop);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, leftWidthMobile, leftWidthDesktop]);

  const renderCenterRightContent = () => {
    const mainProducts = mainStoreProducts.length > 0 ? mainStoreProducts : [];
    const userProducts = userStoreProducts.length > 0 ? userStoreProducts : [];
    const isUnionSAM20 = centerRightView.number === 20;
    const isUnionPolitic19 = centerRightView.number === 19;

    return (
        <>
           {isUnionSAM20 && (
  <>
    <div id="MainUhubFeatureV001ForUnionStore" className="border rounded-md p-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-center flex-1">Union Store</h4>
        <a href={getCartUrl(mainStoreProducts[0] || null)} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </a>
      </div>
      <div className="space-y-2">
        {isLoadingProducts ? (
          <div className="text-center text-muted-foreground py-4">Loading products...</div>
        ) : mainStoreProducts.length > 0 ? (
          mainStoreProducts.map((p, i) => (
            <div 
              key={p.id || i}
              className="border rounded p-2 text-xs flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
              onClick={() => {
                setSelectedProduct(p);
                setProductDetailModalOpen(true);
              }}
            >
              {p.image_url && (
                <img 
                  src={p.image_url} 
                  alt={p.name}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                {p.price && <p className="text-orange-400">${p.price.toFixed(2)}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:text-orange-400 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(p);
                  setProductDetailModalOpen(true);
                }}
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">No products available</div>
        )}
      </div>
    </div>
    <div id="MainUhubFeatureV001ForUsersStores" className="border rounded-md p-2 flex flex-col h-full">
  <div className="flex justify-between items-center mb-2 sticky top-0 bg-background z-10">
    <div className="flex items-center flex-1">
      <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white mr-2" onClick={() => {
        if (!user) {
          alert('You must be logged in to add a product.');
          return;
        }
        setAddProductModalOpen(true)
      }}>
        <Plus className="h-4 w-4" />
      </Button>
      <h4 className="font-semibold text-center flex-1">Users' Stores</h4>
    </div>
    <a href="https://page001.uminion.com/cart/" target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-black">
        <ShoppingCart className="h-4 w-4" />
      </Button>
    </a>
  </div>
  <div 
    className="flex-1 overflow-y-auto"
    style={{
      maxHeight: '320px',
      scrollbarColor: '#f97316 #1f2937',
      scrollbarWidth: 'thin'
    }}
  >
    <style>{`
      div[style*="maxHeight: 320px"]::-webkit-scrollbar {
        width: 8px;
      }
      div[style*="maxHeight: 320px"]::-webkit-scrollbar-track {
        background: #1f2937;
      }
      div[style*="maxHeight: 320px"]::-webkit-scrollbar-thumb {
        background: #f97316;
        border-radius: 4px;
      }
      div[style*="maxHeight: 320px"]::-webkit-scrollbar-thumb:hover {
        background: #ea580c;
      }
    `}</style>
    {everythingProducts.length > 0 ? (
      <div className="grid grid-cols-2 gap-2">
        {getRandomizedProducts(everythingProducts).map((product) => (
          <div
            key={product.id}
            className="border rounded-md p-2 relative h-24 group hover:border-orange-400 transition cursor-pointer"
            style={{
              backgroundImage: product.image_url ? `url('${product.image_url}')` : 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Clickable Overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-40 rounded-md cursor-pointer"
              onClick={() => {
                setSelectedProduct(product);
                setProductDetailModalOpen(true);
              }}
            ></div>

            {/* Product Name */}
            <div className="relative z-10 text-xs font-semibold text-white truncate pointer-events-none">
              {product.name}
            </div>

            {/* Price Badge */}
            {product.price && (
              <div className="absolute bottom-1 left-1 z-10 text-xs font-semibold bg-black bg-opacity-60 text-orange-400 px-1 rounded pointer-events-none">
                ${product.price.toFixed(2)}
              </div>
            )}

            {/* Eye Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
                setProductDetailModalOpen(true);
              }}
              className="absolute bottom-1 right-1 z-20 bg-black bg-opacity-60 hover:bg-opacity-80 p-1 rounded transition"
              title="View product details"
            >
              <Eye className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-muted-foreground text-sm py-8">
        No products yet
      </div>
    )}
  </div>
</div>
  </>
)}

            {isUnionPolitic19 && (
                <div className="border rounded-md p-4 flex items-center justify-center text-muted-foreground h-48">
                    This store is coming soon
                </div>
            )}

            {!isUnionSAM20 && !isUnionPolitic19 && (
  <div id="MainUhubFeatureV001ForStoreColumn" className="border rounded-md p-2 flex flex-col h-full">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold text-center flex-1">Store {String(centerRightView.number).padStart(2, '0')}</h4>
      <a href={getCartUrl(storeProducts[centerRightView.number]?.[0] || null)} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </a>
    </div>
    <div className="flex-1 overflow-y-auto space-y-2 mb-4">
      {isLoadingProducts ? (
        <div className="text-center text-muted-foreground py-4">Loading products...</div>
      ) : (storeProducts[centerRightView.number] && storeProducts[centerRightView.number].length > 0) ? (
        storeProducts[centerRightView.number].map((p, i) => (
          <div 
            key={p.id || i}
            className="border rounded p-2 text-xs flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
            onClick={() => {
              setSelectedProduct(p);
              setProductDetailModalOpen(true);
            }}
          >
            {p.image_url && (
              <img 
                src={p.image_url} 
                alt={p.name}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.name}</p>
              {p.price && <p className="text-orange-400">${p.price.toFixed(2)}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:text-orange-400 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(p);
                setProductDetailModalOpen(true);
              }}
              title="View details"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">No products available</div>
      )}
    </div>
    <div className="border-t pt-2 mt-auto">
      <div className="grid grid-cols-2 gap-1">
        {ALL_STORES.slice(1, 31).map((store) => (
          <Button
            key={store.id}
            variant={store.id === centerRightView.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCenterRightView(store)}
            className="text-xs h-8"
            title={store.name}
          >
            #{String(store.number).padStart(2, '0')}
          </Button>
        ))}
      </div>
    </div>
  </div>
)}
        </>
    );
  };

  const renderCenterContent = () => {
    switch (centerView) {
        case 'friends':
            return <MainUhubFeatureV001ForFriendsView pendingRequests={pendingFriendRequests} setPendingRequests={setPendingFriendRequests} />;
        case 'settings':
            return <MainUhubFeatureV001ForSettingsView />;
        case 'broadcasts':
default:
    const currentBroadcast = broadcasts[broadcastView];
return (
  <>
   <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon" onClick={() => {
      const currentIndex = broadcastKeys.indexOf(broadcastView);
      const nextIndex = (currentIndex - 1 + broadcastKeys.length) % broadcastKeys.length;
      setBroadcastView(broadcastKeys[nextIndex]);
    }}>
      <ChevronLeft />
    </Button>
    <h3 className="text-center font-bold">{currentBroadcast?.title || 'MyBroadcasts'}</h3>
    <Button variant="ghost" size="icon" onClick={() => {
      const currentIndex = broadcastKeys.indexOf(broadcastView);
      const nextIndex = (currentIndex + 1) % broadcastKeys.length;
      setBroadcastView(broadcastKeys[nextIndex]);
    }}>
      <ChevronRight />
    </Button>
  </div>

  {/* Show ALL collapsed section buttons in title bar */}
  <div className="flex gap-1">
    {/* LEFT SECTION (uHome-Hub) COLLAPSE BUTTON */}
    {isLeftSectionCollapsed && (
      <button
        onClick={() => {
          setIsLeftSectionCollapsed(false);
          if (window.innerWidth >= 768) {
            setLeftWidthDesktop(20);
            setCenterWidthDesktop(60);
          } else {
            // On mobile, scroll to top when expanding left section
            const container = document.querySelector('[data-profile-main-container]');
            if (container) {
              container.scrollTop = 0;
            }
          }
        }}
        className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition"
        title="Restore uHome-Hub"
      >
        <span>💬</span>
      </button>
    )}
    
    {/* RIGHT SECTION (UnionSAM#20) COLLAPSE BUTTON */}
    {isRightSectionCollapsed && (
      <button
        onClick={() => {
          setIsRightSectionCollapsed(false);
          if (window.innerWidth >= 768) {
            setRightWidthDesktop(20);
            setCenterWidthDesktop(60);
          } else {
            // On mobile, scroll to top when expanding right section
            const container = document.querySelector('[data-profile-main-container]');
            if (container) {
              container.scrollTop = 0;
            }
          }
        }}
        className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition"
        title="Restore UnionSAM#20"
      >
        <span>🛒</span>
      </button>
    )}
    
    {/* BROADCAST INTERNAL COLLAPSE BUTTONS (UnionNews#14 only) */}
    {broadcastView === 'UnionNews#14' && (
      <>
        {isBroadcastCarouselCollapsed && (
  <button 
    onClick={() => {
      setIsBroadcastCarouselCollapsed(false);
      setBroadcastRightWidth(67);
      setBroadcastLeftWidth(33);
      setBroadcastCarouselImageCount(3);
    }}
    className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition"
    title="Restore carousel"
  >
    📸
  </button>
)}
{isBroadcastLeftCollapsed && (
  <button 
    onClick={() => {
      // CRITICAL: Use setTimeout to ensure state updates BEFORE re-rendering memebox
      setIsBroadcastLeftCollapsed(false);
      setBroadcastLeftWidth(33);
      setBroadcastRightWidth(67);
      setBroadcastCarouselImageCount(3);
      
      // Wait for state to update, then unmount and re-render
      setTimeout(() => {
        unmountTheMemeBox(); // Clean up first
        setTimeout(() => {
          renderTheMemeBox(broadcasts['UnionNews#14']); // Then render fresh
        }, 100);
      }, 50);
    }}
    className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition"
    title="Restore left content"
  >
    🎁
  </button>
)}
      </>
    )}
  </div>
</div>





    
    {broadcastView === 'MyBroadcasts' ? 
      (user ? <CreateBroadcastView /> : <p className="text-center text-muted-foreground">You must be logged in to create a broadcast.</p>) 
      : (currentBroadcast ? <BroadcastView 
  broadcast={currentBroadcast} 
  user={user}
  broadcastView={broadcastView}
  unionNews14Images={unionNews14Images}
  onOpenUnionNews14Modal={() => setIsUnionNews14ModalOpen(true)}
  onImageZoom={(imageUrl: string, title: string, items: BroadcastItem[], currentIndex: number) => {
    console.log('[PROFILE MODAL] Broadcast carousel image zoom:', title, 'Index:', currentIndex);
    setBroadcastZoomState({
      isOpen: true,
      imageUrl,
      title,
      items,
      currentIndex,
    });
  }}
  broadcastDividerDragging={broadcastDividerDragging}
  setBroadcastDividerDragging={setBroadcastDividerDragging}
  broadcastLeftWidth={broadcastLeftWidth}
  setBroadcastLeftWidth={setBroadcastLeftWidth}
  broadcastRightWidth={broadcastRightWidth}
  setBroadcastRightWidth={setBroadcastRightWidth}
  broadcastCarouselImageCount={broadcastCarouselImageCount}
  setBroadcastCarouselImageCount={setBroadcastCarouselImageCount}
  isBroadcastLeftCollapsed={isBroadcastLeftCollapsed}
  setIsBroadcastLeftCollapsed={setIsBroadcastLeftCollapsed}
  isBroadcastCarouselCollapsed={isBroadcastCarouselCollapsed}
  setIsBroadcastCarouselCollapsed={setIsBroadcastCarouselCollapsed}
  activeChatModal={activeChatModal}
  onCloseChatModal={handleCloseChatModal}
  MainUhubFeatureV001ForSisterUnionPages={MainUhubFeatureV001ForSisterUnionPages}
  MainUhubFeatureV001ForModalColors={MainUhubFeatureV001ForModalColors}
/> : <p>Broadcast not found.</p>)
    }
  </>
);

        
    }
  };

  const handleTopLeftButtonClick = (view: string) => {
    if (!user) {
      alert("You must be logged in to use this feature.");
      return;
    }
    setCenterView(view);
  };

  const handleProfileImageClick = () => {
  if (!user) {
    onClose();
    onOpenAuthModal('login');
  } else {
    // For own profile, show own profile modal
    setSelectedFriendForModal({
      id: user.id,
      username: user.username,
      profile_image_url: user.profile_image_url,
      cover_photo_url: null,
    });
    setIsFriendProfileModalOpen(true);
  }
};

const handleEditProfileImageClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (!user) {
    alert('You must be logged in to edit your profile.');
    return;
  }
  setIsEditingProfileImage(true);
};

  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 1 : 6;
  const socialLinkPagesLeft = Array.from({ length: Math.ceil(socialLinksLeft.length / itemsPerPage) }, (_, i) => socialLinksLeft.slice(i * itemsPerPage, (i + 1) * itemsPerPage));
  const socialLinkPagesRight = Array.from({ length: Math.ceil(socialLinksRight.length / itemsPerPage) }, (_, i) => socialLinksRight.slice(i * itemsPerPage, (i + 1) * itemsPerPage));

  const handleSocialNavLeft = (dir: 'left' | 'right') => {
    setSocialPageLeft(prev => {
      const newPage = prev + (dir === 'right' ? 1 : -1);
      if (newPage < 0) return socialLinkPagesLeft.length - 1;
      if (newPage >= socialLinkPagesLeft.length) return 0;
      return newPage;
    });
  };
  
  const handleSocialNavRight = (dir: 'left' | 'right') => {
    setSocialPageRight(prev => {
      const newPage = prev + (dir === 'right' ? 1 : -1);
      if (newPage < 0) return socialLinkPagesRight.length - 1;
      if (newPage >= socialLinkPagesRight.length) return 0;
      return newPage;
    });
  };

  // Helper function to shuffle array (randomize products)
const getRandomizedProducts = (products: Product[]): Product[] => {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

  if (!isOpen) return null;

  return (
    <>
      <div className="bg-background text-foreground w-full h-full flex flex-col relative">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50" onClick={onClose}>
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>
         {/* Top Section */}
         <div className="md:flex md:flex-row hidden md:p-4 md:border-b md:gap-2">
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopLeftSection" className="md:w-1/5 grid grid-cols-4 md:grid-cols-2 grid-rows-1 md:grid-rows-2 gap-2 md:pr-4">
             <Button variant="outline" className="flex flex-col h-full items-center justify-center relative text-xs" title="Friends" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
               {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
               <Users className="h-4 w-4 mb-1" /> Friends
             </Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Broadcast" onClick={() => setCenterView('broadcasts')}><Megaphone className="h-4 w-4 mb-1" /> Broadcast</Button>
             <a href="https://github.com/uminionunion/UminionsWebsite/discussions/13" target="_blank" rel="noopener noreferrer" className="w-full h-full">
               <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center text-xs" title="Code" disabled={!user}><Code className="h-4 w-4 mb-1" /> Code</Button>
             </a>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}><Settings className="h-4 w-4 mb-1" /> Settings</Button>
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopMiddleSection" className="md:w-2/5 h-32 md:h-40 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg')" }}>
             {user && <Button className="absolute bottom-2 right-2" size="sm">Change Cover</Button>}
           </div>

            {/* 8-Button Grid - SMALLER BUTTONS - HIDDEN ON MOBILE */}
<div className="hidden md:flex md:w-1/4 justify-center items-center md:pl-4">
  <div className="grid grid-cols-2 gap-1 w-fit">
    <Button
      variant="outline"
      size="sm"
      className="flex flex-col items-center justify-center h-7 w-7 gap-0 text-xs"
      onClick={() => setIsQuadrantsModalOpen(true)}
      title="HikingToAllStores"
    >
      <Mountain className="h-3 w-3" />
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="flex flex-col items-center justify-center h-7 w-7 gap-0 text-xs"
      onClick={() => {
        if (!user) {
          alert("You must be logged in to use this feature.");
          return;
        }
        setIsHomeModalOpen(true);
      }}
      title="Home"
      disabled={!user}
    >
      <Home className="h-3 w-3" />
    </Button>
    {Array.from({ length: 6 }, (_, i) => (
      <Button
        key={i + 3}
        variant="outline"
        size="sm"
        className="flex flex-col items-center justify-center h-7 w-7 gap-0 text-xs"
        onClick={() => setIsQuadrantsModalOpen(true)}
        title={`Custom ${i + 3}`}
      >
        {i + 3}
      </Button>
    ))}
  </div>
</div>

          {/* Avatar (this is apparently how to modify avatar for users default image(? and then some? or thats it?) EXTRA EXTRA QUEST Do i want to remove avatar fallback)*/}
<div id="MainUhubFeatureV001ForMyProfileSettingsTopRightSection" className="md:w-1/5 flex justify-center md:justify-end items-start md:pl-4 relative">
  <div onClick={handleProfileImageClick} className="cursor-pointer relative group">
    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-orange-400 group-hover:border-orange-600 transition">
      <AvatarImage src={user?.profile_image_url || "/defaultUminionUassets/defaultUminionUbadge.png"} alt="Profile" />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
    {user && (
      <button 
        onClick={handleEditProfileImageClick}
        className="absolute bottom-1 right-1 bg-orange-400 hover:bg-orange-500 text-white rounded-full p-2 transition shadow-lg"
        title="Edit profile picture"
      >
        <Pencil className="h-4 w-4" />
      </button>
    )}
  </div>
  <div className="absolute bottom-0 right-0 flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-gray-500'}`}></div>
      <span className="text-xs text-muted-foreground">{user ? 'Online' : 'Not Logged In'}</span>
  </div>
</div>
         </div>

        
  {/* Mobile Top Row */}
  <div className="md:hidden flex flex-col p-2 border-b gap-2">
    <div className="flex gap-2 items-center">

      {/* Button Row (UPDATE: now full-width since avatar is gone) */}
      <div className="flex gap-1 flex-1">

        <Button
          variant="outline"
          className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1"
          title="Friends"
          onClick={() => handleTopLeftButtonClick('friends')}
          disabled={!user}
        >
          {pendingFriendRequests.length > 0 && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
          )}
          <Users className="h-3 w-3" />
          <span className="text-xxs">Friends</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1"
          title="Broadcast"
          onClick={() => setCenterView('broadcasts')}
        >
          <Megaphone className="h-3 w-3" />
          <span className="text-xxs">Front Page & Memes</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1"
          title="Mountain"
          onClick={() => setIsQuadrantsModalOpen(true)}
        >
          <Mountain className="h-3 w-3" />
          <span className="text-xxs">Your Store</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1"
          title="Home"
          onClick={() => {
            if (!user) {
              alert("You must be logged in to use this feature.");
              return;
            }
            setIsHomeModalOpen(true);
          }}
          disabled={!user}
        >
          <Home className="h-3 w-3" />
          <span className="text-xxs">Home</span>
        </Button>

        {/* NEW CART BUTTON -TEMPORARILY BEING REPLACED BY ANVIL WITH A COMING SOON SIGN— same style, far right */}
        <Button
          variant="outline"
          className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1"
          title="Cart"
          onClick={() => {}}
          disabled
        >
          <Anvil className="h-3 w-3" />
          <span className="text-xxs">Coming Soon</span>
        </Button>

      </div>
    </div>

    {/* Banner removed safely */}
  </div>



        {/* Center Section */}
<div className="flex-grow flex overflow-hidden" data-profile-main-container style={{ flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
  {/* LEFT SECTION - ONLY SHOW IF NOT COLLAPSED */}
  {!isLeftSectionCollapsed && (
    <>
      <div id="MainUhubFeatureV001ForMyProfileSettingsCenterLeftSection" className="md:border-r overflow-y-auto p-2 md:p-4" style={{ width: window.innerWidth < 768 ? '100%' : `${leftWidthDesktop}%`, height: window.innerWidth < 768 ? 'auto' : 'auto' }}>
        <h3 className="text-center font-bold mb-2 md:mb-4 text-xs md:text-base">uHome-Hub:</h3>
        <div className="grid grid-cols-2 gap-1 md:gap-2">
          {MainUhubFeatureV001ForUHomeHubButtons.map(num => (
            <div key={num} className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="md:h-auto h-6 text-xs w-full" 
                onClick={() => handleUHomeHubClick(num)}
              >
                #{String(num).padStart(2, '0')}
              </Button>
              
              {/* Green unread message badge */}
              {unreadChatrooms.has(num) && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-green-600 z-10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* LEFT DIVIDER - ONLY SHOW IF LEFT NOT COLLAPSED (DESKTOP ONLY) */}
{window.innerWidth >= 768 && (
  <div
    className="w-1 bg-gray-500 hover:bg-orange-400 cursor-col-resize transition-colors active:bg-orange-400"
    onMouseDown={() => setLeftDividerDragging(true)}
    onTouchStart={() => setLeftDividerDragging(true)}
  />
)}
    </>
  )}

  {/* CENTER SECTION is it this one? */}
  <div id="MainUhubFeatureV001ForMyProfileSettingsCenterCenterSection" className="p-2 md:p-4 overflow-y-auto" style={{ 
    width: window.innerWidth < 768 ? '100%' : `${centerWidthDesktop}%`,
       height: window.innerWidth < 768 ? 'auto' : 'auto', 
    display: 'flex',
    flexDirection: 'column'
  }}>
    {renderCenterContent()}
  </div>

  {/* RIGHT DIVIDER - ONLY SHOW IF RIGHT NOT COLLAPSED */}
{!isRightSectionCollapsed && window.innerWidth >= 768 && (
  <div
    className="w-1 bg-gray-500 hover:bg-orange-400 cursor-col-resize transition-colors active:bg-orange-400"
    onMouseDown={() => setRightDividerDragging(true)}
    onTouchStart={() => setRightDividerDragging(true)}
  />
)}

  {/* RIGHT SECTION - ONLY SHOW IF NOT COLLAPSED */}
  {!isRightSectionCollapsed && (
    <div id="MainUhubFeatureV001ForMyProfileSettingsCenterRightSection" className="md:border-l overflow-y-auto p-2 md:p-4" style={{ 
      width: window.innerWidth < 768 ? '100%' : `${rightWidthDesktop}%`,
      height: window.innerWidth < 768 ? 'auto' : 'auto',
      borderTop: window.innerWidth < 768 ? '1px solid #374151' : 'none'
    }}>
      <div className="flex items-center justify-center mb-2 md:mb-4">
        <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => navigateCenterRight('left')}><ChevronLeft className="h-3 w-3 md:h-4 md:w-4" /></Button>
        <h3 className="text-center font-bold mx-1 md:mx-2 text-xs md:text-base">{centerRightView.displayName}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => navigateCenterRight('right')}><ChevronRight className="h-3 w-3 md:h-4 md:w-4" /></Button>
      </div>
      <div className="space-y-1 md:space-y-4">
        {renderCenterRightContent()}
      </div>
    </div>
  )}
</div>

          {/* Bottom Section */}
          <div className="flex border-t md:h-auto h-12">
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomLeftSection" className="w-[20%] p-1 md:p-2 border-r flex items-center">
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavLeft('left')}><ChevronLeft className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
              <div className="flex-grow hidden md:grid grid-cols-3 gap-0.5 md:gap-2 place-items-center">
                {socialLinkPagesLeft[socialPageLeft].map(link => (
                  <div key={link.id} className="text-xs md:text-xs">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <div className="flex-grow md:hidden flex justify-center items-center">
                {socialLinkPagesLeft[socialPageLeft].slice(0, 1).map(link => (
                  <div key={link.id} className="text-2xl">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavLeft('right')}><ChevronRight className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
            </div>
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomCenterSection" className="w-[60%] p-1 md:p-2 flex items-center justify-center">
              <a href="https://page001.uminion.com/product/official-uminion-union-card/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-xs md:text-sm">
                Become an Official Member of the Union via getting your Union Card Today!
              </a>
            </div>
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomRightSection" className="w-[20%] p-1 md:p-2 border-l flex items-center">
               <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavRight('left')}><ChevronLeft className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
              <div className="flex-grow hidden md:grid grid-cols-3 gap-0.5 md:gap-2 place-items-center">
                {socialLinkPagesRight[socialPageRight].map(link => (
                  <div key={link.id} className="text-xs md:text-xs">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <div className="flex-grow md:hidden flex justify-center items-center">
                {socialLinkPagesRight[socialPageRight].slice(0, 1).map(link => (
                  <div key={link.id} className="text-2xl">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavRight('right')}><ChevronRight className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
            </div>
          </div>
        </div>

      
        {isAddProductModalOpen && (
  <MainUhubFeatureV001ForAddProductModal 
    isOpen={isAddProductModalOpen} 
    onClose={() => {
      setAddProductModalOpen(false);
      setSelectedProduct(null);
    }}
    editingProduct={selectedProduct}
    onProductAdded={() => {
      // Refresh user products
      if (user) {
        if (user.is_high_high_high_admin === 1) {
          fetch('/api/products/admin/all')
            .then(res => res.json())
            .then(data => setUserStoreProducts(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error refreshing products:', err));
        } else {
          fetch(`/api/products/user/${user.id}`)
            .then(res => res.json())
            .then(data => setUserStoreProducts(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error refreshing products:', err));
        }
      }
    }}
  />
)}
        {isProductDetailModalOpen && (
          <MainUhubFeatureV001ForProductDetailModal isOpen={isProductDetailModalOpen} onClose={() => setProductDetailModalOpen(false)} product={selectedProduct} />
        )}




{isEditProductModalOpen && (
  <MainUhubFeatureV001ForEditProductModal
    isOpen={isEditProductModalOpen}
    onClose={() => {
      setEditProductModalOpen(false);
      setEditingProduct(null);
    }}
    product={editingProduct}
    userStores={userStores}
    onProductUpdated={async () => {
      // Refresh user stores data and products after assignment
      if (user) {
        try {
          // Re-fetch user stores
          const storesRes = await fetch(`/api/products/user/${user.id}/stores`);
          if (storesRes.ok) {
            const storesData = await storesRes.json();
            setUserStores(Array.isArray(storesData) ? storesData : []);
            console.log('[PROFILE MODAL] ✅ User stores refreshed after product assignment');
          }
          
          // Re-fetch user products
          const productsRes = await fetch(`/api/products/user/${user.id}`);
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            setUserStoreProducts(Array.isArray(productsData) ? productsData : []);
            console.log('[PROFILE MODAL] ✅ User products refreshed after product assignment');
          }
        } catch (error) {
          console.error('[PROFILE MODAL] Error refreshing data:', error);
        }
      }
    }}
  />
)}








      
        
      <QuadrantsModal 
  isOpen={isQuadrantsModalOpen}
  onClose={() => setIsQuadrantsModalOpen(false)}
  stores={ALL_STORES}
  userStoresData={userStoresData}
  friendsStoresData={friendsStoresData}
  setFriendsStoresData={setFriendsStoresData}
  isLoadingFriendsStores={isLoadingFriendsStores}
  setIsLoadingFriendsStores={setIsLoadingFriendsStores}
  onSelectStore={(store) => setCenterRightView(store)}
  user={user}
  mainStoreProducts={mainStoreProducts}
  userStoreProducts={userStoreProducts}
  isLoadingProducts={isLoadingProducts}
  setSelectedFriendForModal={setSelectedFriendForModal}
  setIsFriendProfileModalOpen={setIsFriendProfileModalOpen}
  onAddProductClick={() => {
    setIsQuadrantsModalOpen(false);
    setAddProductModalOpen(true);
  }}
  getCartUrl={getCartUrl}
  storeProducts={storeProducts}
  setSelectedProduct={setSelectedProduct}
  setProductDetailModalOpen={setProductDetailModalOpen}
  setAddProductModalOpen={setAddProductModalOpen}
  allProductsForAdmin={allProductsForAdmin}
  everythingProducts={everythingProducts}
  setEditingProduct={setEditingProduct}
  setEditProductModalOpen={setEditProductModalOpen}
  onProductView={(product) => {
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  }}
  onProductDelete={async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/trash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        if (user) {
          if (user.is_high_high_high_admin === 1) {
            const adminRes = await fetch('/api/products/admin/all');
            const adminData = await adminRes.json();
            setUserStoreProducts(Array.isArray(adminData) ? adminData : []);
          } else {
            const userRes = await fetch(`/api/products/user/${user.id}`);
            const userData = await userRes.json();
            setUserStoreProducts(Array.isArray(userData) ? userData : []);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  }}
  onProductEdit={(product: Product) => {
    setSelectedProduct(product);
    setAddProductModalOpen(true);
  }}
  allProducts={everythingProducts}
  onBadgeZoomOpen={onBadgeZoom}
/>









{isFriendProfileModalOpen && selectedFriendForModal && (
  <MainUhubFeatureV001ForUserProfileModal
    isOpen={isFriendProfileModalOpen}
    onClose={() => {
      setIsFriendProfileModalOpen(false);
      setSelectedFriendForModal(null);
    }}
    user={selectedFriendForModal}
    currentUser={user}
    onProductView={(product) => {
      setSelectedProduct(product);
      setProductDetailModalOpen(true);
    }}
    onBadgeZoomOpen={(badge) => {
      console.log('[MY PROFILE] Badge clicked in friend profile:', badge);
      onBadgeZoom?.(badge);
    }}
  />
)}



{isEditingProfileImage && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100001]">
    <div className="bg-background border rounded-lg p-6 max-w-md w-[90%]">
      <h2 className="text-xl font-bold mb-4">Change Profile Picture</h2>
      <div className="mb-4">
        <input 
          type="file" 
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('profileImage', file);
            
            try {
              console.log('[PROFILE] Uploading profile image...');
              const response = await fetch('/api/auth/profile-image', {
                method: 'POST',
                body: formData,
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('[PROFILE] Upload successful:', data);
                
                // Update the user object with new profile image URL
                if (user && data.profile_image_url) {
                  console.log('[PROFILE] Updating user profile image to:', data.profile_image_url);
                  // Force avatar to update by updating the user object
                  // The Avatar component is bound to user.profile_image_url
                }
                
                alert('Profile picture updated successfully!');
                setIsEditingProfileImage(false);
                
                // Reload page to fetch fresh user data from /api/auth/me
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              } else {
                const errorData = await response.json();
                console.error('[PROFILE] Upload failed:', errorData);
                alert(`Failed to upload: ${errorData.error || 'Unknown error'}`);
              }
            } catch (error) {
              console.error('[PROFILE] Error uploading profile picture:', error);
              alert('Error uploading profile picture: ' + error);
            }
          }}
          className="w-full p-2 border rounded bg-gray-800 text-white"
        />
      </div>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setIsEditingProfileImage(false)}
      >
        Cancel
      </Button>
    </div>
  </div>
)}



{isUnionNews14ModalOpen && (
  <UnionNews14FrontPageAdminModal
    isOpen={isUnionNews14ModalOpen}
    onClose={() => setIsUnionNews14ModalOpen(false)}
    onImageAdded={(newImage) => {
      console.log('[PROFILE MODAL] New image added:', newImage);
      // FIXED: Re-fetch images from database instead of prepending to state
      // This ensures the ordering matches what's in the database
      const fetchUpdatedImages = async () => {
        try {
          const res = await fetch('/api/broadcasts/union-news-14/images');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              // Sort by created_at descending to ensure newest first
              const sortedData = data.sort((a, b) => {
                const timeA = new Date(a.created_at || 0).getTime();
                const timeB = new Date(b.created_at || 0).getTime();
                return timeB - timeA; // Newest first
              });
              setUnionNews14Images(sortedData);
              console.log('[PROFILE MODAL] ✅ Re-fetched and sorted', sortedData.length, 'images from database');
            }
          }
        } catch (error) {
          console.error('[PROFILE MODAL] Error re-fetching images:', error);
        }
      };
      
      // Delay slightly to allow backend to finish writing to database
      setTimeout(fetchUpdatedImages, 500);
    }}
  />
)}


 {/* Broadcast Carousel Zoom Modal - ONLY for carousel images */}
      {broadcastZoomState.isOpen && (
        <BroadcastCarouselZoomModal
          imageUrl={broadcastZoomState.imageUrl}
          title={broadcastZoomState.title}
          items={broadcastZoomState.items}
          currentIndex={broadcastZoomState.currentIndex}
          onClose={() => setBroadcastZoomState(prev => ({ ...prev, isOpen: false }))}
          currentUser={user}
        />
      )}


      
      
        <HomeModal 
          isOpen={isHomeModalOpen}
          onClose={() => setIsHomeModalOpen(false)}
          userProducts={userStoreProducts}
        />
    </>
    );
  };

export default MainUhubFeatureV001ForMyProfileModal;

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play, X, Mountain, Home, ChevronDown, ChevronUp, Trash2, Anvil, Pencil, Loader2 } from 'lucide-react';
import MainUhubFeatureV001ForChatModal from '../uminion/MainUhubFeatureV001ForChatModal';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedFeed } from '../../hooks/usePaginatedFeed';
import FeedEntryCard from './FeedEntryCard';
import WorldFeed from './WorldFeed';
import MainUhubFeatureV001ForAddProductModal from './MainUhubFeatureV001ForAddProductModal';
import MainUhubFeatureV001ForProductDetailModal from './MainUhubFeatureV001ForProductDetailModal';
import MainUhubFeatureV001ForFriendsView from './MainUhubFeatureV001ForFriendsView';
import MainUhubFeatureV001ForSettingsView from './MainUhubFeatureV001ForSettingsView';
import { CreateBroadcastView } from './CreateBroadcastView';
import BroadcastCarousel from './BroadcastCarousel';
import AdminProductsList from './AdminProductsList';
import EverythingProductsList from './EverythingProductsList';
import QueuedImage from '../../components/QueuedImage';
import ProductQueuedImage from '../../components/ProductQueuedImage';
import { IMAGE_LOAD_PRIORITY, retainQueuedImages } from '../../lib/image-load-queue';
import { useQueuedImageSlot } from '../../lib/carousel-rotation-queue';
import { useSiteWideMute } from '../../lib/media-sound';
import { Volume2, VolumeX, MoreHorizontal, Radio, BookOpen, TreePalm, Skull, ShipWheel, Ship, Star, KeyRound, Wrench, Projector, Image as ImageIcon, SkipForward, SkipBack, Heart } from 'lucide-react';
import { enqueueProductImageBatch } from '../../lib/product-image-cache';
import { addToMainCart, isCartPriceLabel, LOGIN_REQUEST_EVENT, MAIN_CART_OPEN_EVENT } from '../../lib/internal-cart';
import MainCartView from './MainCartView';
import ProductSearchDropdown from './ProductSearchDropdown';
import MainUhubFeatureV001ForEditProductModal from './MainUhubFeatureV001ForEditProductModal';
import MainUhubFeatureV001ForUserProfileModal from './MainUhubFeatureV001ForUserProfileModal';
import UserStoresQuadrantView from './UserStoresQuadrantView';
import { io, Socket } from 'socket.io-client';
import UnionNews14FrontPageAdminModal from './UnionNews14FrontPageAdminModal';
import BroadcastCarouselZoomModal from './BroadcastCarouselZoomModal';
import TheMemeBoxImplementation001 from './TheMemeBoxImplementation001';
import { renderTheMemeBox, unmountTheMemeBox } from '@/TheMemeBoxRenderer';
import { additionalHardCodedCustomButtonPages } from './additional-hard-coded-custom-button-pages';
import { TheFoodPantryFeature } from '../../../../pantry-finder/src/pages/pantry-feature/the-food-pantry-feature';
import { pantryApiUrl } from '@/lib/api';
import ProfilePhotoEditor, { ProfilePhotoSuccessToast, type ProfilePhotoPurpose } from './ProfilePhotoEditor';
import { PROFILE_PHOTOS_CHANGED_EVENT, type ProfilePhotosChangedDetail } from '../../lib/profile-photo-events';
import 'leaflet/dist/leaflet.css';



interface MainUhubFeatureV001ForMyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onBadgeZoom?: (badge: { url: string; name: string }) => void;
  mobileWorldFeedDraft: string;
  onMobileWorldFeedDraftChange: (value: string) => void;
}

function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return isMobile;
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
  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground">
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
  payment_url?: string | null;
  user_store_id?: number;
  user_store_name?: string;
}

interface PoliticalCandidate {
  id: number;
  name: string;
  country?: string | null;
  state: string;
  office: string;
  website?: string | null;
  image_url?: string | null;
  username?: string | null;
  user_id?: number | null;
  lat: number;
  lng: number;
  show_on_map?: number;
}

interface CaptionStyle {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  size?: number;
}

interface ManagedCarouselItem {
  id?: number;
  image_url: string;
  title?: string | null;
  description?: string | null;
  price?: string | null;
  website?: string | null;
  button_number?: number | null;
  isUrl?: boolean;
  style?: CaptionStyle;
}

type ManagedCarouselSlot = 'left-top' | 'left' | 'right' | 'cover' | 'bottom' | 'center';
type ManagedCarouselAdminTarget = 'left' | 'right' | 'cover' | 'bottom' | 'center';

const parseCaptionStyle = (description?: string | null): CaptionStyle => {
  try {
    const parsed = JSON.parse(description || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const captionStyleToCss = (style: CaptionStyle): React.CSSProperties => ({
  color: style.color || undefined,
  fontWeight: style.bold ? 700 : undefined,
  fontStyle: style.italic ? 'italic' : undefined,
  fontSize: style.size ? ('' + style.size + 'px') : undefined,
});

const isAcceptedCaptionUrl = (value: string) => /^(https?:\/\/|www\.)/i.test(value.trim());
const normalizeCaptionUrl = (value: string) => /^www\./i.test(value.trim()) ? ('https://' + value.trim()) : value.trim();

const getManagedCarouselLimit = (slot: ManagedCarouselSlot) => slot === 'center' ? 49 : 10;

const UnionPoliticCandidates = ({ filtersOpen }: { filtersOpen: boolean }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<PoliticalCandidate[]>([]);
  const [filters, setFilters] = useState({ country: '', state: '', office: '' });
  const [editing, setEditing] = useState<PoliticalCandidate | null>(null);

  const loadCandidates = () => fetch(pantryApiUrl('/api/candidates')).then(response => response.ok ? response.json() : []).then((data: PoliticalCandidate[]) => setCandidates([...data].sort(() => Math.random() - 0.5))).catch(console.error);
  useEffect(() => { loadCandidates(); }, []);
  const removeCandidate = async (id: number) => {
    if (!window.confirm('Delete this candidate card?')) return;
    const response = await fetch(pantryApiUrl(`/api/candidates/${id}`), { method: 'DELETE', credentials: 'include' });
    if (!response.ok) return alert((await response.json()).message || 'Unable to delete candidate.');
    loadCandidates();
  };

  const saveCandidate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const response = await fetch(pantryApiUrl(`/api/candidates/${editing.id}`), { method: 'PUT', credentials: 'include', body: new FormData(event.currentTarget) });
    if (!response.ok) return alert((await response.json()).message || 'Unable to update candidate.');
    setEditing(null);
    loadCandidates();
  };
  const visibleCandidates = candidates.filter(candidate =>
    (!filters.country || candidate.country === filters.country) &&
    (!filters.state || candidate.state === filters.state) &&
    (!filters.office || candidate.office === filters.office));
  const options = (field: 'country' | 'state' | 'office') => [...new Set(candidates.map(candidate => candidate[field]).filter(Boolean))] as string[];

  return <div className="border rounded-md p-3 space-y-3">
    {filtersOpen && <div className="grid grid-cols-3 gap-2">
      {(['country', 'state', 'office'] as const).map(field => <select key={field} value={filters[field]} onChange={event => setFilters({ ...filters, [field]: event.target.value })} className="bg-black border rounded p-1 text-xs"><option value="">All {field}s</option>{options(field).map(value => <option key={value} value={value}>{value}</option>)}</select>)}
    </div>}
    <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
      {visibleCandidates.map(candidate => <article key={candidate.id} className="border rounded-md p-2 relative min-h-24">
        <div className="flex gap-2"><div className="h-16 w-16 shrink-0 bg-gray-800">{candidate.image_url && <QueuedImage src={candidate.image_url} alt={candidate.name} className="h-full w-full object-cover" />}</div><div className="min-w-0"><h4 className="font-semibold truncate">{candidate.name}</h4><p className="text-xs text-muted-foreground">{[candidate.country, candidate.state, candidate.office].filter(Boolean).join(' | ')}</p>{candidate.website && <a href={candidate.website} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:underline break-all">Website</a>}</div></div>
        {user?.id === candidate.user_id && <div className="absolute right-1 bottom-1 flex gap-1"><Button size="icon" variant="ghost" className="h-6 w-6" title="Edit candidate" onClick={() => setEditing(candidate)}><Pencil className="h-3 w-3" /></Button><Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" title="Delete candidate" onClick={() => removeCandidate(candidate.id)}><Trash2 className="h-3 w-3" /></Button></div>}
        <span className="absolute bottom-1 right-1 text-xs text-muted-foreground pr-1">{candidate.username || 'Community'}</span>
      </article>)}
      {!visibleCandidates.length && <p className="text-sm text-muted-foreground text-center py-6">No candidate cards match these filters.</p>}
    </div>
    {editing && <form onSubmit={saveCandidate} className="border-t pt-3 grid gap-2"><input name="name" defaultValue={editing.name} required className="bg-black border rounded p-2" /><input name="country" defaultValue={editing.country || ''} required className="bg-black border rounded p-2" /><input name="state" defaultValue={editing.state} className="bg-black border rounded p-2" /><input name="office" defaultValue={editing.office} required className="bg-black border rounded p-2" /><input name="website" defaultValue={editing.website || ''} placeholder="Website" className="bg-black border rounded p-2" /><div className="grid grid-cols-2 gap-2"><input name="lat" type="number" step="any" defaultValue={editing.lat} className="bg-black border rounded p-2" aria-label="Optional latitude" /><input name="lng" type="number" step="any" defaultValue={editing.lng} className="bg-black border rounded p-2" aria-label="Optional longitude" /></div><input name="image" type="file" accept="image/jpeg,image/png" className="text-xs" /><div className="flex gap-2"><Button type="submit" size="sm">Save</Button><Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form>}
  </div>;
};

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
                    <Button variant="outline" size="icon" className="uhub-store-action h-7 w-12" aria-label={inCart ? 'Remove from cart' : 'Add to cart'} onClick={handleCartClick}>
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

const AccountStatusButton = ({ showLogout, onClick }: { showLogout: boolean; onClick: () => void }) => (
  <button type="button" className={showLogout ? 'rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700' : 'uhub-login-status flex items-center gap-1 rounded bg-transparent px-2 py-1 text-xs text-gray-400 hover:text-gray-200'} style={{ border: 0, boxShadow: 'none', outline: 'none' }} onClick={onClick}>
    {showLogout ? 'Log Out?' : <><span className="h-2 w-2 rounded-full bg-green-500" /> Logged In</>}
  </button>
);

const SiteWideMuteButton = ({ small = false }: { small?: boolean }) => {
  const { muted, toggle } = useSiteWideMute();
  return <Button type="button" variant="outline" size="icon" className={`${small ? 'h-8 w-8 ' : ''}uhub-play-button`} style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: '#374151' }} onClick={toggle} aria-label={muted ? 'Unmute UnionRadio audio and video' : 'Mute UnionRadio audio and video'} aria-pressed={!muted} title={muted ? 'Site sound muted' : 'Site sound on'}>
    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
  </Button>;
};

const UnionRadioPlayer = () => {
  const { muted } = useSiteWideMute();
  const enforceSiteMute = (event: React.SyntheticEvent<HTMLMediaElement>) => {
    if (muted && !event.currentTarget.muted) event.currentTarget.muted = true;
  };
  const { user } = useAuth();
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [replayEpisode, setReplayEpisode] = useState<any>(null);
  const [replayMediaIndex, setReplayMediaIndex] = useState(0);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [archiveMode, setArchiveMode] = useState<'recent' | 'popular' | 'random'>('recent');
  const [archiveEpisodes, setArchiveEpisodes] = useState<any[]>([]);
  const [calendarEpisodes, setCalendarEpisodes] = useState<any[]>([]);
  const [commentEpisode, setCommentEpisode] = useState<any>(null);
  const [episodeComments, setEpisodeComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const playerRef = useRef<HTMLMediaElement | null>(null);
  const replayPlayerRef = useRef<HTMLMediaElement | null>(null);
  const checkingScheduleRef = useRef(false);
  const scheduleTimerRef = useRef<number | null>(null);
  const findDueEpisodeRef = useRef<() => void>(() => {});
  const loadCalendarRef = useRef<() => void>(() => {});
  const loadArchive = useCallback(async (mode: 'recent' | 'popular' | 'random') => {
    const response = await fetch(`/api/episode-archive/${mode}`, { credentials: 'include' });
    if (response.ok) setArchiveEpisodes((await response.json()).episodes || []);
  }, []);

  const loadCalendar = useCallback(async () => {
    const response = await fetch('/api/episodes/calendar', { credentials: 'include' });
    if (response.ok) setCalendarEpisodes((await response.json()).episodes || []);
  }, []);

  const findDueEpisode = useCallback(async () => {
    if (nowPlaying || checkingScheduleRef.current) return;
    if (scheduleTimerRef.current) {
      window.clearTimeout(scheduleTimerRef.current);
      scheduleTimerRef.current = null;
    }
    checkingScheduleRef.current = true;
    try {
      const response = await fetch('/api/episodes/scheduled', { credentials: 'include' });
      if (!response.ok) return;
      const { episode, next_scheduled_at } = await response.json();
      if (episode) {
        setMediaIndex(0);
        setNowPlaying(episode);
      } else if (next_scheduled_at) {
        // One timer for the next scheduled episode (no polling). Capped so long waits re-check safely.
        const delay = Math.min(Math.max(new Date(next_scheduled_at).getTime() - Date.now(), 0) + 500, 2147483647);
        scheduleTimerRef.current = window.setTimeout(() => findDueEpisodeRef.current(), delay);
      }
    } finally {
      checkingScheduleRef.current = false;
    }
  }, [nowPlaying]);
  findDueEpisodeRef.current = findDueEpisode;

  // PREVIOUS POLLING (retired 10/15/26 by StorytellingSalem): checked /api/episodes/scheduled every 15 seconds.
  // useEffect(() => {
  //   findDueEpisode();
  //   const interval = window.setInterval(findDueEpisode, 15000);
  //   return () => window.clearInterval(interval);
  // }, [findDueEpisode]);

  // Check once on mount / after an episode finishes, whenever an episode is created, edited or deleted,
  // and when the tab becomes visible again.
  useEffect(() => {
    findDueEpisode();
    const onChanged = () => { findDueEpisodeRef.current(); loadCalendarRef.current(); };
    const onVisible = () => { if (document.visibilityState === 'visible') onChanged(); };
    window.addEventListener('uhub:episodes-changed', onChanged);
    window.addEventListener('focus', onChanged);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('uhub:episodes-changed', onChanged);
      window.removeEventListener('focus', onChanged);
      document.removeEventListener('visibilitychange', onVisible);
      if (scheduleTimerRef.current) window.clearTimeout(scheduleTimerRef.current);
    };
  }, [findDueEpisode]);

  useEffect(() => {
    loadArchive(archiveMode);
  }, [archiveMode, loadArchive]);

  // PREVIOUS POLLING (retired 10/15/26 by StorytellingSalem): refreshed the calendar every 30 seconds.
  // useEffect(() => {
  //   loadCalendar();
  //   const interval = window.setInterval(loadCalendar, 30000);
  //   return () => window.clearInterval(interval);
  // }, [loadCalendar]);
  useEffect(() => {
    loadCalendarRef.current = loadCalendar;
    loadCalendar();
  }, [loadCalendar]);

  const finishEpisode = async () => {
    if (!nowPlaying) return;
    await fetch(`/api/episodes/${nowPlaying.id}/played`, { method: 'POST', credentials: 'include' });
    setRecentlyPlayed((items) => [nowPlaying, ...items.filter((item) => item.id !== nowPlaying.id)].slice(0, 3));
    setNowPlaying(null);
    setMediaIndex(0);
    loadArchive(archiveMode);
    loadCalendar();
  };

  const handleMediaEnded = () => {
    const media = nowPlaying?.media || [];
    if (mediaIndex + 1 < media.length) setMediaIndex((index) => index + 1);
    else finishEpisode();
  };

  const handleReplayEnded = () => {
    const replayMedia = replayEpisode?.media || [];
    if (replayMediaIndex + 1 < replayMedia.length) {
      setReplayMediaIndex((index) => index + 1);
      return;
    }
    setReplayEpisode(null);
    setReplayMediaIndex(0);
    playerRef.current?.play().catch(() => {});
  };

  const replay = (episode: any) => {
    if (playerRef.current && !playerRef.current.paused) playerRef.current.pause();
    setReplayMediaIndex(0);
    setReplayEpisode(episode);
  };

  const vote = async (episodeId: number, direction: 'upvote' | 'downvote') => {
    const response = await fetch(`/api/episodes/${episodeId}/${direction}`, { method: 'POST', credentials: 'include' });
    if (response.ok) loadArchive(archiveMode);
  };

  const openComments = async (episode: any) => {
    setCommentEpisode(episode);
    setCommentText('');
    const response = await fetch(`/api/episodes/${episode.id}/comments`, { credentials: 'include' });
    const comments = response.ok ? await response.json() : [];
    setEpisodeComments(Array.isArray(comments) ? comments : []);
  };

  const submitComment = async () => {
    if (!commentEpisode || !commentText.trim()) return;
    const response = await fetch(`/api/episodes/${commentEpisode.id}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    if (response.ok) {
      setCommentText('');
      openComments(commentEpisode);
    }
  };

  const EpisodeActions = ({ episode, compact = false }: { episode: any; compact?: boolean }) => (
    <div className={`flex items-center gap-1 ${compact ? 'mt-1' : 'mt-2'}`}>
      <Button variant="outline" size="icon" className={compact ? 'h-5 w-5' : 'h-7 w-7'} onClick={() => replay(episode)} title={`Replay ${episode.name}`}><Play className="h-3 w-3" /></Button>
      <button type="button" className={compact ? 'text-[10px] text-green-400' : 'text-xs text-green-400'} onClick={() => vote(episode.id, 'upvote')}>+{episode.upvotes || 0}</button>
      <button type="button" className={compact ? 'text-[10px] text-red-400' : 'text-xs text-red-400'} onClick={() => vote(episode.id, 'downvote')}>-{episode.downvotes || 0}</button>
      <Button variant="ghost" size="icon" className={compact ? 'h-5 w-5' : 'h-7 w-7'} onClick={() => openComments(episode)} title={`View comments for ${episode.name}`}>
        <QueuedImage src="/EmojisForUminionWebsite/GreenEmoji004CommentOrChat.png" alt="Comments" className="h-4 w-4" />
      </Button>
    </div>
  );

  const media = nowPlaying?.media?.[mediaIndex];
  const replayMedia = replayEpisode?.media?.[replayMediaIndex];
  const toLocalDayKey = (value: Date | string) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const calendarStart = new Date();
  calendarStart.setDate(1);
  calendarStart.setHours(0, 0, 0, 0);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());
  const calendarDays = Array.from({ length: 35 }, (_, index) => new Date(calendarStart.getFullYear(), calendarStart.getMonth(), calendarStart.getDate() + index));
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
      <section className="min-w-0 border rounded-md p-4 bg-gray-950">
        <h4 className="font-semibold text-orange-400 mb-3">Now Playing</h4>
        {nowPlaying && media ? (
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{nowPlaying.name}</p>
              {nowPlaying.description && <p className="text-sm text-muted-foreground">{nowPlaying.description}</p>}
            </div>
            {media.media_type === 'video' ? (
              <video key={`${nowPlaying.id}-${media.id}`} data-union-radio-player muted={muted} onVolumeChange={enforceSiteMute} ref={playerRef as React.RefObject<HTMLVideoElement>} className={`w-full max-h-[420px] bg-black ${replayEpisode ? 'hidden' : ''}`} controls autoPlay={!replayEpisode} playsInline onEnded={handleMediaEnded}>
                <source src={media.media_url} />
              </video>
            ) : (
              <audio key={`${nowPlaying.id}-${media.id}`} data-union-radio-player muted={muted} onVolumeChange={enforceSiteMute} ref={playerRef as React.RefObject<HTMLAudioElement>} className={replayEpisode ? 'hidden' : 'w-full'} controls autoPlay={!replayEpisode} onEnded={handleMediaEnded}>
                <source src={media.media_url} />
              </audio>
            )}
            {replayMedia && (replayMedia.media_type === 'video' ? (
              <video key={`replay-${replayEpisode.id}-${replayMedia.id}`} data-union-radio-player muted={muted} onVolumeChange={enforceSiteMute} ref={replayPlayerRef as React.RefObject<HTMLVideoElement>} className="w-full max-h-[420px] bg-black" controls autoPlay playsInline onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></video>
            ) : (
              <audio key={`replay-${replayEpisode.id}-${replayMedia.id}`} data-union-radio-player muted={muted} onVolumeChange={enforceSiteMute} ref={replayPlayerRef as React.RefObject<HTMLAudioElement>} className="w-full" controls autoPlay onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></audio>
            ))}
            <EpisodeActions episode={nowPlaying} />
          </div>
        ) : replayMedia ? (
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{replayEpisode.name}</p>
              {replayEpisode.description && <p className="text-sm text-muted-foreground">{replayEpisode.description}</p>}
            </div>
            {replayMedia.media_type === 'video' ? (
              <video key={`replay-${replayEpisode.id}-${replayMedia.id}`} data-union-radio-player muted={muted} onVolumeChange={enforceSiteMute} ref={replayPlayerRef as React.RefObject<HTMLVideoElement>} className="w-full max-h-[420px] bg-black" controls autoPlay playsInline onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></video>
            ) : (
              <audio key={`replay-${replayEpisode.id}-${replayMedia.id}`} data-union-radio-player muted={muted} onVolumeChange={enforceSiteMute} ref={replayPlayerRef as React.RefObject<HTMLAudioElement>} className="w-full" controls autoPlay onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></audio>
            )}
          </div>
        ) : <p className="text-sm text-muted-foreground">No scheduled episode is playing.</p>}
      </section>

      <section className="border rounded-md p-4 bg-gray-950">
        <h4 className="font-semibold text-cyan-400 mb-3">Recently Played</h4>
        <div className="space-y-2">
          {recentlyPlayed.length ? recentlyPlayed.map((episode) => (
            <div key={episode.id} className="flex items-center gap-2 text-xs">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => replay(episode)} title={`Replay ${episode.name}`}><Play className="h-3 w-3" /></Button>
              <span className="min-w-0 flex-1 truncate">{episode.name}</span>
              <button type="button" className="text-green-400" onClick={() => vote(episode.id, 'upvote')}>+{episode.upvotes || 0}</button>
              <button type="button" className="text-red-400" onClick={() => vote(episode.id, 'downvote')}>-{episode.downvotes || 0}</button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openComments(episode)} title={`View comments for ${episode.name}`}><QueuedImage src="/EmojisForUminionWebsite/GreenEmoji004CommentOrChat.png" alt="Comments" className="h-4 w-4" /></Button>
            </div>
          )) : <p className="text-xs text-muted-foreground">Nothing has finished playing yet.</p>}
        </div>
      </section>

      <section className="lg:col-span-2 border rounded-md p-4 bg-gray-950">
        <h4 className="font-semibold text-cyan-400 mb-3">Broadcast Calendar</h4>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="p-2 text-center font-semibold text-muted-foreground">{day}</div>)}
          {calendarDays.map((day) => {
            const dayKey = toLocalDayKey(day);
            const entries = calendarEpisodes.filter((episode) => episode.scheduled_at && toLocalDayKey(episode.scheduled_at) === dayKey);
            return (
              <div key={dayKey} className="min-h-24 border border-gray-700 p-1 bg-black/30">
                <p className="mb-1 text-right text-muted-foreground">{day.getDate()}</p>
                {entries.map((episode) => {
                  const played = !!episode.last_played_at;
                  return (
                    <div key={episode.id} className="mb-1 border-l-2 border-orange-400 bg-gray-900 p-1">
                      <div className="flex items-center gap-1">
                        {episode.cover_image_url && <QueuedImage src={episode.cover_image_url} alt="" className="h-5 w-5 object-cover" />}
                        <span className="min-w-0 flex-1 truncate">{episode.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{new Date(episode.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                      {played && <EpisodeActions episode={episode} compact />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
      <section className="lg:col-span-2 border rounded-md p-4 bg-gray-950">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="font-semibold text-cyan-400 mr-auto">Archive</h4>
          {(['recent', 'popular', 'random'] as const).map((mode) => <Button key={mode} variant={archiveMode === mode ? 'default' : 'outline'} size="sm" onClick={() => setArchiveMode(mode)}>{mode}</Button>)}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {archiveEpisodes.map((episode) => (
            <div key={episode.id} className="border rounded p-2 text-sm">
              <p className="font-semibold truncate">{episode.name}</p>
              <EpisodeActions episode={episode} />
            </div>
          ))}
        </div>
      </section>
      {commentEpisode && <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/70 p-4" onClick={() => setCommentEpisode(null)}>
        <div className="w-full max-w-lg border rounded-md bg-black p-4" onClick={(event) => event.stopPropagation()}>
          <div className="mb-3 flex items-center justify-between"><h4 className="font-semibold">Comments: {commentEpisode.name}</h4><Button variant="ghost" size="icon" onClick={() => setCommentEpisode(null)} title="Close comments"><X className="h-4 w-4" /></Button></div>
          <div className="max-h-64 space-y-2 overflow-y-auto text-sm">{episodeComments.length ? episodeComments.map((comment) => <div key={comment.id} className="border rounded p-2"><p className="font-semibold text-xs text-cyan-400">{comment.username || 'Member'}</p><p>{comment.content}</p></div>) : <p className="text-muted-foreground">No comments yet.</p>}</div>
          {user ? <div className="mt-3 flex gap-2"><input className="flex-1 rounded border bg-gray-900 p-2 text-sm text-white" value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." /><Button onClick={submitComment} disabled={!commentText.trim()}>Post</Button></div> : <p className="mt-3 text-xs text-muted-foreground">Log in to leave a comment.</p>}
        </div>
      </div>}
    </div>
  );
};

const PantryFinderBroadcastView = () => {
  const [pantries, setPantries] = useState<any[]>([]);

  // Leaky-bucket loading: the view renders first, then the pantry data is requested 3 seconds later.
  // This component only exists while Find-a-Pantry#13 is open, so closing it cancels the request and frees the data.
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch('/pantry-api/api/pantries', { signal: controller.signal })
        .then((response) => response.ok ? response.json() : [])
        .then((items) => setPantries(Array.isArray(items) ? items.filter((item) => item.deleted === 0) : []))
        .catch((error) => { if (error?.name !== 'AbortError') setPantries([]); });
    }, 3000);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const addPantry = async (pantry: any) => {
    const response = await fetch('/pantry-api/api/pantries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pantry) });
    if (!response.ok) return null;
    const created = await response.json();
    setPantries((items) => [...items, created]);
    return created;
  };

  return <div className="uhub-pantry-finder min-h-[920px] h-[calc(70vh+300px)] overflow-hidden border rounded-md bg-gray-950"><TheFoodPantryFeature pantries={pantries} addPantry={addPantry} /></div>;
};

const BetaButtonView = () => (
  <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
    {Array.from({ length: 25 }, (_, index) => index + 1).map((page) => (
      <a key={page} className="flex min-h-20 items-center justify-center border rounded-md bg-gray-900 text-sm font-semibold text-cyan-300 hover:border-orange-400 hover:text-white" href={`/?betaPage=${page}`}>
        Page{String(page).padStart(3, '0')}
      </a>
    ))}
  </div>
);

const UmiMatchView = ({ onExit }: { onExit: () => void }) => {
  const { user } = useAuth();
  const [screen, setScreen] = useState<'discover' | 'matches' | 'messages' | 'settings' | 'map'>('discover');
  const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [messageUser, setMessageUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const currentCard = discoverUsers[0];

  const loadDiscover = () => fetch('/api/umimatch/discover', { credentials: 'include' }).then(res => res.ok ? res.json() : { users: [] }).then(data => setDiscoverUsers(data.users || [])).catch(() => setDiscoverUsers([]));
  const loadMatches = () => fetch('/api/umimatch/matches', { credentials: 'include' }).then(res => res.ok ? res.json() : { matches: [] }).then(data => setMatches(data.matches || [])).catch(() => setMatches([]));
  const loadProfile = () => fetch('/api/umimatch/profile', { credentials: 'include' }).then(res => res.ok ? res.json() : { profile: {} }).then(data => setProfile(data.profile || {})).catch(() => setProfile({}));

  useEffect(() => {
    if (!user) return;
    loadDiscover();
    loadMatches();
    loadProfile();
  }, [user]);

  const enroll = async () => {
    setIsEnrolling(true);
    try {
      const response = await fetch('/api/umimatch/enroll', { method: 'POST', credentials: 'include' });
      if (!response.ok) throw new Error('Unable to sign up for UmiMatch.');
      await loadProfile();
      await loadDiscover();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to sign up for UmiMatch.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const swipe = async (targetUserId: number, action: 'like' | 'skip') => {
    const response = await fetch(`/api/umimatch/${action}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId }) });
    const result = response.ok ? await response.json() : null;
    if (result?.isMatch) alert("It's a Match!");
    setDiscoverUsers(users => users.filter(matchUser => matchUser.id !== targetUserId));
    loadMatches();
  };

  const unmatch = async (targetUserId: number) => {
    if (!confirm('Are you sure you want to unmatch? This will delete the chat and hide the profile.')) return;
    const response = await fetch(`/api/umimatch/unmatch`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId }) });
    if (response.ok) {
      alert('Unmatched successfully.');
      loadMatches();
      setScreen('matches');
    } else {
      alert('Unable to unmatch.');
    }
  };

  const openMessages = async (match: any) => {
    setMessageUser(match);
    setScreen('messages');
    const response = await fetch(`/api/umimatch/messages/${match.id}`, { credentials: 'include' });
    const data = response.ok ? await response.json() : { messages: [] };
    setMessages(data.messages || []);
  };

  const sendMessage = async () => {
    if (!messageUser || !messageText.trim()) return;
    const response = await fetch(`/api/umimatch/messages/${messageUser.id}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: messageText }) });
    if (response.ok) {
      setMessageText('');
      openMessages(messageUser);
    }
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/api/umimatch/profile', { 
        method: 'PUT', 
        credentials: 'include', 
        body: formData 
      });
      if (response.ok) alert('UmiMatch profile saved.');
    } catch (error) {
      console.error('[UMIMATCH] Save failed:', error);
      alert('Unable to save profile.');
    }
    loadProfile();
  };

  if (!user) return <div className="uhub-umimatch-login-prompt flex h-full min-h-[50vh] items-center justify-center p-6 text-center text-muted-foreground">Log-in or SignUp to use UmiMatch</div>;

  if (profile.is_enrolled !== 1) return <div className="flex h-full items-center justify-center rounded-md border bg-black p-6 text-center text-white">
    <div className="max-w-lg space-y-4">
      <h3 className="text-xl font-bold">This Section Here is Called: UmiMatch#22!</h3>
      <p className="text-sm text-muted-foreground">A Place to Match with others and see where it goes! Would you like to be signed up and start Matching?</p>
      <div className="flex justify-center gap-3"><Button onClick={enroll} disabled={isEnrolling}>{isEnrolling ? 'Signing up...' : 'Yes'}</Button><Button variant="outline" onClick={onExit}>No</Button></div>
    </div>
  </div>;

  return <div className="h-full overflow-y-auto rounded-md border bg-black p-4 text-white">
    <div className="mb-4 flex gap-2"><Button size="sm" onClick={() => setScreen('discover')}>Discover</Button><Button size="sm" variant="outline" onClick={() => { setScreen('matches'); loadMatches(); }}>Matches</Button><Button size="sm" variant="outline" onClick={() => { setScreen('settings'); loadProfile(); }}>Settings</Button></div>
    {screen === 'discover' && <div className="mx-auto max-w-md text-center">
      {currentCard ? <><div className="overflow-hidden rounded-md border bg-gray-900"><QueuedImage src={currentCard.profile?.priority_image || currentCard.profile?.image1 || currentCard.profile_image_url || '/defaultUminionUassets/defaultUminionUbadge.png'} alt={currentCard.username} className="h-72 w-full object-cover" /><div className="p-3"><h3 className="text-xl font-bold">{currentCard.username}{currentCard.profile?.gender ? `, ${currentCard.profile.gender}` : ''}</h3><p className="text-sm text-muted-foreground">{currentCard.profile?.city || 'Location unknown'}</p><p className="mt-2 text-sm">{currentCard.profile?.bio || 'No bio yet.'}</p></div></div><div className="mt-3 flex justify-center gap-4"><Button variant="outline" onClick={() => swipe(currentCard.id, 'skip')}>Skip</Button><Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => swipe(currentCard.id, 'like')}>Like</Button></div></> : <p className="text-muted-foreground">That's enough people in your area for now.</p>}
    </div>}
    {screen === 'matches' && <div className="space-y-2">{matches.length ? matches.map(match => <div key={match.id} className="flex w-full items-center gap-3 rounded border p-2 text-left hover:bg-gray-900 group"><button className="flex-1 flex items-center gap-3" onClick={() => openMessages(match)}><QueuedImage src={match.profile?.priority_image || match.profile?.image1 || match.profile_image_url || '/defaultUminionUassets/defaultUminionUbadge.png'} alt="" className="h-12 w-12 rounded object-cover" /><span>{match.username}</span></button><Button size="sm" variant="destructive" className="opacity-0 group-hover:opacity-100 transition" onClick={() => unmatch(match.id)}>Unmatch</Button></div>) : <p className="text-muted-foreground">No matches yet.</p>}</div>}
    {screen === 'messages' && <div className="space-y-3"><div className="flex justify-between items-center"><Button size="sm" variant="outline" onClick={() => setScreen('matches')}>Back</Button><Button size="sm" variant="destructive" onClick={() => unmatch(messageUser?.id)}>Unmatch</Button></div><h3 className="font-bold">{messageUser?.username}</h3><div className="h-64 overflow-y-auto rounded border p-2">{messages.map(message => <div key={message.id} className={`mb-2 ${message.sender_id === user.id ? 'text-right' : 'text-left'}`}><span className="inline-block rounded bg-gray-800 px-2 py-1 text-sm">{message.content}</span></div>)}</div><div className="flex gap-2"><input value={messageText} onChange={event => setMessageText(event.target.value)} onKeyDown={event => event.key === 'Enter' && sendMessage()} className="flex-1 rounded border bg-gray-900 p-2" placeholder="Type a message..." /><Button onClick={sendMessage}>Send</Button></div></div>}
    {screen === 'settings' && <form onSubmit={saveProfile} className="grid gap-3 text-white">
      <textarea name="bio" defaultValue={profile.bio || ''} maxLength={1000} style={{ color: 'white', backgroundColor: '#111827' }} className="min-h-24 rounded border bg-gray-900 p-2 placeholder:text-gray-500" placeholder="Bio" />
      
      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-hidden rounded border bg-gray-900 p-2 text-white text-sm truncate">
          {profile.city || 'No city selected'}
        </div>
        <Button type="button" size="sm" onClick={() => setScreen('map')}>Please Choose a City</Button>
      </div>
      <input type="hidden" name="city" defaultValue={profile.city || ''} />

      <div className="grid grid-cols-2 gap-2">
        <select name="gender" defaultValue={profile.gender || ''} style={{ color: 'white', backgroundColor: '#111827' }} className="rounded border bg-gray-900 p-2">
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>EveryoneElse</option>
        </select>
        <select name="interested_in" defaultValue={profile.interested_in || ''} style={{ color: 'white', backgroundColor: '#111827' }} className="rounded border bg-gray-900 p-2">
          <option value="">Interested in</option>
          <option>Male</option>
          <option>Female</option>
          <option>EveryoneElse</option>
          <option>Everyone</option>
        </select>
      </div>
      <select name="max_distance" defaultValue={profile.max_distance || 100} style={{ color: 'white', backgroundColor: '#111827' }} className="rounded border bg-gray-900 p-2">
        {Array.from({ length: 300 }, (_, i) => i + 1).map(num => (
          <option key={num} value={num}>{num} miles</option>
        ))}
      </select>
      <select name="priority_image" defaultValue={profile.priority_image || 'image1'} style={{ color: 'white', backgroundColor: '#111827' }} className="rounded border bg-gray-900 p-2">
        {/* Only show priority options if more than 1 image exists */}
        {Object.keys(profile).filter(k => k.startsWith('image')).length > 1 && (
          <>
            <option value="image1">Image 1 as Primary</option>
            <option value="image2">Image 2 as Primary</option>
            <option value="image3">Image 3 as Primary</option>
            <option value="image4">Image 4 as Primary</option>
            <option value="image5">Image 5 as Primary</option>
          </>
        )}
      </select>
      {/* Dynamic image upload section: limit to 5 */}
      <div className="grid gap-2">
        {Object.keys(profile).filter(k => k.startsWith('image')).length < 5 && (
          <div className="flex flex-col gap-1 p-2 border border-dashed border-gray-700 rounded">
            <label className="text-xs text-gray-400">Add new image?</label>
            <input type="file" name={`image${Object.keys(profile).filter(k => k.startsWith('image')).length + 1}`} accept="image/*" style={{ color: 'white', backgroundColor: '#111827' }} className="rounded border bg-gray-900 p-2 text-sm file:text-white file:bg-gray-800 file:border-0" />
          </div>
        )}
        {/* Show existing image slots to allow replacement/deletion if needed, or just keep them simple */}
        {Object.keys(profile).filter(k => k.startsWith('image')).map((key, idx) => (
          <div key={key} className="flex items-center gap-2 text-xs text-gray-400">
            <span>Image {idx + 1}: {profile[key]?.split('/').pop()}</span>
            <input type="file" name={key} accept="image/*" className="text-xs" />
          </div>
        ))}
      </div>
      <Button type="submit">Save Settings</Button>
    </form>}
  </div>;
};

const MillionPixelView = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixels, setPixels] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any>(null);
  const [selectedPixel, setSelectedPixel] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [historyPage, setHistoryPage] = useState<number | null>(null);

  const loadPixels = useCallback(() => {
    fetch(`/api/million-pixel/pixels${historyPage ? `?historyPage=${historyPage}` : ''}`, { credentials: 'include' })
      .then(response => response.ok ? response.json() : { pixels: [] })
      .then(data => setPixels(data.pixels || []))
      .catch(() => setPixels([]));
  }, [historyPage]);

  const loadInventory = () => {
    if (!user) return;
    fetch('/api/million-pixel/inventory', { credentials: 'include' })
      .then(response => response.ok ? response.json() : { inventory: null })
      .then(data => setInventory(data.inventory))
      .catch(() => setInventory(null));
  };

  useEffect(() => { loadPixels(); }, [loadPixels]);
  useEffect(() => { loadInventory(); }, [user]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1000);
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color || '#ffffff';
      ctx.fillRect(Number(pixel.x), Number(pixel.y), 1, 1);
    });
  }, [pixels]);

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(999, Math.floor((event.clientX - rect.left) / rect.width * 1000)));
    const y = Math.max(0, Math.min(999, Math.floor((event.clientY - rect.top) / rect.height * 1000)));
    const response = await fetch(`/api/million-pixel/pixels/${x}/${y}`, { credentials: 'include' });
    const data = response.ok ? await response.json() : { pixel: { x, y, color: '#ffffff', change_count: 0 }, nextCost: 1 };
    setSelectedPixel(data.pixel);
  };

  const changePixel = async () => {
    if (!user) return alert('Log in to change pixels.');
    if (!selectedPixel) return;
    const response = await fetch(`/api/million-pixel/pixels/${selectedPixel.x}/${selectedPixel.y}/change`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ color: selectedColor }) });
    if (!response.ok) return alert((await response.json()).error || 'Unable to change pixel.');
    setSelectedPixel(null);
    loadPixels();
    loadInventory();
  };

  return <div className="h-full overflow-y-auto rounded-md border bg-black p-3 text-white">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-cyan-300">Million-Pixel#23</h3><span className="text-xs text-muted-foreground">PixelTickets: {inventory?.total_pixeltickets ?? (user ? '...' : 'Log in')}</span></div>
    <div className="mb-3 flex flex-wrap gap-1"><Button size="sm" variant={historyPage === null ? 'default' : 'outline'} onClick={() => setHistoryPage(null)}>Live</Button>{Array.from({ length: 10 }, (_, index) => index + 1).map(page => <Button key={page} size="sm" variant={historyPage === page ? 'default' : 'outline'} onClick={() => setHistoryPage(page)}>{page}</Button>)}</div>
    <canvas ref={canvasRef} width={1000} height={1000} onClick={handleCanvasClick} className="mx-auto aspect-square max-h-[58vh] w-full max-w-[620px] cursor-crosshair rounded border bg-white" />
    {selectedPixel && <div className="mt-3 flex flex-wrap items-center gap-2 rounded border p-2 text-sm"><span>Pixel ({selectedPixel.x}, {selectedPixel.y}) changed {selectedPixel.change_count || 0}/10 times</span><input type="color" value={selectedColor} onChange={event => setSelectedColor(event.target.value)} /><Button size="sm" onClick={changePixel}>Change Color</Button><Button size="sm" variant="outline" onClick={() => setSelectedPixel(null)}>Cancel</Button></div>}
  </div>;
};

const RotatingUnionEventCard = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { items } = useManagedCarouselItems('left-top');
  const imageVisible = useQueuedImageSlot({ carouselId: 'left-top', urls: items.map(item => item.image_url), index, setIndex, paused });
  useEffect(() => setIndex(0), [items]);
  const activeItem = items[index] || items[0];
  if (!activeItem) return <div className="uhub-event-rotator" />;
  return <div className="uhub-event-rotator" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onClick={() => activeItem.website && window.open(activeItem.website, '_blank')}>
    <button type="button" className="uhub-event-arrow left" onClick={(event) => { event.stopPropagation(); setIndex(value => (value - 1 + items.length) % items.length); }}>‹</button>
    {imageVisible && <QueuedImage
      key={activeItem.image_url}
      src={activeItem.image_url}
      alt={activeItem.title || 'uHome-Hub upper carousel image'}
      queuePriority={IMAGE_LOAD_PRIORITY.carousel}
    />}
    <p>{activeItem.title || activeItem.description}{activeItem.price ? ` · ${activeItem.price}` : ''}</p>
    <button type="button" className="uhub-event-arrow right" onClick={(event) => { event.stopPropagation(); setIndex(value => (value + 1) % items.length); }}>›</button>
  </div>;
};

const useManagedCarouselItems = (slot: ManagedCarouselSlot) => {
  const [items, setItems] = useState<ManagedCarouselItem[]>([]);
  const loadItems = useCallback(() => {
    fetch(`/api/carousels/${slot}/items`, { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw new Error(`Unable to load carousel (${response.status}).`);
        const data: { items?: ManagedCarouselItem[] } = await response.json();
        if (!Array.isArray(data.items)) throw new Error('The carousel response was invalid.');
        setItems(data.items);
      })
      .catch(error => console.error('[CAROUSELS] Unable to load displayed entries:', error));
  }, [slot]);
  useEffect(() => loadItems(), [loadItems]);
  useEffect(() => {
    const handleUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ slot: ManagedCarouselSlot }>).detail;
      if (detail?.slot === slot) loadItems();
    };
    window.addEventListener('uhub-managed-carousel-updated', handleUpdated);
    return () => window.removeEventListener('uhub-managed-carousel-updated', handleUpdated);
  }, [loadItems, slot]);
  return { items, refresh: loadItems };
};

const ManagedProductCarousel = ({ slot }: { slot: ManagedCarouselSlot }) => {
  const { items } = useManagedCarouselItems(slot);
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const imageVisible = useQueuedImageSlot({ carouselId: `product-${slot}`, urls: items.map(item => item.image_url), index, setIndex, paused });
  useEffect(() => setIndex(0), [items]);
  const item = items[index] || items[0];
  if (!item) return <div className="uhub-header-product-carousel" />;
  return <div className="uhub-header-product-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <button type="button" className="uhub-mini-carousel-arrow left" onClick={() => setIndex(value => (value - 1 + items.length) % items.length)}>‹</button>
    {imageVisible && <QueuedImage
      key={item.image_url}
      src={item.image_url}
      alt={item.title || 'Carousel image'}
      queuePriority={IMAGE_LOAD_PRIORITY.carousel}
    />}
    <div className="uhub-header-product-overlay">
      {item.title && (item.website
        ? <a href={item.website} target="_blank" rel="noopener noreferrer" title="Open website">{item.title}</a>
        : <span>{item.title}</span>)}
      {item.description && <small>{item.description}</small>}
      <div className="flex gap-1">
        {item.price && <button
          type="button"
          title={isCartPriceLabel(item.price) ? (user ? 'Add to cart' : 'Log in to add to cart') : 'Open website'}
          onClick={() => {
            if (item.id && isCartPriceLabel(item.price)) addToMainCart({ carousel_item_id: item.id }, Boolean(user));
            else if (item.website) window.open(item.website, '_blank', 'noopener,noreferrer');
          }}
        >{item.price}</button>}
      </div>
    </div>
    <button type="button" className="uhub-mini-carousel-arrow right" onClick={() => setIndex(value => (value + 1) % items.length)}>›</button>
  </div>;
};

const HeaderProductCarousel = () => <ManagedProductCarousel slot="left" />;
const FooterPosterCarousel = () => <ManagedProductCarousel slot="right" />;

const defaultCoverImageUrl = '/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg';
// Features that take over the MemeBox's spot on mobile until exited.
const MOBILE_MEMEBOX_REPLACEMENT_VIEWS = ['UmiMatch#22', 'Find-a-Pantry#13', 'Million-Pixel#23', 'Beta-Button-10,011'];

// Saved images feed one cover placeholder; the shared queue replaces its image.
const CoverImageRotator = ({ userCoverUrl, opacity, fallbackToDefault = false, onButtonClick, appendedItems }: { userCoverUrl: string | null; opacity: number; fallbackToDefault?: boolean; onButtonClick: (number: number) => void; appendedItems?: ManagedCarouselItem[] }) => {
  return <ManagedCoverImageSlot userCoverUrl={userCoverUrl} opacity={opacity} fallbackToDefault={fallbackToDefault} onButtonClick={onButtonClick} appendedItems={appendedItems} />;
};

// On mobile the hidden bottom banner's images are appended, so the cover plays top entries then bottom entries in order.
const ManagedCoverImageSlot = ({ userCoverUrl, opacity, fallbackToDefault, onButtonClick, appendedItems }: { userCoverUrl: string | null; opacity: number; fallbackToDefault: boolean; onButtonClick: (number: number) => void; appendedItems?: ManagedCarouselItem[] }) => {
  const { items } = useManagedCarouselItems('cover');
  const slides = useMemo<ManagedCarouselItem[]>(() => {
    const saved = items.filter(item => item.image_url).map(item => item.image_url === defaultCoverImageUrl && userCoverUrl
      ? { ...item, image_url: userCoverUrl } : item);
    const top = saved.length || !fallbackToDefault ? saved : [{ image_url: userCoverUrl || defaultCoverImageUrl }];
    return appendedItems ? [...top, ...appendedItems.filter(item => item.image_url)] : top;
  }, [items, fallbackToDefault, userCoverUrl, appendedItems]);
  const urls = useMemo(() => slides.map(item => item.image_url), [slides]);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [urls]);
  const imageVisible = useQueuedImageSlot({ carouselId: 'cover', urls, index, setIndex, firstNextIndex: 1, sequential: Boolean(appendedItems) });
  const slide = slides[index];
  if (!imageVisible || !slide) return null;
  const buttonNumber = slide.button_number;
  const image = <QueuedImage
    key={slide.image_url}
    src={slide.image_url}
    alt="uHub cover"
    className={`absolute inset-0 h-full w-full ${userCoverUrl && slide.image_url === userCoverUrl ? 'object-contain' : 'object-cover'}`}
    style={{ opacity }}
    queuePriority={IMAGE_LOAD_PRIORITY.critical}
    retainInCache
  />;
  return buttonNumber ? <button type="button" className="uhub-banner-action absolute inset-0 h-full w-full" aria-label={`Open button ${buttonNumber}`} onClick={() => onButtonClick(buttonNumber)}>{image}</button> : image;
};

// The anchor placeholder starts with the default image and is replaced by the shared queue.
const AnchorRotator = () => {
  const { items } = useManagedCarouselItems('center');
  const slides = useMemo(() => items.filter(item => item.image_url), [items]);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [slides]);
  const imageVisible = useQueuedImageSlot({ carouselId: 'center', urls: slides.map(slide => slide.image_url), index, setIndex });
  const slide = slides[index] || slides[0];
  if (!slide) return <div className="relative h-full w-full" />;
  return <div className="relative h-full w-full">
    {imageVisible && <QueuedImage key={slide.image_url} src={slide.image_url} alt={slide.title || 'Uminion anchor artwork'} className="h-full w-full object-contain" queuePriority={IMAGE_LOAD_PRIORITY.critical} retainInCache />}
    {slide.title ? <p className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-xs text-white">{slide.title}</p> : null}
  </div>;
};

type SitePageKey = 'about' | 'terms' | 'welcome';
interface SitePageData { content: string; enabled: boolean; lastUpdated: string }

// To override the "Last Updated" date by hand, put text here (for example 'May 1, 2025'); empty means "use the date of the last save".
const TERMS_LAST_UPDATED_OVERRIDE = '';

const sanitizeSitePageHtml = (html: string) => html
  .replace(/<\s*(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
  .replace(/<\s*(script|iframe|object|embed|style)[^>]*>/gi, '')
  .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2');

const sitePageConfig: Record<SitePageKey, { button: string; title: string; line: (lastUpdated: string) => string }> = {
  about: { button: 'Button 9998', title: 'About Us', line: () => 'Welcome To The Uminion Union About Us Section:' },
  terms: { button: 'Button 9999', title: 'Terms of Use & Service', line: (lastUpdated) => `Last Updated ${TERMS_LAST_UPDATED_OVERRIDE || lastUpdated || '___'}` },
  welcome: { button: 'Button T', title: 'Welcome Title', line: () => '' },
};

const useSitePage = (key: SitePageKey, enabled = true) => {
  const [page, setPage] = useState<SitePageData>({ content: '', enabled: false, lastUpdated: '' });
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(() => {
    fetch(`/api/site-pages/${key}`, { credentials: 'include' })
      .then(response => response.ok ? response.json() : null)
      .then((data: SitePageData | null) => { if (data) setPage(data); })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [key]);
  useEffect(() => { if (enabled) load(); }, [enabled, load]);
  return { page, setPage, loaded, reload: load };
};

const GroupIcon = ({ withChat = false }: { withChat?: boolean }) => (
  <svg viewBox="0 0 32 32" className="h-5 w-6" fill="currentColor" aria-hidden="true">
    {withChat && <path d="M9 1h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-6l-4 3v-3H9a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" />}
    <circle cx="16" cy={withChat ? 16 : 10} r="3.6" />
    <circle cx="7" cy={withChat ? 18 : 12} r="3" />
    <circle cx="25" cy={withChat ? 18 : 12} r="3" />
    <path d={withChat ? 'M9.5 30v-6a6.5 6.5 0 0 1 13 0v6z' : 'M9.5 28v-6a6.5 6.5 0 0 1 13 0v6z'} />
    <path d={withChat ? 'M1 30v-4.5a4.5 4.5 0 0 1 7-3.7A8 8 0 0 0 7.500 30z' : 'M1 28v-4.500a4.500 4.500 0 0 1 7-3.700A8 8 0 0 0 7.500 28z'} />
    <path d={withChat ? 'M31 30v-4.500a4.500 4.500 0 0 0-7-3.700A8 8 0 0 1 24.500 30z' : 'M31 28v-4.500a4.500 4.500 0 0 0-7-3.700A8 8 0 0 1 24.500 28z'} />
  </svg>
);

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SitePageModal = ({ pageKey, isAdmin, onClose, onChanged, defaultContent = '', introduction }: { pageKey: SitePageKey; isAdmin: boolean; onClose: () => void; onChanged: () => void; defaultContent?: string; introduction?: React.ReactNode }) => {
  const config = sitePageConfig[pageKey];
  const { page, setPage, loaded } = useSitePage(pageKey);
  const shownContent = page.content || (defaultContent ? escapeHtml(defaultContent) : '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [textColor, setTextColor] = useState('#ffffff');

  useEffect(() => {
    if (isEditing && editorRef.current) editorRef.current.innerHTML = sanitizeSitePageHtml(loaded ? shownContent : page.content);
    // Only seed the editor when edit mode starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const save = async (body: Partial<SitePageData>) => {
    const response = await fetch(`/api/site-pages/${pageKey}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Could not save.');
    const data: SitePageData = await response.json();
    setPage(data);
    onChanged();
  };

  const handleUpdateOrSave = async () => {
    if (!isEditing) return setIsEditing(true);
    setIsSaving(true);
    try {
      const lastUpdated = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      await save({ content: editorRef.current?.innerHTML || '', lastUpdated });
      setIsEditing(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEnabled = async () => {
    try { await save({ enabled: !page.enabled }); } catch (error) { alert(error instanceof Error ? error.message : 'Could not update.'); }
  };

  const format = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`/api/site-pages/${pageKey}/image`, { method: 'POST', credentials: 'include', body: formData });
    if (!response.ok) return alert((await response.json().catch(() => ({}))).error || 'Image upload failed.');
    const { url } = await response.json();
    format('insertImage', url);
  };

  const toolbarButton = 'rounded border border-white/20 bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700';

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/75 p-4">
      <div role="dialog" aria-modal="true" aria-label={config.title} className={`${introduction ? 'uhub-mobile-about-modal ' : ''}relative z-[2147483647] flex max-h-[90vh] w-full max-w-[640px] flex-col rounded-2xl border border-white/10 bg-[#0b0b0f] p-4 shadow-2xl shadow-orange-400/30`}>
        <button type="button" onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-xl font-bold text-white ring-1 ring-white/20 transition hover:bg-gray-800" aria-label={`Close ${config.title}`}>
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 flex items-center justify-between gap-3 pr-10">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white">{config.button}</p>
            <h2 className="text-2xl font-black text-white">{config.title}</h2>
          </div>
          <div className="rounded-full border border-orange-400/40 bg-orange-400/10 px-3 py-1 text-sm font-semibold text-orange-400">
            Present: General-Union-Secretary: &quot;StorytellingSalem&quot;
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {config.line(page.lastUpdated) && <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />}
            {config.line(page.lastUpdated)}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button type="button" onClick={handleUpdateOrSave} disabled={isSaving} className="bg-orange-400 text-black hover:bg-orange-500">{isSaving ? 'Saving...' : isEditing ? 'Save?' : 'Update?'}</Button>
              {pageKey !== 'welcome' && <Button type="button" onClick={toggleEnabled} disabled={isEditing} className={page.enabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-500'}>{page.enabled ? 'Enabled' : 'Disabled'}</Button>}
            </div>
          )}
        </div>
        {isAdmin && isEditing && (
          <div className="mb-2 flex flex-wrap items-center gap-1">
            <button type="button" className={toolbarButton} onClick={() => format('formatBlock', 'h1')}>H1</button>
            <button type="button" className={toolbarButton} onClick={() => format('formatBlock', 'h2')}>H2</button>
            <button type="button" className={toolbarButton} onClick={() => format('formatBlock', 'h3')}>H3</button>
            <button type="button" className={toolbarButton} onClick={() => format('formatBlock', 'p')}>Text</button>
            <button type="button" className={`${toolbarButton} font-bold`} onClick={() => format('bold')}>B</button>
            <button type="button" className={`${toolbarButton} italic`} onClick={() => format('italic')}>I</button>
            <button type="button" className={`${toolbarButton} underline`} onClick={() => format('underline')}>U</button>
            <label className={`${toolbarButton} flex items-center gap-1`}>Color<input type="color" value={textColor} onChange={event => { setTextColor(event.target.value); format('foreColor', event.target.value); }} /></label>
            <button type="button" className={toolbarButton} onClick={() => imageInputRef.current?.click()}>Add image</button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.target.value = ''; }} />
          </div>
        )}
        {isAdmin && isEditing ? (
          <div ref={editorRef} contentEditable suppressContentEditableWarning className="min-h-[240px] flex-1 overflow-y-auto rounded-xl border border-orange-400/40 bg-[#111827] p-3 text-sm text-gray-100 outline-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_img]:max-w-full" />
        ) : (
          <div className="min-h-[240px] flex-1 overflow-y-auto rounded-xl border border-white/10 bg-[#111827] p-3 text-sm text-gray-100 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_img]:max-w-full [&_a]:text-orange-400 [&_a]:underline">
            {introduction}
            {!loaded ? <p className="text-gray-400">Loading...</p> : shownContent ? <div dangerouslySetInnerHTML={{ __html: sanitizeSitePageHtml(shownContent) }} /> : <p className="text-gray-400">Nothing has been written here yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const welcomeChangedEvent = 'uhub:welcome-changed';

// The welcome sentence next to the play button. It shows the admin-saved rich text, or the built-in sentence until one is saved.
const WelcomeDescription = ({ fallback, className }: { fallback: string; className: string }) => {
  const { page, reload } = useSitePage('welcome');
  useEffect(() => {
    window.addEventListener(welcomeChangedEvent, reload);
    return () => window.removeEventListener(welcomeChangedEvent, reload);
  }, [reload]);
  if (!page.content) return <p className={className}>{fallback}</p>;
  return <div className={`${className} [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-bold [&_img]:mx-auto [&_img]:max-w-full [&_a]:text-orange-400 [&_a]:underline`} dangerouslySetInnerHTML={{ __html: sanitizeSitePageHtml(page.content) }} />;
};

// "T" (Title) button: only a high-high-high admin sees it; it edits the welcome sentence.
const WelcomeTitleButton = ({ fallback, small = false }: { fallback: string; small?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className={`font-extrabold hover:opacity-90 ${small ? 'text-xs h-8' : 'text-sm'}`}
        style={{ backgroundColor: '#800020', color: '#FFD700' }}
        title="Title (welcome text)"
        onClick={() => setOpen(true)}
      >T</Button>
      {open && <SitePageModal pageKey="welcome" isAdmin onClose={() => setOpen(false)} onChanged={() => window.dispatchEvent(new Event(welcomeChangedEvent))} defaultContent={fallback} />}
    </>
  );
};

type UHomeHubButtonSetting = { number: number; title: string; image_url: string };
const uHomeHubButtonsChangedEvent = 'uhub:uhome-hub-buttons-changed';
const UHOME_HUB_TITLE_MAX = 40;

// Titles and background images for the uHome-Hub #01-#30 buttons; blank entries keep the "#NN" look.
const useUHomeHubButtonSettings = () => {
  const [buttons, setButtons] = useState<UHomeHubButtonSetting[]>([]);
  const reload = useCallback(() => {
    fetch('/api/uhome-hub-buttons', { credentials: 'include', cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then((data: { buttons?: UHomeHubButtonSetting[] } | null) => { if (Array.isArray(data?.buttons)) setButtons(data.buttons); })
      .catch(() => {});
  }, []);
  useEffect(() => {
    reload();
    window.addEventListener(uHomeHubButtonsChangedEvent, reload);
    return () => window.removeEventListener(uHomeHubButtonsChangedEvent, reload);
  }, [reload]);
  return buttons;
};

type UHomeHubButtonDraft = UHomeHubButtonSetting & { file?: File; preview?: string; removeImage?: boolean };

const UHomeHubButtonsAdminModal = ({ onClose }: { onClose: () => void }) => {
  const [drafts, setDrafts] = useState<UHomeHubButtonDraft[]>([]);
  const [original, setOriginal] = useState<UHomeHubButtonSetting[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const draftsRef = useRef<UHomeHubButtonDraft[]>([]);
  draftsRef.current = drafts;
  useEffect(() => {
    fetch('/api/uhome-hub-buttons', { credentials: 'include', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error(`Unable to load the uHome-Hub buttons (${response.status}).`);
        const data: { buttons?: UHomeHubButtonSetting[] } = await response.json();
        if (!Array.isArray(data.buttons)) throw new Error('The uHome-Hub response was invalid.');
        setOriginal(data.buttons);
        setDrafts(data.buttons.map(button => ({ ...button })));
      })
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : 'Unable to load the uHome-Hub buttons.'));
    return () => draftsRef.current.forEach(draft => { if (draft.preview) URL.revokeObjectURL(draft.preview); });
  }, []);
  const update = (number: number, change: Partial<UHomeHubButtonDraft>) => setDrafts(current => current.map(draft => {
    if (draft.number !== number) return draft;
    if (draft.preview && ('file' in change || change.removeImage)) URL.revokeObjectURL(draft.preview);
    return { ...draft, ...change };
  }));
  const handleSave = async () => {
    const changed = drafts.filter(draft => {
      const saved = original.find(button => button.number === draft.number);
      return draft.file || draft.removeImage || draft.title.trim() !== (saved?.title || '');
    });
    if (!changed.length) return onClose();
    if (changed.some(draft => draft.title.trim().length > UHOME_HUB_TITLE_MAX)) return alert(`Titles can be up to ${UHOME_HUB_TITLE_MAX} characters.`);
    const formData = new FormData();
    const uploads: File[] = [];
    formData.append('buttons', JSON.stringify(changed.map(draft => ({
      number: draft.number,
      title: draft.title.trim(),
      uploadIndex: draft.file ? uploads.push(draft.file) - 1 : null,
      removeImage: !draft.file && !!draft.removeImage,
    }))));
    uploads.forEach(file => formData.append('images', file));
    setIsSaving(true);
    try {
      const response = await fetch('/api/uhome-hub-buttons', { method: 'POST', credentials: 'include', body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Unable to save (${response.status}).`);
      window.dispatchEvent(new Event(uHomeHubButtonsChangedEvent));
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save the uHome-Hub buttons.');
    } finally {
      setIsSaving(false);
    }
  };
  return <div className="fixed inset-0 z-[100300] flex items-center justify-center bg-black/75 p-4">
    <div role="dialog" aria-modal="true" aria-label="uHome-Hub button titles and backgrounds" className="uhub-uhome-hub-buttons-admin max-h-[86vh] w-[92vw] max-w-3xl overflow-y-auto rounded-md border bg-black p-4 text-white">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">uHome-Hub buttons #01–#30: titles &amp; background images</h3><Button type="button" variant="outline" size="sm" onClick={onClose}>Close</Button></div>
      <p className="my-2 text-xs text-muted-foreground">Leave a title blank to show the button number. Background images are optional; buttons without one stay transparent.</p>
      {loadError ? <p className="py-5 text-center text-red-400">{loadError}</p> : !drafts.length ? <p className="py-5 text-center">Loading buttons…</p> : <div className="space-y-2">
        {drafts.map(draft => {
          const label = `#${String(draft.number).padStart(2, '0')}`;
          const image = draft.preview || (draft.removeImage ? '' : draft.image_url);
          return <div key={draft.number} className="grid grid-cols-[120px_1fr] items-center gap-2 rounded border p-2 text-xs" data-uhome-hub-button={draft.number}>
            <div className="flex h-10 items-center justify-center overflow-hidden rounded border border-gray-700 bg-cover bg-center px-1 font-semibold text-white" style={{ backgroundImage: image ? `url("${image}")` : undefined, textShadow: image ? '0 1px 3px #000' : undefined }}>
              <span className="truncate">{draft.title.trim() || label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-8 font-bold">{label}</span>
              <input value={draft.title} maxLength={UHOME_HUB_TITLE_MAX} onChange={event => update(draft.number, { title: event.target.value })} placeholder={`Title (blank = ${label})`} aria-label={`Title for button ${label}`} className="min-w-[140px] flex-1 rounded border bg-gray-900 p-1 text-white" style={{ color: '#ffffff', fontSize: '12px' }} />
              <Button type="button" size="sm" variant="outline" onClick={event => (event.currentTarget.nextElementSibling as HTMLInputElement | null)?.click()}>{image ? 'Change image' : 'Add image'}</Button>
              <input type="file" accept="image/*" className="hidden" aria-label={`Background image for button ${label}`} onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) update(draft.number, { file, preview: URL.createObjectURL(file), removeImage: false });
              }} />
              {image && <Button type="button" size="sm" variant="destructive" onClick={() => update(draft.number, { file: undefined, preview: undefined, removeImage: true })}>Remove image</Button>}
            </div>
          </div>;
        })}
      </div>}
      <Button type="button" className="mt-3" disabled={isSaving || !drafts.length} onClick={handleSave}>{isSaving ? 'Saving…' : 'Save'}</Button>
    </div>
  </div>;
};

// "30BKG" button: only a high-high-high admin sees it; it edits the uHome-Hub #01-#30 titles and background images.
const UHomeHubButtonsAdminButton = ({ small = false }: { small?: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className={`uhub-30bkg-button font-bold hover:opacity-90 ${small ? 'text-xs h-8' : 'text-sm'}`}
        style={{ backgroundColor: '#FFDAB9', color: '#0B1F4D' }}
        title="uHome-Hub #01-#30 titles and background images"
        onClick={() => setOpen(true)}
      >30BKG</Button>
      {open && <UHomeHubButtonsAdminModal onClose={() => setOpen(false)} />}
    </>
  );
};

// Mobile anvil slots alternate: the feature button shows first, then "Coming Soon", and repeat on the given interval.
const MOBILE_TOP_ANVIL_ROTATE_MS = 6700;
const MOBILE_BOTTOM_ANVIL_ROTATE_MS = 7600;
const useAlternatingFeatureSlot = (intervalMs: number, enabled: boolean) => {
  const [showFeature, setShowFeature] = useState(true);
  useEffect(() => {
    setShowFeature(true);
    if (!enabled) return;
    const timer = window.setInterval(() => setShowFeature(current => !current), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, enabled]);
  return showFeature;
};

const AdminHubButton = ({ className = '', onClick }: { className?: string; onClick: () => void }) => (
  <Button type="button" className={`uhub-admin-hub-button bg-orange-500 hover:bg-orange-600 text-black font-bold ${className}`} title="Admin Hub" onClick={onClick}>
    <Wrench className="h-4 w-4" /> Admin Hub
  </Button>
);

// Admin Hub: the one place for every high-high-high admin editor button. Each button opens the same editor it always has.
const AdminHubModal = ({ welcomeFallback, onClose, onOpenUnionNews14Modal, onOpenManagedCarouselAdmin }: {
  welcomeFallback: string;
  onClose: () => void;
  onOpenUnionNews14Modal: () => void;
  onOpenManagedCarouselAdmin: (slot: ManagedCarouselAdminTarget) => void;
}) => (
  <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 p-4">
    <div role="dialog" aria-modal="true" aria-label="Admin Hub" className="uhub-admin-hub w-[92vw] max-w-xl rounded-md border bg-black p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Admin Hub</h3>
        <Button type="button" variant="outline" size="icon" aria-label="Close Admin Hub" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="uhub-admin-button-row flex min-w-0 flex-wrap items-center gap-2">
        <Button className="bg-green-700 hover:bg-green-800 text-white text-sm" onClick={onOpenUnionNews14Modal}>Add Images?</Button>
        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm" onClick={() => onOpenManagedCarouselAdmin('left')}>L</Button>
        <Button className="bg-gray-300 hover:bg-gray-200 text-[#b87333] font-extrabold text-sm" title="CenterImageCarousel" onClick={() => onOpenManagedCarouselAdmin('center')}>C</Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => onOpenManagedCarouselAdmin('right')}>R</Button>
        <Button className="bg-pink-500 hover:bg-pink-600 text-white text-sm" onClick={() => onOpenManagedCarouselAdmin('cover')}>Up</Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white text-sm" onClick={() => onOpenManagedCarouselAdmin('bottom')}>Down</Button>
        <WelcomeTitleButton fallback={welcomeFallback} />
        <UHomeHubButtonsAdminButton />
      </div>
    </div>
  </div>
);

const ManagedCarouselAdminModal = ({ slot, onClose }: { slot: ManagedCarouselAdminTarget | null; onClose: () => void }) => {
  const [activeLeftSlot, setActiveLeftSlot] = useState<'left-top' | 'left'>('left');
  const [items, setItems] = useState<Array<ManagedCarouselItem & { file?: File }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const activeSlot: ManagedCarouselSlot = slot === 'left' ? activeLeftSlot : slot === 'right' ? 'right' : slot === 'cover' ? 'cover' : slot === 'center' ? 'center' : 'bottom';
  const maxItems = getManagedCarouselLimit(activeSlot);
  const isBottom = activeSlot === 'bottom';
  const supportsButton = activeSlot === 'cover' || isBottom;
  const slotLabel = slot === 'left' ? (activeSlot === 'left-top' ? 'upper left' : 'lower left') : slot === 'cover' ? 'cover image' : slot === 'bottom' ? 'bottom promo' : slot === 'center' ? 'center image' : 'right';
  useEffect(() => {
    if (!slot) return;
    let cancelled = false;
    setItems([]);
    setLoadError('');
    setIsLoading(true);
    fetch(`/api/carousels/${activeSlot}/items`, { credentials: 'include' })
      .then(async response => {
        if (!response.ok) throw new Error(`Unable to load carousel (${response.status}).`);
        const data: { items?: ManagedCarouselItem[] } = await response.json();
        if (!Array.isArray(data.items)) throw new Error('The carousel response was invalid.');
        if (!cancelled) setItems(data.items.map(item => ({ ...item, isUrl: !!item.website, style: activeSlot === 'bottom' ? parseCaptionStyle(item.description) : undefined })));
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Unable to load carousel.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeSlot, slot]);
  if (!slot) return null;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length > maxItems) return alert(`This collection can contain up to ${maxItems} entries.`);
    if (supportsButton && items.some(item => item.button_number != null && (!Number.isInteger(item.button_number) || item.button_number < 1 || item.button_number > 10000))) return alert('Choose a whole button number from 1 to 10000.');
    if (isBottom) {
      if (items.some(item => !item.image_url && !item.file && !(item.title || '').trim())) return alert('Each entry needs an image or a caption.');
      if (items.some(item => item.isUrl && !isAcceptedCaptionUrl(item.website || ''))) return alert('Caption URLs must start with http://, https:// or www.');
    } else if (items.some(item => !item.image_url && !item.file)) return alert('Each carousel item needs an image.');
    setIsSubmitting(true);
    const formData = new FormData();
    const uploads: File[] = [];
    const serializedItems = items.map(item => {
      const uploadIndex = item.file ? uploads.push(item.file) - 1 : null;
      return {
        id: item.id ?? null,
        uploadIndex,
        title: item.title || '',
        description: isBottom ? JSON.stringify(item.style || {}) : item.description || '',
        price: item.price || '',
        website: isBottom && !item.isUrl ? '' : isBottom ? normalizeCaptionUrl(item.website || '') : (item.website || '').trim(),
        ...(supportsButton ? { button_number: item.button_number ?? null } : {}),
      };
    });
    uploads.forEach(file => formData.append('images', file));
    formData.append('items', JSON.stringify(serializedItems));
    try {
      const response = await fetch(`/api/carousels/${activeSlot}/items/replace`, { method: 'POST', credentials: 'include', body: formData });
      if (!response.ok) throw new Error((await response.json()).error || 'Upload failed');
      window.dispatchEvent(new CustomEvent('uhub-managed-carousel-updated', { detail: { slot: activeSlot } }));
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="fixed inset-0 z-[100300] flex items-center justify-center bg-black/75 p-4">
    <form onSubmit={handleSubmit} className="max-h-[86vh] w-[92vw] max-w-3xl overflow-y-auto rounded-md border bg-black p-4 text-white">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Edit {slotLabel} carousel ({items.length}/{maxItems})</h3><Button type="button" variant="outline" size="sm" onClick={onClose}>Close</Button></div>
      {slot === 'left' && <div className="mb-3 flex gap-2">
        <Button type="button" size="sm" variant={activeLeftSlot === 'left-top' ? 'default' : 'outline'} onClick={() => setActiveLeftSlot('left-top')}>Above uHome-Hub</Button>
        <Button type="button" size="sm" variant={activeLeftSlot === 'left' ? 'default' : 'outline'} onClick={() => setActiveLeftSlot('left')}>Below uHome-Hub</Button>
      </div>}
      {slot === 'cover' && <p className="my-2 text-xs text-muted-foreground">Manage up to 10 entries, including the editable default cover. While that default entry is present, members see their own cover in its place. Images use the shared queue with 5 seconds between visits.</p>}
      {slot === 'center' && <p className="my-2 text-xs text-muted-foreground">Manage up to 49 entries, including the editable or removable anchor image. Captions are optional. Images use the shared queue with 5 seconds between visits.</p>}
      {isBottom && <p className="my-2 text-xs text-muted-foreground">Manage up to 10 image and/or caption entries, including the membership caption and umiMatch banner. All entries can be edited, reordered or removed.</p>}
      <p className="my-2 text-xs text-muted-foreground">Manage images, captions, prices, and order. Existing images stay in place unless replaced or removed.</p>
      {isLoading ? <p className="py-5 text-center">Loading carousel…</p> : loadError ? <p className="py-5 text-center text-red-400">{loadError}</p> : <div className="space-y-2">
        {items.map((item, index) => <div key={item.id ?? `new-${index}`} className="grid grid-cols-[72px_1fr] gap-2 rounded border p-2 text-xs">
          <div className="space-y-1">
            {item.file ? <span className="block h-16 w-16 overflow-hidden rounded break-all">{item.file.name}</span> : item.image_url ? <img src={item.image_url} alt="" className="h-16 w-16 rounded object-cover" /> : <span className="block h-16 w-16 rounded bg-gray-800" />}
            <input type="file" accept="image/*" aria-label={`Replace image ${index + 1}`} onChange={event => {
              const file = event.target.files?.[0];
              if (file) setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, file } : entry));
            }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={item.title || ''} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry))} placeholder="Caption/title" className="rounded border bg-gray-900 p-1" />
            {supportsButton && (item.image_url || item.file) && <div className="col-span-2 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={item.button_number != null} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, button_number: event.target.checked ? 3 : null } : entry))} />Would you like to associate this image with a button?</label>
              {item.button_number != null && <label>Button number (1-10,000)<input type="number" min={1} max={10000} step={1} required value={Number.isNaN(item.button_number) ? '' : item.button_number} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, button_number: event.target.value === '' ? Number.NaN : Number(event.target.value) } : entry))} className="ml-2 w-24 rounded border bg-gray-900 p-1" /></label>}
            </div>}
            {isBottom ? <>
              <label className="flex items-center gap-1"><input type="checkbox" checked={!!item.isUrl} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, isUrl: event.target.checked } : entry))} />Is this caption a URL?</label>
              <div className="col-span-2 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1">Color<input type="color" value={item.style?.color || '#ffffff'} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, style: { ...entry.style, color: event.target.value } } : entry))} /></label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={!!item.style?.bold} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, style: { ...entry.style, bold: event.target.checked } } : entry))} /><b>Bold</b></label>
                <label className="flex items-center gap-1"><input type="checkbox" checked={!!item.style?.italic} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, style: { ...entry.style, italic: event.target.checked } } : entry))} /><i>Italic</i></label>
                <label className="flex items-center gap-1">Size<input type="number" min={8} max={32} value={item.style?.size || 14} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, style: { ...entry.style, size: Math.min(32, Math.max(8, Number(event.target.value) || 14)) } } : entry))} className="w-14 rounded border bg-gray-900 p-1" />px</label>
              </div>              {item.isUrl ? <input value={item.website || ''} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, website: event.target.value } : entry))} placeholder="https://..." className="rounded border bg-gray-900 p-1" /> : <span />}
            </> : <>
              <input value={item.description || ''} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))} placeholder="Description" className="rounded border bg-gray-900 p-1" />
              <input value={item.price || ''} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, price: event.target.value } : entry))} placeholder="Price/button text" className="rounded border bg-gray-900 p-1" />
              <input value={item.website || ''} onChange={event => setItems(current => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, website: event.target.value } : entry))} placeholder="Website" className="rounded border bg-gray-900 p-1" />
            </>}
            <div className="col-span-2 flex justify-end gap-1">
              <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => setItems(current => current.map((entry, itemIndex) => itemIndex === index - 1 ? current[index] : itemIndex === index ? current[index - 1] : entry))}>Move up</Button>
              <Button type="button" size="sm" variant="outline" disabled={index === items.length - 1} onClick={() => setItems(current => current.map((entry, itemIndex) => itemIndex === index + 1 ? current[index] : itemIndex === index ? current[index + 1] : entry))}>Move down</Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => setItems(current => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
            </div>
          </div>
        </div>)}
      </div>
      }
      <Button type="button" className="mt-3 mr-2" variant="outline" disabled={items.length >= maxItems || isLoading || !!loadError} onClick={() => setItems(current => [...current, { image_url: '', title: '', description: '', price: '', website: '' }])}>Add image</Button>
      <Button type="submit" className="mt-3" disabled={isSubmitting || isLoading || !!loadError}>{isSubmitting ? 'Saving...' : 'Save carousel'}</Button>
    </form>
  </div>;
};


// World Feed (everyone can read) + My Posts (only logged-in users can post), shown on the front page of uHub.
const FrontPageSocial = ({ user, stacked = false, compact = false, draft }: { user: any; stacked?: boolean; compact?: boolean; draft?: { content: string; onChange: (value: string) => void } }) => {
  const [localContent, setLocalContent] = useState('');
  const content = draft?.content ?? localContent;
  const setContent = draft?.onChange ?? setLocalContent;
  const [isPosting, setIsPosting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const createPost = async () => {
    if (!user || !content.trim()) return;
    setIsPosting(true);
    try {
      const response = await fetch('/api/social-posts', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Could not create your post.');
      setContent('');
      setRefreshKey(key => key + 1);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not create your post.');
    } finally { setIsPosting(false); }
  };
  return (
    <div className={`mt-4 flex shrink-0 flex-col gap-2${compact ? ' uhub-compact-world-feed' : ''}`} data-stacked={stacked}>
      <div className="flex h-72 flex-col"><WorldFeed refreshKey={refreshKey} /></div>
      <div className="flex flex-col gap-1 rounded-lg border p-2">
        <textarea className="w-full resize-none rounded border bg-gray-800 p-2 text-xs text-white placeholder-gray-500" style={{ color: '#ffffff', height: '2.5rem' }} aria-label="My Posts" placeholder={user ? 'Write a post...' : 'Log in to post to the World Feed'} maxLength={1000} value={content} onChange={(event) => setContent(event.target.value)} disabled={!user} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400" aria-live="polite">{1000 - content.length}/1000</span>
          <Button size="sm" className="h-7 bg-orange-400 px-3 text-xs hover:bg-orange-500" onClick={createPost} disabled={!user || isPosting || !content.trim()}>{isPosting ? 'Posting...' : 'Create Post'}</Button>
        </div>
      </div>
    </div>
  );
};

const MobileWorldFeed = ({ user, draft, onDraftChange, expanded, onExpandedChange }: {
  user: any;
  draft: string;
  onDraftChange: (value: string) => void;
  expanded: boolean;
  onExpandedChange: (value: boolean) => void;
}) => {
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!expanded) return;
    const collapseOutside = (event: Event) => {
      if (event.target instanceof Node && !feedRef.current?.contains(event.target)) onExpandedChange(false);
    };
    document.addEventListener('pointerdown', collapseOutside, true);
    document.addEventListener('focusin', collapseOutside);
    return () => {
      document.removeEventListener('pointerdown', collapseOutside, true);
      document.removeEventListener('focusin', collapseOutside);
    };
  }, [expanded, onExpandedChange]);
  return <div ref={feedRef} className="uhub-mobile-world-feed" data-expanded={expanded} onClickCapture={() => onExpandedChange(true)} onInputCapture={() => onExpandedChange(true)} onFocusCapture={event => {
    if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement || event.target.matches(':focus-visible')) onExpandedChange(true);
  }}>
    <button type="button" className="uhub-mobile-world-feed-title" aria-expanded={expanded} onClick={() => onExpandedChange(true)}>World Feed</button>
    <FrontPageSocial user={user} compact draft={{ content: draft, onChange: onDraftChange }} />
  </div>;
};

const BroadcastView = ({ 
  broadcast, 
  user, 
  broadcastView, 
  unionNews14Images, 
  setUnionNews14Images,
  onOpenAdminHub,
  onExitUmiMatch,
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
  mobileWorldFeedDraft,
  setMobileWorldFeedDraft,
  bottomNavigation,
}) => {
  const isMobile = useMobileViewport();
  const [mobileWorldFeedExpanded, setMobileWorldFeedExpanded] = useState(false);

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
      if (!refreshRes.ok) throw new Error('Failed to refresh carousel images');
      const freshData = await refreshRes.json();
      if (!Array.isArray(freshData)) throw new Error('Invalid carousel image response');
      setUnionNews14Images(freshData);
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
      if (!refreshRes.ok) throw new Error('Failed to refresh carousel images');
      const freshData = await refreshRes.json();
      if (!Array.isArray(freshData)) throw new Error('Invalid carousel image response');
      setUnionNews14Images(freshData);
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
    if (rightWidth >= 67) return 9;
    if (rightWidth >= 50) return 8;
    if (rightWidth >= 40) return 6;
    return 0;
  };

  // Handle divider drag
  const handleDividerMouseDown = () => {
    setBroadcastDividerDragging(true);
  };

  useEffect(() => {
  if (!broadcastDividerDragging || isMobile || broadcastView !== 'UnionNews#14') return;

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
}, [broadcastDividerDragging, isMobile, broadcastView]);

  const resetToDefaultPosition = () => {
    setBroadcastLeftWidth(33);
    setBroadcastRightWidth(67);
    setBroadcastCarouselImageCount(9);
  };

  const resetToPosition002 = () => {
    setBroadcastLeftWidth(65);
    setBroadcastRightWidth(35);
    setBroadcastCarouselImageCount(6);
    setIsBroadcastLeftCollapsed(false);
    setIsBroadcastCarouselCollapsed(false);
  };

  if (broadcastView === 'UnionRadio#15') return <UnionRadioPlayer />;
  if (broadcastView === 'Find-a-Pantry#13') return <PantryFinderBroadcastView />;
  if (broadcastView === 'Beta-Button-10,011') return <BetaButtonView />;
  if (broadcastView === 'UmiMatch#22') return <UmiMatchView onExit={onExitUmiMatch} />;
  if (broadcastView === 'Million-Pixel#23') return <MillionPixelView />;

  if (broadcastView !== 'UnionNews#14') {
    // For non-UnionNews#14 broadcasts, use original layout
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-6 flex-1">
          <div className="w-1/3">
            <h4 className="font-semibold whitespace-pre-line text-center">{broadcast.subtitle}</h4>
            <div className="aspect-square bg-muted rounded-md my-2 bg-cover bg-center" style={{ backgroundImage: `url(${broadcast.logo})` }}></div>
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="icon" className="uhub-broadcast-footer-arrow" style={{ backgroundColor: 'transparent', color: '#ffffff', border: '0', boxShadow: 'none' }}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
              <Button variant="ghost" size="icon" className="uhub-broadcast-footer-arrow" style={{ backgroundColor: 'transparent', color: '#ffffff', border: '0', boxShadow: 'none' }}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="w-2/3 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <SiteWideMuteButton />
              <WelcomeDescription fallback={broadcast.description} className="text-sm text-muted-foreground flex-grow text-center" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">Learn how to code (in less than 5min) for Free- over at our GitHub here:</a>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex h-full min-w-0 gap-2">
                <div className="flex h-48 w-1/3 min-w-0 items-center justify-center overflow-hidden rounded-md bg-transparent p-2">
                  <AnchorRotator />
                </div>
                <div className="w-2/3 min-w-0">
                  <BroadcastCarousel
                    items={broadcast.extraImages || []}
                    visibleItemCount={Math.min(broadcastCarouselImageCount, 6)}
                    isAdmin={user?.is_high_high_high_admin === 1}
                    onImageZoom={handleCarouselImageZoom}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UnionNews#14 layout with mobile-responsive stacking
if (isMobile) {
  // MOBILE LAYOUT: Vertical stack with proper scrolling
  return (
    <div className="uhub-mobile-broadcast flex flex-col w-full">
            {/* TOP: Broadcast Carousel */}
      {!isBroadcastCarouselCollapsed && (
        <div className="flex-shrink-0 flex flex-col w-[100%] mx-auto py-4">
          <div className="flex items-center gap-2 mb-2">
            {user?.is_high_high_high_admin === 1 && (
              <AdminHubButton className="text-xs h-8" onClick={onOpenAdminHub} />
                          )}
                        </div>

                        {/* CAROUSEL CONTENT - NO overflow-hidden */}
          <div className="flex-shrink-0">
            <div className="uhub-mobile-feed-carousel-row" data-feed-expanded={mobileWorldFeedExpanded}>
              <MobileWorldFeed user={user} draft={mobileWorldFeedDraft} onDraftChange={setMobileWorldFeedDraft} expanded={mobileWorldFeedExpanded} onExpandedChange={setMobileWorldFeedExpanded} />
              <div className="uhub-mobile-broadcast-carousel">
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
    visibleItemCount={broadcastView === 'UnionNews#14' ? 2 : Math.min(broadcastCarouselImageCount, 6)}
    maxPages={broadcastView === 'UnionNews#14' ? 183 : undefined}
    backgroundClassName={broadcastView === 'UnionNews#14' ? 'bg-black' : undefined}
    isAdmin={broadcastView === 'UnionNews#14' && user?.is_high_high_high_admin === 1}
    onReorderLeft={broadcastView === 'UnionNews#14' ? handleReorderLeft : undefined}
    onReorderRight={broadcastView === 'UnionNews#14' ? handleReorderRight : undefined}
    onImageZoom={handleCarouselImageZoom}
  />
</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBroadcastCarouselCollapsed && (
        <button
          onClick={() => {
            setIsBroadcastCarouselCollapsed(false);
            setBroadcastCarouselImageCount(9);
          }}
          className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded transition m-4"
        >
          <span>📸 Carousel</span>
        </button>
      )}


      {/* MIDDLE: Memebox */}
      {!isBroadcastLeftCollapsed && (
        <div className="uhub-mobile-memes flex-shrink-0 flex flex-col w-full py-4">
          <h4 className="font-semibold whitespace-pre-line text-sm">{broadcast.subtitle}</h4>
          <div
            id="TheReactMemeImplementationConnection001"
            data-meme-box-layout={broadcastCarouselImageCount}
            className="bg-muted rounded-md my-2"
            style={{ minHeight: '280px' }}
          />
          {/* Restore this mobile attribution/navigation strip when alternate MemeBox-area content is available.
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          */}
        </div>
      )}
      {bottomNavigation}

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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  title="Upload meme"
                  onClick={(event) => { event.stopPropagation(); document.dispatchEvent(new Event('uhub-memebox-upload')); }}
                >
                  <img src="/EmojisForUminionWebsite/GreenEmoji010UploadIcon.png" width="24" alt="" className="exclude-zoom" />
                </Button>
                <h4 className="font-semibold whitespace-pre-line text-center text-sm flex-1">{broadcast.subtitle}</h4>
              </div>
              <div
                id="TheReactMemeImplementationConnection001"
                data-meme-box-layout={broadcastCarouselImageCount}
                className="flex-1 bg-muted rounded-md my-2 overflow-hidden"
                style={{ minHeight: '200px' }}
              />
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }}><ChevronRight className="h-4 w-4" /></Button>
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
          <div style={{ width: `${broadcastRightWidth}%` }} className="flex flex-col overflow-y-auto overflow-x-hidden">
            <div className="flex items-center gap-2 mb-2">
              <SiteWideMuteButton small />
                        <WelcomeDescription fallback={broadcast.description} className="text-xs text-muted-foreground flex-grow text-center" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-xs">Learn how to code (in less than 5min) for Free- over at our GitHub here:</a>
                            </div>

                            {/* CAROUSEL - Shows limited images based on width */}
            <div className="shrink-0 overflow-hidden">
              <div className="flex h-full min-w-0 gap-2">
                <div className="flex h-48 w-1/3 min-w-0 items-center justify-center overflow-hidden rounded-md bg-transparent p-2">
                  <AnchorRotator />
                </div>
                <div className="w-2/3 min-w-0">
                  <BroadcastCarousel
                    items={unionNews14Images}
                    visibleItemCount={2}
                    maxPages={183}
                    backgroundClassName="bg-black"
                    isAdmin={user?.is_high_high_high_admin === 1}
                    onReorderLeft={handleReorderLeft}
                    onReorderRight={handleReorderRight}
                    onImageZoom={handleCarouselImageZoom}
                  />
                </div>
              </div>
            </div>
            <FrontPageSocial user={user} />
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
  storeProducts: { [key: number]: Product[] };
  onProductView: (product: Product) => void;
  onProductDelete: (productId: number) => void;
  setSelectedProduct: (product: Product | null) => void;
  setProductDetailModalOpen: (open: boolean) => void;
  setAddProductModalOpen?: (open: boolean) => void;
  allProductsForAdmin?: Product[];
  everythingProducts?: Product[];
  loadStoreProducts: (storeId: number) => void;
  loadingStoreIds: Set<number>;
  storeProductErrors: Record<number, string>;
  loadEverythingProducts: () => void;
  isLoadingEverythingProducts: boolean;
  everythingProductsError: string;
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
  storeProducts = {},
  onProductView,
  onProductDelete,
  allProductsForAdmin = [],
  setSelectedProduct,
  setAddProductModalOpen,
  everythingProducts = [],
  loadStoreProducts,
  loadingStoreIds,
  storeProductErrors,
  loadEverythingProducts,
  isLoadingEverythingProducts,
  everythingProductsError,
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

const storePages = useMemo(() => buildStorePages(), [stores, userStoresData, userStoresCount, userStorePages]);

  useEffect(() => {
    if (!isOpen) return;
    if (currentPage === 1) {
      loadStoreProducts(0);
      loadEverythingProducts();
      return;
    }
    if (currentPage >= 2 && currentPage <= 9) {
      storePages[currentPage - 1].forEach(store => {
        if (store) loadStoreProducts(store.id);
      });
    }
  }, [currentPage, isOpen, loadStoreProducts, loadEverythingProducts, storePages]);

  // Check if user is logged in (to be able see the 'add product' button; yes?' -12:18am on 2/3/26
  const canAddProducts = !!user;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100000]">
      <div className="uhub-store-browser bg-background border rounded-lg p-6 max-w-6xl w-[95%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Store Quadrants (All 30 Stores)</h2>


<div className="uhub-store-browser-navigation flex justify-between items-center mt-6">
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


          
          <Button variant="ghost" size="icon" className="uhub-store-browser-close" onClick={onClose} aria-label="Close stores" title="Close">
            <X className="h-6 w-6" />
          </Button>          
        </div>

        {/* PAGE 1 - REDESIGNED LAYOUT */}
        {currentPage === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[70vh]">
            
            {/* TOP LEFT: Union Store - WITH HEIGHT CONSTRAINT FOR 10 ITEMS */}
<div className="border rounded-lg p-4 flex flex-col h-full">
  <div className="flex justify-between items-center mb-3 sticky top-0 bg-background z-10">
    <h3 className="font-bold">Union Store</h3>
  </div>
  <div className="union-store-scrollable" style={{ maxHeight: '380px', overflow: 'hidden', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {mainStoreProducts.length > 0 ? (
      mainStoreProducts.map((p) => (
        <div 
          key={p.id}
          className="border rounded p-2 text-xs flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer flex-shrink-0"
          onClick={() => {
            onProductView(p);
          }}
        >
          {p.image_url && (
            <ProductQueuedImage
              src={p.image_url}
              queue="union"
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
  className="uhub-store-action h-7 w-7 flex-shrink-0"
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
      <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground" role="status" aria-label="Loading Union Store"><Loader2 className="h-4 w-4 animate-spin" />Loading Union Store</div>
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
      <QueuedImage
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
    <QueuedImage
      src={uStore.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"}
      alt={`${uStore.name} banner`}
      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
      fallbackSrc="/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"
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
      products={everythingProducts}
  isLoading={isLoadingEverythingProducts}
  onProductView={onProductView}
      onAddToCart={(product) => addToMainCart(product, Boolean(user))}
      error={everythingProductsError}
      onRetry={loadEverythingProducts}
    />
  </div>
</div>



            
          </div>
        )}

        {/* PAGES 2-10 REMAIN THE SAME IN REPRESENTING UNION STORES 1-30 */}
       {currentPage > 1 && currentPage <= 9 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[70vh]">
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
              <QueuedImage
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
            <QueuedImage
              src={store.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"}
              alt={`${store.name} banner`}
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
              fallbackSrc="/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"
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
            {loadingStoreIds.has(store.number) ? (
              <div className="col-span-2 text-center text-muted-foreground py-4 text-sm">Loading products...</div>
            ) : storeProductErrors[store.number] ? (
              <div className="col-span-2 text-center text-red-400 py-4 text-sm">
                <p>Products could not be loaded.</p>
                <Button size="sm" variant="outline" onClick={() => loadStoreProducts(store.number)}>Retry</Button>
              </div>
            ) : storeProducts[store.number] && storeProducts[store.number].length > 0 ? (
              storeProducts[store.number].map((product) => (
                <div
                  key={product.id}
                  className="border rounded-md p-2 relative h-24 group hover:border-orange-400 transition cursor-pointer"
                  style={{
                    background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
                  }}
                >
                  {product.image_url && <ProductQueuedImage src={product.image_url} queue="users" alt="" className="absolute inset-0 h-full w-full object-cover" />}
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
                    className="uhub-store-action absolute bottom-1 right-1 z-20 h-7 w-7 inline-flex items-center justify-center rounded transition"
                    title="View product details"
                  >
                    <Eye className="h-3 w-3 text-white" />
                  </button>

                  {/* Add to cart, left of the Eye */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void addToMainCart(product, Boolean(user));
                    }}
                    className="uhub-store-action uhub-tile-cart absolute bottom-1 right-9 z-20 h-7 w-7 inline-flex items-center justify-center rounded transition"
                    aria-label={user ? `Add ${product.name} to cart` : 'Log in to add to cart'}
                    title={user ? 'Add to cart' : 'Log in to add to cart'}
                  >
                    <ShoppingCart className="h-3 w-3 text-white" />
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[70vh]">
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
                  <QueuedImage
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
                <QueuedImage
                  src={userStore.banner_url || "/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"}
                  alt={`${userStore.name} banner`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                  fallbackSrc="/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg"
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
      className="uhub-store-action absolute bottom-1 right-1 z-20 h-7 w-7 inline-flex items-center justify-center rounded transition"
      title="View product details"
    >
      <Eye className="h-3 w-3 text-white" />
    </button>

    {/* Add to cart, left of the Eye */}
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void addToMainCart(product, Boolean(user));
      }}
      className="uhub-store-action uhub-tile-cart absolute bottom-1 right-9 z-20 h-7 w-7 inline-flex items-center justify-center rounded transition"
      aria-label={user ? `Add ${product.name} to cart` : 'Log in to add to cart'}
      title={user ? 'Add to cart' : 'Log in to add to cart'}
    >
      <ShoppingCart className="h-3 w-3 text-white" />
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
const HomeModal = ({ isOpen, onClose, userProducts = [], user = null }: { isOpen: boolean; onClose: () => void; userProducts?: any[]; user?: any }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [worldFeedRefreshKey, setWorldFeedRefreshKey] = useState(0);

  const fetchFriendsFeedPage = useCallback(async (offset: number, limit: number) => {
    if (!user) return { items: [], total: 0 };
    const res = await fetch(`/api/feed/friends?offset=${offset}&limit=${limit}`, { credentials: 'include' });
    if (!res.ok) return { items: [], total: 0 };
    return res.json();
  }, [user]);

  const fetchUnionAnnouncementsPage = useCallback(async (offset: number, limit: number) => {
    if (!user) return { items: [], total: 0 };
    const res = await fetch(`/api/feed/union-announcements?offset=${offset}&limit=${limit}`, { credentials: 'include' });
    if (!res.ok) return { items: [], total: 0 };
    return res.json();
  }, [user]);

  const friendsFeed = usePaginatedFeed(fetchFriendsFeedPage, [user?.id], isOpen && !!user);
  const unionFeed = usePaginatedFeed(fetchUnionAnnouncementsPage, [user?.id], isOpen && !!user);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsSubmittingPost(true);
    try {
      const response = await fetch('/api/social-posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPostContent.trim() }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Could not create your post.');
      }
      setNewPostContent('');
      setWorldFeedRefreshKey(key => key + 1);
    } catch (error) {
      console.error('[HOME MODAL] Error creating post:', error);
      window.alert(error instanceof Error ? error.message : 'Could not create your post.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-background border rounded-lg p-6 max-w-4xl w-[90%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Home</h2>
          <Button variant="ghost" size="icon" onClick={onClose} style={{ backgroundColor: 'transparent', color: '#ffffff' }}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[70vh]">
          <WorldFeed refreshKey={worldFeedRefreshKey} />

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
              style={{ color: '#ffffff' }}
              placeholder="Write a post..." 
              rows={3}
              maxLength={1000}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              disabled={!user}
            ></textarea>
            <div className="mb-2 self-start text-xs text-gray-400" aria-live="polite">
              {1000 - newPostContent.length}/1000
            </div>
            <Button
              className="w-full bg-orange-400 hover:bg-orange-500"
              onClick={handleCreatePost}
              disabled={!user || isSubmittingPost || !newPostContent.trim()}
            >
              {isSubmittingPost ? 'Posting...' : 'Create Post'}
            </Button>
          </div>

          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <h3 className="font-bold mb-4">My Feed</h3>
            {!user ? (
              <div className="text-center text-muted-foreground py-8 flex-1 flex items-center justify-center">
                Log in to see posts from your friends
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">Friends</h4>
                  {friendsFeed.isLoading ? (
                    <div className="text-center text-muted-foreground text-sm">Loading feed...</div>
                  ) : friendsFeed.items.length > 0 ? (
                    <div className="space-y-2">
                      {friendsFeed.items.map((entry: any) => (
                        <FeedEntryCard key={`${entry.type}-${entry.id}`} entry={entry} onChanged={friendsFeed.reload} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">Posts from friends appear here</div>
                  )}
                  {friendsFeed.hasMore && (
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={friendsFeed.viewMore}>
                      View More
                    </Button>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">Union Announcements</h4>
                  {unionFeed.isLoading ? (
                    <div className="text-center text-muted-foreground text-sm">Loading announcements...</div>
                  ) : unionFeed.items.length > 0 ? (
                    <div className="space-y-2">
                      {unionFeed.items.map((entry: any) => (
                        <FeedEntryCard key={`${entry.type}-${entry.id}`} entry={entry} onChanged={unionFeed.reload} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm">No announcements yet</div>
                  )}
                  {unionFeed.hasMore && (
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={unionFeed.viewMore}>
                      View More
                    </Button>
                  )}
                </div>
              </div>
            )}
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


const MainUhubFeatureV001ForMyProfileModal: React.FC<MainUhubFeatureV001ForMyProfileModalProps> = ({ isOpen, onClose, onOpenAuthModal, onBadgeZoom, mobileWorldFeedDraft, onMobileWorldFeedDraftChange: setMobileWorldFeedDraft }) => {
  const { user, logout } = useAuth();
  const isMobile = useMobileViewport();
  const showTopAnvilFeature = useAlternatingFeatureSlot(MOBILE_TOP_ANVIL_ROTATE_MS, isMobile);
  const showBottomAnvilFeature = useAlternatingFeatureSlot(MOBILE_BOTTOM_ANVIL_ROTATE_MS, isMobile);
  const [mobileSection, setMobileSection] = useState<'front' | 'hub' | 'stores' | 'features' | 'more'>('front');
  const [mobileFooterOpen, setMobileFooterOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isMobile && mobileContentRef.current) mobileContentRef.current.scrollTop = 0;
  }, [isMobile, mobileSection]);
  const [isPoliticFilterOpen, setPoliticFilterOpen] = useState(false);
  const [isPoliticFilterPressed, setPoliticFilterPressed] = useState(false);
  const [managedCarouselAdminSlot, setManagedCarouselAdminSlot] = useState<ManagedCarouselAdminTarget | null>(null);
  const MainUhubFeatureV001ForUHomeHubButtons = Array.from({ length: 30 }, (_, i) => i + 1);
  const uHomeHubButtonSettings = useUHomeHubButtonSettings();
  const [customizableButtonPage, setCustomizableButtonPage] = useState(1);
  const CustomButtonsPage001sNextPageButton = 'CustomButtonsPage001sNextPageButton';
  const CustomButtonsPage002sPreviousPageButton = 'CustomButtonsPage002sPreviousPageButton';
  const CustomButtonsPage002sNextPageButton = 'CustomButtonsPage002sNextPageButton';
  const CustomButtonsPage003sPreviousPageButton = 'CustomButtonsPage003sPreviousPageButton';
  const CustomButtonsPage003sNextPageButton = 'CustomButtonsPage003sNextPageButton';
  const CustomButtonsPage004sPreviousPageButton = 'CustomButtonsPage004sPreviousPageButton';
  const CustomButtonsPage004sNextPageButton = 'CustomButtonsPage004sNextPageButton';
  const CustomButtonsPage005sPreviousPageButton = 'CustomButtonsPage005sPreviousPageButton';
  const CustomButtonsPage005sNextPageButton = 'CustomButtonsPage005sNextPageButton';
  const CustomButtonsPage006sPreviousPageButton = 'CustomButtonsPage006sPreviousPageButton';
  const CustomButtonsPage006sNextPageButton = 'CustomButtonsPage006sNextPageButton';
  const CustomButtonsPage007sPreviousPageButton = 'CustomButtonsPage007sPreviousPageButton';
  const CustomButtonsPage007sNextPageButton = 'CustomButtonsPage007sNextPageButton';
  const hardCodedCustomButtonPages: Record<number, Array<number | string | null>> = {
    8: [100, 101, 107, 108, 102, 103, 109, 110, 104, 105, 111, 112, 'CustomButtonsPage008sPreviousPageButton', 106, 113, 'CustomButtonsPage008sNextPageButton'],
    9: [114, 115, 121, 122, 116, 117, 123, 124, 118, 119, 125, 126, 'CustomButtonsPage009sPreviousPageButton', 120, 127, 'CustomButtonsPage009sNextPageButton'],
    10: [128, 129, 135, 136, 130, 131, 137, 138, 132, 133, 139, 140, 'CustomButtonsPage010sPreviousPageButton', 134, 141, 'CustomButtonsPage010sNextPageButton'],
    11: [142, 143, 149, 150, 144, 145, 151, 152, 146, 147, 153, 154, 'CustomButtonsPage011sPreviousPageButton', 148, 155, 'CustomButtonsPage011sNextPageButton'],
    12: [156, 157, 163, 164, 158, 159, 165, 166, 160, 161, 167, 168, 'CustomButtonsPage012sPreviousPageButton', 162, 169, 'CustomButtonsPage012sNextPageButton'],
    13: [170, 171, 177, 178, 172, 173, 179, 180, 174, 175, 181, 182, 'CustomButtonsPage013sPreviousPageButton', 176, 183, 'CustomButtonsPage013sNextPageButton'],
    14: [184, 185, 191, 192, 186, 187, 193, 194, 188, 189, 195, 196, 'CustomButtonsPage014sPreviousPageButton', 190, 197, 'CustomButtonsPage014sNextPageButton'],
    15: [198, 199, 205, 206, 200, 201, 207, 208, 202, 203, 209, 210, 'CustomButtonsPage015sPreviousPageButton', 204, 211, 'CustomButtonsPage015sNextPageButton'],
    16: [212, 213, 219, 220, 214, 215, 221, 222, 216, 217, 223, 224, 'CustomButtonsPage016sPreviousPageButton', 218, 225, 'CustomButtonsPage016sNextPageButton'],
    17: [226, 227, 233, 234, 228, 229, 235, 236, 230, 231, 237, 238, 'CustomButtonsPage017sPreviousPageButton', 232, 239, 'CustomButtonsPage017sNextPageButton'],
    18: [240, 241, 247, 248, 242, 243, 249, 250, 244, 245, 251, 252, 'CustomButtonsPage018sPreviousPageButton', 246, 253, 'CustomButtonsPage018sNextPageButton'],
    19: [254, 255, 261, 262, 256, 257, 263, 264, 258, 259, 265, 266, 'CustomButtonsPage019sPreviousPageButton', 260, 267, 'CustomButtonsPage019sNextPageButton'],
    20: [268, 269, 275, 276, 270, 271, 277, 278, 272, 273, 279, 280, 'CustomButtonsPage020sPreviousPageButton', 274, 281, 'CustomButtonsPage020sNextPageButton'],
    21: [282, 283, 289, 290, 284, 285, 291, 292, 286, 287, 293, 294, 'CustomButtonsPage021sPreviousPageButton', 288, 295, 'CustomButtonsPage021sNextPageButton'],
    22: [296, 297, 303, 304, 298, 299, 305, 306, 300, 301, 307, 308, 'CustomButtonsPage022sPreviousPageButton', 302, 309, 'CustomButtonsPage022sNextPageButton'],
    23: [310, 311, 317, 318, 312, 313, 319, 320, 314, 315, 321, 322, 'CustomButtonsPage023sPreviousPageButton', 316, 323, 'CustomButtonsPage023sNextPageButton'],
    24: [324, 325, 331, 332, 326, 327, 333, 334, 328, 329, 335, 336, 'CustomButtonsPage024sPreviousPageButton', 330, 337, 'CustomButtonsPage024sNextPageButton'],
    25: [338, 339, 345, 346, 340, 341, 347, 348, 342, 343, 349, 350, 'CustomButtonsPage025sPreviousPageButton', 344, 351, 'CustomButtonsPage025sNextPageButton'],
    26: [352, 353, 359, 360, 354, 355, 361, 362, 356, 357, 363, 364, 'CustomButtonsPage026sPreviousPageButton', 358, 365, 'CustomButtonsPage026sNextPageButton'],
    27: [366, 367, 373, 374, 368, 369, 375, 376, 370, 371, 377, 378, 'CustomButtonsPage027sPreviousPageButton', 372, 379, 'CustomButtonsPage027sNextPageButton'],
    28: [380, 381, 387, 388, 382, 383, 389, 390, 384, 385, 391, 392, 'CustomButtonsPage028sPreviousPageButton', 386, 393, 'CustomButtonsPage028sNextPageButton'],
    29: [394, 395, 401, 402, 396, 397, 403, 404, 398, 399, 405, 406, 'CustomButtonsPage029sPreviousPageButton', 400, 407, 'CustomButtonsPage029sNextPageButton'],
    30: [408, 409, 415, 416, 410, 411, 417, 418, 412, 413, 419, 420, 'CustomButtonsPage030sPreviousPageButton', 414, 421, 'CustomButtonsPage030sNextPageButton'],
    31: [422, 423, 429, 430, 424, 425, 431, 432, 426, 427, 433, 434, 'CustomButtonsPage031sPreviousPageButton', 428, 435, 'CustomButtonsPage031sNextPageButton'],
    32: [436, 437, 443, 444, 438, 439, 445, 446, 440, 441, 447, 448, 'CustomButtonsPage032sPreviousPageButton', 442, 449, 'CustomButtonsPage032sNextPageButton'],
    33: [450, 451, 457, 458, 452, 453, 459, 460, 454, 455, 461, 462, 'CustomButtonsPage033sPreviousPageButton', 456, 463, 'CustomButtonsPage033sNextPageButton'],
    34: [464, 465, 471, 472, 466, 467, 473, 474, 468, 469, 475, 476, 'CustomButtonsPage034sPreviousPageButton', 470, 477, 'CustomButtonsPage034sNextPageButton'],
    35: [478, 479, 485, 486, 480, 481, 487, 488, 482, 483, 489, 490, 'CustomButtonsPage035sPreviousPageButton', 484, 491, 'CustomButtonsPage035sNextPageButton'],
    36: [492, 493, 499, 500, 494, 495, 501, 502, 496, 497, 503, 504, 'CustomButtonsPage036sPreviousPageButton', 498, 505, 'CustomButtonsPage036sNextPageButton'],
    37: [506, 507, 513, 514, 508, 509, 515, 516, 510, 511, 517, 518, 'CustomButtonsPage037sPreviousPageButton', 512, 519, 'CustomButtonsPage037sNextPageButton'],
    38: [520, 521, 527, 528, 522, 523, 529, 530, 524, 525, 531, 532, 'CustomButtonsPage038sPreviousPageButton', 526, 533, 'CustomButtonsPage038sNextPageButton'],
    39: [534, 535, 541, 542, 536, 537, 543, 544, 538, 539, 545, 546, 'CustomButtonsPage039sPreviousPageButton', 540, 547, 'CustomButtonsPage039sNextPageButton'],
    40: [548, 549, 555, 556, 550, 551, 557, 558, 552, 553, 559, 560, 'CustomButtonsPage040sPreviousPageButton', 554, 561, 'CustomButtonsPage040sNextPageButton'],
    41: [562, 563, 569, 570, 564, 565, 571, 572, 566, 567, 573, 574, 'CustomButtonsPage041sPreviousPageButton', 568, 575, 'CustomButtonsPage041sNextPageButton'],
    42: [576, 577, 583, 584, 578, 579, 585, 586, 580, 581, 587, 588, 'CustomButtonsPage042sPreviousPageButton', 582, 589, 'CustomButtonsPage042sNextPageButton'],
    43: [590, 591, 597, 598, 592, 593, 599, 600, 594, 595, 601, 602, 'CustomButtonsPage043sPreviousPageButton', 596, 603, 'CustomButtonsPage043sNextPageButton'],
    44: [604, 605, 611, 612, 606, 607, 613, 614, 608, 609, 615, 616, 'CustomButtonsPage044sPreviousPageButton', 610, 617, 'CustomButtonsPage044sNextPageButton'],
    45: [618, 619, 625, 626, 620, 621, 627, 628, 622, 623, 629, 630, 'CustomButtonsPage045sPreviousPageButton', 624, 631, 'CustomButtonsPage045sNextPageButton'],
    46: [632, 633, 639, 640, 634, 635, 641, 642, 636, 637, 643, 644, 'CustomButtonsPage046sPreviousPageButton', 638, 645, 'CustomButtonsPage046sNextPageButton'],
    47: [646, 647, 653, 654, 648, 649, 655, 656, 650, 651, 657, 658, 'CustomButtonsPage047sPreviousPageButton', 652, 659, 'CustomButtonsPage047sNextPageButton'],
    48: [660, 661, 667, 668, 662, 663, 669, 670, 664, 665, 671, 672, 'CustomButtonsPage048sPreviousPageButton', 666, 673, 'CustomButtonsPage048sNextPageButton'],
    49: [674, 675, 681, 682, 676, 677, 683, 684, 678, 679, 685, 686, 'CustomButtonsPage049sPreviousPageButton', 680, 687, 'CustomButtonsPage049sNextPageButton'],
    50: [688, 689, 695, 696, 690, 691, 697, 698, 692, 693, 699, 700, 'CustomButtonsPage050sPreviousPageButton', 694, 701, 'CustomButtonsPage050sNextPageButton'],
    51: [702, 703, 709, 710, 704, 705, 711, 712, 706, 707, 713, 714, 'CustomButtonsPage051sPreviousPageButton', 708, 715, 'CustomButtonsPage051sNextPageButton'],
    52: [716, 717, 723, 724, 718, 719, 725, 726, 720, 721, 727, 728, 'CustomButtonsPage052sPreviousPageButton', 722, 729, 'CustomButtonsPage052sNextPageButton'],
    53: [730, 731, 737, 738, 732, 733, 739, 740, 734, 735, 741, 742, 'CustomButtonsPage053sPreviousPageButton', 736, 743, 'CustomButtonsPage053sNextPageButton'],
    54: [744, 745, 751, 752, 746, 747, 753, 754, 748, 749, 755, 756, 'CustomButtonsPage054sPreviousPageButton', 750, 757, 'CustomButtonsPage054sNextPageButton'],
    55: [758, 759, 765, 766, 760, 761, 767, 768, 762, 763, 769, 770, 'CustomButtonsPage055sPreviousPageButton', 764, 771, 'CustomButtonsPage055sNextPageButton'],
    56: [772, 773, 779, 780, 774, 775, 781, 782, 776, 777, 783, 784, 'CustomButtonsPage056sPreviousPageButton', 778, 785, 'CustomButtonsPage056sNextPageButton'],
    57: [786, 787, 793, 794, 788, 789, 795, 796, 790, 791, 797, 798, 'CustomButtonsPage057sPreviousPageButton', 792, 799, 'CustomButtonsPage057sNextPageButton'],
    58: [800, 801, 807, 808, 802, 803, 809, 810, 804, 805, 811, 812, 'CustomButtonsPage058sPreviousPageButton', 806, 813, 'CustomButtonsPage058sNextPageButton'],
    59: [814, 815, 821, 822, 816, 817, 823, 824, 818, 819, 825, 826, 'CustomButtonsPage059sPreviousPageButton', 820, 827, 'CustomButtonsPage059sNextPageButton'],
    60: [828, 829, 835, 836, 830, 831, 837, 838, 832, 833, 839, 840, 'CustomButtonsPage060sPreviousPageButton', 834, 841, 'CustomButtonsPage060sNextPageButton'],
    61: [842, 843, 849, 850, 844, 845, 851, 852, 846, 847, 853, 854, 'CustomButtonsPage061sPreviousPageButton', 848, 855, 'CustomButtonsPage061sNextPageButton'],
    62: [856, 857, 863, 864, 858, 859, 865, 866, 860, 861, 867, 868, 'CustomButtonsPage062sPreviousPageButton', 862, 869, 'CustomButtonsPage062sNextPageButton'],
    63: [870, 871, 877, 878, 872, 873, 879, 880, 874, 875, 881, 882, 'CustomButtonsPage063sPreviousPageButton', 876, 883, 'CustomButtonsPage063sNextPageButton'],
    64: [884, 885, 891, 892, 886, 887, 893, 894, 888, 889, 895, 896, 'CustomButtonsPage064sPreviousPageButton', 890, 897, 'CustomButtonsPage064sNextPageButton'],
    65: [898, 899, 905, 906, 900, 901, 907, 908, 902, 903, 909, 910, 'CustomButtonsPage065sPreviousPageButton', 904, 911, 'CustomButtonsPage065sNextPageButton'],
    66: [912, 913, 919, 920, 914, 915, 921, 922, 916, 917, 923, 924, 'CustomButtonsPage066sPreviousPageButton', 918, 925, 'CustomButtonsPage066sNextPageButton'],
    67: [926, 927, 933, 934, 928, 929, 935, 936, 930, 931, 937, 938, 'CustomButtonsPage067sPreviousPageButton', 932, 939, 'CustomButtonsPage067sNextPageButton'],
    68: [940, 941, 947, 948, 942, 943, 949, 950, 944, 945, 951, 952, 'CustomButtonsPage068sPreviousPageButton', 946, 953, 'CustomButtonsPage068sNextPageButton'],
    69: [954, 955, 961, 962, 956, 957, 963, 964, 958, 959, 965, 966, 'CustomButtonsPage069sPreviousPageButton', 960, 967, 'CustomButtonsPage069sNextPageButton'],
    70: [968, 969, 975, 976, 970, 971, 977, 978, 972, 973, 979, 980, 'CustomButtonsPage070sPreviousPageButton', 974, 981, 'CustomButtonsPage070sNextPageButton'],
    71: [982, 983, 989, 990, 984, 985, 991, 992, 986, 987, 993, 994, 'CustomButtonsPage071sPreviousPageButton', 988, 995, 'CustomButtonsPage071sNextPageButton'],
    72: [996, 997, 1003, 1004, 998, 999, 1005, 1006, 1000, 1001, 1007, 1008, 'CustomButtonsPage072sPreviousPageButton', 1002, 1009, 'CustomButtonsPage072sNextPageButton'],
    ...additionalHardCodedCustomButtonPages,
  };
  const customButtonPageScrollRef = useRef<HTMLDivElement>(null);
  const customButtonScrollDrivenRef = useRef(false);
  const customButtonPageHeight = isMobile ? 320 : 140;

  useEffect(() => {
    if (isMobile && customButtonScrollDrivenRef.current) {
      customButtonScrollDrivenRef.current = false;
      return;
    }
    customButtonPageScrollRef.current?.scrollTo({
      top: (customizableButtonPage - 1) * customButtonPageHeight,
      behavior: isMobile ? 'auto' : 'smooth',
    });
  }, [customizableButtonPage, customButtonPageHeight, isMobile, mobileSection]);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [storeProducts, setStoreProducts] = useState<{ [key: number]: Product[] }>({});
  const [loadingStoreIds, setLoadingStoreIds] = useState<Set<number>>(new Set());
  const [storeProductErrors, setStoreProductErrors] = useState<{ [key: number]: string }>({});
  const inFlightStoreLoads = useRef(new Set<number>());
  const loadedStoreIds = useRef(new Set<number>());
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
  const [isPromoHovered, setIsPromoHovered] = useState(false);
  const [isPromoAutoplayPaused, setIsPromoAutoplayPaused] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const { items: bottomPromoItems } = useManagedCarouselItems('bottom');
  useEffect(() => setPromoIndex(0), [bottomPromoItems]);
  const mobileBottomBannerItems = useMemo(() => bottomPromoItems.filter(item => item.image_url), [bottomPromoItems]);
  const promoCount = bottomPromoItems.length;
  const activeBottomPromo = bottomPromoItems[promoIndex];
  const activeBottomPromoStyle = captionStyleToCss(parseCaptionStyle(activeBottomPromo?.description));
  const promoPauseTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
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
  const [areProfileSurfacesOpaque, setAreProfileSurfacesOpaque] = useState(true);
  const [isButton18Active, setIsButton18Active] = useState(false);
  const [isSnakeModalOpen, setIsSnakeModalOpen] = useState(false);
  const [openSitePage, setOpenSitePage] = useState<SitePageKey | null>(null);
  const aboutPage = useSitePage('about', customizableButtonPage === 715);
  const termsPage = useSitePage('terms', customizableButtonPage === 715);
  const [snakeGamePhase, setSnakeGamePhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [snakeGameScore, setSnakeGameScore] = useState(0);
  const [snakeSegments, setSnakeSegments] = useState<Array<{ x: number; y: number }>>([]);
  const [snakeDirection, setSnakeDirection] = useState<'up' | 'down' | 'left' | 'right'>('right');
  const [snakeCherry, setSnakeCherry] = useState<{ x: number; y: number }>({ x: 10, y: 5 });
  const [areFeatureIconsActive, setAreFeatureIconsActive] = useState({
    heart: false,
    palm: false,
    lion: false,
    microphone: false,
    steeringWheel: false,
    movie: false,
  });
  const [showLogout, setShowLogout] = useState(false);
  //i have an error. trying to find the error. is this whats causing the error? part000002 of X ***Update:> I think error is solved; cause this might be a repeat of a working code. aka i think safe maybe to delete as of 2/10/26+maybe yes
  // const [everythingProducts, setEverythingProducts] = useState<Product[]>([]);
  const [allProductsForAdmin, setAllProductsForAdmin] = useState<Product[]>([]);
  const [everythingProducts, setEverythingProducts] = useState<Product[]>([]);
  const [isLoadingEverythingProducts, setIsLoadingEverythingProducts] = useState(false);
  const [everythingProductsError, setEverythingProductsError] = useState('');
  const inFlightEverythingLoad = useRef(false);
  const hasLoadedEverything = useRef(false);
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
  const [broadcastCarouselImageCount, setBroadcastCarouselImageCount] = useState<number>(9);
  const [isBroadcastLeftCollapsed, setIsBroadcastLeftCollapsed] = useState(false);
  const [isBroadcastCarouselCollapsed, setIsBroadcastCarouselCollapsed] = useState(false);
  const [broadcastDividerDragging, setBroadcastDividerDragging] = useState(false);
  // NEW: Collapse state for left (uHome-Hub) and right (UnionSAM#20) sections
 const [isLeftSectionCollapsed, setIsLeftSectionCollapsed] = useState(false);
 const [isRightSectionCollapsed, setIsRightSectionCollapsed] = useState(false);
  const [leftDividerDragging, setLeftDividerDragging] = useState(false);
  const [rightDividerDragging, setRightDividerDragging] = useState(false);
  const loadStoreProducts = useCallback(async (storeId: number) => {
    if (loadedStoreIds.current.has(storeId) || inFlightStoreLoads.current.has(storeId)) return;

    inFlightStoreLoads.current.add(storeId);
    setLoadingStoreIds(previous => new Set(previous).add(storeId));
    setStoreProductErrors(previous => {
      const next = { ...previous };
      delete next[storeId];
      return next;
    });
    try {
      const response = await fetch(`/api/products/store/${storeId}`);
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('The server returned an invalid product list.');
      setStoreProducts(previous => ({ ...previous, [storeId]: data as Product[] }));
      if (storeId === 0) setMainStoreProducts(data as Product[]);
      if (storeId === 0) void enqueueProductImageBatch((data as Product[]).map(product => product.image_url || ''), 'union')
        .catch(error => console.error('[PRODUCT IMAGES] Union Store preload failed:', error));
      loadedStoreIds.current.add(storeId);
    } catch (error) {
      setStoreProductErrors(previous => ({
        ...previous,
        [storeId]: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      inFlightStoreLoads.current.delete(storeId);
      setLoadingStoreIds(previous => {
        const next = new Set(previous);
        next.delete(storeId);
        return next;
      });
    }
  }, []);

  const loadEverythingProducts = useCallback(async () => {
    if (hasLoadedEverything.current || inFlightEverythingLoad.current) return;

    inFlightEverythingLoad.current = true;
    setIsLoadingEverythingProducts(true);
    setEverythingProductsError('');
    try {
      const response = await fetch('/api/products/everything/all');
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('The server returned an invalid product list.');
      setEverythingProducts(data as Product[]);
      void enqueueProductImageBatch((data as Product[]).map(product => product.image_url || ''), 'users')
        .catch(error => console.error('[PRODUCT IMAGES] Users Stores preload failed:', error));
      hasLoadedEverything.current = true;
    } catch (error) {
      setEverythingProductsError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      inFlightEverythingLoad.current = false;
      setIsLoadingEverythingProducts(false);
    }
  }, []);

  const broadcasts = {
      'UnionNews#14': { memeBoxId: 'TheReactMemeImplementationConnection001', title: 'UnionNews#14 & GGEMMMS#25', creator: 'GGEMMMS#25', subtitle: 'Got Memes? Share Memes:', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.15-Made-on-NC-JPEG.png', extraImages: ['https://page001.uminion.com/StoreProductsAndImagery/TapestryVersion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/Tshirtbatchversion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/UkraineLogo001.png'], description: 'Welcome to the Uminion Union! We have Rallies every 24th of the month, stores built by unionFolk, chats, news, voting, teaching ppl how to code (for free) & we even offer an ad-free- meme section below!', website: 'https://github.com/uminionunion/UminionsWebsite/discussions/13' },
      'UnionRadio#15': { title: 'Broadcasts- UnionRadio#15', creator: 'StorytellingSalem', subtitle: 'Under Construction- Union Radio #15.', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.16-Made-on-NC-JPEG.png', extraImages: [], description: 'Union Radio #15 is presently underConstruction; & is expected to be live again, along with when we launch v3!', website: 'https://uminion.com' },
      'Find-a-Pantry#13': { title: 'Find-a-Pantry#13', creator: 'Uminion Union', subtitle: 'Find and add community resources.', logo: '', extraImages: [], description: 'Find-a-Pantry', website: 'https://uminion.com' },
      'UmiMatch#22': { title: 'UmiMatch#22', creator: 'Uminion Union', subtitle: 'Meet union folk.', logo: '', extraImages: [], description: 'UmiMatch', website: 'https://uminion.com' },
      'Million-Pixel#23': { title: 'Million-Pixel#23', creator: 'Uminion Union', subtitle: 'One million pixels, powered by PixelTickets.', logo: '', extraImages: [], description: 'Million-Pixel', website: 'https://uminion.com' },
      'Beta-Button-10,011': { title: 'Beta-Button-10,011', creator: 'Uminion Union', subtitle: 'Features in Development', logo: '', extraImages: [], description: 'Beta Pages', website: 'https://uminion.com' },
  };
  const broadcastKeys = ['UnionNews#14', 'UnionRadio#15', 'MyBroadcasts'];
  const [selectedFriendForModal, setSelectedFriendForModal] = useState<any>(null);
  const [isFriendProfileModalOpen, setIsFriendProfileModalOpen] = useState(false);
  const [photoEditorPurpose, setPhotoEditorPurpose] = useState<ProfilePhotoPurpose | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<ProfilePhotoPurpose | null>(null);
  const dismissPhotoSuccess = useCallback(() => setPhotoSuccess(null), []);
  const [unreadChatrooms, setUnreadChatrooms] = useState<Set<number>>(new Set());
  const [unreadStatusError, setUnreadStatusError] = useState('');

  useEffect(() => {
    const onPhotosChanged = (event: Event) => {
      const detail = (event as CustomEvent<ProfilePhotosChangedDetail>).detail;
      if (!detail || typeof detail.userId !== 'number') return;
      const updates = {
        ...(detail.profile_image_url !== undefined ? { profile_image_url: detail.profile_image_url } : {}),
        ...(detail.cover_photo_url !== undefined ? { cover_photo_url: detail.cover_photo_url } : {}),
      };
      setSelectedFriendForModal((selected: any) => selected?.id === detail.userId ? { ...selected, ...updates } : selected);
    };
    window.addEventListener(PROFILE_PHOTOS_CHANGED_EVENT, onPhotosChanged);
    return () => window.removeEventListener(PROFILE_PHOTOS_CHANGED_EVENT, onPhotosChanged);
  }, []);

  useEffect(() => {
    setPhotoEditorPurpose(null);
    setPhotoSuccess(null);
    setUnreadChatrooms(new Set());
    setUnreadStatusError('');
  }, [user?.id, isOpen]);
  const socketRef = useRef<Socket | null>(null);



const [isUnionNews14ModalOpen, setIsUnionNews14ModalOpen] = useState(false);
const [isAdminHubOpen, setIsAdminHubOpen] = useState(false);
const isAdmin = user?.is_high_high_high_admin === 1;
const [unionNews14Images, setUnionNews14Images] = useState<BroadcastItem[]>([]);

  useEffect(() => {
    if (!showLogout) return;
    const timeout = window.setTimeout(() => setShowLogout(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [showLogout]);


  
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
    // Enable this log when debugging UnionNews14 image loading.
    // console.log('[PROFILE MODAL] Fetching UnionNews14 images from database...');
    const res = await fetch('/api/broadcasts/union-news-14/images');
    if (!res.ok) {
      console.error('[PROFILE MODAL] Failed to fetch images, status:', res.status);
      return;
    }
    const data = await res.json();
    console.log('[PROFILE MODAL] ✅ Fetched images:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      setUnionNews14Images(data);
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
  let cancelled = false;
  if (isOpen) {
    setUnreadStatusError('');
    // For logged-in users, get their unread status
    if (user && user.id) {
      fetch('/api/chat/unread-status', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`Could not load unread chat status (HTTP ${res.status}).`);
          return res.json();
        })
        .then(data => {
          if (cancelled) return;
          if (!Array.isArray(data)) throw new Error('The server returned invalid unread chat status.');
          if (Array.isArray(data)) {
            const unreadSet = new Set<number>();
            data.forEach((item: any) => {
              const match = typeof item.chatroom_room_name === 'string' && item.chatroom_room_name.match(/chatroom-(\d+)/);
              if (match) {
                // Extract the Sister Union number from the room name
                const sisterUnionNum = parseInt(item.chatroom_room_name.split('-chatroom')[0].match(/\d+/)?.[0] || '0');
                unreadSet.add(sisterUnionNum);
              }
            });
            setUnreadChatrooms(unreadSet);
            // Enable when debugging initial unread-room loading.
            // console.log('[PROFILE] Loaded unread chatrooms for logged-in user:', Array.from(unreadSet));
          }
        })
        .catch(error => {
          if (cancelled) return;
          console.error('[PROFILE] Error loading unread chatrooms:', error);
          setUnreadStatusError(error instanceof Error ? error.message : 'Could not load unread chat status.');
        });
    } else {
      // For non-logged-in users, show green circle for ANY room with messages
      fetch('/api/chat/rooms-with-messages')
        .then(res => {
          if (!res.ok) throw new Error(`Could not load chatroom message status (HTTP ${res.status}).`);
          return res.json();
        })
        .then(data => {
          if (cancelled) return;
          if (!Array.isArray(data)) throw new Error('The server returned invalid chatroom message status.');
          if (Array.isArray(data)) {
            const roomsWithMessagesSet = new Set<number>(data);
            setUnreadChatrooms(roomsWithMessagesSet);
            console.log('[PROFILE] Loaded rooms with messages for non-logged-in user:', Array.from(roomsWithMessagesSet));
          }
        })
        .catch(error => {
          if (cancelled) return;
          console.error('[PROFILE] Error loading rooms with messages:', error);
          setUnreadStatusError(error instanceof Error ? error.message : 'Could not load chatroom message status.');
        });
    }
  }
  return () => { cancelled = true; };
}, [user?.id, isOpen]);


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
            // Enable this log when debugging pending friend-request loading.
            // console.log(`[PROFILE MODAL] ✅ Loaded ${data.length} pending friend requests`);
            setPendingFriendRequests(data);
          }
        })
        .catch(error => {
          console.error('[PROFILE MODAL] ❌ Error fetching friend requests:', error);
        });
    }
  }, [user, isOpen]);

 // Load fixed product lists only when the store quadrants are opened.
useEffect(() => {
  const fetchVisibleProductLists = async () => {
    setIsLoadingProducts(true);
    try {
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
    } catch (error) {
      // TURN ON WHEN YOU NEED TO DEBUG: inspect initial Union Store product-list failures.
      // console.error('[PRODUCTS] Failed to load initial Union Store products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  if (isOpen && isQuadrantsModalOpen) {
    void fetchVisibleProductLists();
  }
}, [user, isOpen, isQuadrantsModalOpen]);

// Stores #01-#30 are requested only when selected; this is the former startup fan-out for diagnostics.
// TURN ON WHEN YOU NEED TO DEBUG: temporarily run this loop to inspect the old startup requests,
// then remove it again so opening the profile does not issue 30 additional product requests.
// for (let storeNum = 1; storeNum <= 30; storeNum += 1) {
//   fetch(`/api/products/store/${storeNum}`)
//     .then(response => response.json())
//     .then(data => console.log(`[PRODUCTS] Store ${storeNum} returned ${Array.isArray(data) ? data.length : 'invalid'} products`))
//     .catch(error => console.error(`[PRODUCTS] Debug request failed for store ${storeNum}:`, error));
// }
// fetch('/api/products/everything/all')
//   .then(response => response.json())
//   .then(data => console.log(`[PRODUCTS] Everything returned ${Array.isArray(data) ? data.length : 'invalid'} products`))
//   .catch(error => console.error('[PRODUCTS] Debug request failed for Everything:', error));
useEffect(() => {
  if (isOpen && centerRightView.number === 20) {
    void loadStoreProducts(0);
    void loadEverythingProducts();
  } else if (isOpen && centerRightView.number !== 19) {
    void loadStoreProducts(centerRightView.id);
  }
}, [centerRightView, isOpen, loadStoreProducts, loadEverythingProducts]);

// TURN ON WHEN YOU NEED TO DEBUG: the former startup fan-out fetched each store #01-#30 and Everything.
// Re-enable explicit requests inside the store-selection and Everything-view handlers only to inspect those lists.

  

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



  

// Main Cart: replaces the center/MemeBox area on desktop and opens as a modal on phones.
const [isMainCartOpen, setIsMainCartOpen] = useState(false);
const memeBoxRandomAfterCartRef = useRef(false);
const showMainCart = useCallback(() => {
  if (!user) {
    onOpenAuthModal('login');
    return;
  }
  setIsMainCartOpen(true);
}, [user, onOpenAuthModal]);
const closeMainCart = () => {
  setIsMainCartOpen(false);
  if (isMobile) return;
  // Desktop: bring the MemeBox back, starting on a random entry.
  memeBoxRandomAfterCartRef.current = true;
  setAreFeatureIconsActive(prev => ({ ...prev, heart: false, palm: false, lion: false, microphone: false }));
  setCenterView('broadcasts');
  setBroadcastView('UnionNews#14');
};
useEffect(() => {
  if (!isOpen) return;
  const handleLoginRequest = () => onOpenAuthModal('login');
  window.addEventListener(LOGIN_REQUEST_EVENT, handleLoginRequest);
  window.addEventListener(MAIN_CART_OPEN_EVENT, showMainCart);
  return () => {
    window.removeEventListener(LOGIN_REQUEST_EVENT, handleLoginRequest);
    window.removeEventListener(MAIN_CART_OPEN_EVENT, showMainCart);
  };
}, [isOpen, onOpenAuthModal, showMainCart]);
useEffect(() => {
  if (!user) setIsMainCartOpen(false);
}, [user]);
// Choosing another center feature while the desktop cart is open replaces the cart.
useEffect(() => setIsMainCartOpen(false), [centerView, broadcastView]);
const isDesktopCartOpen = isMainCartOpen && !isMobile;

const memeBoxReplacedByFeatureRef = useRef(false);
useEffect(() => {
  if (isOpen && !isDesktopCartOpen && centerView === 'broadcasts' && broadcastView === 'UnionNews#14' && broadcasts['UnionNews#14']) {
    // A MemeBox coming back from a banner feature (mobile) or the Main Cart (desktop) restarts on a random, unseen entry.
    renderTheMemeBox(broadcasts['UnionNews#14'], { randomStart: (isMobile && memeBoxReplacedByFeatureRef.current) || memeBoxRandomAfterCartRef.current });
    memeBoxReplacedByFeatureRef.current = false;
    memeBoxRandomAfterCartRef.current = false;
  } else {
    if (isOpen && centerView === 'broadcasts' && MOBILE_MEMEBOX_REPLACEMENT_VIEWS.includes(broadcastView)) memeBoxReplacedByFeatureRef.current = true;
    unmountTheMemeBox();
  }

  return () => {
    unmountTheMemeBox();
  };
}, [isOpen, centerView, broadcastView, isMobile, isDesktopCartOpen]);







  

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
          // DEBUG NOTE: re-enable only when checking user-store fetch issues.
          // console.log('[PRODUCTS] User stores fetch failed, status:', res.status);
          setUserStoresData([]);
          return;
        }
        const data = await res.json();
        setUserStoresData(Array.isArray(data) ? data : []);
        // DEBUG NOTE: re-enable only when checking user-store counts.
        // console.log(`[PRODUCTS] Fetched ${data.length} user stores with products`);
      } catch (error) {
        // DEBUG NOTE: re-enable only when checking user-store errors.
        // console.error('[PRODUCTS] Error fetching user stores:', error);
        setUserStoresData([]);
      }
    };

    if (isOpen && isQuadrantsModalOpen) {
      fetchUserStoresData();
    }
  }, [isOpen, isQuadrantsModalOpen]);


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
        transports: process.env.NODE_ENV === 'production' ? ['polling'] : ['websocket', 'polling'],
        upgrade: process.env.NODE_ENV !== 'production',
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
        <Button variant="ghost" size="icon" className="uhub-store-action h-7 w-7" onClick={showMainCart} aria-label={user ? 'View cart' : 'Log in to view your cart'} title={user ? 'View cart' : 'Log in to view your cart'}>
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {mainStoreProducts.length > 0 ? (
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
                <ProductQueuedImage
                  src={p.image_url}
                  queue="union"
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
                className="uhub-store-action h-7 w-7 flex-shrink-0"
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
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground" role="status" aria-label="Loading Union Store"><Loader2 className="h-4 w-4 animate-spin" />Loading Union Store</div>
        )}
      </div>
    </div>
    <div className="mb-3 overflow-hidden border rounded-md"><FooterPosterCarousel /></div>
    <div id="MainUhubFeatureV001ForUsersStores" className="border rounded-md p-2 flex flex-col h-full" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
  <div className="flex justify-between items-center mb-2 sticky top-0 z-10 uhub-users-stores-header" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
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
    <Button variant="ghost" size="icon" className="uhub-store-action h-7 w-7" onClick={showMainCart} aria-label={user ? 'View cart' : 'Log in to view your cart'} title={user ? 'View cart' : 'Log in to view your cart'}>
      <ShoppingCart className="h-4 w-4" />
    </Button>
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
            style={{ background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)' }}
          >
            {product.image_url && <ProductQueuedImage src={product.image_url} queue="users" alt="" className="absolute inset-0 h-full w-full object-cover" />}
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
              className="uhub-store-action absolute bottom-1 right-1 z-20 h-7 w-7 inline-flex items-center justify-center rounded transition"
              title="View product details"
            >
              <Eye className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground" role="status" aria-label="Loading Users' Stores">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading Users' Stores
      </div>
    )}
  </div>
</div>
  </>
)}

            {isUnionPolitic19 && (
              <UnionPoliticCandidates filtersOpen={isPoliticFilterOpen} />
            )}

            {!isUnionSAM20 && !isUnionPolitic19 && (
  <div id="MainUhubFeatureV001ForStoreColumn" className="border rounded-md p-2 flex flex-col h-full" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold text-center flex-1">Store {String(centerRightView.number).padStart(2, '0')}</h4>
      <Button variant="ghost" size="icon" className="uhub-store-action h-7 w-7" onClick={showMainCart} aria-label={user ? 'View cart' : 'Log in to view your cart'} title={user ? 'View cart' : 'Log in to view your cart'}>
        <ShoppingCart className="h-4 w-4" />
      </Button>
    </div>
    <div className="flex-1 overflow-y-auto space-y-2 mb-4">
      {loadingStoreIds.has(centerRightView.number) ? (
        <div className="text-center text-muted-foreground py-4">Loading products...</div>
      ) : storeProductErrors[centerRightView.number] ? (
        <div className="text-center text-red-400 py-4">
          <p>Products could not be loaded.</p>
          <Button size="sm" variant="outline" onClick={() => loadStoreProducts(centerRightView.id)}>Retry</Button>
        </div>
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
              className="uhub-store-action h-7 w-7 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(p);
                setProductDetailModalOpen(true);
              }}
              title="View details"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="uhub-store-action h-7 w-7 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                void addToMainCart(p, Boolean(user));
              }}
              aria-label={user ? `Add ${p.name} to cart` : 'Log in to add to cart'}
              title={user ? 'Add to cart' : 'Log in to add to cart'}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">No products available</div>
      )}
    </div>
    <div className="border-t pt-2 mt-auto" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
      <div className="grid grid-cols-2 gap-1" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
        {ALL_STORES.slice(1, 31).map((store) => (
          <Button
            key={store.id}
            variant={store.id === centerRightView.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCenterRightView(store)}
            className="uhub-store-selector-button text-xs h-8 text-white border-gray-700 hover:text-black"
            style={{ color: store.id === centerRightView.id ? '#000000' : '#ffffff' }}
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
    const moveNavigationBelowMemeBox = isMobile && broadcastView === 'UnionNews#14';
    const broadcastNavigation = <div className="uhub-broadcast-navigation flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => {
      const currentIndex = broadcastKeys.indexOf(broadcastView);
      const nextIndex = (currentIndex - 1 + broadcastKeys.length) % broadcastKeys.length;
      setBroadcastView(broadcastKeys[nextIndex]);
    }}>
      <ChevronLeft />
    </Button>
    <h3 className="text-center font-bold">{currentBroadcast?.title || 'MyBroadcasts'}</h3>
    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => {
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
    {isLeftSectionCollapsed && !isMobile && (
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
    {isRightSectionCollapsed && !isMobile && (
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
</div>;
return (
  <>
    {!moveNavigationBelowMemeBox && broadcastNavigation}
    {isMobile && MOBILE_MEMEBOX_REPLACEMENT_VIEWS.includes(broadcastView) && (
      <div className="mb-2 flex justify-end">
        <Button type="button" variant="outline" size="icon" className="uhub-mobile-memebox-return" aria-label="Close &amp; back to MemeBox" title="Close &amp; back to MemeBox" onClick={() => {
          setAreFeatureIconsActive(prev => ({ ...prev, heart: false, palm: false, lion: false }));
          setBroadcastView('UnionNews#14');
        }}><X className="h-4 w-4" /></Button>
      </div>
    )}
    {broadcastView === 'MyBroadcasts' ? 
      (user ? <CreateBroadcastView /> : <p className="text-center text-muted-foreground">You must be logged in to create a broadcast.</p>) 
      : (currentBroadcast ? <BroadcastView 
  broadcast={currentBroadcast} 
  user={user}
  broadcastView={broadcastView}
  unionNews14Images={unionNews14Images}
  setUnionNews14Images={setUnionNews14Images}
  onOpenAdminHub={() => setIsAdminHubOpen(true)}
  onExitUmiMatch={() => { setAreFeatureIconsActive(prev => ({ ...prev, heart: false })); setBroadcastView('UnionNews#14'); }}
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
  mobileWorldFeedDraft={mobileWorldFeedDraft}
  setMobileWorldFeedDraft={setMobileWorldFeedDraft}
  bottomNavigation={moveNavigationBelowMemeBox ? broadcastNavigation : null}
/> : <p>Broadcast not found.</p>)
    }
  </>
);

        
    }
  };

  const getRandomCherryPosition = useCallback((currentSnake: Array<{ x: number; y: number }>) => {
    const boardSize = 16;
    const occupied = new Set(currentSnake.map(segment => `${segment.x},${segment.y}`));
    const availableCells: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < boardSize; y += 1) {
      for (let x = 0; x < boardSize; x += 1) {
        if (!occupied.has(`${x},${y}`)) {
          availableCells.push({ x, y });
        }
      }
    }

    if (availableCells.length === 0) {
      return { x: 0, y: 0 };
    }

    return availableCells[Math.floor(Math.random() * availableCells.length)];
  }, []);

  const resetSnakeGameState = useCallback(() => {
    setSnakeGamePhase('idle');
    setSnakeGameScore(0);
    setSnakeDirection('right');
    setSnakeSegments([
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
    ]);
    setSnakeCherry(getRandomCherryPosition([
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
    ]));
  }, [getRandomCherryPosition]);

  useEffect(() => {
    if (!isSnakeModalOpen) {
      resetSnakeGameState();
    }
  }, [isSnakeModalOpen, resetSnakeGameState]);

  const startSnakeGame = useCallback(() => {
    const initialSnake = [
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
    ];
    setSnakeSegments(initialSnake);
    setSnakeDirection('right');
    setSnakeGameScore(0);
    setSnakeGamePhase('playing');
    setSnakeCherry(getRandomCherryPosition(initialSnake));
  }, [getRandomCherryPosition]);

  const handleSnakeDirectionChange = useCallback((nextDirection: 'up' | 'down' | 'left' | 'right') => {
    setSnakeDirection((currentDirection) => {
      const oppositeMap = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      } as const;

      if (oppositeMap[currentDirection] === nextDirection) {
        return currentDirection;
      }

      return nextDirection;
    });
  }, []);

  useEffect(() => {
    if (snakeGamePhase !== 'playing') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const nextDirection = keyMap[event.key];
      if (nextDirection) {
        event.preventDefault();
        handleSnakeDirectionChange(nextDirection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snakeGamePhase, handleSnakeDirectionChange]);

  useEffect(() => {
    if (snakeGamePhase !== 'playing') return;

    const gameTick = window.setInterval(() => {
      setSnakeSegments((currentSnake) => {
        if (currentSnake.length === 0) {
          return currentSnake;
        }

        const head = currentSnake[0];
        const deltaMap: Record<'up' | 'down' | 'left' | 'right', { x: number; y: number }> = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: 1 },
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 },
        };

        const delta = deltaMap[snakeDirection];
        const nextHead = {
          x: head.x + delta.x,
          y: head.y + delta.y,
        };

        const collidedWithWall = nextHead.x < 0 || nextHead.x >= 16 || nextHead.y < 0 || nextHead.y >= 16;
        const collidedWithSelf = currentSnake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

        if (collidedWithWall || collidedWithSelf) {
          setSnakeGamePhase('over');
          return currentSnake;
        }

        const nextSnake = [nextHead, ...currentSnake];
        const ateCherry = nextHead.x === snakeCherry.x && nextHead.y === snakeCherry.y;

        if (ateCherry) {
          setSnakeGameScore((currentScore) => currentScore + 1);
          setSnakeCherry(getRandomCherryPosition(nextSnake));
          return nextSnake;
        }

        nextSnake.pop();
        return nextSnake;
      });
    }, 150);

    return () => window.clearInterval(gameTick);
  }, [snakeGamePhase, snakeDirection, snakeCherry, getRandomCherryPosition]);

  const closeSnakeGame = useCallback(() => {
    setIsSnakeModalOpen(false);
    setIsButton18Active(false);
    resetSnakeGameState();
  }, [resetSnakeGameState]);

  const handleTopLeftButtonClick = (view: string) => {
    if (!user) {
      alert("You must be logged in to use this feature.");
      return;
    }
    setCenterView(view);
    setMobileSection('front');
  };

  const handleMicrophoneButtonClick = () => {
    const nextMicrophoneState = !areFeatureIconsActive.microphone;
    setAreFeatureIconsActive(prev => ({ ...prev, heart: false, lion: false, microphone: nextMicrophoneState }));
    setCenterView('broadcasts');
    setMobileSection('front');
    setBroadcastView(nextMicrophoneState ? 'UnionRadio#15' : 'MyBroadcasts');
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
      cover_photo_url: user.cover_photo_url || null,
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
  setPhotoEditorPurpose('profile');
};

  const itemsPerPage = 6;
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

  useEffect(() => {
    setSocialPageLeft(0);
    setSocialPageRight(0);
  }, [isMobile]);

  // Retired 10/16/26: the 7000ms promo interval; the bottom promo now rotates through the carousel scheduler.
  const promoImageVisible = useQueuedImageSlot({
    carouselId: 'bottom-promo',
    urls: bottomPromoItems.map(item => item.image_url || ''),
    index: promoIndex,
    setIndex: setPromoIndex,
    paused: !isOpen || isPromoHovered || isPromoAutoplayPaused,
  });

  useEffect(() => () => {
    if (promoPauseTimeoutRef.current !== null) {
      window.clearTimeout(promoPauseTimeoutRef.current);
    }
  }, []);

  const navigatePromo = (direction: 'left' | 'right') => {
    if (!promoCount) return;
    setPromoIndex(index => (index + (direction === 'right' ? 1 : -1) + promoCount) % promoCount);
    setIsPromoAutoplayPaused(true);
    if (promoPauseTimeoutRef.current !== null) {
      window.clearTimeout(promoPauseTimeoutRef.current);
    }
    promoPauseTimeoutRef.current = window.setTimeout(() => {
      promoPauseTimeoutRef.current = null;
      setIsPromoAutoplayPaused(false);
    }, 60_000);
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

  const activateCustomButton = (buttonNumber: number | string, page = customizableButtonPage) => {
    if (typeof buttonNumber === 'string') {
      if (buttonNumber.endsWith('sPreviousPageButton')) setCustomizableButtonPage(Math.max(1, page - 1));
      else if (buttonNumber.endsWith('sNextPageButton')) setCustomizableButtonPage(Math.min(715, page + 1));
      return;
    }
    if ((page === 1 && (buttonNumber === 6 || (buttonNumber === 4 && user?.id !== 1))) ||
      (page === 715 && ((buttonNumber === 9998 && !aboutPage.page.enabled) || (buttonNumber === 9999 && !termsPage.page.enabled)) && user?.is_high_high_high_admin !== 1)) return;
    if (page === 1 && (buttonNumber === 1 || buttonNumber === 7)) {
      if (user) handleTopLeftButtonClick(buttonNumber === 1 ? 'friends' : 'settings');
      return;
    }
    if (buttonNumber === 18) {
      setIsButton18Active(current => {
        setIsSnakeModalOpen(!current);
        return !current;
      });
      return;
    }
    const externalLinks: Record<number, string> = {
      2: 'https://github.com/uminionunion/UminionsWebsite/discussions/13',
      9: 'https://whatsYORstory.com',
      10: 'https://www.facebook.com/share/g/1FMa6xWVmQ/',
      11: 'https://www.facebook.com/share/g/1EfPw4uW8k/',
      12: 'https://www.facebook.com/share/g/1PD9kge6ZL/',
      13: 'https://github.com/uminionunion/UminionsWebsite/discussions/13',
      14: 'https://github.com/uminionunion/UminionsWebsite',
    };
    if (page === 1 && externalLinks[buttonNumber]) {
      window.open(externalLinks[buttonNumber], '_blank', 'noopener,noreferrer');
      return;
    }
    if (page === 715 && (buttonNumber === 9998 || buttonNumber === 9999)) {
      setOpenSitePage(buttonNumber === 9998 ? 'about' : 'terms');
      return;
    }
    if (page === 715 && buttonNumber === 10000) {
      window.open('https://www.uminion.com', '_blank', 'noopener,noreferrer');
      return;
    }
    if (page === 1 && buttonNumber === 8) {
      setAreProfileSurfacesOpaque(prev => !prev);
      return;
    }
    if (page === 1 && [3, 4, 5].includes(buttonNumber)) {
      const key = buttonNumber === 3 ? 'heart' : buttonNumber === 4 ? 'palm' : 'lion';
      const nextState = !areFeatureIconsActive[key];
      setMobileSection('front');
      setAreFeatureIconsActive(prev => ({ ...prev, heart: false, palm: false, lion: false, microphone: false, [key]: nextState }));
      setCenterView('broadcasts');
      setBroadcastView(nextState ? buttonNumber === 3 ? 'UmiMatch#22' : buttonNumber === 4 ? 'Million-Pixel#23' : 'Find-a-Pantry#13' : 'UnionNews#14');
      return;
    }
    if (page === 715 && buttonNumber === 10011 && (user?.id === 1 || user?.id === 2)) {
      setMobileSection('front');
      setCenterView('broadcasts');
      setBroadcastView(current => current === 'Beta-Button-10,011' ? 'UnionNews#14' : 'Beta-Button-10,011');
      return;
    }
    setAreFeatureIconsActive(prev => ({
      ...prev,
      heart: buttonNumber === 3 ? !prev.heart : prev.heart,
      palm: buttonNumber === 4 ? !prev.palm : prev.palm,
      lion: buttonNumber === 5 ? !prev.lion : prev.lion,
      microphone: buttonNumber === 6 ? !prev.microphone : prev.microphone,
      steeringWheel: buttonNumber === 7 ? !prev.steeringWheel : prev.steeringWheel,
      movie: buttonNumber === 15 ? !prev.movie : prev.movie,
    }));
    if (page === 1 && ![3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(buttonNumber)) setIsQuadrantsModalOpen(true);
  };
  const activateBannerButton = (number: number) => {
    if (!Number.isInteger(number) || number < 1 || number > 10000) {
      console.error('[CAROUSELS] Invalid associated button:', number);
      return;
    }
    activateCustomButton(number, number <= 15 ? 1 : Math.floor((number - 16) / 14) + 2);
    if (isMobile) window.requestAnimationFrame(() => {
      const center = document.getElementById('MainUhubFeatureV001ForMyProfileSettingsCenterSection');
      const container = mobileContentRef.current;
      if (center && container) container.scrollTop += center.getBoundingClientRect().top - container.getBoundingClientRect().top;
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div data-mobile-section={mobileSection} data-mobile-trial="branchExpansion001" className={`uhub-dashboard ${areProfileSurfacesOpaque ? 'uhub-profile-surfaces' : 'uhub-profile-surfaces uhub-transparent-mode'} text-foreground w-full h-full flex flex-col relative`} style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
        {unreadStatusError && <p role="alert" className="border-b border-red-700 bg-black px-4 py-2 pr-14 text-sm text-red-400">{unreadStatusError} Message indicators may be out of date.</p>}
        <Button variant="ghost" size="icon" className="hidden md:flex absolute top-4 right-4 z-50 h-8 w-8 p-1 text-white hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff', border: '0', boxShadow: 'none' }} onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
        {isMobile && (
          <header className="uhub-mobile-identity">
            <div className="uhub-mobile-account-row">
              <button type="button" onClick={handleProfileImageClick} aria-label={user ? 'Open my profile' : 'Log in to your account'} className="uhub-mobile-avatar-button">
                <Avatar className="h-12 w-12 border-2 border-orange-400">
                  <AvatarImage src={user?.profile_image_url || '/defaultUminionUassets/defaultUminionUbadge.png'} alt="" className="object-contain" queuePriority={IMAGE_LOAD_PRIORITY.critical} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </button>
              <button type="button" className="uhub-mobile-brand" aria-label="Uminion Union - About Us" onClick={() => setMobileAboutOpen(true)}>Uminion Union</button>
              {user ? <div className="uhub-mobile-username truncate text-xs text-gray-200">{user.username}</div> : <div className="uhub-mobile-inline-auth">
                  <Button type="button" size="sm" onClick={() => onOpenAuthModal('login')}>Log In</Button>
                  <Button type="button" size="sm" className="bg-orange-400 text-black hover:bg-orange-500" onClick={() => onOpenAuthModal('signup')}>Sign Up</Button>
                </div>}
              <SiteWideMuteButton />
              {user && <div className="uhub-mobile-login-status"><AccountStatusButton showLogout={showLogout} onClick={() => { if (showLogout) void logout(); else setShowLogout(true); }} /></div>}
            </div>
            {user && <div className="uhub-mobile-account-actions">
              {user ? <>
                <Button type="button" variant="outline" size="sm" onClick={() => setPhotoEditorPurpose('profile')}>Edit picture</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setPhotoEditorPurpose('cover')}>Change cover</Button>
              </> : null}
            </div>}
            <nav className="uhub-mobile-primary-actions" aria-label="Mobile shortcuts">
              <Button type="button" variant="outline" disabled={!user} onClick={() => setIsHomeModalOpen(true)}><Home /><span>Profile</span></Button>
              <Button type="button" variant="outline" aria-current={mobileSection === 'hub' ? 'page' : undefined} onClick={() => setMobileSection('hub')}><MessageSquare /><span>uHome-Hub</span>{unreadChatrooms.size > 0 && <span className="uhub-mobile-unread" aria-label="Unread chats" />}</Button>
              <Button type="button" variant="outline" onClick={handleMicrophoneButtonClick}><Radio /><span>UnionRadio</span></Button>
              {showTopAnvilFeature
                ? <Button id="uhub-mobile-coming-soon-top" type="button" variant="outline" title="UmiMatch" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }} onClick={() => activateBannerButton(3)}><Heart fill="currentColor" /><span>UmiMatch</span></Button>
                : <Button id="uhub-mobile-coming-soon-top" type="button" variant="outline" disabled><Anvil /><span>Coming Soon</span></Button>}
              <Button type="button" variant="outline" aria-current={mobileSection === 'features' ? 'page' : undefined} onClick={() => setMobileSection('features')}><img src="/uhub/dist/mobile-custom-buttons-logo.png" alt="" className="uhub-custom-buttons-logo exclude-zoom" /><span>10,000</span></Button>
            </nav>
            <div className="uhub-mobile-cover">
              <CoverImageRotator userCoverUrl={user?.cover_photo_url || null} opacity={1} fallbackToDefault onButtonClick={activateBannerButton} appendedItems={mobileBottomBannerItems} />
            </div>
          </header>
        )}
         {/* Top Section */}
         <div className="uhub-dashboard-header md:flex md:flex-row hidden md:p-4 md:border-b md:gap-2" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
           <div className="uhub-mobile-more-intro md:hidden">
             <h2 className="text-xl font-bold">Your 10,000 Customizable-Buttons:</h2>
             <a href={broadcasts['UnionNews#14'].website} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-400 underline">Learn how to code (in less than 5min) for Free—over at our GitHub here</a>
             <div className="uhub-mobile-page-controls">
               <Button type="button" variant="outline" size="icon" aria-label="Previous feature page" disabled={customizableButtonPage === 1} onClick={() => setCustomizableButtonPage(page => Math.max(1, page - 1))}><ChevronLeft className="h-5 w-5" /></Button>
               <label>Page <input aria-label="Feature page" type="number" inputMode="numeric" min={1} max={715} value={customizableButtonPage} onChange={event => { const page = Number(event.target.value); if (Number.isInteger(page) && page >= 1 && page <= 715) setCustomizableButtonPage(page); }} /> of 715</label>
               <Button type="button" variant="outline" size="icon" aria-label="Next feature page" disabled={customizableButtonPage === 715} onClick={() => setCustomizableButtonPage(page => Math.min(715, page + 1))}><ChevronRight className="h-5 w-5" /></Button>
             </div>
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopLeftSection" className={`md:w-1/5 grid grid-cols-4 md:grid-cols-2 grid-rows-1 gap-2 md:pr-4 ${isAdmin ? 'uhub-top-left-admin md:grid-rows-3 md:gap-1' : 'md:grid-rows-2'}`} style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent' }} title="Broadcast" onClick={() => setCenterView('broadcasts')}><Megaphone className="h-4 w-4 mb-1" /> Broadcast</Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent' }} title="HikingToAllStores" onClick={() => setIsQuadrantsModalOpen(true)}>
               <Mountain className="h-4 w-4 mb-1" /> Stores
             </Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent' }} onClick={handleMicrophoneButtonClick} title="Microphone" aria-label="Microphone">
               <span className="text-2xl leading-none">{areFeatureIconsActive.microphone ? '✌︎' : '🎙'}</span>
               <span className="text-xs leading-none">UnionRadio</span>
             </Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent' }} title="Home" onClick={() => {
               if (!user) {
                 alert("You must be logged in to use this feature.");
                 return;
               }
               setIsHomeModalOpen(true);
             }} disabled={!user}><Home className="h-4 w-4 mb-1" /> Home</Button>
             {isAdmin && <>
               <AdminHubButton className="flex h-full min-h-0 flex-col gap-0 px-1 py-0 text-xs" onClick={() => setIsAdminHubOpen(true)} />
               <Button id="uhub-admin-coming-soon" type="button" variant="outline" className="flex flex-col h-full min-h-0 items-center justify-center gap-0 px-1 py-0 text-xs text-white bg-transparent border-gray-700" style={{ color: '#ffffff', backgroundColor: 'transparent' }} title="Admin Coming Soon" disabled><Anvil className="h-4 w-4" /> Admin Coming Soon</Button>
             </>}
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopMiddleSection" className="md:w-2/5 h-32 md:h-40 bg-cover bg-center rounded-md relative overflow-hidden" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent', backgroundImage: 'none' }}>
             {!isMobile && <CoverImageRotator userCoverUrl={user?.cover_photo_url || null} opacity={areProfileSurfacesOpaque ? 1 : 0.5} onButtonClick={activateBannerButton} />}
             {user && <Button className="absolute bottom-2 right-2" size="sm" onClick={() => setPhotoEditorPurpose('cover')}>Change Cover</Button>}
           </div>

            {/* 8-Button Grid - SMALLER BUTTONS - HIDDEN ON MOBILE */}
<div className="uhub-feature-pages hidden md:flex md:w-1/4 justify-center items-center md:pl-4" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
  <div
    ref={customButtonPageScrollRef}
    onScroll={(event) => {
      const scrollPage = Math.round(event.currentTarget.scrollTop / customButtonPageHeight) + 1;
      if (isMobile && scrollPage !== customizableButtonPage) customButtonScrollDrivenRef.current = true;
      setCustomizableButtonPage(Math.max(1, Math.min(715, scrollPage)));
    }}
    className="w-fit overflow-y-auto overflow-x-hidden"
    style={{
      maxHeight: `${customButtonPageHeight}px`,
      scrollSnapType: isMobile ? 'none' : 'y mandatory',
      scrollbarColor: '#6b7280 transparent',
      scrollbarWidth: 'auto',
    }}
    aria-label="Custom button pages"
  >
    <div style={{ height: `${customButtonPageHeight * 715}px`, position: 'relative' }}>
  <div className="grid grid-cols-4 gap-1 w-fit" style={{ position: 'sticky', top: 0, scrollSnapAlign: 'start' }}>
    {customizableButtonPage === 1 && <>
    <Button
      variant="outline"
      size="sm"
      className="flex flex-col items-center justify-center h-8 w-12 gap-0 text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white"
      style={{ color: '#ffffff', backgroundColor: 'transparent' }}
      onClick={() => handleTopLeftButtonClick('friends')}
      title="Friends"
      disabled={!user}
    >
      {pendingFriendRequests.length > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />}
      <Users className="h-5 w-5" />
      <span>Friends</span>
    </Button>
    <a href="https://github.com/uminionunion/UminionsWebsite/discussions/13" target="_blank" rel="noopener noreferrer" className="w-12 h-8">
      <Button
        variant="outline"
        size="sm"
        className="flex flex-col items-center justify-center h-8 w-12 gap-0 text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white"
        style={{ color: '#ffffff', backgroundColor: 'transparent' }}
        title="Code"
      >
        <Code className="h-5 w-5" />
        <span>Code</span>
      </Button>
    </a>
    </>}
    {(customizableButtonPage === 1
      ? [9, 10, 3, 4, 11, 12, 5, 6, 13, 14, 7, 8, 15, CustomButtonsPage001sNextPageButton]
      : customizableButtonPage === 2
        ? [16, 17, 23, 24, 18, 19, 25, 26, 20, 21, 27, 28, CustomButtonsPage002sPreviousPageButton, 22, 29, CustomButtonsPage002sNextPageButton]
        : customizableButtonPage === 3
          ? [30, 31, 37, 38, 32, 33, 39, 40, 34, 35, 41, 42, CustomButtonsPage003sPreviousPageButton, 36, 43, CustomButtonsPage003sNextPageButton]
          : customizableButtonPage === 4
            ? [44, 45, 51, 52, 46, 47, 53, 54, 48, 49, 55, 56, CustomButtonsPage004sPreviousPageButton, 50, 57, CustomButtonsPage004sNextPageButton]
            : customizableButtonPage === 5
              ? [58, 59, 65, 66, 60, 61, 67, 68, 62, 63, 69, 70, CustomButtonsPage005sPreviousPageButton, 64, 71, CustomButtonsPage005sNextPageButton]
              : customizableButtonPage === 6
                ? [72, 73, 79, 80, 74, 75, 81, 82, 76, 77, 83, 84, CustomButtonsPage006sPreviousPageButton, 78, 85, CustomButtonsPage006sNextPageButton]
                : customizableButtonPage === 7
                  ? [86, 87, 93, 94, 88, 89, 95, 96, 90, 91, 97, 98, CustomButtonsPage007sPreviousPageButton, 92, 99, CustomButtonsPage007sNextPageButton]
                  : hardCodedCustomButtonPages[customizableButtonPage]
    ).map((buttonNumber) => (
      buttonNumber === null ? (
        <span key={`empty-custom-button-${customizableButtonPage}`} className="h-8 w-12" />
      ) : customizableButtonPage === 1 && buttonNumber === 7 ? (
      <Button
        key="settings"
        variant="outline"
        size="sm"
        className="flex flex-col items-center justify-center h-8 w-12 gap-0 text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white"
        style={{ color: '#ffffff', backgroundColor: 'transparent' }}
        onClick={() => handleTopLeftButtonClick('settings')}
        title="Settings"
        aria-label="Settings"
        disabled={!user}
      >
        <Settings className="h-5 w-5" />
      </Button>
      ) : (
      <Button
        key={buttonNumber}
        variant="outline"
        size="sm"
        className={`flex flex-col items-center justify-center h-8 w-12 gap-0 text-xs text-white border-gray-700 hover:bg-gray-700 hover:text-white ${customizableButtonPage === 1 && [6, 15].includes(buttonNumber) ? 'opacity-50 cursor-not-allowed' : ''} ${customizableButtonPage === 1 && buttonNumber === 4 && user?.id !== 1 ? 'opacity-50 cursor-not-allowed' : ''} ${typeof buttonNumber === 'number' && buttonNumber >= 10001 && buttonNumber <= 10012 ? 'text-[0.65rem] text-gray-500 opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
        style={{
          color: '#ffffff',
          backgroundColor: buttonNumber === 18 && isButton18Active
            ? '#22c55e'
            : customizableButtonPage === 1 && buttonNumber === 3 && areFeatureIconsActive.heart
              ? '#dc2626'
              : customizableButtonPage === 1 && buttonNumber === 4 && areFeatureIconsActive.palm
                ? '#facc15'
                : customizableButtonPage === 1 && buttonNumber === 5
                  ? '#2563eb'
                  : 'transparent',
          borderColor: buttonNumber === 18
            ? isButton18Active ? '#22c55e' : '#374151'
            : undefined,
          boxShadow: buttonNumber === 18 && isButton18Active ? '0 0 0 2px rgba(34, 197, 94, 0.45)' : 'none',
        }}
        onClick={() => activateCustomButton(buttonNumber)}
        disabled={(customizableButtonPage === 715 && ((buttonNumber === 9998 && !aboutPage.page.enabled) || (buttonNumber === 9999 && !termsPage.page.enabled)) && user?.is_high_high_high_admin !== 1) || (typeof buttonNumber === 'number' && buttonNumber >= 10001 && buttonNumber <= 10012 && !(customizableButtonPage === 715 && buttonNumber === 10011 && (user?.id === 1 || user?.id === 2))) || (customizableButtonPage === 1 && (buttonNumber === 4 && user?.id !== 1 || buttonNumber === 6))}
        title={typeof buttonNumber === 'string' && buttonNumber.endsWith('sPreviousPageButton')
          ? 'Previous button page'
          : typeof buttonNumber === 'string' && buttonNumber.endsWith('sNextPageButton')
            ? 'Next button page'
            : customizableButtonPage === 1 && buttonNumber === CustomButtonsPage001sNextPageButton
          ? 'Next button page'
            : customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sPreviousPageButton
              ? 'Previous button page'
              : customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sNextPageButton
                ? 'Next button page'
                : customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sPreviousPageButton
                  ? 'Previous button page'
                  : customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sNextPageButton
                    ? 'Next button page'
                  : customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sPreviousPageButton
                    ? 'Previous button page'
                  : customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sNextPageButton
                    ? 'Next button page'
                  : customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sPreviousPageButton
                    ? 'Previous button page'
                  : customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sNextPageButton
                    ? 'Next button page'
                  : customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sPreviousPageButton
                    ? 'Previous button page'
                  : customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sNextPageButton
                    ? 'Next button page'
                  : customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sPreviousPageButton
                    ? 'Previous button page'
                  : customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sNextPageButton
                    ? 'Next button page'
                : customizableButtonPage === 1 && buttonNumber === 8
              ? 'Toggle transparency'
              : `Custom ${buttonNumber}`}
      >
        <span className={customizableButtonPage === 1 && [3, 4, 5, 6, 7, 8, 15, 16].includes(buttonNumber) ? 'text-[1.5625rem] leading-none' : 'text-xl leading-none'}>
          {buttonNumber === 18 ? (isButton18Active ? '𓆗' : '𓆙') :
            customizableButtonPage === 1 && buttonNumber === 3 ? <Heart fill={areFeatureIconsActive.heart ? 'currentColor' : 'none'} /> :
            customizableButtonPage === 1 && buttonNumber === 4 ? (areFeatureIconsActive.palm ? <Skull /> : <TreePalm />) :
            customizableButtonPage === 1 && buttonNumber === 5 ? (areFeatureIconsActive.lion ? '𓃮' : '𓃭') :
            customizableButtonPage === 1 && buttonNumber === 6 ? <ShipWheel /> :
            customizableButtonPage === 1 && buttonNumber === 7 ? (areFeatureIconsActive.steeringWheel ? <Ship /> : <ShipWheel />) :
            customizableButtonPage === 1 && buttonNumber === 8 ? <Star fill={areProfileSurfacesOpaque ? 'none' : 'currentColor'} /> :
            customizableButtonPage === 1 && buttonNumber === 9 ? <BookOpen /> :
            customizableButtonPage === 1 && buttonNumber === 10 ? '🐃' :
            customizableButtonPage === 1 && buttonNumber === 11 ? '🦬' :
            customizableButtonPage === 1 && buttonNumber === 12 ? '🦣' :
            customizableButtonPage === 1 && buttonNumber === 13 ? <KeyRound /> :
            customizableButtonPage === 1 && buttonNumber === 14 ? <Wrench /> :
            customizableButtonPage === 1 && buttonNumber === 15 ? (areFeatureIconsActive.movie ? <ImageIcon /> : <Projector />) :
            customizableButtonPage === 1 && buttonNumber === CustomButtonsPage001sNextPageButton ? <SkipForward /> :
            customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sPreviousPageButton ? <SkipBack /> :
            customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sNextPageButton ? <SkipForward /> :
            customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sPreviousPageButton ? <SkipBack /> :
            customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sNextPageButton ? <SkipForward /> :
            customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sPreviousPageButton ? <SkipBack /> :
            customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sNextPageButton ? <SkipForward /> :
            customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sPreviousPageButton ? <SkipBack /> :
            customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sNextPageButton ? <SkipForward /> :
            customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sPreviousPageButton ? <SkipBack /> :
            customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sNextPageButton ? <SkipForward /> :
            customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sPreviousPageButton ? <SkipBack /> :
            customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sNextPageButton ? <SkipForward /> :
            typeof buttonNumber === 'string' && buttonNumber.endsWith('sPreviousPageButton') ? <SkipBack /> :
            typeof buttonNumber === 'string' && buttonNumber.endsWith('sNextPageButton') ? <SkipForward /> :
            customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sNextPageButton ? <SkipForward /> :
            customizableButtonPage === 715 && buttonNumber === 9998 ? <GroupIcon /> :
            customizableButtonPage === 715 && buttonNumber === 9999 ? <GroupIcon withChat /> :
            customizableButtonPage === 715 && buttonNumber === 10000 ? '🐾' : buttonNumber}
        </span>
      </Button>
      )
    ))}
  </div>
    </div>
  </div>
</div>

          {/* Avatar (this is apparently how to modify avatar for users default image(? and then some? or thats it?) EXTRA EXTRA QUEST Do i want to remove avatar fallback)*/}
<div id="MainUhubFeatureV001ForMyProfileSettingsTopRightSection" className="md:w-1/5 flex justify-center md:justify-end items-start md:pl-4 relative" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
  <div onClick={handleProfileImageClick} className="cursor-pointer relative group">
    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-orange-400 group-hover:border-orange-600 transition">
      <AvatarImage
        src={user?.profile_image_url || "/defaultUminionUassets/defaultUminionUbadge.png"}
        alt="Profile"
        className="object-contain"
        style={{ opacity: areProfileSurfacesOpaque ? 1 : 0.5 }}
        queuePriority={IMAGE_LOAD_PRIORITY.critical}
      />
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
      {user ? <AccountStatusButton showLogout={showLogout} onClick={() => { if (showLogout) void logout(); else setShowLogout(true); }} /> : <div className="flex gap-1"><Button size="sm" className="h-7 text-xs" onClick={() => onOpenAuthModal('login')}>Log In</Button><Button size="sm" className="h-7 text-xs bg-orange-400 hover:bg-orange-500 text-black" onClick={() => onOpenAuthModal('signup')}>Sign Up</Button></div>}
  </div>
</div>
         </div>

        
  {isMobile && (
    <nav className="uhub-mobile-navigation" aria-label="Mobile sections">
      <button type="button" aria-current={mobileSection === 'front' ? 'page' : undefined} onClick={() => { setMobileSection('front'); setCenterView('broadcasts'); setBroadcastView('UnionNews#14'); }}><Megaphone /><span>Front Page</span></button>
      <button type="button" aria-current={mobileSection === 'stores' ? 'page' : undefined} onClick={() => setMobileSection('stores')}><ShoppingCart /><span>Stores</span></button>
      {showBottomAnvilFeature
        ? <button id="uhub-mobile-coming-soon-footer" type="button" title="Find a Pantry" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff' }} onClick={() => activateBannerButton(5)}><span className="uhub-mobile-lion-icon" aria-hidden="true">𓃮</span><span>Find a Pantry</span></button>
        : <button id="uhub-mobile-coming-soon-footer" type="button" disabled><Anvil /><span>Coming Soon</span></button>}
      <button type="button" aria-current={mobileSection === 'more' ? 'page' : undefined} onClick={() => setMobileSection('more')}><MoreHorizontal /><span>More</span></button>
    </nav>
  )}



        {/* Center Section */}
  <div ref={mobileContentRef} className="uhub-dashboard-main flex-grow flex overflow-hidden" data-profile-main-container style={{ display: isMobile && mobileSection === 'features' ? 'none' : 'flex', flexDirection: isMobile ? 'column' : 'row', backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
  {isMobile && mobileSection === 'more' && <div className="uhub-mobile-more-menu">
    <h2 className="text-xl font-bold">More</h2>
  </div>}
  {/* LEFT SECTION - ONLY SHOW IF NOT COLLAPSED */}
  {(isMobile ? mobileSection === 'hub' : !isLeftSectionCollapsed) && (
    <>
      <div id="MainUhubFeatureV001ForMyProfileSettingsCenterLeftSection" className="md:border-r overflow-y-auto p-2 md:p-4 text-white" style={{ width: isMobile ? '100%' : `${leftWidthDesktop}%`, backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
        <RotatingUnionEventCard />
        <h3 className="text-center font-bold mb-2 md:mb-4 text-xs md:text-base">uHome-Hub:</h3>
        <div className="grid grid-cols-2 gap-1 md:gap-2">
          {MainUhubFeatureV001ForUHomeHubButtons.map(num => {
            const hubButton = uHomeHubButtonSettings.find(button => button.number === num);
            const hubLabel = `#${String(num).padStart(2, '0')}`;
            const hubTitle = hubButton?.title?.trim() || '';
            return (
              <div key={num} className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:h-auto h-6 text-xs w-full text-white border-gray-700 hover:bg-gray-700 hover:text-white"
                  style={{
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    borderColor: '#374151',
                    boxShadow: 'none',
                    ...(hubButton?.image_url ? { backgroundImage: `url("${hubButton.image_url}")`, backgroundSize: 'cover', backgroundPosition: 'center', textShadow: '0 1px 3px #000' } : {}),
                  }}
                  title={hubTitle ? `${hubLabel} ${hubTitle}` : undefined}
                  data-uhome-hub-button={num}
                  onClick={() => handleUHomeHubClick(num)}
                >
                  <span className="truncate">{hubTitle || hubLabel}</span>
                </Button>
                
                {/* Green unread message badge */}
                {unreadChatrooms.has(num) && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-green-600 z-10"></div>
                )}
              </div>
            );
          })}
        </div>
        {!isMobile && <div className="mt-4"><HeaderProductCarousel /></div>}
      </div>
      
      {/* LEFT DIVIDER - ONLY SHOW IF LEFT NOT COLLAPSED (DESKTOP ONLY) */}
{!isMobile && (
  <div
    className="w-1 bg-gray-500 hover:bg-orange-400 cursor-col-resize transition-colors active:bg-orange-400"
    onMouseDown={() => setLeftDividerDragging(true)}
    onTouchStart={() => setLeftDividerDragging(true)}
  />
)}
    </>
  )}

  {/* CENTER SECTION is it this one? */}
  <div id="MainUhubFeatureV001ForMyProfileSettingsCenterSection" className="p-2 md:p-4 overflow-y-auto text-white" style={{ 
    width: isMobile ? '100%' : `${centerWidthDesktop}%`,
    display: isMobile && mobileSection !== 'front' ? 'none' : 'flex',
    flexDirection: 'column',
    backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent'
  }}>
    {isDesktopCartOpen
      ? <MainCartView isLoggedIn={Boolean(user)} onClose={closeMainCart} closeLabel="Close cart and return to the MemeBox" onViewProduct={(product) => { setSelectedProduct(product); setProductDetailModalOpen(true); }} />
      : renderCenterContent()}
  </div>

  {/* RIGHT DIVIDER - ONLY SHOW IF RIGHT NOT COLLAPSED */}
{!isRightSectionCollapsed && !isMobile && (
  <div
    className="w-1 bg-gray-500 hover:bg-orange-400 cursor-col-resize transition-colors active:bg-orange-400"
    onMouseDown={() => setRightDividerDragging(true)}
    onTouchStart={() => setRightDividerDragging(true)}
  />
)}

  {/* RIGHT SECTION - ONLY SHOW IF NOT COLLAPSED */}
  {(isMobile ? mobileSection === 'stores' : !isRightSectionCollapsed) && (
    <div id="MainUhubFeatureV001ForMyProfileSettingsCenterRightSection" className="md:border-l overflow-y-auto p-2 md:p-4 text-white" style={{ 
      width: isMobile ? '100%' : `${rightWidthDesktop}%`,
      borderTop: isMobile ? '1px solid #374151' : 'none',
      backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent'
    }}>
      {isMobile && <div className="uhub-mobile-store-actions">
        <h2 className="text-xl font-bold">Stores</h2>
        <Button type="button" variant="outline" onClick={() => setIsQuadrantsModalOpen(true)}><Mountain className="mr-2 h-4 w-4" />Browse All Stores</Button>
      </div>}
      {isMobile && <div className="uhub-mobile-stores-carousel mb-4"><HeaderProductCarousel /></div>}
      <div className="flex items-center justify-center mb-2 md:mb-4 bg-black uhub-right-store-header">
        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => navigateCenterRight('left')}><ChevronLeft className="h-4 w-4" /></Button>
        <h3 className="text-center font-bold mx-1 md:mx-2 text-xs md:text-base text-white">{centerRightView.displayName}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => navigateCenterRight('right')}><ChevronRight className="h-4 w-4" /></Button>
        {centerRightView.number === 19 && <Button variant="outline" size="sm" className={`h-7 ml-1 border-white text-xs ${isPoliticFilterPressed ? 'bg-blue-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`} onClick={() => { setPoliticFilterOpen(open => !open); setPoliticFilterPressed(true); window.setTimeout(() => setPoliticFilterPressed(false), 220); }}>Filter</Button>}
      </div>
      <div className="space-y-1 md:space-y-4">
        {renderCenterRightContent()}
      </div>
    </div>
  )}
</div>

          {/* Bottom Section */}
          <div role={isMobile ? 'navigation' : undefined} aria-label={isMobile ? 'More options' : undefined} data-mobile-expanded={mobileFooterOpen} className="uhub-dashboard-footer flex border-t md:h-auto h-12">
            {isMobile && <button type="button" className="uhub-mobile-footer-toggle uhub-mobile-friends-row" disabled={!user} onClick={() => handleTopLeftButtonClick('friends')}>
              <span>Friends{pendingFriendRequests.length > 0 && <span className="ml-2 text-orange-400">{pendingFriendRequests.length}</span>}</span>
              <ChevronUp className="h-4 w-4" />
            </button>}
            {isMobile && <button type="button" className="uhub-mobile-footer-toggle" aria-expanded={mobileFooterOpen} onClick={() => setMobileFooterOpen(open => !open)}>
              Social Links & Promotions
              {mobileFooterOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>}
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomLeftSection" className="w-[20%] p-1 md:p-2 border-r flex items-center">
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavLeft('left')}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="flex-grow hidden md:grid grid-cols-3 gap-0.5 md:gap-2 place-items-center">
                {socialLinkPagesLeft[socialPageLeft].map(link => (
                  <div key={link.id} className={typeof link.icon === 'string' ? 'text-base font-semibold leading-none' : 'text-xs md:text-xs'}>
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <div className="flex-grow md:hidden flex justify-center items-center">
                {socialLinkPagesLeft[socialPageLeft].map(link => (
                  <div key={link.id} className="text-2xl">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavLeft('right')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div
              id="MainUhubFeatureV001ForMyProfileSettingsBottomCenterSection"
              className="relative w-[60%] p-1 md:p-2 flex items-center justify-center overflow-hidden"
              onMouseEnter={() => setIsPromoHovered(true)}
              onMouseLeave={() => setIsPromoHovered(false)}
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous promotion"
                className="absolute left-[11px] z-10 h-7 w-7 border-gray-700 bg-black text-white hover:bg-gray-700 hover:text-white"
                onClick={() => navigatePromo('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {activeBottomPromo ? (
                <div className="flex h-[100px] w-full items-center justify-center gap-2 px-9">
                  {promoImageVisible && activeBottomPromo.image_url && (activeBottomPromo.button_number
                    ? <button type="button" className={`uhub-banner-action relative h-[100px] ${activeBottomPromo.title ? 'max-w-[50%]' : 'w-full max-w-none'}`} aria-label={`Open button ${activeBottomPromo.button_number}`} onClick={() => { if (activeBottomPromo.button_number != null) activateBannerButton(activeBottomPromo.button_number); }}><QueuedImage key={activeBottomPromo.image_url} src={activeBottomPromo.image_url} alt={activeBottomPromo.title || 'Promotion'} className={activeBottomPromo.title ? 'h-[100px] max-w-full rounded object-cover' : 'h-[100px] w-full max-w-none rounded object-cover'} queuePriority={IMAGE_LOAD_PRIORITY.critical} retainInCache /></button>
                    : <QueuedImage key={activeBottomPromo.image_url} src={activeBottomPromo.image_url} alt={activeBottomPromo.title || 'Promotion'} className={activeBottomPromo.title ? 'h-[100px] max-w-[50%] rounded object-cover' : 'h-[100px] w-full max-w-none rounded object-cover'} queuePriority={IMAGE_LOAD_PRIORITY.critical} retainInCache />)}
                  {activeBottomPromo.title && (activeBottomPromo.website
                    ? <a href={activeBottomPromo.website} target="_blank" rel="noopener noreferrer" className="text-center text-orange-400 hover:underline text-xs md:text-sm" style={activeBottomPromoStyle}>{activeBottomPromo.title}</a>
                    : <span className="text-center text-white text-xs md:text-sm" style={activeBottomPromoStyle}>{activeBottomPromo.title}</span>)}
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next promotion"
                className="absolute right-[11px] z-10 h-7 w-7 border-gray-700 bg-black text-white hover:bg-gray-700 hover:text-white"
                onClick={() => navigatePromo('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomRightSection" className="w-[20%] p-1 md:p-2 border-l flex items-center">
               <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavRight('left')}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="flex-grow hidden md:grid grid-cols-3 gap-0.5 md:gap-2 place-items-center">
                {socialLinkPagesRight[socialPageRight].map(link => (
                  <div key={link.id} className={typeof link.icon === 'string' ? 'text-base font-semibold leading-none' : 'text-xs md:text-xs'}>
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <div className="flex-grow md:hidden flex justify-center items-center">
                {socialLinkPagesRight[socialPageRight].map(link => (
                  <div key={link.id} className="text-2xl">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavRight('right')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            {isMobile && <button type="button" className="uhub-mobile-footer-toggle uhub-mobile-close-row" onClick={onClose}>
              Close uHub
              <X className="h-4 w-4" />
            </button>}
          </div>
        </div>

      
        {isMobile && mobileAboutOpen && <SitePageModal pageKey="about" isAdmin={user?.is_high_high_high_admin === 1} onClose={() => setMobileAboutOpen(false)} onChanged={() => aboutPage.reload()} introduction={<div className="uhub-mobile-about-introduction">
          <WelcomeDescription fallback={broadcasts['UnionNews#14'].description} className="text-sm text-white" />
          <a href={broadcasts['UnionNews#14'].website} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline">Learn how to code (in less than 5min) for Free—over at our GitHub here</a>
        </div>} />}
        {openSitePage && (
          <SitePageModal
            pageKey={openSitePage}
            isAdmin={user?.is_high_high_high_admin === 1}
            onClose={() => setOpenSitePage(null)}
            onChanged={() => { aboutPage.reload(); termsPage.reload(); }}
          />
        )}

        {isSnakeModalOpen && (
          <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/75 p-4">
            <div className="relative z-[2147483647] w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#0b0b0f] p-4 shadow-2xl shadow-green-500/30">
              <button
                type="button"
                onClick={closeSnakeGame}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-xl font-bold text-white ring-1 ring-white/20 transition hover:bg-gray-800"
                aria-label="Close snake game"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex items-center justify-between gap-3 pr-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-green-400">uHub Arcade</p>
                  <h2 className="text-2xl font-black text-white">Snake Game</h2>
                </div>
                <div className="rounded-full border border-green-400/40 bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-300">
                  Score: {snakeGameScore}
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400" />
                  Eat the cherry. Don&apos;t hit the wall or yourself.
                </div>
                {snakeGamePhase !== 'playing' && (
                  <Button
                    type="button"
                    onClick={startSnakeGame}
                    className="bg-green-500 text-black hover:bg-green-400"
                  >
                    Play a Snake Game?
                  </Button>
                )}
              </div>

              <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center">
                <div
                  className="grid gap-[2px] rounded-xl border border-white/10 bg-[#111827] p-2"
                  style={{
                    gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
                    width: '100%',
                    maxWidth: '420px',
                    aspectRatio: '1 / 1',
                  }}
                >
                  {Array.from({ length: 16 * 16 }, (_, index) => {
                    const x = index % 16;
                    const y = Math.floor(index / 16);
                    const isHead = snakeSegments[0]?.x === x && snakeSegments[0]?.y === y;
                    const isBody = snakeSegments.some((segment, segmentIndex) => segmentIndex > 0 && segment.x === x && segment.y === y);
                    const isCherry = snakeCherry.x === x && snakeCherry.y === y;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className="rounded-[3px]"
                        style={{
                          backgroundColor: isHead
                            ? '#22c55e'
                            : isBody
                              ? '#86efac'
                              : isCherry
                                ? '#f43f5e'
                                : '#1f2937',
                          boxShadow: isCherry ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>

                {snakeGamePhase === 'over' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/70 p-4">
                    <div className="w-full max-w-[280px] rounded-xl border border-red-500/40 bg-[#111827] p-4 text-center shadow-lg shadow-red-500/20">
                      <p className="text-sm uppercase tracking-[0.2em] text-red-300">Game Over</p>
                      <p className="mt-2 text-xl font-bold text-white">Score: {snakeGameScore}</p>
                      <Button
                        type="button"
                        onClick={startSnakeGame}
                        className="mt-4 w-full bg-red-500 text-white hover:bg-red-400"
                      >
                        Play again?
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => handleSnakeDirectionChange('left')}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-gray-800 text-2xl font-bold text-white"
                  aria-label="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleSnakeDirectionChange('right')}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-gray-800 text-2xl font-bold text-white"
                  aria-label="Move right"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}

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
        {isMainCartOpen && isMobile && (
          <div className="uhub-main-cart-modal fixed inset-0 z-[100000] flex items-center justify-center bg-black bg-opacity-70" onClick={() => setIsMainCartOpen(false)}>
            <div className="bg-background border rounded-lg p-4 w-[95%] max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" aria-label="Your cart" onClick={event => event.stopPropagation()}>
              <MainCartView isLoggedIn={Boolean(user)} onClose={closeMainCart} closeLabel="Close cart" onViewProduct={(product) => { setSelectedProduct(product); setProductDetailModalOpen(true); }} />
            </div>
          </div>
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
  storeProducts={storeProducts}
  setSelectedProduct={setSelectedProduct}
  setProductDetailModalOpen={setProductDetailModalOpen}
  setAddProductModalOpen={setAddProductModalOpen}
  allProductsForAdmin={allProductsForAdmin}
  everythingProducts={everythingProducts}
  loadStoreProducts={loadStoreProducts}
  loadingStoreIds={loadingStoreIds}
  storeProductErrors={storeProductErrors}
  loadEverythingProducts={loadEverythingProducts}
  isLoadingEverythingProducts={isLoadingEverythingProducts}
  everythingProductsError={everythingProductsError}
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



{user?.is_high_high_high_admin === 1 && isAdminHubOpen && (
  <AdminHubModal
    welcomeFallback={broadcasts['UnionNews#14'].description}
    onClose={() => setIsAdminHubOpen(false)}
    onOpenUnionNews14Modal={() => setIsUnionNews14ModalOpen(true)}
    onOpenManagedCarouselAdmin={setManagedCarouselAdminSlot}
  />
)}

{user?.is_high_high_high_admin === 1 && (
  <ManagedCarouselAdminModal slot={managedCarouselAdminSlot} onClose={() => setManagedCarouselAdminSlot(null)} />
)}

{photoEditorPurpose && user && (
  <ProfilePhotoEditor
    key={`${user.id}-${photoEditorPurpose}`}
    userId={user.id}
    purpose={photoEditorPurpose}
    currentImageUrl={photoEditorPurpose === 'profile' ? user.profile_image_url : user.cover_photo_url}
    onClose={() => setPhotoEditorPurpose(null)}
    onSaved={() => {
      setPhotoSuccess(photoEditorPurpose);
      setPhotoEditorPurpose(null);
    }}
  />
)}
{photoSuccess && <ProfilePhotoSuccessToast purpose={photoSuccess} onDismiss={dismissPhotoSuccess} />}



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
              setUnionNews14Images(data);
            } else {
              throw new Error('Invalid carousel image response');
            }
          } else {
            throw new Error('Failed to refresh carousel images after upload');
          }
        } catch (error) {
          console.error('[PROFILE MODAL] Error re-fetching images:', error);
        }
      };
      
      void fetchUpdatedImages();
    }}
  />
)}


      {activeChatModal !== null && (
        <MainUhubFeatureV001ForChatModal
          isOpen
          onClose={handleCloseChatModal}
          pageName={MainUhubFeatureV001ForSisterUnionPages[activeChatModal - 1]}
          backgroundColor={MainUhubFeatureV001ForModalColors[activeChatModal - 1]}
          modalNumber={activeChatModal}
        />
      )}

 {/* Broadcast Carousel Zoom Modal - ONLY for carousel images */}
      {broadcastZoomState.isOpen && (
        <BroadcastCarouselZoomModal
          key={broadcastZoomState.imageUrl}
          imageUrl={broadcastZoomState.imageUrl}
          title={broadcastZoomState.title}
          onClose={() => setBroadcastZoomState(prev => ({ ...prev, isOpen: false }))}
        />
      )}


      
      
        <HomeModal 
          isOpen={isHomeModalOpen}
          onClose={() => setIsHomeModalOpen(false)}
          userProducts={userStoreProducts}
          user={user}
        />
    </>
    );
  };

export default MainUhubFeatureV001ForMyProfileModal;

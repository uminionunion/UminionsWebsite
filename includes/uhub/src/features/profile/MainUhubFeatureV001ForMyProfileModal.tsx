import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play, X, Mountain, Home, ChevronDown, ChevronUp, Trash2, Anvil, Pencil } from 'lucide-react';
import MainUhubFeatureV001ForChatModal from '../uminion/MainUhubFeatureV001ForChatModal';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedFeed } from '../../hooks/usePaginatedFeed';
import FeedEntryCard from './FeedEntryCard';
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
import { additionalHardCodedCustomButtonPages } from './additional-hard-coded-custom-button-pages';
import { TheFoodPantryFeature } from '../../../../pantry-finder/src/pages/pantry-feature/the-food-pantry-feature';
import { pantryApiUrl } from '@/lib/api';
import 'leaflet/dist/leaflet.css';



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
        <div className="flex gap-2"><div className="h-16 w-16 shrink-0 bg-gray-800">{candidate.image_url && <img src={candidate.image_url} alt={candidate.name} className="h-full w-full object-cover" />}</div><div className="min-w-0"><h4 className="font-semibold truncate">{candidate.name}</h4><p className="text-xs text-muted-foreground">{[candidate.country, candidate.state, candidate.office].filter(Boolean).join(' | ')}</p>{candidate.website && <a href={candidate.website} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:underline break-all">Website</a>}</div></div>
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

const UnionRadioPlayer = () => {
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
    checkingScheduleRef.current = true;
    try {
      const response = await fetch('/api/episodes/scheduled', { credentials: 'include' });
      if (!response.ok) return;
      const { episode } = await response.json();
      if (episode) {
        setMediaIndex(0);
        setNowPlaying(episode);
      }
    } finally {
      checkingScheduleRef.current = false;
    }
  }, [nowPlaying]);

  useEffect(() => {
    findDueEpisode();
    const interval = window.setInterval(findDueEpisode, 15000);
    return () => window.clearInterval(interval);
  }, [findDueEpisode]);

  useEffect(() => {
    loadArchive(archiveMode);
  }, [archiveMode, loadArchive]);

  useEffect(() => {
    loadCalendar();
    const interval = window.setInterval(loadCalendar, 30000);
    return () => window.clearInterval(interval);
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
        <img src="/EmojisForUminionWebsite/GreenEmoji004CommentOrChat.png" alt="Comments" className="h-4 w-4" />
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
              <video key={`${nowPlaying.id}-${media.id}`} ref={playerRef as React.RefObject<HTMLVideoElement>} className={`w-full max-h-[420px] bg-black ${replayEpisode ? 'hidden' : ''}`} controls autoPlay={!replayEpisode} playsInline onEnded={handleMediaEnded}>
                <source src={media.media_url} />
              </video>
            ) : (
              <audio key={`${nowPlaying.id}-${media.id}`} ref={playerRef as React.RefObject<HTMLAudioElement>} className={replayEpisode ? 'hidden' : 'w-full'} controls autoPlay={!replayEpisode} onEnded={handleMediaEnded}>
                <source src={media.media_url} />
              </audio>
            )}
            {replayMedia && (replayMedia.media_type === 'video' ? (
              <video key={`replay-${replayEpisode.id}-${replayMedia.id}`} ref={replayPlayerRef as React.RefObject<HTMLVideoElement>} className="w-full max-h-[420px] bg-black" controls autoPlay playsInline onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></video>
            ) : (
              <audio key={`replay-${replayEpisode.id}-${replayMedia.id}`} ref={replayPlayerRef as React.RefObject<HTMLAudioElement>} className="w-full" controls autoPlay onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></audio>
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
              <video key={`replay-${replayEpisode.id}-${replayMedia.id}`} ref={replayPlayerRef as React.RefObject<HTMLVideoElement>} className="w-full max-h-[420px] bg-black" controls autoPlay playsInline onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></video>
            ) : (
              <audio key={`replay-${replayEpisode.id}-${replayMedia.id}`} ref={replayPlayerRef as React.RefObject<HTMLAudioElement>} className="w-full" controls autoPlay onEnded={handleReplayEnded}><source src={replayMedia.media_url} /></audio>
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
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openComments(episode)} title={`View comments for ${episode.name}`}><img src="/EmojisForUminionWebsite/GreenEmoji004CommentOrChat.png" alt="Comments" className="h-4 w-4" /></Button>
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
                        {episode.cover_image_url && <img src={episode.cover_image_url} alt="" className="h-5 w-5 object-cover" />}
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

  useEffect(() => {
    fetch('/pantry-api/api/pantries').then((response) => response.ok ? response.json() : []).then((items) => setPantries(Array.isArray(items) ? items.filter((item) => item.deleted === 0) : [])).catch(() => setPantries([]));
  }, []);

  const addPantry = async (pantry: any) => {
    const response = await fetch('/pantry-api/api/pantries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pantry) });
    if (!response.ok) return null;
    const created = await response.json();
    setPantries((items) => [...items, created]);
    return created;
  };

  return <div className="uhub-pantry-finder min-h-[620px] h-[70vh] overflow-hidden border rounded-md bg-gray-950"><TheFoodPantryFeature pantries={pantries} addPantry={addPantry} /></div>;
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

const getNextUnionEventDateLabel = (short = false) => {
  const today = new Date();
  const eventDate = new Date(today.getFullYear(), today.getMonth() + (today.getDate() >= 25 ? 1 : 0), 24);
  return eventDate.toLocaleDateString('en-US', { month: short ? 'short' : 'long', day: 'numeric', year: 'numeric' });
};

const RotatingUnionEventCard = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const faces = [
    { image: '/includes/Uminionad001.png', text: `Next Union Event: ${getNextUnionEventDateLabel()} 9am to 9pm` },
    { image: '/includes/WYSad001.png', text: 'AD - Sponsored By: WhatsYorStory.com', url: 'https://WhatsYorStory.com' },
    { image: '/includes/Uminionad001.png', text: `Next Union Event: ${getNextUnionEventDateLabel(true)} (9am to 9pm)` },
    { image: '/includes/WYSad001.png', text: 'AD - Sponsored By: WhatsYorStory.com', url: 'https://WhatsYorStory.com' },
  ];
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % faces.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused, faces.length]);
  const activeFace = faces[index];
  return <div className="uhub-event-rotator" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onClick={() => activeFace.url && window.open(activeFace.url, '_blank')}>
    <button type="button" className="uhub-event-arrow left" onClick={(event) => { event.stopPropagation(); setIndex(value => (value - 1 + faces.length) % faces.length); }}>‹</button>
    <img src={activeFace.image} alt="Next Union Event" />
    <p>{activeFace.text}</p>
    <button type="button" className="uhub-event-arrow right" onClick={(event) => { event.stopPropagation(); setIndex(value => (value + 1) % faces.length); }}>›</button>
  </div>;
};

const headerStoreItems = [
  { title: 'Ukraine Poster', image: '/StoreProductsAndImagery/UkraineLogo001.png', action: 'u24.gov.ua', url: 'https://u24.gov.ua', cart: 'https://page001.uminion.com/cart/?add-to-cart=UStoreButton004.001AAA' },
  { title: 'BYO Tapestry', image: '/StoreProductsAndImagery/TapestryVersion001.png', action: '+$1,499.95 BYO Tapestry', cart: 'https://page001.uminion.com/cart/?add-to-cart=UStoreButton005.001AAAAA' },
  { title: 'Union Shirts', image: '/StoreProductsAndImagery/Tshirtbatchversion001.png', action: 'View Cart', cart: 'https://page001.uminion.com/cart/' },
];

const HeaderProductCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % headerStoreItems.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused]);
  const item = headerStoreItems[index];
  return <div className="uhub-header-product-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <button type="button" className="uhub-mini-carousel-arrow left" onClick={() => setIndex(value => (value - 1 + headerStoreItems.length) % headerStoreItems.length)}>‹</button>
    <img src={item.image} alt={item.title} />
    <div className="uhub-header-product-overlay">
      <span>{item.title}</span>
      <div className="flex gap-1">
        {item.url && <button type="button" onClick={() => window.open(item.url, '_blank')}>{item.action}</button>}
        <button type="button" onClick={() => window.open(item.cart, '_blank')}>{item.url ? '+ Cart' : item.action}</button>
      </div>
    </div>
    <button type="button" className="uhub-mini-carousel-arrow right" onClick={() => setIndex(value => (value + 1) % headerStoreItems.length)}>›</button>
  </div>;
};

const footerPosterItems = [
  { title: 'Sister Union #14: Union News - 2024 Classic', image: '/StoreProductsAndImagery/UminionLogo014.00.2024Classic.png', sku: 'UStoreButton005.026.01A' },
  { title: 'Sister Union #15: Union Radio - 2024 Classic', image: '/StoreProductsAndImagery/UminionLogo015.00.2024Classic.png', sku: 'UStoreButton005.027.01A' },
  { title: 'Sister Union #16: Union Drive - 2024 Classic', image: '/StoreProductsAndImagery/UminionLogo016.00.2024Classic.png', sku: 'UStoreButton005.028.01A' },
  { title: 'Sister Union #17: Union Archive - 2024 Classic', image: '/StoreProductsAndImagery/UminionLogo017.00.2024Classic.png', sku: 'UStoreButton005.029.01A' },
  { title: 'Sister Union #18: Union Tech - 2024 Classic', image: '/StoreProductsAndImagery/UminionLogo018.00.2024Classic.png', sku: 'UStoreButton005.030.01A' },
  { title: 'Sister Union #19: Union Politic - 2024 Classic', image: '/StoreProductsAndImagery/UminionLogo019.00.2024Classic.png', sku: 'UStoreButton005.031.01A' },
];

const FooterPosterCarousel = () => {
  const [index, setIndex] = useState(0);
  const visible = Array.from({ length: 3 }, (_, offset) => footerPosterItems[(index + offset) % footerPosterItems.length]);
  return <div className="uhub-footer-poster-carousel">
    <button type="button" className="uhub-footer-poster-arrow" onClick={() => setIndex(value => (value - 1 + footerPosterItems.length) % footerPosterItems.length)}>‹</button>
    <div className="uhub-footer-poster-strip">{visible.map(item => <div key={item.sku} className="uhub-footer-poster-card">
      <img src={item.image} alt={item.title} />
      <div className="uhub-footer-poster-overlay">
        <button type="button" aria-label="Previous poster variant">▲</button>
        <span>{item.title}</span>
        <button type="button" aria-label="Next poster variant">▼</button>
        <button type="button" onClick={() => window.open(`https://page001.uminion.com/cart/?add-to-cart=${encodeURIComponent(item.sku)}`, '_blank')}>+ Cart</button>
        <input type="number" aria-label="Quantity" />
        <strong>$69.95</strong>
      </div>
    </div>)}</div>
    <button type="button" className="uhub-footer-poster-arrow" onClick={() => setIndex(value => (value + 1) % footerPosterItems.length)}>›</button>
  </div>;
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
  if (broadcastView === 'UnionRadio#15') return <UnionRadioPlayer />;
  if (broadcastView === 'Find-a-Pantry#13') return <PantryFinderBroadcastView />;
  if (broadcastView === 'Beta-Button-10,011') return <BetaButtonView />;

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
    setBroadcastCarouselImageCount(9);
  };

  const resetToPosition002 = () => {
    setBroadcastLeftWidth(65);
    setBroadcastRightWidth(35);
    setBroadcastCarouselImageCount(6);
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
              <Button variant="ghost" size="icon" className="uhub-broadcast-footer-arrow" style={{ backgroundColor: 'transparent', color: '#ffffff', border: '0', boxShadow: 'none' }}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
              <Button variant="ghost" size="icon" className="uhub-broadcast-footer-arrow" style={{ backgroundColor: 'transparent', color: '#ffffff', border: '0', boxShadow: 'none' }}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="w-2/3 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="icon" className="uhub-play-button" style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: '#374151' }}><Play className="h-4 w-4" /></Button>
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
                visibleItemCount={broadcastCarouselImageCount}
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
            <Button variant="outline" size="icon" className="h-8 w-8 uhub-play-button" style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: '#374151' }}><Play className="h-4 w-4" /></Button>
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
    visibleItemCount={broadcastCarouselImageCount}
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
            setBroadcastCarouselImageCount(9);
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
            data-meme-box-layout={broadcastCarouselImageCount}
            className="bg-muted rounded-md my-2"
            style={{ minHeight: '400px' }}
          />
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }}><ChevronRight className="h-4 w-4" /></Button>
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
          <div style={{ width: `${broadcastRightWidth}%` }} className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="icon" className="h-8 w-8 uhub-play-button" style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: '#374151' }}><Play className="h-4 w-4" /></Button>
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
  visibleItemCount={broadcastCarouselImageCount}
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
const HomeModal = ({ isOpen, onClose, userProducts = [], user = null }: { isOpen: boolean; onClose: () => void; userProducts?: any[]; user?: any }) => {
  const [myAccountExpanded, setMyAccountExpanded] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

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
      await fetch('/api/social-posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPostContent.trim() }),
      });
      setNewPostContent('');
    } catch (error) {
      console.error('[HOME MODAL] Error creating post:', error);
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
              style={{ color: '#ffffff' }}
              placeholder="Write a post..." 
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              disabled={!user}
            ></textarea>
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


const MainUhubFeatureV001ForMyProfileModal: React.FC<MainUhubFeatureV001ForMyProfileModalProps> = ({ isOpen, onClose, onOpenAuthModal, onBadgeZoom }) => {
  const { user, logout } = useAuth();
  const [isPoliticFilterOpen, setPoliticFilterOpen] = useState(false);
  const [isPoliticFilterPressed, setPoliticFilterPressed] = useState(false);
  const MainUhubFeatureV001ForUHomeHubButtons = Array.from({ length: 30 }, (_, i) => i + 1);
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
  const customButtonPageHeight = 140;

  useEffect(() => {
    customButtonPageScrollRef.current?.scrollTo({
      top: (customizableButtonPage - 1) * customButtonPageHeight,
      behavior: 'smooth',
    });
  }, [customizableButtonPage]);
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
  const [areProfileSurfacesOpaque, setAreProfileSurfacesOpaque] = useState(true);
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
 const [isLeftSectionCollapsed, setIsLeftSectionCollapsed] = useState(window.innerWidth < 768);
  const [isRightSectionCollapsed, setIsRightSectionCollapsed] = useState(window.innerWidth < 768);
  const [leftDividerDragging, setLeftDividerDragging] = useState(false);
  const [rightDividerDragging, setRightDividerDragging] = useState(false);
  const broadcasts = {
      'UnionNews#14': { memeBoxId: 'TheReactMemeImplementationConnection001', title: 'UnionNews#14 & GEMMMS#25', creator: 'GEMMMS#25', subtitle: 'Got Memes? Share Memes:', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.15-Made-on-NC-JPEG.png', extraImages: ['https://page001.uminion.com/StoreProductsAndImagery/TapestryVersion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/Tshirtbatchversion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/UkraineLogo001.png'], description: 'Welcome to the Uminion Union! We have Rallies every 24th of the month, stores built by unionFolk, chats, news, voting, teach ppl how to code (for free) & even offer an ad-free- meme section below!', website: 'https://github.com/uminionunion/UminionsWebsite/discussions/13' },
      'UnionRadio#15': { title: 'Broadcasts- UnionRadio#15', creator: 'StorytellingSalem', subtitle: 'Under Construction- Union Radio #15.', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.16-Made-on-NC-JPEG.png', extraImages: [], description: 'Union Radio #15 is presently underConstruction; & is expected to be live again, along with when we launch v3!', website: 'https://uminion.com' },
      'Find-a-Pantry#13': { title: 'Find-a-Pantry#13', creator: 'Uminion Union', subtitle: 'Find and add community resources.', logo: '', extraImages: [], description: 'Find-a-Pantry', website: 'https://uminion.com' },
      'Beta-Button-10,011': { title: 'Beta-Button-10,011', creator: 'Uminion Union', subtitle: 'Features in Development', logo: '', extraImages: [], description: 'Beta Pages', website: 'https://uminion.com' },
  };
  const broadcastKeys = ['MyBroadcasts', ...Object.keys(broadcasts)];
  const [selectedFriendForModal, setSelectedFriendForModal] = useState<any>(null);
  const [isFriendProfileModalOpen, setIsFriendProfileModalOpen] = useState(false);
  const [isEditingProfileImage, setIsEditingProfileImage] = useState(false);
  const [unreadChatrooms, setUnreadChatrooms] = useState<Set<number>>(new Set());
  const socketRef = useRef<Socket | null>(null);



const [isUnionNews14ModalOpen, setIsUnionNews14ModalOpen] = useState(false);
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
              <UnionPoliticCandidates filtersOpen={isPoliticFilterOpen} />
            )}

            {!isUnionSAM20 && !isUnionPolitic19 && (
  <div id="MainUhubFeatureV001ForStoreColumn" className="border rounded-md p-2 flex flex-col h-full" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
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
return (
  <>
    <div className="flex items-center justify-between mb-4">
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
      <div className={areProfileSurfacesOpaque ? 'uhub-profile-surfaces text-foreground w-full h-full flex flex-col relative' : 'uhub-profile-surfaces uhub-transparent-mode text-foreground w-full h-full flex flex-col relative'} style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 h-8 w-8 p-1 text-white hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff', border: '0', boxShadow: 'none' }} onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
         {/* Top Section */}
         <div className="md:flex md:flex-row hidden md:p-4 md:border-b md:gap-2" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopLeftSection" className="md:w-1/5 grid grid-cols-4 md:grid-cols-2 grid-rows-1 md:grid-rows-2 gap-2 md:pr-4" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center relative text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent' }} title="Friends" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
               {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
               <Users className="h-4 w-4 mb-1" /> Friends
             </Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent' }} title="Broadcast" onClick={() => setCenterView('broadcasts')}><Megaphone className="h-4 w-4 mb-1" /> Broadcast</Button>
             <a href="https://github.com/uminionunion/UminionsWebsite/discussions/13" target="_blank" rel="noopener noreferrer" className="w-full h-full">
               <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent', opacity: 1 }} title="Code" disabled={!user}><Code className="h-4 w-4 mb-1" /> Code</Button>
             </a>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" style={{ color: '#ffffff', backgroundColor: 'transparent' }} title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}><Settings className="h-4 w-4 mb-1" /> Settings</Button>
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopMiddleSection" className="md:w-2/5 h-32 md:h-40 bg-cover bg-center rounded-md relative overflow-hidden" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent', backgroundImage: 'none' }}>
             <img src="/defaultUminionUassets/defaultUminionUbanneriArt06,505.19.jpg" alt="uHub cover" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: areProfileSurfacesOpaque ? 1 : 0.5 }} />
             {user && <Button className="absolute bottom-2 right-2" size="sm">Change Cover</Button>}
           </div>

            {/* 8-Button Grid - SMALLER BUTTONS - HIDDEN ON MOBILE */}
<div className="hidden md:flex md:w-1/4 justify-center items-center md:pl-4" style={{ backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
  <div
    ref={customButtonPageScrollRef}
    onScroll={(event) => {
      const scrollPage = Math.round(event.currentTarget.scrollTop / customButtonPageHeight) + 1;
      setCustomizableButtonPage(Math.max(1, Math.min(715, scrollPage)));
    }}
    className="w-fit overflow-y-auto overflow-x-hidden"
    style={{
      maxHeight: `${customButtonPageHeight}px`,
      scrollSnapType: 'y mandatory',
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
      onClick={() => setIsQuadrantsModalOpen(true)}
      title="HikingToAllStores"
    >
      <Mountain className="h-5 w-5" />
      <span>Stores</span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="flex flex-col items-center justify-center h-8 w-12 gap-0 text-xs text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white"
      style={{ color: '#ffffff', backgroundColor: 'transparent' }}
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
      <Home className="h-5 w-5" />
      <span>Home</span>
    </Button>
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
      ) : (
      <Button
        key={buttonNumber}
        variant="outline"
        size="sm"
        className={`flex flex-col items-center justify-center h-8 w-12 gap-0 text-xs text-white border-gray-700 hover:bg-gray-700 hover:text-white ${customizableButtonPage === 1 && [3, 4, 7, 15].includes(buttonNumber) ? 'opacity-50 cursor-not-allowed' : ''} ${typeof buttonNumber === 'number' && buttonNumber >= 10001 && buttonNumber <= 10012 ? 'text-[0.65rem] text-gray-500 opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
        style={{ color: '#ffffff', backgroundColor: customizableButtonPage === 1 && buttonNumber === 5 ? '#2563eb' : 'transparent' }}
        onClick={() => {
          if (typeof buttonNumber === 'string' && buttonNumber.endsWith('sPreviousPageButton')) {
            setCustomizableButtonPage(page => Math.max(1, page - 1));
            return;
          }

          if (typeof buttonNumber === 'string' && buttonNumber.endsWith('sNextPageButton')) {
            setCustomizableButtonPage(page => Math.min(715, page + 1));
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 9) {
            window.open('https://whatsYORstory.com', '_blank', 'noopener,noreferrer');
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 10) {
            window.open('https://www.facebook.com/share/g/1FMa6xWVmQ/', '_blank', 'noopener,noreferrer');
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 11) {
            window.open('https://www.facebook.com/share/g/1EfPw4uW8k/', '_blank', 'noopener,noreferrer');
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 12) {
            window.open('https://www.facebook.com/share/g/1PD9kge6ZL/', '_blank', 'noopener,noreferrer');
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 13) {
            window.open('https://github.com/uminionunion/UminionsWebsite/discussions/13', '_blank', 'noopener,noreferrer');
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 14) {
            window.open('https://github.com/uminionunion/UminionsWebsite', '_blank', 'noopener,noreferrer');
            return;
          }

          if (customizableButtonPage === 715 && buttonNumber === 10000) {
            window.open('https://www.uminion.com', '_blank', 'noopener,noreferrer');
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === CustomButtonsPage001sNextPageButton) {
            setCustomizableButtonPage(2);
            return;
          }

          if (customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sPreviousPageButton) {
            setCustomizableButtonPage(1);
            return;
          }

          if (customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sNextPageButton) {
            setCustomizableButtonPage(3);
            return;
          }

          if (customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sPreviousPageButton) {
            setCustomizableButtonPage(2);
            return;
          }

          if (customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sNextPageButton) {
            setCustomizableButtonPage(4);
            return;
          }

          if (customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sPreviousPageButton) {
            setCustomizableButtonPage(3);
            return;
          }

          if (customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sNextPageButton) {
            setCustomizableButtonPage(5);
            return;
          }

          if (customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sPreviousPageButton) {
            setCustomizableButtonPage(4);
            return;
          }

          if (customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sNextPageButton) {
            setCustomizableButtonPage(6);
            return;
          }

          if (customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sPreviousPageButton) {
            setCustomizableButtonPage(5);
            return;
          }

          if (customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sNextPageButton) {
            setCustomizableButtonPage(7);
            return;
          }

          if (customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sPreviousPageButton) {
            setCustomizableButtonPage(6);
            return;
          }

          if (customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sNextPageButton) {
            setCustomizableButtonPage(8);
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 8) {
            setAreProfileSurfacesOpaque(prev => !prev);
            return;
          }

          // Microphone toggle: 1st click opens Broadcasts-UnionRadio#15, 2nd click opens MyBroadcasts.
          if (customizableButtonPage === 1 && buttonNumber === 6) {
            const nextMicrophoneState = !areFeatureIconsActive.microphone;
            setAreFeatureIconsActive(prev => ({ ...prev, microphone: nextMicrophoneState }));
            setCenterView('broadcasts');
            setBroadcastView(nextMicrophoneState ? 'UnionRadio#15' : 'MyBroadcasts');
            return;
          }

          if (customizableButtonPage === 1 && buttonNumber === 5) {
            const nextLionState = !areFeatureIconsActive.lion;
            setAreFeatureIconsActive(prev => ({ ...prev, lion: nextLionState }));
            setCenterView('broadcasts');
            setBroadcastView(nextLionState ? 'Find-a-Pantry#13' : 'UnionNews#14');
            return;
          }

          if (customizableButtonPage === 715 && buttonNumber === 10011 && (user?.id === 1 || user?.id === 2)) {
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
          if (customizableButtonPage === 1 && ![3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(buttonNumber)) {
            setIsQuadrantsModalOpen(true);
          }
        }}
        disabled={typeof buttonNumber === 'number' && buttonNumber >= 10001 && buttonNumber <= 10012 && !(customizableButtonPage === 715 && buttonNumber === 10011 && (user?.id === 1 || user?.id === 2))}
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
          {customizableButtonPage === 1 && buttonNumber === 3 ? (areFeatureIconsActive.heart ? '♥︎' : '♡') :
            customizableButtonPage === 1 && buttonNumber === 4 ? (areFeatureIconsActive.palm ? '☠' : '🏝') :
            customizableButtonPage === 1 && buttonNumber === 5 ? (areFeatureIconsActive.lion ? '𓃮' : '𓃭') :
            customizableButtonPage === 1 && buttonNumber === 6 ? (areFeatureIconsActive.microphone ? '✌︎' : '🎙') :
            customizableButtonPage === 1 && buttonNumber === 7 ? (areFeatureIconsActive.steeringWheel ? '⛴' : '☸') :
            customizableButtonPage === 1 && buttonNumber === 8 ? (areProfileSurfacesOpaque ? '✩' : '★') :
            customizableButtonPage === 1 && buttonNumber === 9 ? '🕮' :
            customizableButtonPage === 1 && buttonNumber === 10 ? '🐃' :
            customizableButtonPage === 1 && buttonNumber === 11 ? '🦬' :
            customizableButtonPage === 1 && buttonNumber === 12 ? '🦣' :
            customizableButtonPage === 1 && buttonNumber === 13 ? '🗝' :
            customizableButtonPage === 1 && buttonNumber === 14 ? '🛠' :
            customizableButtonPage === 1 && buttonNumber === 15 ? (areFeatureIconsActive.movie ? '🖼' : '📽') :
            customizableButtonPage === 1 && buttonNumber === CustomButtonsPage001sNextPageButton ? '⏭' :
            customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sPreviousPageButton ? '⏮' :
            customizableButtonPage === 2 && buttonNumber === CustomButtonsPage002sNextPageButton ? '⏭' :
            customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sPreviousPageButton ? '⏮' :
            customizableButtonPage === 3 && buttonNumber === CustomButtonsPage003sNextPageButton ? '⏭' :
            customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sPreviousPageButton ? '⏮' :
            customizableButtonPage === 4 && buttonNumber === CustomButtonsPage004sNextPageButton ? '⏭' :
            customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sPreviousPageButton ? '⏮' :
            customizableButtonPage === 5 && buttonNumber === CustomButtonsPage005sNextPageButton ? '⏭' :
            customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sPreviousPageButton ? '⏮' :
            customizableButtonPage === 6 && buttonNumber === CustomButtonsPage006sNextPageButton ? '⏭' :
            customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sPreviousPageButton ? '⏮' :
            customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sNextPageButton ? '⏭' :
            typeof buttonNumber === 'string' && buttonNumber.endsWith('sPreviousPageButton') ? '⏮' :
            typeof buttonNumber === 'string' && buttonNumber.endsWith('sNextPageButton') ? '⏭' :
            customizableButtonPage === 7 && buttonNumber === CustomButtonsPage007sNextPageButton ? '⏭' :
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
      <AvatarImage src={user?.profile_image_url || "/defaultUminionUassets/defaultUminionUbadge.png"} alt="Profile" style={{ opacity: areProfileSurfacesOpaque ? 1 : 0.5 }} />
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
      {user ? <button type="button" className={showLogout ? 'rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700' : 'flex items-center gap-1 rounded bg-transparent px-2 py-1 text-xs text-gray-400 hover:text-gray-200'} onClick={() => { if (showLogout) void logout(); else setShowLogout(true); }}>{showLogout ? 'Log Out?' : <><span className="h-2 w-2 rounded-full bg-green-500" /> Logged In</>}</button> : <div className="flex gap-1"><Button size="sm" className="h-7 text-xs" onClick={() => onOpenAuthModal('login')}>Log In</Button><Button size="sm" className="h-7 text-xs bg-orange-400 hover:bg-orange-500 text-black" onClick={() => onOpenAuthModal('signup')}>Sign Up</Button></div>}
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
  <div className="flex-grow flex overflow-hidden" data-profile-main-container style={{ flexDirection: window.innerWidth < 768 ? 'column' : 'row', backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
  {/* LEFT SECTION - ONLY SHOW IF NOT COLLAPSED */}
  {!isLeftSectionCollapsed && (
    <>
      <div id="MainUhubFeatureV001ForMyProfileSettingsCenterLeftSection" className="md:border-r overflow-y-auto p-2 md:p-4 text-white" style={{ width: window.innerWidth < 768 ? '100%' : `${leftWidthDesktop}%`, height: window.innerWidth < 768 ? 'auto' : 'auto', backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent' }}>
        <RotatingUnionEventCard />
        <h3 className="text-center font-bold mb-2 md:mb-4 text-xs md:text-base">uHome-Hub:</h3>
        <div className="grid grid-cols-2 gap-1 md:gap-2">
          {MainUhubFeatureV001ForUHomeHubButtons.map(num => (
            <div key={num} className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="md:h-auto h-6 text-xs w-full text-white bg-transparent border-gray-700 hover:bg-gray-700 hover:text-white" 
                style={{ color: '#ffffff', backgroundColor: 'transparent' }}
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
        <div className="mt-4"><HeaderProductCarousel /></div>
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
  <div id="MainUhubFeatureV001ForMyProfileSettingsCenterSection" className="p-2 md:p-4 overflow-y-auto text-white" style={{ 
    width: window.innerWidth < 768 ? '100%' : `${centerWidthDesktop}%`,
       height: window.innerWidth < 768 ? 'auto' : 'auto', 
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent'
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
    <div id="MainUhubFeatureV001ForMyProfileSettingsCenterRightSection" className="md:border-l overflow-y-auto p-2 md:p-4 text-white" style={{ 
      width: window.innerWidth < 768 ? '100%' : `${rightWidthDesktop}%`,
      height: window.innerWidth < 768 ? 'auto' : 'auto',
      borderTop: window.innerWidth < 768 ? '1px solid #374151' : 'none',
      backgroundColor: areProfileSurfacesOpaque ? '#000000' : 'transparent'
    }}>
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
          <div className="flex border-t md:h-auto h-12">
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomLeftSection" className="w-[20%] p-1 md:p-2 border-r flex items-center">
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavLeft('left')}><ChevronLeft className="h-4 w-4" /></Button>
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
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavLeft('right')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomCenterSection" className="w-[60%] p-1 md:p-2 flex items-center justify-center">
              <a href="https://page001.uminion.com/product/official-uminion-union-card/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-xs md:text-sm">
                Become an Official Member of the Union via getting your Union Card Today!
              </a>
            </div>
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomRightSection" className="w-[20%] p-1 md:p-2 border-l flex items-center">
               <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavRight('left')}><ChevronLeft className="h-4 w-4" /></Button>
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
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 p-1 text-white bg-transparent hover:bg-gray-700 hover:text-white" style={{ backgroundColor: 'transparent', color: '#ffffff' }} onClick={() => handleSocialNavRight('right')}><ChevronRight className="h-4 w-4" /></Button>
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
          user={user}
        />
    </>
    );
  };

export default MainUhubFeatureV001ForMyProfileModal;


// FILE: client/src/features/profile/MainHubUpgradeV001ForMyProfileModal.tsx
// =================================================================================================
//
// This file defines the main "uHub" modal component, which serves as the central user interface
// for interacting with the application's features. It's a complex component that manages state
// for various views like friends, broadcasts, settings, and product displays.
//
// Main Features:
// - A multi-panel layout (top, center, bottom sections with left, middle, right columns).
// - Displays user profile information (avatar, cover photo).
// - Provides navigation to different sections: Friends, Broadcasts, Code, Settings.
// - Contains the "uHome-Hub" buttons (#01-#24) which open individual chat modals.
// - Shows product listings and store information in the right-hand panel.
// - Includes social media links in the footer.
// - Manages opening and closing of other modals (Chat, Add Product, Product Detail).
//
// State Management (React Hooks):
// - `useState` is used extensively to manage the active view, selected items, modal visibility,
//   and paginated content (e.g., social media links).
// - `useEffect` is used to fetch data from the server (like friend requests and products) when
//   the component loads or when the user logs in.
// - `useAuth` custom hook is used to get the current logged-in user's state.
//
// CSS Styling:
// - Styling is done using Tailwind CSS classes. The class names are descriptive of the layout
//   and appearance (e.g., `flex`, `grid`, `p-4`, `border-b`, `w-1/5`).
// - The layout is responsive and uses flexbox and grid for structure.
//
// Backend/Server Connection (Express.js & Kysely):
// - This component makes API calls to the Express server using `fetch`.
// - Example: `fetch('/api/friends/requests/pending')` retrieves pending friend requests.
// - The server-side logic for these endpoints is located in `server/friends.ts`, `server/auth.ts`, etc.
// - These server files use the Kysely query builder to interact with the SQLite database.
//
// ---
//
// PHP & MySQL Conversion Guide:
//
// To convert this component to a traditional PHP/MySQL stack:
//
// 1.  **File Structure**:
//     - This entire component would become a single PHP template file, e.g., `templates/uhub.php`.
//     - The complex state management and interactivity would be moved to a dedicated JavaScript file, e.g., `assets/js/uhub.js`.
//
// 2.  **Backend (PHP & MySQL)**:
//     -   **Data Fetching**: Instead of `useEffect` and `fetch`, the initial data (like user info, products) would be fetched directly in PHP before rendering the template.
//         -   PHP Example: `$user = get_user_data($_SESSION['user_id']); $products = get_products('UnionSAM#20');`
//     -   **API Endpoints**: The `fetch` calls for dynamic actions (like accepting a friend request) would point to dedicated PHP API files (e.g., `api/friends.php`).
//         -   JS Example: `fetch('api/friends.php', { method: 'POST', body: formData })`
//         -   `api/friends.php` would process `$_POST` data, run a MySQL query (`UPDATE friends SET status = 'accepted' WHERE ...`), and `echo json_encode(['status' => 'success']);`.
//
// 3.  **Frontend (HTML, CSS, JavaScript)**:
//     -   **Component to HTML**: The JSX structure would be converted to plain HTML within `uhub.php`.
//     -   **State Management**: React's `useState` would be replaced by JavaScript variables in `uhub.js`. DOM manipulations would be done manually.
//         -   JS Example: `let currentView = 'broadcasts'; function showView(view) { ... document.getElementById('friends-view').style.display = 'none'; ... }`
//     -   **Conditional Rendering**: React's `{user && <Button />}` would become PHP `if` blocks.
//         -   PHP Example: `<?php if (is_logged_in()): ?><button>Edit</button><?php endif; ?>`
//     -   **Styling**: All `className` attributes are directly converted to `class` attributes in HTML. The final compiled Tailwind CSS file would be linked in the main layout.
//
// 4.  **Database (MySQL)**:
//     - The Kysely schema in `server/db-types.ts` would be translated into a MySQL `CREATE TABLE` script. Data types would be mapped (e.g., `INTEGER` -> `INT`, `TEXT` -> `VARCHAR(255)` or `TEXT`).
//     - Kysely queries would be rewritten as standard SQL queries executed via PHP's PDO or MySQLi extension.
//
// ---
//
// AI Prompting Guide for Recreation:
//
// To recreate this component with an AI, you could use a prompt like this:
// "Create a React component for a complex user profile modal called 'uHub'. It should have a three-section layout (top, center, bottom), each with three columns (left, middle, right).
// - The top section shows user profile info, navigation buttons, and a cover image.
// - The center section has a main content area in the middle, a list of 'uHome-Hub' buttons on the left, and a product display area on the right.
// - The bottom section contains social media links.
// - The component should manage state for different views (friends, broadcasts, settings) and handle opening other modals for chat and product details.
// - Use Tailwind CSS for styling and `lucide-react` for icons. Fetch data from API endpoints like '/api/friends/requests/pending'."
//
// =================================================================================================

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play, X } from 'lucide-react';
// PHP Conversion: These are component imports. In PHP, you would `include` or `require` template parts or function files.
import MainHubUpgradeV001ForChatModal from '../uminion/MainHubUpgradeV001ForChatModal';
import { useAuth } from '@/hooks/useAuth';
import MainHubUpgradeV001ForAddProductModal from './MainHubUpgradeV001ForAddProductModal';
import MainHubUpgradeV001ForProductDetailModal from './MainHubUpgradeV001ForProductDetailModal';
import MainHubUpgradeV001ForFriendsView from './MainHubUpgradeV001ForFriendsView';
import MainHubUpgradeV001ForSettingsView from './MainHubUpgradeV001ForSettingsView';
import { CreateBroadcastView } from './CreateBroadcastView';

interface MainHubUpgradeV001ForMyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
}

// PHP Conversion: This data would be stored in a PHP array or fetched from a database.
// Social media links for the bottom-left section.
const socialLinksLeftPage1 = [
  { id: 'facebook', href: 'https://www.facebook.com/groups/1615679026489537', icon: <Facebook /> },
  { id: 'bluesky', href: 'https://bsky.app/profile/uminion.bsky.social', icon: <MessageSquare /> },
  { id: 'github', href: 'https://github.com/uminionunion/uminionswebsite', icon: <Github /> },
  { id: 'youtube', href: 'https://www.youtube.com/@UminionUnion', icon: <Youtube /> },
  { id: 'twitch', href: 'https://www.twitch.tv/theuminionunion', icon: <Twitch /> },
  { id: 'discord', href: 'https://discord.com/login?redirect_to=%2Flogin%3Fredirect_to%3D%252Fchannels%252F1357919291428573204%252F1357919292280144075', icon: 'D' },
];
const socialLinksLeftPage2 = [
    { id: 'page2-1', href: 'https://example.com/page2-1', icon: 'L1' },
    { id: 'page2-2', href: 'https://example.com/page2-2', icon: 'L2' },
    { id: 'page2-3', href: 'https://example.com/page2-3', icon: 'L3' },
    { id: 'page2-4', href: 'https://example.com/page2-4', icon: 'L4' },
    { id: 'page2-5', href: 'https://example.com/page2-5', icon: 'L5' },
    { id: 'page2-6', href: 'https://example.com/page2-6', icon: 'L6' },
];
const socialLinksLeftPage3 = [
    { id: 'page3-1', href: 'https://example.com/page3-1', icon: 'L7' },
    { id: 'page3-2', href: 'https://example.com/page3-2', icon: 'L8' },
    { id: 'page3-3', href: 'https://example.com/page3-3', icon: 'L9' },
    { id: 'page3-4', href: 'https://example.com/page3-4', icon: 'L10' },
    { id: 'page3-5', href: 'https://example.com/page3-5', icon: 'L11' },
    { id: 'page3-6', href: 'https://example.com/page3-6', icon: 'L12' },
];
const socialLinkPagesLeft = [socialLinksLeftPage1, socialLinksLeftPage2, socialLinksLeftPage3];

// Social media links for the bottom-right section.
const socialLinksRightPage1 = [
  { id: 'instagram', href: 'https://www.instagram.com/theuminionunion/?igsh=ajdjeGUycHRmczVs&ut-m_source=qr#', icon: <Instagram /> },
  { id: 'mastodon', href: 'https://mastodon.social/@uminion', icon: 'M' },
  { id: 'githubDiscussions', href: 'https://github.com/uminionunion/UminionsWebsite/discussions', icon: <Github /> },
  { id: 'threads', href: 'https://www.threads.com/@theuminionunion', icon: '@' },
  { id: 'patreon', href: 'https://www.patreon.com/uminion', icon: 'P' },
  { id: 'githubIssues', href: 'https://github.com/uminionunion/UminionsWebsite/issues', icon: <Github /> },
];
const socialLinksRightPage2 = [
    { id: 'page2-r1', href: 'https://example.com/page2-r1', icon: 'R1' },
    { id: 'page2-r2', href: 'https://example.com/page2-r2', icon: 'R2' },
    { id: 'page2-r3', href: 'https://example.com/page2-r3', icon: 'R3' },
    { id: 'page2-r4', href: 'https://example.com/page2-r4', icon: 'R4' },
    { id: 'page2-r5', href: 'https://example.com/page2-r5', icon: 'R5' },
    { id: 'page2-r6', href: 'https://example.com/page2-r6', icon: 'R6' },
];
const socialLinksRightPage3 = [
    { id: 'page3-r1', href: 'https://example.com/page3-r1', icon: 'R7' },
    { id: 'page3-r2', href: 'https://example.com/page3-r2', icon: 'R8' },
    { id: 'page3-r3', href: 'https://example.com/page3-r3', icon: 'R9' },
    { id: 'page3-r4', href: 'https://example.com/page3-r4', icon: 'R10' },
    { id: 'page3-r5', href: 'https://example.com/page3-r5', icon: 'R11' },
    { id: 'page3-r6', href: 'https://example.com/page3-r6', icon: 'R12' },
];
const socialLinkPagesRight = [socialLinksRightPage1, socialLinksRightPage2, socialLinksRightPage3];


// A reusable component for rendering a social media icon link.
const MainHubUpgradeV001ForSocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
    {children}
  </a>
);

// A component to display a single product in a box.
const ProductBox = ({ product, onMagnify }) => {
    const [inCart, setInCart] = useState(false);

    const handleCartClick = () => {
        setInCart(!inCart);
    };

    if (!product) return <div className="h-48 border rounded-md p-2 flex items-center justify-center text-muted-foreground">No Product</div>;

    const handleImageClick = () => {
        if (product.url) {
            window.open(product.url, '_blank');
        }
    };

    return (
        <div className="border rounded-md p-2 relative h-48 group">
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

// A component to display a broadcast's details.
const BroadcastView = ({ broadcast }) => (
    <div className="flex gap-6">
        <div className="w-1/3">
            <h4 className="font-semibold">{broadcast.subtitle}</h4>
            <div className="aspect-square bg-muted rounded-md my-2 bg-cover bg-center" style={{backgroundImage: `url(${broadcast.logo})`}}></div>
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon"><ChevronLeft /></Button>
                <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
                <Button variant="ghost" size="icon"><ChevronRight /></Button>
            </div>
        </div>
        <div className="w-2/3">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="icon"><Play /></Button>
                <p className="text-sm text-muted-foreground flex-grow">{broadcast.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {broadcast.extraImages.slice(0,3).map((img, i) => <div key={i} className="aspect-square bg-muted rounded-md bg-cover bg-center" style={{backgroundImage: `url(${img})`}}></div>)}
            </div>
            <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">Visit Website</a>
        </div>
    </div>
);

// The main modal component for the uHub.
const MainHubUpgradeV001ForMyProfileModal: React.FC<MainHubUpgradeV001ForMyProfileModalProps> = ({ isOpen, onClose, onOpenAuthModal }) => {
  // PHP Conversion: All these `useState` calls manage the component's internal state. In a JS/PHP app, this state would be held in plain JavaScript variables in `uhub.js`.
  // When state changes, JS functions would manually update the DOM (e.g., changing innerHTML, adding/removing classes).
  const { user } = useAuth();
  const MainHubUpgradeV001ForUHomeHubButtons = Array.from({ length: 24 }, (_, i) => i + 1);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [products, setProducts] = useState<any>({});
  const [centerRightView, setCenterRightView] = useState('UnionSAM#20');
  const centerRightViews = ['UnionEvent#12', 'UnionPolitic#19', 'UnionSAM#20'];
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [centerView, setCenterView] = useState('broadcasts');
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const [socialPageLeft, setSocialPageLeft] = useState(0);
  const [socialPageRight, setSocialPageRight] = useState(0);

  const [broadcastView, setBroadcastView] = useState('UnionNews#14');
  const broadcasts = {
      'UnionNews#14': { title: 'Broadcasts- UnionNews#14', creator: 'uAdmin', subtitle: 'The latest news from the Union.', logo: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', extraImages: ['https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg', 'https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png', 'https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png'], description: 'This week, we cover the latest developments in Union infrastructure and upcoming community events. Stay tuned for special announcements!', website: 'https://uminion.com' },
      'UnionRadio#15': { title: 'Broadcasts- UnionRadio#15', creator: 'uDJ', subtitle: '24/7 tunes for the Union.', logo: 'https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png', extraImages: [], description: 'Non-stop music curated for our members. Send in your requests!', website: 'https://uminion.com' },
  };
  const broadcastKeys = ['MyBroadcasts', ...Object.keys(broadcasts)];

  // Effect to fetch pending friend requests when the modal is open and a user is logged in.
  // PHP Conversion: This `useEffect` would be an AJAX call in `uhub.js`. `fetch('api/friends.php?action=get_pending').then(...)`.
  // The PHP script would query the database and return JSON. The JS `then` block would parse the JSON and update the DOM to show the requests.
  useEffect(() => {
    if (user && isOpen) {
      fetch('/api/friends/requests/pending')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPendingFriendRequests(data);
          }
        });
    }
  }, [user, isOpen]);



// Fetch initial unread status on load
useEffect(() => {
  if (user && isOpen) {
    fetch('/api/chat/unread-status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const chatroomNums = new Set<number>();
          data.forEach(item => {
            // Extract chatroom number from room name
            const match = item.chatroom_room_name.match(/SisterUnion(\d+)/);
            if (match && item.has_unread === 1) {
              chatroomNums.add(parseInt(match[1], 10));
            }
          });
          setUnreadChatrooms(chatroomNums);
          console.log(`[PROFILE] Initial unread chatrooms:`, Array.from(chatroomNums));
        }
      })
      .catch(err => console.error('[PROFILE] Error fetching unread status:', err));
  }
}, [user, isOpen]);

  

  // Effect to set up the product data for different views.
  useEffect(() => {
    const allProducts = {
        'UnionSAM#20': [
            { id: 1, name: 'Tapestry', price: 1999.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg', url: 'https://uminion.com/product/byoct-build-your-own-custom-tapestry/', store: 'main' },
            { id: 2, name: 'uT-Shirt', price: 24.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png', url: 'https://uminion.com/product/custom-u-t-shirt/', store: 'user' },
            { id: 3, name: 'Classic Logo', price: 64.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-18-2024-poster/', store: 'user' },
            { id: 4, name: 'Ukraine', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png', url: 'https://u24.gov.ua/', store: 'user' },
            { id: 5, name: 'Official Union Card', price: 14.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png', url: 'https://uminion.com/product/union-card-the-official-uminion-union-card/', store: 'user' },
        ],
        'UnionPolitic#19': [
            { id: 6, name: 'Support unionCandidates as a WHOLE', price: 64.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
            { id: 7, name: 'unionCandidateX', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
            { id: 8, name: 'unionCandidateY', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
            { id: 9, name: 'unionCandidateZ', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
        ],
        'UnionEvent#12': [
            { id: 10, name: 'Monthly Rally: This 24th!', time: '9am-9pm', location: 'Where: Downtown &/or: Outside your Local City Hall/State House!', image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo012.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-12-2024-poster/' },
        ],
    };
    setProducts(allProducts);
  }, []);

  const handleMagnify = (product) => {
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  };

  const MainHubUpgradeV001ForSisterUnionPages = [
    'SisterUnion001NewEngland', 'SisterUnion002CentralEastCoast', 'SisterUnion003SouthEast',
    'SisterUnion004TheGreatLakesAndAppalachia', 'SisterUnion005CentralSouth', 'SisterUnion006CentralNorth',
    'SisterUnion007SouthWest', 'SisterUnion008NorthWest', 'SisterUnion009International',
    'SisterUnion010TheGreatHall', 'SisterUnion011WaterFall', 'SisterUnion012UnionEvent',
    'SisterUnion013UnionSupport', 'SisterUnion014UnionNews', 'SisterUnion015UnionRadio',
    'SisterUnion016UnionDrive', 'SisterUnion017UnionArchiveAndEducation', 'SisterUnion018UnionTech',
    'SisterUnion019UnionPolitic', 'SisterUnion020UnionSAM', 'SisterUnion021UnionUkraineAndTheCrystalPalace',
    'SisterUnion022FestyLove', 'SisterUnion023UnionLegal', 'SisterUnion024UnionMarket',
  ];
  const MainHubUpgradeV001ForModalColors = Array.from({ length: 24 }, (_, i) => `hsl(${i * 15}, 70%, 50%)`);

  const handleUHomeHubClick = (buttonNumber: number) => setActiveChatModal(buttonNumber);
  const handleCloseChatModal = () => setActiveChatModal(null);

  const navigateCenterRight = (direction: 'left' | 'right') => {
    const currentIndex = centerRightViews.indexOf(centerRightView);
    const nextIndex = (currentIndex + (direction === 'right' ? 1 : -1) + centerRightViews.length) % centerRightViews.length;
    setCenterRightView(centerRightViews[nextIndex]);
  };

  const navigateBroadcast = (direction: 'left' | 'right') => {
    const currentIndex = broadcastKeys.indexOf(broadcastView);
    const nextIndex = (currentIndex + (direction === 'right' ? 1 : -1) + broadcastKeys.length) % broadcastKeys.length;
    setBroadcastView(broadcastKeys[nextIndex]);
  };

  const renderCenterRightContent = () => {
    const currentProducts = products[centerRightView] || [];
    const mainStoreProducts = currentProducts.filter(p => p.store === 'main');
    const userStoreProducts = currentProducts.filter(p => p.store !== 'main');

    return (
        <>
            <div id="MainHubUpgradeV001ForMainStore" className="border rounded-md p-2">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-center">Main Store</h4>
                    <a href="https://uminion.com/cart/" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500" id="MainHubUpgradeV001ForUnionSAM#20ViewCart">
                            <ShoppingCart />
                        </Button>
                    </a>
                </div>
                <div className="space-y-2">
                    {mainStoreProducts.map((p, i) => <ProductBox key={p.id || i} product={p} onMagnify={handleMagnify} />)}
                </div>
            </div>
            <div id="MainHubUpgradeV001ForYourStore" className="border rounded-md p-2">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 mr-2" onClick={() => {
                            if (!user) {
                                alert('You must be logged in to add a product.');
                                return;
                            }
                            setAddProductModalOpen(true)
                        }}>
                            <Eye />
                        </Button>
                        <h4 className="font-semibold text-center">Your Store:</h4>
                    </div>
                </div>
                <div className="space-y-2">
                    {userStoreProducts.map((p, i) => <ProductBox key={p.id || i} product={p} onMagnify={handleMagnify} />)}
                </div>
            </div>
        </>
    );
  };

  const renderCenterContent = () => {
    switch (centerView) {
        case 'friends':
            return <MainHubUpgradeV001ForFriendsView pendingRequests={pendingFriendRequests} setPendingRequests={setPendingFriendRequests} />;
        case 'settings':
            return <MainHubUpgradeV001ForSettingsView />;
        case 'broadcasts':
        default:
            const currentBroadcast = broadcasts[broadcastView];
            return (
                <>
                    <div className="flex items-center justify-center mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigateBroadcast('left')}>
                            <ChevronLeft />
                        </Button>
                        <h3 className="text-center font-bold mx-4">{currentBroadcast?.title || 'MyBroadcasts'}</h3>
                        <Button variant="ghost" size="icon" onClick={() => navigateBroadcast('right')}>
                            <ChevronRight />
                        </Button>
                    </div>
                    {broadcastView === 'MyBroadcasts' ? 
                        (user ? <CreateBroadcastView /> : <p className="text-center text-muted-foreground">You must be logged in to create a broadcast.</p>) 
                        : (currentBroadcast ? <BroadcastView broadcast={currentBroadcast} /> : <p>Broadcast not found.</p>)}
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
    }
  };

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

  if (!isOpen) return null;

  return (
    <>
      <div className="bg-background text-foreground w-full h-full flex flex-col relative">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-50" onClick={onClose}>
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>
        {/* Top Section */}
        <div className="flex p-4 border-b">
          <div id="MainHubUpgradeV001ForMyProfileSettingsTopLeftSection" className="w-1/5 grid grid-cols-2 grid-rows-2 gap-2 pr-4">
            <Button variant="outline" className="flex flex-col h-full items-center justify-center relative" title="FriendsFam&Others" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
              {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
              <Users className="mb-1" /> Friends
            </Button>
            <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Broadcast" onClick={() => setCenterView('broadcasts')}><Megaphone className="mb-1" /> Broadcast</Button>
            <a href="https://github.com/uminionunion/uminionswebsite" target="_blank" rel="noopener noreferrer" className="w-full h-full">
              <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center" title="Code" disabled={!user}><Code className="mb-1" /> Code</Button>
            </a>
            <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}><Settings className="mb-1" /> Settings</Button>
          </div>
          <div id="MainHubUpgradeV001ForMyProfileSettingsTopMiddleSection" className="w-3/5 h-40 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png')" }}>
            {user && <Button className="absolute bottom-2 right-2" size="sm">Change Cover</Button>}
          </div>
          <div id="MainHubUpgradeV001ForMyProfileSettingsTopRightSection" className="w-1/5 flex justify-end items-start pl-4 relative">
            <div onClick={handleProfileImageClick} className="cursor-pointer">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.profile_image_url || "https://uminion.com/wp-content/uploads/2025/02/iArt06532.png"} alt="Profile" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
            {user && <Button size="sm" className="absolute top-0 right-0">Edit</Button>}
            <div className="absolute bottom-0 right-0 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-muted-foreground">{user ? 'Online' : 'Not Logged In'}</span>
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex-grow flex overflow-hidden">
          <div id="MainHubUpgradeV001ForMyProfileSettingsCenterLeftSection" className="w-[20%] p-4 border-r overflow-y-auto">
            <h3 className="text-center font-bold mb-4">uHome-Hub:</h3>
            <div className="grid grid-cols-2 gap-2">
              {MainHubUpgradeV001ForUHomeHubButtons.map(num => (
  <Button 
    key={num} 
    variant="outline" 
    size="sm" 
    onClick={() => handleUHomeHubClick(num)}
    className="relative"
  >
    #{String(num).padStart(2, '0')}
    {unreadChatrooms.has(num) && (
      <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full transform translate-x-1 -translate-y-1"></div>
    )}
  </Button>
))}
            </div>
          </div>
          <div id="MainHubUpgradeV001ForMyProfileSettingsCenterCenterSection" className="w-[60%] p-4 overflow-y-auto">
            {renderCenterContent()}
          </div>
          <div id="MainHubUpgradeV001ForMyProfileSettingsCenterRightSection" className="w-[20%] p-4 border-l overflow-y-auto">
            <div className="flex items-center justify-center mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigateCenterRight('left')}><ChevronLeft /></Button>
                <h3 className="text-center font-bold mx-4">{centerRightView}</h3>
                <Button variant="ghost" size="icon" onClick={() => navigateCenterRight('right')}><ChevronRight /></Button>
            </div>
            <div className="space-y-4">
              {renderCenterRightContent()}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex border-t">
          <div id="MainHubUpgradeV001ForMyProfileSettingsBottomLeftSection" className="w-[20%] p-4 border-r flex items-center">
            <Button variant="ghost" size="icon" onClick={() => handleSocialNavLeft('left')}><ChevronLeft /></Button>
            <div className="flex-grow grid grid-cols-3 gap-4 place-items-center">
              {socialLinkPagesLeft[socialPageLeft].map(link => (
                <MainHubUpgradeV001ForSocialIcon key={link.id} href={link.href}>{link.icon}</MainHubUpgradeV001ForSocialIcon>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleSocialNavLeft('right')}><ChevronRight /></Button>
          </div>
          <div id="MainHubUpgradeV001ForMyProfileSettingsBottomCenterSection" className="w-[60%] p-4 flex items-center justify-center">
            <a href="https://uminion.com/product/union-card-the-official-uminion-union-card/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
              Become an Official Member of the Union via getting your Union Card Today!
            </a>
          </div>
          <div id="MainHubUpgradeV001ForMyProfileSettingsBottomRightSection" className="w-[20%] p-4 border-l flex items-center">
             <Button variant="ghost" size="icon" onClick={() => handleSocialNavRight('left')}><ChevronLeft /></Button>
            <div className="flex-grow grid grid-cols-3 gap-4 place-items-center">
              {socialLinkPagesRight[socialPageRight].map(link => (
                <MainHubUpgradeV001ForSocialIcon key={link.id} href={link.href}>{link.icon}</MainHubUpgradeV001ForSocialIcon>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleSocialNavRight('right')}><ChevronRight /></Button>
          </div>
        </div>
      </div>
      
      {activeChatModal !== null && (
        <MainHubUpgradeV001ForChatModal
          isOpen={activeChatModal !== null}
          onClose={handleCloseChatModal}
          pageName={MainHubUpgradeV001ForSisterUnionPages[activeChatModal - 1]}
          backgroundColor={MainHubUpgradeV001ForModalColors[activeChatModal - 1]}
          modalNumber={activeChatModal}
        />
      )}
      {isAddProductModalOpen && (
        <MainHubUpgradeV001ForAddProductModal isOpen={isAddProductModalOpen} onClose={() => setAddProductModalOpen(false)} />
      )}
      {isProductDetailModalOpen && (
        <MainHubUpgradeV001ForProductDetailModal isOpen={isProductDetailModalOpen} onClose={() => setProductDetailModalOpen(false)} product={selectedProduct} />
      )}
    </>
  );
};

export default MainHubUpgradeV001ForMyProfileModal;

// =================================================================================================
// Deployment Instructions
// =================================================================================================
//
// To deploy this application, you will need a server environment (like a VPS) with Node.js installed.
//
// 1.  **GitHub**:
//     -   Create a new repository on GitHub.
//     -   In your local project folder, initialize a git repository: `git init`.
//     -   Add the remote repository: `git remote add origin <your-github-repo-url>`.
//     -   Add all files: `git add .`.
//     -   Commit the files: `git commit -m "Initial commit"`.
//     -   Push to GitHub: `git push -u origin main`.
//
// 2.  **VPS (Virtual Private Server) Setup**:
//     -   Connect to your VPS via SSH.
//     -   Install Node.js and npm (Node Package Manager).
//     -   Install a process manager like `pm2` to keep your app running: `npm install -g pm2`.
//     -   Clone your repository from GitHub: `git clone <your-github-repo-url>`.
//     -   Navigate into your project directory: `cd <your-repo-name>`.
//
// 3.  **Building and Running the Application**:
//     -   Install dependencies: `npm install`.
//     -   Build the application for production: `npm run build`. This will create a `dist` directory.
//     -   Start the application using pm2: `pm2 start dist/server/index.js --name my-app`.
//
// 4.  **FTP (File Transfer Protocol)**:
//     -   If you prefer FTP over Git, you can use an FTP client (like FileZilla) to upload your files.
//     -   First, run the `npm run build` command on your local machine to generate the `dist` folder.
//     -   Connect to your server using your FTP client.
//     -   Upload the entire project folder, including `node_modules`, `dist`, and `package.json`, to your server.
//     -   Once uploaded, connect to your server via SSH and run the application using pm2 as described above.
//
// 5.  **Web Server (Nginx/Apache) - Optional but Recommended**:
//     -   It's best practice to run your Node.js app behind a reverse proxy like Nginx.
//     -   Install Nginx on your VPS.
//     -   Configure Nginx to listen on port 80 and forward requests to your Node.js app's port (e.g., 3001 or 4000).
//     -   This allows you to handle SSL certificates, serve static files more efficiently, and manage multiple sites on one server.
//
// =================================================================================================

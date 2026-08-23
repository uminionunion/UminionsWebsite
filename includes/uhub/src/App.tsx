import React, { useState, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainUhubFeatureV001ForSisterUnionRoutes from '@/features/uminion/MainUhubFeatureV001ForSisterUnionRoutes';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import AuthModal from './features/auth/AuthModal';
import MainUhubFeatureV001ForMyProfileModal from '@/features/profile/MainUhubFeatureV001ForMyProfileModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MainUhubFeatureV001ForUserProfileModal from './features/profile/MainUhubFeatureV001ForUserProfileModal';
import BadgeZoomToast from './features/profile/BadgeZoomToast';
import { Pencil } from 'lucide-react';

const MainUhubFeatureV001Layout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [sharedProfileUser, setSharedProfileUser] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [zoomedBadge, setZoomedBadge] = useState<{ url: string; name: string } | null>(null);
  const [isLauncherImageUploadOpen, setLauncherImageUploadOpen] = useState(false);

  // Handler for badge zoom that works in ANY modal context
  const handleBadgeZoom = (badge: { url: string; name: string }) => {
    console.log('[BADGE ZOOM] Opening badge zoom modal:', badge);
    setZoomedBadge(badge);
  };

// Check for shared profile link in URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const openProfileUsername = params.get('openProfile');
  
  if (openProfileUsername) {
    console.log(`[SHARED PROFILE] Opening profile for user ${openProfileUsername}`);
    
    // Fetch the user data by username
    fetch(`/api/auth/user/${encodeURIComponent(openProfileUsername)}`)
      .then(res => res.json())
      .then(userData => {
        setSharedProfileUser(userData);
        setProfileModalOpen(true);
        // Remove the query param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch(err => {
        console.error('[SHARED PROFILE] Error fetching user:', err);
      });
  }
}, []);
  
  useEffect(() => {
    if (autoLaunch) {
      handleAutoLaunch();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoLaunch]);

  const handleAutoLaunch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if(timerRef.current) clearInterval(timerRef.current);
          setProfileModalOpen(true);
          setCountdown(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOpenModalManually = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setCountdown(null);
    }
    setProfileModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleOpenAuthModal = (mode: 'login' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleProfileImageClick = () => {
    if (!user) {
      handleOpenAuthModal('login');
    } else {
      // Show own user profile (not my profile modal)
      setSharedProfileUser(user);
      setProfileModalOpen(true);
    }
  };

  const handleLauncherImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch('/api/auth/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Profile image upload failed');
      }

      setLauncherImageUploadOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Profile image upload failed:', error);
    }
  };

  return (
    // Compact horizontal bar (instead of page007's full-page header/main/footer layout)
    // so the 5 buttons sit in a single row inside page001's "FrontPage001" mount div.
    <div className="relative inline-flex flex-wrap items-center gap-3">
      <Button onClick={handleOpenModalManually} className="relative">
        uHub
        {countdown !== null && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {countdown}
          </div>
        )}
      </Button>

      {isAuthLoading ? (
        <span id="loading-text">loading...</span>
      ) : !user ? (
        <>
          <Button onClick={() => handleOpenAuthModal('signup')} className="bg-orange-400 hover:bg-orange-500 text-black">Sign Up?</Button>
          <Button onClick={() => handleOpenAuthModal('login')}>Log In?</Button>
        </>
      ) : (
        <Button onClick={handleLogout} variant="destructive">Log Out</Button>
      )}

      <a href="https://www.facebook.com/groups/uminion/" target="_blank" rel="noopener noreferrer">
        <Button>Find us on FB!</Button>
      </a>

      <div onClick={handleProfileImageClick} className="relative cursor-pointer group">
        <Avatar className="h-[60px] w-[60px] border-2 border-orange-400 group-hover:border-orange-600 transition">
          <AvatarImage src={user?.profile_image_url || "/defaultUminionUassets/defaultUminionUbadge.png"} alt="Profile" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        {user && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setLauncherImageUploadOpen(true);
            }}
            className="absolute bottom-0 right-0 rounded-full bg-orange-400 p-1 text-white shadow-lg hover:bg-orange-500"
            title="Edit profile picture"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      <Routes>
        <Route path="/*" element={<MainUhubFeatureV001ForSisterUnionRoutes />} />
      </Routes>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50">
          {sharedProfileUser ? (
            <MainUhubFeatureV001ForUserProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => {
                setProfileModalOpen(false);
                setSharedProfileUser(null);
              }}
              user={sharedProfileUser}
              currentUser={user}
              onBadgeZoomOpen={(badge) => setZoomedBadge(badge)}
            />
          ) : (
            <MainUhubFeatureV001ForMyProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setProfileModalOpen(false)}
              onOpenAuthModal={handleOpenAuthModal}
              onBadgeZoom={handleBadgeZoom}
            />
          )}
        </div>
      )}

      {zoomedBadge && (
        <BadgeZoomToast
          imageUrl={zoomedBadge.url}
          altText={`${zoomedBadge.name} badge`}
          onClose={() => setZoomedBadge(null)}
        />
      )}

      {isLauncherImageUploadOpen && user && (
        <div className="fixed inset-0 z-[1000002] flex items-center justify-center bg-black/70">
          <div className="w-[90%] max-w-md rounded-lg border bg-black p-6 text-white">
            <h2 className="mb-4 text-xl font-bold">Change Profile Picture</h2>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleLauncherImageUpload(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full text-white"
              onClick={() => setLauncherImageUploadOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {authModal.isOpen && (
        <AuthModal
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          onSwitchMode={(newMode) => setAuthModal({ isOpen: true, mode: newMode })}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router initialEntries={['/']}>
      <AuthProvider>
        <MainUhubFeatureV001Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;

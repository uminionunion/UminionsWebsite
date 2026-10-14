
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Facebook, Youtube, Twitch, Instagram, Github, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, ChevronUp } from 'lucide-react';

const socialLinks = [
  { id: 'facebook', icon: <Facebook />, defaultLink: 'https://www.facebook.com/groups/1615679026489537' },
  { id: 'bluesky', icon: <MessageSquare />, defaultLink: 'https://bsky.app/profile/uminion.bsky.social' },
  { id: 'github', icon: <Github />, defaultLink: 'https://github.com/uminionunion/uminionswebsite' },
  { id: 'youtube', icon: <Youtube />, defaultLink: 'https://www.youtube.com/@UminionUnion' },
  { id: 'twitch', icon: <Twitch />, defaultLink: 'https://www.twitch.tv/theuminionunion' },
  { id: 'discord', icon: 'D', defaultLink: 'https://discord.com/login?redirect_to=%2Flogin%3Fredirect_to%3D%252Fchannels%252F1357919291428573204%252F1357919292280144075' },
  { id: 'instagram', icon: <Instagram />, defaultLink: 'https://www.instagram.com/theuminionunion/?igsh=ajdjeGUycHRmczVs&ut-m_source=qr#' },
  { id: 'mastodon', icon: 'M', defaultLink: 'https://mastodon.social/@uminion' },
  { id: 'githubDiscussions', icon: <Github />, defaultLink: 'https://github.com/uminionunion/UminionsWebsite/discussions' },
  { id: 'threads', icon: '@', defaultLink: 'https://www.threads.com/@theuminionunion' },
  { id: 'patreon', icon: 'P', defaultLink: 'https://www.patreon.com/uminion' },
  { id: 'githubIssues', icon: <Github />, defaultLink: 'https://github.com/uminionunion/UminionsWebsite/issues' },
];

const MainUhubFeatureV001ForSettingsView = () => {
  const { user, logout } = useAuth();
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [isUmiMatchEnrolled, setIsUmiMatchEnrolled] = useState(false);
  const [isSocialLinksExpanded, setIsSocialLinksExpanded] = useState(false);
  const [isProfileCustomizationExpanded, setIsProfileCustomizationExpanded] = useState(false);
  const [isMyAccountExpanded, setIsMyAccountExpanded] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    allow_logged_in_friends_list: true,
    allow_anonymous_posts: true,
    allow_anonymous_interactions: false,
  });
  const [privacyError, setPrivacyError] = useState('');
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  useEffect(() => {
    const savedAutoLaunch = localStorage.getItem('uHubAutoLaunch');
    if (savedAutoLaunch !== null) {
      setAutoLaunch(JSON.parse(savedAutoLaunch));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch('/api/umimatch/profile', { credentials: 'include' })
      .then(response => response.ok ? response.json() : { profile: null })
      .then(data => setIsUmiMatchEnrolled(data.profile?.is_enrolled === 1))
      .catch(() => setIsUmiMatchEnrolled(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/account/privacy', { credentials: 'include' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load privacy settings.');
        if (!cancelled) {
          setPrivacySettings({
            allow_logged_in_friends_list: data.allow_logged_in_friends_list === 1,
            allow_anonymous_posts: data.allow_anonymous_posts === 1,
            allow_anonymous_interactions: data.allow_anonymous_interactions === 1,
          });
          setPrivacyError('');
        }
      })
      .catch(error => {
        if (!cancelled) setPrivacyError(error instanceof Error ? error.message : 'Could not load privacy settings.');
      });
    return () => { cancelled = true; };
  }, [user]);

  const handlePrivacyChange = async (field: keyof typeof privacySettings, checked: boolean) => {
    const previousValue = privacySettings[field];
    setPrivacySettings(current => ({ ...current, [field]: checked }));
    setIsSavingPrivacy(true);
    setPrivacyError('');
    try {
      const response = await fetch('/api/account/privacy', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: checked }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save privacy settings.');
      setPrivacySettings({
        allow_logged_in_friends_list: data.allow_logged_in_friends_list === 1,
        allow_anonymous_posts: data.allow_anonymous_posts === 1,
        allow_anonymous_interactions: data.allow_anonymous_interactions === 1,
      });
    } catch (error) {
      setPrivacySettings(current => ({ ...current, [field]: previousValue }));
      setPrivacyError(error instanceof Error ? error.message : 'Could not save privacy settings.');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const removeUmiMatchAccount = async () => {
    if (!window.confirm('Remove your UmiMatch account, matches, and UmiMatch chats?')) return;
    const response = await fetch('/api/umimatch/remove', { method: 'POST', credentials: 'include' });
    if (response.ok) setIsUmiMatchEnrolled(false);
  };

  const deleteMyAccount = async () => {
    if (!window.confirm('Delete your uHub account? This archives your user record and logs you out.')) return;
    const response = await fetch('/api/account/delete', { method: 'POST', credentials: 'include' });
    if (response.ok) {
      await logout();
      window.location.reload();
    }
  };

  const handleAutoLaunchChange = (checked: boolean) => {
    setAutoLaunch(checked);
    localStorage.setItem('uHubAutoLaunch', JSON.stringify(checked));
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-bold text-lg mb-4">General Settings</h4>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="auto-launch-toggle" checked={autoLaunch} onCheckedChange={handleAutoLaunchChange} />
            <Label htmlFor="auto-launch-toggle">Should the uHub auto-launch when website launches/refreshes?</Label>
          </div>
          <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={logout}>Log Out</Button>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-bold text-lg">Social Media Links</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border border-gray-600 bg-black text-white hover:bg-black hover:text-white"
            aria-label={isSocialLinksExpanded ? 'Collapse Social Media Links' : 'Expand Social Media Links'}
            aria-expanded={isSocialLinksExpanded}
            aria-controls="social-media-links-menu"
            onClick={() => setIsSocialLinksExpanded(expanded => !expanded)}
          >
            {isSocialLinksExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {isSocialLinksExpanded && (
          <div id="social-media-links-menu">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialLinks.map(link => (
                <div key={link.id} className="flex items-center gap-2">
                  <div className="p-2 border rounded-md">{link.icon}</div>
                  <Input defaultValue={link.defaultLink} />
                  <Button variant="outline" size="sm">Change Icon</Button>
                </div>
              ))}
            </div>
            <Button variant="destructive" className="mt-4">Reset All Links</Button>
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-bold text-lg text-white">Profile-Customization</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border border-gray-600 bg-black text-white hover:bg-black hover:text-white"
            aria-label={isProfileCustomizationExpanded ? 'Collapse Profile-Customization' : 'Expand Profile-Customization'}
            aria-expanded={isProfileCustomizationExpanded}
            aria-controls="profile-customization-menu"
            onClick={() => setIsProfileCustomizationExpanded(expanded => !expanded)}
          >
            {isProfileCustomizationExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {isProfileCustomizationExpanded && (
          <div id="profile-customization-menu">
            <button
              type="button"
              onClick={() => setIsMyAccountExpanded(expanded => !expanded)}
              className="mb-4 flex w-full items-center justify-between rounded bg-gray-700 px-2 py-1 text-left font-bold text-white transition hover:text-orange-400"
              aria-expanded={isMyAccountExpanded}
              aria-controls="my-account-options"
            >
              <span>My Account {isMyAccountExpanded ? '-' : '+'}</span>
              {isMyAccountExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isMyAccountExpanded && (
              <div id="my-account-options" className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={privacySettings.allow_logged_in_friends_list} disabled={isSavingPrivacy} onChange={event => handlePrivacyChange('allow_logged_in_friends_list', event.target.checked)} className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow others (who are logged in) to see my friends list</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={privacySettings.allow_anonymous_posts} disabled={isSavingPrivacy} onChange={event => handlePrivacyChange('allow_anonymous_posts', event.target.checked)} className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to see posts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={privacySettings.allow_anonymous_interactions} disabled={isSavingPrivacy} onChange={event => handlePrivacyChange('allow_anonymous_interactions', event.target.checked)} className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to like and comment on posts</span>
                </label>
                {privacyError && <p role="alert" className="text-sm text-red-400">{privacyError}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-bold text-lg mb-4">Communication Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="email-opt-in" />
            <Label htmlFor="email-opt-in">I opt-in to receive emails/newsletters/reminders/eventContent/stuff regarding the union</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="text-opt-in" />
            <Label htmlFor="text-opt-in">I opt-in to receive texts on events/newsletters/reminders/stuff regarding the union</Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isUmiMatchEnrolled && <Button variant="outline" onClick={removeUmiMatchAccount}>You are signed up for UmiMatch. Would you like to unSignUp/HaveYourAccountRemoved from UmiMatch?</Button>}
        <Button variant="destructive" onClick={deleteMyAccount}>Delete My Account</Button>
      </div>
    </div>
  );
};

export default MainUhubFeatureV001ForSettingsView;

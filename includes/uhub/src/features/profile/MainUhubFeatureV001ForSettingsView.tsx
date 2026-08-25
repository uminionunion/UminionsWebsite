
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Facebook, Youtube, Twitch, Instagram, Github, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
  const [autoLaunch, setAutoLaunch] = useState(true);

  useEffect(() => {
    const savedAutoLaunch = localStorage.getItem('uHubAutoLaunch');
    if (savedAutoLaunch !== null) {
      setAutoLaunch(JSON.parse(savedAutoLaunch));
    }
  }, []);

  const handleAutoLaunchChange = (checked: boolean) => {
    setAutoLaunch(checked);
    localStorage.setItem('uHubAutoLaunch', JSON.stringify(checked));
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-bold text-lg mb-4">General Settings</h4>
        <div className="flex items-center space-x-2">
          <Switch id="auto-launch-toggle" checked={autoLaunch} onCheckedChange={handleAutoLaunchChange} />
          <Label htmlFor="auto-launch-toggle">Should the uHub auto-launch when website launches/refreshes?</Label>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-lg mb-4">Social Media Links</h4>
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
    </div>
  );
};

export default MainUhubFeatureV001ForSettingsView;

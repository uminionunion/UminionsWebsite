
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageSquare, UserX, ShieldAlert, Paperclip, Send, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const FriendRequestItem = ({ request, onAccept, onReject, onBlock, onReport }) => (
  <div className="flex items-center justify-between p-2 rounded-md bg-accent/50">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={request.user1_profile_image_url} />
        <AvatarFallback>{request.user1_username.charAt(1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{request.user1_username}</p>
        <p className="text-xs text-muted-foreground">Wants to be your friend</p>
      </div>
    </div>
    <div className="flex gap-1">
      <Button size="sm" onClick={() => onAccept(request.id)}>Accept</Button>
      <Button size="sm" variant="destructive" onClick={() => onReject(request.id)}>Deny</Button>
      <Button size="sm" variant="outline" onClick={() => onBlock(request.user_id1)}>Block</Button>
      <Button size="sm" variant="outline" onClick={() => onReport(request.user_id1)}>Report</Button>
    </div>
  </div>
);

const MainUhubFeatureV001ForFriendsView = ({ pendingRequests, setPendingRequests }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [feed, setFeed] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/friends')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFriends(data);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/feed/friends?offset=0&limit=30', { credentials: 'include' })
      .then(res => res.ok ? res.json() : { items: [] })
      .then(data => setFeed(Array.isArray(data.items) ? data.items : []))
      .catch(console.error);
  }, [user, friends.length]);

  useEffect(() => {
    if (!selectedFriend) return;
    fetch(`/api/direct-messages/${selectedFriend.id}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : { messages: [] })
      .then(data => setMessages(Array.isArray(data.messages) ? data.messages : []))
      .catch(console.error);
  }, [selectedFriend]);

  const handleAccept = async (requestId) => {
    await fetch('/api/friends/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    fetch('/api/friends').then(res => res.json()).then(setFriends);
  };

  const handleReject = async (requestId) => {
    await fetch('/api/friends/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleBlock = async (userId) => {
    await fetch('/api/friends/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    alert(`User ${userId} blocked.`);
  };

  const handleReport = (userId) => {
    const reason = prompt("Please provide a reason for reporting this user:");
    if (reason) {
      fetch('/api/friends/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedId: userId, reason }),
      });
      alert(`User ${userId} reported.`);
    }
  };

  const sendMessage = async (attachment?: { url: string; type: string }) => {
    if (!selectedFriend || (!messageText.trim() && !attachment)) return;
    const response = await fetch(`/api/direct-messages/${selectedFriend.id}`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: messageText, attachmentUrl: attachment?.url, attachmentType: attachment?.type }),
    });
    if (response.ok) {
      const data = await response.json();
      setMessages(current => [...current, data.message]);
      setMessageText('');
    }
  };

  const uploadAttachment = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const uploaded = await response.json();
      await sendMessage({ url: uploaded.url, type: file.type });
    } catch (error) {
      console.error('[FRIENDS] Attachment upload failed:', error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const upvoteFeedEntry = async (entry) => {
    const basePath = entry.type === 'meme' ? `/api/memes/posts/${entry.id}` : entry.type === 'social' ? `/api/social-posts/${entry.id}` : `/api/episodes/${entry.id}`;
    await fetch(`${basePath}/upvote`, { method: 'POST', credentials: 'include' });
    setFeed(current => current.map(item => item.type === entry.type && item.id === entry.id ? { ...item, upvotes: item.upvotes + 1 } : item));
  };

  return (
    <div className="grid grid-cols-3 h-full gap-4">
      <div className="col-span-1 border-r pr-4 overflow-y-auto">
        <h4 className="font-bold text-lg mb-4">Friend Requests</h4>
        <div className="space-y-2 mb-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(req => (
              <FriendRequestItem 
                key={req.id} 
                request={req} 
                onAccept={handleAccept}
                onReject={handleReject}
                onBlock={handleBlock}
                onReport={handleReport}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No new friend requests.</p>
          )}
        </div>

        <h4 className="font-bold text-lg mb-4">Friends List</h4>
        <div className="space-y-2">
          {friends.length > 0 ? friends.map(friend => (
            <div
              key={friend.id}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedFriend?.id === friend.id ? 'bg-accent' : 'hover:bg-muted/50'}`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friend.profile_image_url} />
                  <AvatarFallback>{friend.username.charAt(1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{friend.username}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          )) : <p className="text-sm text-muted-foreground">No friends yet.</p>}
        </div>
      </div>

      <div className="col-span-2 flex flex-col h-full">
        {selectedFriend ? (
          <>
            <div className="border-b pb-2 mb-4">
              <h4 className="font-bold text-lg">Chat with {selectedFriend.username}</h4>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
              {messages.map(message => (
                <div key={message.id} className={message.sender_id === user.id ? 'text-right' : 'text-left'}>
                  <span className="inline-block max-w-[80%] rounded bg-gray-800 px-3 py-2 text-sm">
                    {message.content}
                    {message.attachment_url && <a className="mt-1 block text-cyan-300 underline" href={message.attachment_url} target="_blank" rel="noreferrer">{message.attachment_type?.startsWith('image/') ? 'View image' : message.attachment_type?.startsWith('audio/') ? 'Play audio' : message.attachment_type?.startsWith('video/') ? 'Play video' : 'Open attachment'}</a>}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder={`Message ${selectedFriend.username}...`} value={messageText} onChange={event => setMessageText(event.target.value)} onKeyDown={event => event.key === 'Enter' && void sendMessage()} />
              <Button onClick={() => void sendMessage()} disabled={!messageText.trim()}><Send className="h-4 w-4" /></Button>
              <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border"><Paperclip className="h-4 w-4" /><input type="file" className="hidden" accept="image/jpeg,image/png,image/gif,audio/mpeg,audio/*,video/mp4,video/*" onChange={uploadAttachment} disabled={isUploading} /></label>
            </div>
          </>
        ) : (
          <div className="h-full overflow-y-auto">
            <h4 className="mb-3 text-lg font-bold">Friends' Activity</h4>
            <div className="space-y-2">{feed.map(entry => <div key={`${entry.type}-${entry.id}`} className="rounded border bg-gray-900/60 p-2"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-cyan-300">{entry.username}</span><button type="button" className="flex items-center gap-1 text-xs text-green-300" onClick={() => void upvoteFeedEntry(entry)}><ThumbsUp className="h-3 w-3" /> {entry.upvotes}</button></div><p className="mt-1 text-sm">{entry.content || entry.title || entry.name || 'Shared an episode'}</p></div>)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainUhubFeatureV001ForFriendsView;

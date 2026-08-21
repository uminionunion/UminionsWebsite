
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageSquare, UserPlus, UserX, ShieldAlert } from 'lucide-react';
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

const MainHubUpgradeV001ForFriendsView = ({ pendingRequests, setPendingRequests }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);

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

  const handleAccept = async (requestId) => {
    await fetch('/api/friends/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    // Re-fetch friends list
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
    // Optionally remove from lists
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

  return (
    <div className="grid grid-cols-3 h-full gap-4">
      {/* Friends List */}
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
                  {/* Online status can be implemented with WebSockets */}
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          )) : <p className="text-sm text-muted-foreground">No friends yet.</p>}
        </div>
      </div>

      {/* Direct Message Area */}
      <div className="col-span-2 flex flex-col h-full">
        {selectedFriend ? (
          <>
            <div className="border-b pb-2 mb-4">
              <h4 className="font-bold text-lg">Chat with {selectedFriend.username}</h4>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {/* Chat messages would be loaded here */}
              <div className="text-center text-muted-foreground p-8">
                Direct messaging is under construction.
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder={`Message ${selectedFriend.username}...`} />
              <Button>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a friend to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainHubUpgradeV001ForFriendsView;

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { ThumbsUp, ThumbsDown, MessageCircle, Star } from 'lucide-react';

// Renders a single entry (MemeBox post or Social Media post) inside "My Feed" / "Union Announcements",
// with vote/favorite/comment controls per C.2. Both post types share the same vote/favorite/comment
// endpoint shapes (/api/memes/posts/:id/... vs /api/social-posts/:id/...), so one component covers both.
interface FeedEntryCardProps {
  entry: any;
  onChanged: () => void;
}

const FeedEntryCard: React.FC<FeedEntryCardProps> = ({ entry, onChanged }) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const basePath = entry.type === 'meme' ? `/api/memes/posts/${entry.id}` : `/api/social-posts/${entry.id}`;

  const vote = async (direction: 'upvote' | 'downvote') => {
    try {
      await fetch(`${basePath}/${direction}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      onChanged();
    } catch (error) {
      console.error('[FEED] Error voting:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      await fetch(`${basePath}/favorite`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      onChanged();
    } catch (error) {
      console.error('[FEED] Error favoriting:', error);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await fetch(`${basePath}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      setCommentText('');
      setIsCommentBoxOpen(false);
      onChanged();
    } catch (error) {
      console.error('[FEED] Error commenting:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="border rounded p-2 bg-gray-900/50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-cyan-400">{entry.username}</span>
        <span className="text-[10px] text-gray-500 uppercase">{entry.type === 'meme' ? 'MemeBox' : 'Social'}</span>
      </div>

      {entry.type === 'meme' ? (
        <div className="flex items-center gap-2 mb-2">
          {entry.images && entry.images[0] && (
            <img src={entry.images[0]} alt={entry.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate text-xs">{entry.title}</p>
            {entry.description && (
              <p className="text-xs text-gray-500 truncate">
                {entry.description}
                {entry.isEdited ? ' -edited' : ''}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-200 whitespace-pre-wrap mb-2">{entry.content}</p>
      )}
      {entry.type === 'social' && entry.isEdited && (
        <p className="text-right text-[10px] text-gray-500 mb-1">edited</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`flex items-center gap-1 text-xs ${entry.userVote === 1 ? 'text-green-400' : 'text-gray-400'}`}
          onClick={() => vote('upvote')}
        >
          <ThumbsUp className="h-3 w-3" /> {entry.upvotes}
        </button>
        <button
          type="button"
          className={`flex items-center gap-1 text-xs ${entry.userVote === -1 ? 'text-red-400' : 'text-gray-400'}`}
          onClick={() => vote('downvote')}
        >
          <ThumbsDown className="h-3 w-3" /> {entry.downvotes}
        </button>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-gray-400"
          onClick={() => setIsCommentBoxOpen((prev) => !prev)}
        >
          <MessageCircle className="h-3 w-3" /> Comment
        </button>
        <button
          type="button"
          className={`flex items-center gap-1 text-xs ${entry.isFavorited ? 'text-yellow-400' : 'text-gray-400'}`}
          onClick={toggleFavorite}
        >
          <Star className="h-3 w-3" /> Favorite
        </button>
      </div>

      {isCommentBoxOpen && (
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 p-1 text-xs border rounded bg-gray-800 text-white"
            style={{ color: '#ffffff' }}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <Button size="sm" className="bg-orange-400 hover:bg-orange-500" onClick={submitComment} disabled={isSubmittingComment}>
            {isSubmittingComment ? '...' : 'Post'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedEntryCard;

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import QueuedImage from '../../components/QueuedImage';

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
  const [interactionError, setInteractionError] = useState('');

  const basePath = entry.type === 'meme' ? `/api/memes/posts/${entry.id}` : entry.type === 'social' ? `/api/social-posts/${entry.id}` : `/api/episodes/${entry.id}`;

  const vote = async (direction: 'upvote' | 'downvote') => {
    try {
      setInteractionError('');
      const response = await fetch(`${basePath}/${direction}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not update your vote.');
      onChanged();
    } catch (error) {
      console.error('[FEED] Error voting:', error);
      setInteractionError(error instanceof Error ? error.message : 'Could not update your vote.');
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
    setInteractionError('');
    try {
      const response = await fetch(`${basePath}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not post your comment.');
      setCommentText('');
      setIsCommentBoxOpen(false);
      onChanged();
    } catch (error) {
      console.error('[FEED] Error commenting:', error);
      setInteractionError(error instanceof Error ? error.message : 'Could not post your comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="border rounded p-2 bg-gray-900/50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-cyan-400">{entry.username}</span>
        <span className="text-[10px] text-gray-500 uppercase">{entry.type === 'meme' ? 'MemeBox' : entry.type === 'social' ? 'Social' : 'Episode'}</span>
      </div>

      {interactionError && <p role="alert" className="mt-2 text-xs text-red-400">{interactionError}</p>}

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
      ) : entry.type === 'social' ? (
        <p className="text-xs text-gray-200 whitespace-pre-wrap mb-2">{entry.content}</p>
      ) : (
        <div className="flex items-center gap-2 mb-2">
          {entry.cover_image_url && (
            <QueuedImage src={entry.cover_image_url} alt={entry.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate text-xs">{entry.name}</p>
            {entry.description && (
              <p className="text-xs text-gray-500 truncate">
                {entry.description}
                {entry.isEdited ? ' -edited' : ''}
              </p>
            )}
          </div>
        </div>
      )}
      {entry.type === 'social' && entry.isEdited && (
        <p className="text-right text-[10px] text-gray-500 mb-1">edited</p>
      )}

      {/* Same grayish-black background (#222222) and green emoji icons the MemeBox voteSection uses. */}
      <div className="flex items-center justify-around gap-2 p-2 rounded" style={{ backgroundColor: '#222222' }}>
        <button type="button" aria-label="Upvote" className="flex flex-col items-center gap-1 border-0 bg-transparent p-1 text-white" onClick={() => vote('upvote')}>
          <img src="/EmojisForUminionWebsite/GreenEmoji002ThumbsUp.png" width="20" alt="Upvote" />
          <span className="text-xs font-bold" style={{ color: '#00ff00' }}>{entry.upvotes}</span>
        </button>
        <button type="button" aria-label="Downvote" className="flex flex-col items-center gap-1 border-0 bg-transparent p-1 text-white" onClick={() => vote('downvote')}>
          <img src="/EmojisForUminionWebsite/GreenEmoji003ThumbsDown.png" width="20" alt="Downvote" />
          <span className="text-xs font-bold" style={{ color: '#00ff00' }}>{entry.downvotes}</span>
        </button>
        <button type="button" aria-label="Comment" className="flex flex-col items-center gap-1 border-0 bg-transparent p-1 text-white" onClick={() => setIsCommentBoxOpen((prev) => !prev)}>
          <img src="/EmojisForUminionWebsite/GreenEmoji004CommentOrChat.png" width="20" alt="Comment" />
        </button>
        <button type="button" aria-label="Favorite" className="flex flex-col items-center gap-1 border-0 bg-transparent p-1 text-white" onClick={toggleFavorite}>
          <img src="/EmojisForUminionWebsite/GreenEmoji001ThumbsUpFavorites.png" width="20" alt="Favorite" />
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

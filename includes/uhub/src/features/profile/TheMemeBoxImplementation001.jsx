import React, { useState, useEffect, useRef, useCallback } from "react";
import MainUhubFeatureV001ForUserProfileModal from "./MainUhubFeatureV001ForUserProfileModal";

export default function TheMemeBoxImplementation001() {
  // =====================================================
  // STATE VARIABLES
  // =====================================================

  const [allPosts, setAllPosts] = useState([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [commentImageData, setCommentImageData] = useState(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isViewCommentsDialogOpen, setIsViewCommentsDialogOpen] = useState(false);
  const [isFavoritesGridOpen, setIsFavoritesGridOpen] = useState(false);
  const [isFavoriteDetailOpen, setIsFavoriteDetailOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [selectedFavoritePost, setSelectedFavoritePost] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentDescription, setCommentDescription] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [currentUsername, setCurrentUsername] = useState("DemoUser");

  const [isCommentImageZoomOpen, setIsCommentImageZoomOpen] = useState(false);
  const [zoomedCommentImage, setZoomedCommentImage] = useState(null);

  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState(null);

 // For user profile modal integration
  const [isViewingUserProfile, setIsViewingUserProfile] = useState(false);
  const [viewingUserData, setViewingUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const SWIPE_THRESHOLD = 50;
  const MAX_UPLOAD_IMAGES = 50;


  // =====================================================
// EMOJI CONSTANTS WITH FALLBACKS
// =====================================================

// Initial emojis (try to use these first)
const EMOJIS = { 
  UPVOTE_INITIAL: <img src="/EmojisForUminionWebsite/GreenEmoji002ThumbsUp.png" width="24" />,     // Fallback: 👍
  DOWNVOTE_INITIAL: <img src="/EmojisForUminionWebsite/GreenEmoji003ThumbsDown.png" width="24" />,   // Fallback: 👎
  COMMENT_INITIAL: <img src="/EmojisForUminionWebsite/GreenEmoji004CommentOrChat.png" width="24" />,     // Fallback: 💬

  // Fallback emojis (will appear if initial doesn't render) ((((Note from Salem: Fallback function presently not working (i believe, at least, not by actually falling back. anywho; keep that in mind -1:01pm on 3/5/26)
  UPVOTE_FALLBACK: "👍",
  DOWNVOTE_FALLBACK: "👎",
  COMMENT_FALLBACK: "💬",
};

  

  // =====================================================
  // AUTH STATUS CHECK
  // =====================================================

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUsername(user.username);
          setCurrentUser(user);
          console.log("[MEMEBOX] ✅ Logged in as:", user.username);
        } else if (res.status === 401) {
          setCurrentUsername("DemoUser");
          setCurrentUser(null);
        }
      } catch (error) {
        setCurrentUsername("DemoUser");
        setCurrentUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  // =====================================================
  // SAMPLE DATA
  // =====================================================

  const samplePosts = [
    {
      id: 1,
      title: "Laughing Cat",
      description: "This cat is having the best time ever!",
      images: [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ff9999' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3ECat Meme 1%3C/text%3E%3C/svg%3E",
      ],
      upvotes: 15,
      downvotes: 2,
      userVote: null,
      timestamp: new Date(Date.now() - 86400000),
      comments: [],
      isFavorited: false,
    },
    {
      id: 2,
      title: "Dog Jump",
      description: "Pupper jumping super high!",
      images: [
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2399ccff' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EDog Meme 2%3C/text%3E%3C/svg%3E",
      ],
      upvotes: 8,
      downvotes: 1,
      userVote: null,
      timestamp: new Date(Date.now() - 172800000),
      comments: [],
      isFavorited: false,
    },
  ];

  // =====================================================
  // INITIALIZATION - FETCH POSTS FROM DATABASE
  // =====================================================

  useEffect(() => {
   const fetchPostsFromDatabase = async () => {
     try {
       console.log("[MEMEBOX] Fetching posts from database...");

       const [viralRes, userSubmittedRes] = await Promise.all([
         fetch("/api/memes/posts/viral", { credentials: "include" }),  // ✅ ADD credentials
         fetch("/api/memes/posts/user-submitted", { credentials: "include" }),  // ✅ ADD credentials
       ]);

       const viralPosts = viralRes.ok ? await viralRes.json() : [];
       const userSubmittedPosts = userSubmittedRes.ok
         ? await userSubmittedRes.json()
         : [];

       console.log("[MEMEBOX] ✅ Fetched", viralPosts.length, "viral posts");
       console.log("[MEMEBOX] ✅ Fetched", userSubmittedPosts.length, "user posts");

       const allDbPosts = [...viralPosts, ...userSubmittedPosts];

       if (allDbPosts.length > 0) {
         // ✅ FIXED: Fetch comments for each post during initial load
         const formattedPosts = await Promise.all(
           allDbPosts.map(async (post) => {
             let comments = [];
             try {
               const commentRes = await fetch(`/api/memes/posts/${post.id}/comments`, {
                 credentials: "include",
               });
               if (commentRes.ok) {
                 const rawComments = await commentRes.json();
               comments = rawComments.map((comment) => ({
  id: comment.id,
  username: comment.username || "Anonymous",
  title: comment.title,
  description: comment.description,
  image: comment.image_url,
  upvotes: comment.upvotes || 0,
  downvotes: comment.downvotes || 0,
  userVote: comment.userVote || null,
  timestamp: new Date(comment.created_at),
  hidden: false,
  is_deleted: comment.is_deleted || 0, // ✅ ADD THIS
}));
               }
             } catch (err) {
               console.log("[MEMEBOX] Error fetching comments for post", post.id);
             }

             return {
               id: post.id,
               title: post.title,
               description: post.description,
               images: post.images || [samplePosts[0].images[0]],
               upvotes: post.upvotes || 0,
               downvotes: post.downvotes || 0,
               userVote: null,
               timestamp: new Date(post.created_at),
               comments: comments, // ✅ FIXED: Load comments from database
               isFavorited: post.isFavorited || false,
             };
           })
         );

         setAllPosts(formattedPosts);
       } else {
         console.log("[MEMEBOX] No posts in database, using sample posts");
         setAllPosts(samplePosts);
       }
     } catch (error) {
       console.error("[MEMEBOX] Error fetching posts:", error);
       setAllPosts(samplePosts);
     }
   };

   fetchPostsFromDatabase();
 }, []);


  

  // =====================================================
  // POST NAVIGATION
  // =====================================================

  const showNextPost = useCallback(() => {
    setCurrentPostIndex((prev) => (prev + 1) % allPosts.length);
  }, [allPosts.length]);

  const showPreviousPost = useCallback(() => {
    setCurrentPostIndex((prev) => (prev === 0 ? allPosts.length - 1 : prev - 1));
  }, [allPosts.length]);




const fetchCommentsForPost = useCallback(async (postId) => {
  try {
    const response = await fetch(`/api/memes/posts/${postId}/comments`, {
      credentials: "include",
    });

    if (!response.ok) return [];

    const comments = await response.json();
return comments.map((comment) => ({
  id: comment.id,
  username: comment.username || "Anonymous", // ✅ NEW: Add username
  title: comment.title,
  description: comment.description,
  image: comment.image_url,
  upvotes: comment.upvotes || 0,
  downvotes: comment.downvotes || 0,
  userVote: comment.userVote || null, // ✅ NEW: Get from server instead of null
  timestamp: new Date(comment.created_at),
  hidden: false,
  is_deleted: comment.is_deleted || 0, // ✅ ADD THIS
}));
  } catch (error) {
    console.error(
      "[MEMEBOX] Error fetching comments for post",
      postId,
      ":",
      error,
    );
    return [];
  }
}, []);
  




  

  // =====================================================
  // VOTING FUNCTIONS
  // =====================================================

  const handleUpvote = useCallback(async () => {
  const post = allPosts[currentPostIndex];
  if (!post) return;

  try {
    console.log("[MEMEBOX] Upvoting post", post.id);

    const response = await fetch(`/api/memes/posts/${post.id}/upvote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upvote failed");
    }

    const data = await response.json();

    const updatedPosts = [...allPosts];
    updatedPosts[currentPostIndex].upvotes = data.upvotes;
    updatedPosts[currentPostIndex].downvotes = data.downvotes;
    updatedPosts[currentPostIndex].userVote = data.userVote;
    setAllPosts(updatedPosts);

    console.log("[MEMEBOX] ✅ Upvote successful");
  } catch (error) {
    console.error("[MEMEBOX] ❌ Upvote error:", error);
    alert("Failed to upvote: " + error.message);
  }
}, [allPosts, currentPostIndex]);

const handleDownvote = useCallback(async () => {
  const post = allPosts[currentPostIndex];
  if (!post) return;

  try {
    console.log("[MEMEBOX] Downvoting post", post.id);

    const response = await fetch(`/api/memes/posts/${post.id}/downvote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Downvote failed");
    }

    const data = await response.json();

    const updatedPosts = [...allPosts];
    updatedPosts[currentPostIndex].upvotes = data.upvotes;
    updatedPosts[currentPostIndex].downvotes = data.downvotes;
    updatedPosts[currentPostIndex].userVote = data.userVote;
    setAllPosts(updatedPosts);

    console.log("[MEMEBOX] ✅ Downvote successful");
  } catch (error) {
    console.error("[MEMEBOX] ❌ Downvote error:", error);
    alert("Failed to downvote: " + error.message);
  }
}, [allPosts, currentPostIndex]);



// =====================================================
// COMMENT VOTING FUNCTIONS
// =====================================================

const handleCommentVote = useCallback((commentIndex, voteType) => {
  const updatedPosts = [...allPosts];
  const post = updatedPosts[currentPostIndex];
  const comment = post.comments[commentIndex];

  if (!comment) return;

  if (voteType === 1) {
    // Upvote
    if (comment.userVote === 1) {
      comment.upvotes--;
      comment.userVote = null;
    } else if (comment.userVote === -1) {
      comment.downvotes--;
      comment.upvotes++;
      comment.userVote = 1;
    } else {
      comment.upvotes++;
      comment.userVote = 1;
    }
  } else if (voteType === -1) {
    // Downvote
    if (comment.userVote === -1) {
      comment.downvotes--;
      comment.userVote = null;
    } else if (comment.userVote === 1) {
      comment.upvotes--;
      comment.downvotes++;
      comment.userVote = -1;
    } else {
      comment.downvotes++;
      comment.userVote = -1;
    }
  }

  setAllPosts(updatedPosts);
}, [allPosts, currentPostIndex]);





  const handleCommentVoteWithAPI = useCallback(
  async (commentId, commentIndex, voteType) => {
    const post = allPosts[currentPostIndex];
    if (!post) return;

    try {
      // Update backend first
      const endpoint = voteType === 1 
        ? `/api/memes/comments/${commentId}/upvote`
        : `/api/memes/comments/${commentId}/downvote`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Vote failed");
      }

      // Then update frontend state
      const updatedPosts = [...allPosts];
      const comment = updatedPosts[currentPostIndex].comments[commentIndex];
      if (!comment) return;

      if (voteType === 1) {
        if (comment.userVote === 1) {
          comment.upvotes--;
          comment.userVote = null;
        } else if (comment.userVote === -1) {
          comment.downvotes--;
          comment.upvotes++;
          comment.userVote = 1;
        } else {
          comment.upvotes++;
          comment.userVote = 1;
        }
      } else if (voteType === -1) {
        if (comment.userVote === -1) {
          comment.downvotes--;
          comment.userVote = null;
        } else if (comment.userVote === 1) {
          comment.upvotes--;
          comment.downvotes++;
          comment.userVote = -1;
        } else {
          comment.downvotes++;
          comment.userVote = -1;
        }
      }

      setAllPosts(updatedPosts);
      console.log("[MEMEBOX] ✅ Comment vote synced with database");
    } catch (error) {
      console.error("[MEMEBOX] ❌ Comment vote error:", error);
      alert("Failed to vote on comment: " + error.message);
    }
  },
  [allPosts, currentPostIndex]
);


  

  

  // =====================================================
  // FAVORITE FUNCTIONS
  // =====================================================

const handleFavorite = useCallback(async () => {
  const post = allPosts[currentPostIndex];
  if (!post) return;

  try {
    console.log("[MEMEBOX] Toggling favorite for post", post.id);

    const response = await fetch(`/api/memes/posts/${post.id}/favorite`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to toggle favorite");
    }

    const data = await response.json();

    const updatedPosts = [...allPosts];
    updatedPosts[currentPostIndex].isFavorited = data.isFavorited;
    setAllPosts(updatedPosts);

    console.log("[MEMEBOX] ✅ Favorite toggled:", data.isFavorited);
  } catch (error) {
    console.error("[MEMEBOX] ❌ Favorite error:", error);
    alert("Failed to toggle favorite: " + error.message);
  }
}, [allPosts, currentPostIndex]);



  
const handleDeletePost = useCallback(async () => {
  const post = allPosts[currentPostIndex];
  if (!post) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete "${post.title}"? This will also delete all comments on this post.`
  );
  if (!confirmed) return;

  try {
    console.log("[MEMEBOX] Deleting post", post.id);

    const response = await fetch(`/api/memes/posts/${post.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete post");
    }

    // Remove post from allPosts
    const updatedPosts = allPosts.filter((p) => p.id !== post.id);
    setAllPosts(updatedPosts);
    
    // Navigate to next post or previous
    if (updatedPosts.length > 0) {
      setCurrentPostIndex(Math.max(0, currentPostIndex - 1));
    }

    console.log("[MEMEBOX] ✅ Post deleted successfully");
  } catch (error) {
    console.error("[MEMEBOX] ❌ Delete error:", error);
    alert("Failed to delete post: " + error.message);
  }
}, [allPosts, currentPostIndex]);

  


  const handleDeleteComment = useCallback(
  async (commentId, commentIndex) => {
    const post = allPosts[currentPostIndex];
    if (!post) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment? The text will be replaced with 'author deleted comment'."
    );
    if (!confirmed) return;

    try {
      console.log("[MEMEBOX] Deleting comment", commentId);

      const response = await fetch(`/api/memes/comments/${commentId}/delete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete comment");
      }

      // Update comment in state to mark as deleted
      const updatedPosts = [...allPosts];
      updatedPosts[currentPostIndex].comments[commentIndex].is_deleted = 1;
      updatedPosts[currentPostIndex].comments[commentIndex].description = null;
      setAllPosts(updatedPosts);

      console.log("[MEMEBOX] ✅ Comment deleted successfully");
    } catch (error) {
      console.error("[MEMEBOX] ❌ Delete comment error:", error);
      alert("Failed to delete comment: " + error.message);
    }
  },
  [allPosts, currentPostIndex]
);

  const removeFromFavorites = useCallback(
    (postId) => {
      const updatedPosts = allPosts.map((post) =>
        post.id === postId ? { ...post, isFavorited: false } : post
      );
      setAllPosts(updatedPosts);
      closeFavoriteDetail();
    },
    [allPosts]
  );





  
  // =====================================================
  // DIALOG FUNCTIONS
  // =====================================================

  const openUploadDialog = () => setIsUploadDialogOpen(true);
  const closeUploadDialog = () => {
    setIsUploadDialogOpen(false);
    setUploadTitle("");
    setUploadDescription("");
    setUploadedImages([]);
  };

  const openCommentDialog = () => setIsCommentDialogOpen(true);
  const closeCommentDialog = () => {
    setIsCommentDialogOpen(false);
    setCommentTitle("");
    setCommentDescription("");
    setCommentImageData(null);
  };

  const openViewCommentsDialog = () => setIsViewCommentsDialogOpen(true);
  const closeViewCommentsDialog = () => setIsViewCommentsDialogOpen(false);

  const showFavoritesGrid = () => setIsFavoritesGridOpen(true);
  const closeFavoritesGrid = () => setIsFavoritesGridOpen(false);

  const openFavoriteDetail = (post) => {
    setSelectedFavoritePost(post);
    setIsFavoriteDetailOpen(true);
  };

  const closeFavoriteDetail = () => {
    setIsFavoriteDetailOpen(false);
    setSelectedFavoritePost(null);
  };

  // =====================================================
  // ZOOM MODAL FUNCTIONS
  // =====================================================

  const openZoomModal = (imageIndex = 0) => {
    setZoomImageIndex(imageIndex);
    setIsZoomModalOpen(true);
  };

  const closeZoomModal = () => {
    setIsZoomModalOpen(false);
  };

  const zoomNextPost = () => {
    showNextPost();
    setZoomImageIndex(0);
  };

  const zoomPreviousPost = () => {
    showPreviousPost();
    setZoomImageIndex(0);
  };

  const zoomNextImage = () => {
    const post = allPosts[currentPostIndex];
    if (post && zoomImageIndex < post.images.length - 1) {
      setZoomImageIndex((prev) => prev + 1);
    }
  };

  const zoomPreviousImage = () => {
    if (zoomImageIndex > 0) {
      setZoomImageIndex((prev) => prev - 1);
    }
  };



const openCommentImageZoom = (imageUrl) => {
  setZoomedCommentImage(imageUrl);
  setIsCommentImageZoomOpen(true);
};

const openUserProfile = async (username) => {
  try {
    console.log("[MEMEBOX] Fetching profile for user:", username);
    // Fetch user by username - endpoint must return full user object with ID
    const response = await fetch(`/api/users/by-username/${username}`, {
      credentials: "include",
    });

    if (response.ok) {
      const userData = await response.json();
      console.log("[MEMEBOX] ✅ User profile fetched:", userData);
      setViewingUserData(userData);
      setIsViewingUserProfile(true);
    } else {
      console.error("[MEMEBOX] User not found:", username);
      alert(`User "${username}" not found`);
    }
  } catch (error) {
    console.error("[MEMEBOX] Error fetching user profile:", error);
    alert("Failed to load user profile");
  }
};

  const closeUserProfile = () => {
    setIsViewingUserProfile(false);
    setViewingUserData(null);
  };

const closeCommentImageZoom = () => {
  setIsCommentImageZoomOpen(false);
  setZoomedCommentImage(null);
};




  
  // =====================================================
  // FILE UPLOAD FUNCTIONS
  // =====================================================

  const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50GB
  
  files.slice(0, MAX_UPLOAD_IMAGES - uploadedImages.length).forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File "${file.name}" is too large. Max size: 50GB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImages((prev) => [...prev, event.target.result]);
    };
    reader.readAsDataURL(file);
  });
};

  const handleCommentImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCommentImageData(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // =====================================================
  // FORM SUBMISSION
  // =====================================================

  const submitUpload = async () => {
    if (uploadedImages.length === 0) {
  alert("Please enter a title and select at least one image");
  return;
}

    try {
      console.log("[MEMEBOX] Uploading post with", uploadedImages.length, "images...");

      const response = await fetch("/api/memes/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: uploadTitle,
          description: uploadDescription,
          imageBase64Array: uploadedImages, // ✅ Raw base64 array
        }),
      });

      if (!response.ok) {
        let errorMsg = "Upload failed";
        try {
          const error = await response.json();
          errorMsg = error.error || "Upload failed";
        } catch {
          errorMsg = `Upload failed (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log("[MEMEBOX] ✅ Post uploaded with ID:", result.id);

      const newPost = {
        id: result.id,
        title: uploadTitle,
        description: uploadDescription,
        images: uploadedImages, // ✅ FIXED: Store as array
        upvotes: 0,
        downvotes: 0,
        userVote: null,
        timestamp: new Date(),
        comments: [],
        isFavorited: false,
      };

      setAllPosts((prev) => [newPost, ...prev]);
      closeUploadDialog();
    } catch (error) {
      console.error("[MEMEBOX] ❌ Upload error:", error);
      alert("Failed to upload: " + error.message);
    }
  };



const submitComment = async () => {
  if (!commentTitle.trim() && !commentDescription.trim()) {
    alert("Please enter a comment title and description");
    return;
  }

  const post = allPosts[currentPostIndex];
  if (!post) return;

  try {
    console.log("[MEMEBOX] Submitting comment for post", post.id);

    const response = await fetch(`/api/memes/posts/${post.id}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: commentTitle.trim() || null,
        description: commentDescription.trim() || null,
        image: commentImageData || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[MEMEBOX] Server error:", error);
      throw new Error(error.error || "Failed to add comment");
    }

    const newComment = await response.json();
    console.log("[MEMEBOX] ✅ Comment created with ID:", newComment.id);

    // ✅ FIXED: Fetch fresh comments from database instead of just adding to state
    const freshComments = await fetchCommentsForPost(post.id);
    
    const updatedPosts = [...allPosts];
    updatedPosts[currentPostIndex].comments = freshComments;
    setAllPosts(updatedPosts);
    closeCommentDialog();
  } catch (error) {
    console.error("[MEMEBOX] ❌ Comment error:", error);
    alert("Failed to add comment: " + error.message);
  }
};



  
  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const getTimeElapsed = (timestamp) => {
    const now = new Date();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const isVideoFile = (url) => {
    return /\.(mp4|webm|ogg|mov|avi|mkv|gif)$/i.test(url);
  };

  const getPageTitle = () => {
    if (currentPage === 1) return "User Posts";
    if (currentPage === 2) return "All Posts";
    if (currentPage === 3) return "Favorites";
    return "Posts";
  };

  const handlePageNavigation = () => {
    setCurrentPage((prev) => (prev === 3 ? 1 : prev + 1));
    setCurrentPostIndex(0);
  };

  // =====================================================
  // TOUCH HANDLING
  // =====================================================

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffY) < SWIPE_THRESHOLD / 2) {
      if (diffX > 0) {
        showNextPost();
      } else {
        showPreviousPost();
      }
    }
  };

  // =====================================================
  // FILTERED POSTS & DISPLAY
  // =====================================================

  const getFilteredPosts = useCallback(() => {
    if (currentPage === 1) {
      return allPosts;
    } else if (currentPage === 2) {
      return allPosts.filter((p) => p.downvotes < 5);
    } else if (currentPage === 3) {
      return allPosts.filter((p) => p.isFavorited);
    }
    return allPosts;
  }, [allPosts, currentPage]);

  const filteredPosts = getFilteredPosts();
  const displayPost = filteredPosts[currentPostIndex];
  const favoritesPosts = allPosts.filter((p) => p.isFavorited);

  // =====================================================
  // STYLES
  // =====================================================

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#1a1a1a",
      color: "#ffffff",
      fontFamily: "inherit",
      overflow: "auto",
    },
    navbar: {
      backgroundColor: "#222222",
      borderBottom: "2px solid #444444",
      padding: "16px 0",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    },
    navbarContent: {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "0 5px", 
  display: "flex",
  flexWrap: "wrap",          // ⭐ allows second line to drop
  justifyContent: "center",  // ⭐ centers both rows
  gap: "5px",               // optional, looks nicer
},

    navbarTitle: {
      fontSize: "28px",
      fontWeight: "bold",
      margin: 0,
      color: "#00ff00",
    },
    navbarButtons: {
  display: "flex",
  gap: "5px",
  width: "100%",            // ⭐ forces new line
  justifyContent: "center", // ⭐ centers the buttons
},

    navButton: {
      backgroundColor: "#222222",
      color: "#ffffff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s ease",
    },
    postViewerContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
      padding: "20px",
    },
    // ✅ NEW: Stack images vertically
    imagesStack: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      margin: "0 auto 20px",
      maxWidth: "600px",
      width: "100%",
    },
    mediaItem: {
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
      cursor: "pointer",
      backgroundColor: "#333333",
    },
    postImage: {
      width: "100%",
      height: "auto",
      display: "block",
      borderRadius: "12px",
    },
    postVideo: {
      width: "100%",
      height: "auto",
      borderRadius: "12px",
    },
    playIcon: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "60px",
      height: "60px",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "30px",
      color: "#00ff00",
    },
    zoomButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      backgroundColor: "rgba(0, 102, 255, 0.8)",
      color: "#ffffff",
      border: "none",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "18px",
      transition: "all 0.3s ease",
    },
    postInfo: {
      textAlign: "center",
      marginBottom: "20px",
    },
    postTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0 0 8px 0",
      color: "#00ff00",
    },
    postDescription: {
      fontSize: "14px",
      color: "#cccccc",
      margin: "0 0 8px 0",
    },
    postTime: {
      fontSize: "12px",
      color: "#999999",
      margin: 0,
    },
    voteSection: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "20px",
      padding: "16px",
      backgroundColor: "#222222",
      borderRadius: "8px",
    },
    voteCount: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    voteNumber: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#00ff00",
    },
    voteLabel: {
      fontSize: "12px",
      color: "#999999",
      marginTop: "4px",
    },
    actionButtonsContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginBottom: "16px",
      justifyContent: "center",
    },
    actionButton: {
      backgroundColor: "#333333",
      color: "#ffffff",
      border: "2px solid #666666",
      padding: "10px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.3s ease",
      minWidth: "100px",
    },
    actionButtonActive: {
      backgroundColor: "#00ff00",
      color: "#000000",
      borderColor: "#00ff00",
    },
    navigationButtons: {
      display: "flex",
      gap: "12px",
      marginBottom: "12px",
      justifyContent: "center",
    },
    navArrowButton: {
      backgroundColor: "#222222",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      minWidth: "120px",
      display: "flex",
  flexDirection: "column",
  alignItems: "center",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px",
    },
    zoomModalContent: {
      position: "relative",
      maxWidth: "90vw",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#222222",
      borderRadius: "12px",
      padding: "20px",
    },
    zoomImage: {
      maxWidth: "100%",
      maxHeight: "70vh",
      objectFit: "contain",
      borderRadius: "8px",
      marginBottom: "16px",
    },
    zoomVideo: {
      maxWidth: "100%",
      maxHeight: "70vh",
      objectFit: "contain",
      borderRadius: "8px",
      marginBottom: "16px",
    },
    zoomControls: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    zoomButton_control: {
      backgroundColor: "#555555",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
    },
    dialog: {
      backgroundColor: "#222222",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
      maxWidth: "500px",
      width: "100%",
      maxHeight: "80vh",
      display: "flex",
      flexDirection: "column",
    },
    favoritesDialog: {
      backgroundColor: "#222222",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
      maxWidth: "800px",
      width: "100%",
      maxHeight: "85vh",
      display: "flex",
      flexDirection: "column",
    },
    dialogHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderBottom: "1px solid #444444",
    },
    dialogContent: {
      flex: 1,
      overflow: "auto",
      padding: "20px",
    },
    dialogFooter: {
      display: "flex",
      gap: "12px",
      padding: "16px 20px",
      borderTop: "1px solid #444444",
      justifyContent: "flex-end",
    },
    closeButton: {
      backgroundColor: "transparent",
      color: "#ffffff",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      padding: "0",
      width: "32px",
      height: "32px",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      marginBottom: "6px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#ffffff",
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      backgroundColor: "#333333",
      color: "#ffffff",
      border: "1px solid #444444",
      borderRadius: "6px",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      padding: "8px 12px",
      backgroundColor: "#333333",
      color: "#ffffff",
      border: "1px solid #444444",
      borderRadius: "6px",
      fontSize: "14px",
      boxSizing: "border-box",
      fontFamily: "inherit",
      minHeight: "100px",
      resize: "vertical",
    },
    characterCount: {
      display: "block",
      fontSize: "12px",
      color: "#999999",
      marginTop: "4px",
    },
    fileInput: {
      width: "100%",
      padding: "8px 12px",
      backgroundColor: "#333333",
      color: "#ffffff",
      border: "1px solid #444444",
      borderRadius: "6px",
      cursor: "pointer",
      boxSizing: "border-box",
    },
    helpText: {
      fontSize: "12px",
      color: "#999999",
      marginTop: "6px",
    },
    imagePreviewContainer: {
      marginTop: "16px",
      padding: "12px",
      backgroundColor: "#333333",
      borderRadius: "8px",
    },
    imagePreviewGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
      gap: "8px",
      marginTop: "8px",
    },
    imagePreviewItem: {
      position: "relative",
      borderRadius: "6px",
      overflow: "hidden",
    },
    imagePreview: {
      width: "100%",
      height: "80px",
      objectFit: "cover",
      borderRadius: "6px",
    },
    removeImageButton: {
      position: "absolute",
      top: "2px",
      right: "2px",
      backgroundColor: "rgba(255, 0, 0, 0.8)",
      color: "#ffffff",
      border: "none",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
    },
    cancelButton: {
      backgroundColor: "#666666",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s ease",
    },
    submitButton: {
      backgroundColor: "#00ff00",
      color: "#000000",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
    },
    emptyState: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      fontSize: "18px",
      color: "#999999",
    },
    footer: {
      backgroundColor: "#222222",
      borderTop: "2px solid #444444",
      padding: "12px 20px",
      textAlign: "center",
      fontSize: "12px",
    },
    footerText: {
      margin: "0 0 4px 0",
      color: "#cccccc",
    },
  };

  // =====================================================
  // RENDER FUNCTIONS
  // =====================================================

const renderNavbar = () => {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
  return (
    <div
      style={{
        ...styles.navbar,
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        overflowX: "hidden",
        gap: 6,
        padding: "6px 8px",
        alignItems: "center"
      }}
    >
      <button style={{ ...styles.navArrowButton, flex: 1, minWidth: 0 }} onClick={showPreviousPost}>
        <img src="/EmojisForUminionWebsite/GreenEmoji013ArrowPreviousPagePost.png" width="24" />
        Prev
      </button>

      <button style={{ ...styles.navArrowButton, flex: 1, minWidth: 0 }} onClick={showNextPost}>
        <img src="/EmojisForUminionWebsite/GreenEmoji012ArrowNextPagePost.png" width="24" />
        Next
      </button>

      <button style={{ ...styles.navButton, flex: 1, minWidth: 0 }} onClick={openUploadDialog}>
        <img src="/EmojisForUminionWebsite/GreenEmoji010UploadIcon.png" width="24" />
        Upload
      </button>

      <button style={{ ...styles.navButton, flex: 1, minWidth: 0 }} onClick={handlePageNavigation}>
        <img src="/EmojisForUminionWebsite/GreenEmoji007UserPost.png" width="24" />
        {getPageTitle()}
      </button>

      <button style={{ ...styles.navButton, flex: 1, minWidth: 0 }} onClick={showFavoritesGrid}>
        <img src="/EmojisForUminionWebsite/GreenEmoji001ThumbsUpFavorites.png" width="24" />
        Favs ({favoritesPosts.length})
      </button>
    </div>
  );
}


  // DESKTOP VERSION (unchanged)
  return (
    <div style={styles.navbar}>
      <div style={styles.navbarContent}>
        {/* your original 2‑row layout */}
        {/* B.) TOP LINE — PREVIOUS / NEXT */}
        <div style={styles.navigationButtons}>
          <button style={styles.navArrowButton} onClick={showPreviousPost}>
            <img
              src="/EmojisForUminionWebsite/GreenEmoji013ArrowPreviousPagePost.png"
              width="24"
              style={{ marginBottom: 4 }}
            />
            Previous Post
          </button>

          <button style={styles.navArrowButton} onClick={showNextPost}>
            <img
              src="/EmojisForUminionWebsite/GreenEmoji012ArrowNextPagePost.png"
              width="24"
              style={{ marginBottom: 4 }}
            />
            Next Post
          </button>
        </div>

        {/* C.) SECOND LINE — UPLOAD / USER POSTS / FAVORITES */}
        <div style={styles.navbarButtons}>
          <button style={styles.navButton} onClick={openUploadDialog}>
            <img
              src="/EmojisForUminionWebsite/GreenEmoji010UploadIcon.png"
              width="24"
              style={{ marginBottom: 4 }}
            />
            Upload
          </button>

          <button style={styles.navButton} onClick={handlePageNavigation}>
            <img
              src="/EmojisForUminionWebsite/GreenEmoji007UserPost.png"
              width="24"
              style={{ marginBottom: 4 }}
            />
            {getPageTitle()}
          </button>

          <button style={styles.navButton} onClick={showFavoritesGrid}>
            <img
              src="/EmojisForUminionWebsite/GreenEmoji001ThumbsUpFavorites.png"
              width="24"
              style={{ marginBottom: 4 }}
            />
            Favorites ({favoritesPosts.length})
          </button>
        </div>
      </div>
    </div>
  );
};

   
          

  const renderPostViewer = () => {
    if (!displayPost) {
      return (
        <div style={styles.postViewerContainer}>
          <div style={styles.emptyState}>No posts available</div>
        </div>
      );
    }

    return (
      <div style={styles.postViewerContainer} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* ✅ NEW: Stacked images */}
        <div style={styles.imagesStack}>
          {displayPost.images.map((image, idx) => (
  <div key={idx} style={styles.mediaItem} onClick={() => openZoomModal(idx)}>
    {isVideoFile(image) ? (
      <>
        <video
          style={styles.postVideo}
          controls={false}
          muted
          onClick={(e) => {
            e.stopPropagation();
            const vid = e.currentTarget;
            vid.muted = !vid.muted;
          }}
        >
          <source src={image} />
        </video>
        <div style={styles.playIcon}>🔊</div>
      </>
    ) : (
      <img src={image} alt={`post-${idx}`} style={styles.postImage} />
    )}
    {/* ✅ REMOVED: Eye icon button - clicking image still opens zoom modal */}
  </div>
))}
        </div>

        <div style={styles.postInfo}>
  <h2 style={styles.postTitle}>{displayPost.title}</h2>
  <p style={styles.postDescription}>{displayPost.description}</p>
  {displayPost.username && (
    <div style={{
      fontSize: "13px",
      margin: "6px 0 8px 0",
      fontWeight: "500",
    }}>
      By:{" "}
      <button
        style={{
          fontSize: "13px",
          color: "#0099ff",
          fontWeight: "bold",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0",
          textDecoration: "underline",
        }}
        onClick={() => openUserProfile(displayPost.username)}
      >
        {displayPost.username}
      </button>
    </div>
  )}
  <p style={styles.postTime}>{getTimeElapsed(displayPost.timestamp)}</p>
</div>

<div style={styles.voteSection}>
  <div style={styles.voteCount}>
    <div style={styles.voteNumber}>{EMOJIS.UPVOTE_INITIAL} {displayPost.upvotes}</div>
    <div style={styles.voteLabel}>Upvotes</div>
  </div>
  <div style={styles.voteCount}> 
    <div style={styles.voteNumber}>{EMOJIS.DOWNVOTE_INITIAL} {displayPost.downvotes}</div>
    <div style={styles.voteLabel}>Downvotes</div>
  </div>
  <div style={styles.voteCount}>
    <div style={styles.voteNumber}> 
      {EMOJIS.COMMENT_INITIAL} {displayPost.comments.length}
    </div>
    <div style={styles.voteLabel}>Comments</div>
  </div>
</div>

        {/* ROW 1: Upvote, Downvote, Favorites */}
<div style={styles.actionButtonsContainer}>
  <button
    style={{
      ...styles.actionButton,
      ...(displayPost.userVote === 1 ? styles.actionButtonActive : {}),
    }}
    onClick={handleUpvote}
  >
    {EMOJIS.UPVOTE_INITIAL} Upvote
  </button>
  <button
    style={{
      ...styles.actionButton,
      ...(displayPost.userVote === -1 ? styles.actionButtonActive : {}),
    }}
    onClick={handleDownvote}
  >
    {EMOJIS.DOWNVOTE_INITIAL} Downvote
  </button>
  <button
    style={{
      ...styles.actionButton,
      ...(displayPost.isFavorited ? styles.actionButtonActive : {}),
    }}
    onClick={handleFavorite}
  >
    <img
      src="/EmojisForUminionWebsite/GreenEmoji001ThumbsUpFavorites.png"
      width="24"
    />{" "}
    Favorites
  </button>
</div>

{/* ROW 2: Comment, View Comments, Delete (if owner) */}
<div style={styles.actionButtonsContainer}>
  <button style={styles.actionButton} onClick={openCommentDialog}>
    {EMOJIS.COMMENT_INITIAL} Comment
  </button>
  <button style={styles.actionButton} onClick={openViewCommentsDialog}>
    <img
      src="/EmojisForUminionWebsite/GreenEmoji005CommentsChats.png"
      width="24"
    />{" "}
    View Comments
  </button>
  {currentUsername === displayPost.username && (
    <button
      style={{ ...styles.actionButton, backgroundColor: "#ff6666" }}
      onClick={handleDeletePost}
    >
      🗑️ Delete Post
    </button>
  )}
</div>

       
      </div>
    );
  };

  // ✅ NEW: Zoom Modal
  const renderZoomModal = () => {
  if (!isZoomModalOpen || !displayPost) return null;

  return (
    <div style={styles.overlay} onClick={closeZoomModal}>
      <div style={styles.zoomModalContent} onClick={(e) => e.stopPropagation()}>
        {/* ✅ FIXED: Stack all images vertically, CENTER-ALIGNED */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "16px",
          padding: "0 8px",
          alignItems: "center",  // ✅ NEW: Center all images horizontally
          justifyContent: "flex-start",
        }}>
          {displayPost.images.map((media, idx) => (
            <div key={idx}>
              {isVideoFile(media) ? (
                <video
                  style={styles.zoomVideo}
                  controls
                  onClick={(e) => e.stopPropagation()}
                >
                  <source src={media} />
                </video>
              ) : (
                <img src={media} alt={`zoom-${idx}`} style={styles.zoomImage} />
              )}
            </div>
          ))}
        </div>

        {/* ✅ FIXED: Navigation buttons for posts only, not images */}
        <div style={styles.zoomControls}>
          <button style={styles.zoomButton_control} onClick={zoomPreviousPost}>
            <img src="/EmojisForUminionWebsite/GreenEmoji013ArrowPreviousPagePost.png" width="24" /> Prev Post
          </button>
          <button style={styles.zoomButton_control} onClick={zoomNextPost}>
            <img src="/EmojisForUminionWebsite/GreenEmoji012ArrowNextPagePost.png" width="24" /> Next Post
          </button>
          <button style={styles.zoomButton_control} onClick={closeZoomModal}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

  const renderUploadDialog = () => {
    if (!isUploadDialogOpen) return null;

    return (
      <div style={styles.overlay} onClick={closeUploadDialog}>
        <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
          <div style={styles.dialogHeader}>
            <h2 style={{ margin: 0, fontSize: "20px" }}>📤 Upload New Meme</h2>
            <button style={styles.closeButton} onClick={closeUploadDialog}>✕</button>
          </div>

          <div style={styles.dialogContent}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Meme Title *</label>
              <input
                style={styles.input}
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter a catchy title..."
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Tell us about your meme..."
              />
              <span style={styles.characterCount}>{uploadDescription.length} characters</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Images/Videos *</label>
              <input
                style={styles.fileInput}
                type="file"
                multiple
                accept="image/*,video/*,.gif"
                onChange={handleFileSelect}
              />
              <span style={styles.helpText}>
  {uploadedImages.length} / {MAX_UPLOAD_IMAGES} files selected (Max 50GB per file)
</span>
            </div>

            {uploadedImages.length > 0 && (
              <div style={styles.imagePreviewContainer}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Preview:</span>
                <div style={styles.imagePreviewGrid}>
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} style={styles.imagePreviewItem}>
                      <img src={img} alt={`preview-${idx}`} style={styles.imagePreview} />
                      <button style={styles.removeImageButton} onClick={() => removeUploadedImage(idx)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={styles.dialogFooter}>
            <button style={styles.cancelButton} onClick={closeUploadDialog}>Cancel</button>
            <button style={styles.submitButton} onClick={submitUpload}>Upload</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCommentDialog = () => {
  if (!isCommentDialogOpen) return null;

  return (
    <div style={styles.overlay} onClick={closeCommentDialog}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.dialogHeader}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>💬 Add Comment</h2>
          <button style={styles.closeButton} onClick={closeCommentDialog}>
            ✕
          </button>
        </div>

        <div style={styles.dialogContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Comment Title *</label>
            <input
              style={styles.input}
              type="text"
              value={commentTitle}
              onChange={(e) => setCommentTitle(e.target.value)}
              placeholder="Brief comment title..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Comment *</label>
            <textarea
              style={styles.textarea}
              value={commentDescription}
              onChange={(e) => setCommentDescription(e.target.value)}
              placeholder="Share your thoughts..."
            />
            <span style={styles.characterCount}>
              {commentDescription.length} characters
            </span>
          </div>

          {/* ✅ NEW: Comment Image Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Add Image (Optional)</label>
            <input
              style={styles.fileInput}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleCommentImageSelect}
            />
            <span style={styles.helpText}>
              Max 1 image. Allowed: JPG, JPEG, PNG
            </span>
          </div>

          {/* ✅ NEW: Image Preview */}
          {commentImageData && (
            <div style={styles.imagePreviewContainer}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                Preview:
              </span>
              <div style={{ position: "relative", marginTop: "8px" }}>
                <img
                  src={commentImageData}
                  alt="comment-preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "150px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <button
                  style={styles.removeImageButton}
                  onClick={() => setCommentImageData(null)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.dialogFooter}>
          <button style={styles.cancelButton} onClick={closeCommentDialog}>
            Cancel
          </button>
          <button style={styles.submitButton} onClick={submitComment}>
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};
const renderViewCommentsDialog = () => {
  if (!isViewCommentsDialogOpen) return null;

  return (
    <div style={styles.overlay} onClick={closeViewCommentsDialog}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.dialogHeader}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>💬 Comments ({displayPost?.comments.length || 0})</h2>
          <button style={styles.closeButton} onClick={closeViewCommentsDialog}>✕</button>
        </div>

        <div style={styles.dialogContent}>
          {displayPost && displayPost.comments.length > 0 ? (
            displayPost.comments.map((comment, idx) => (
              <div key={comment.id} style={{ 
                backgroundColor: "#333333", 
                padding: "12px", 
                borderRadius: "8px", 
                marginBottom: "12px",
                borderLeft: "3px solid #0066ff",
              }}>
                {/* Comment header with username, title and timestamp */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  }}
>
  <div>
  {comment.is_deleted ? (
    <span
      style={{
        fontSize: "12px",
        color: "#999999",
        fontWeight: "bold",
        fontStyle: "italic",
      }}
    >
      Author Deleted Comment
    </span>
  ) : (
    <button
      style={{
        fontSize: "12px",
        color: "#0099ff",
        fontWeight: "bold",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "0",
        textDecoration: "underline",
      }}
      onClick={() => openUserProfile(comment.username)}
    >
      {comment.username}
    </button>
  )}
  <h3
    style={{
      margin: "4px 0 0 0",
      color: "#00ff00",
      fontSize: "14px",
    }}
  >
    {comment.title}
  </h3>
</div>
  <span style={{ fontSize: "11px", color: "#999999" }}>
    {getTimeElapsed(comment.timestamp)}
  </span>
</div>


                
                {/* Comment image if exists */}
           {comment.image && (
  <img
    src={comment.image}
    alt="comment"
    style={{
      width: "100%",
      maxHeight: "150px",
      objectFit: "cover",
      borderRadius: "4px",
      marginBottom: "8px",
      cursor: "pointer",
    }}
    onClick={() => openCommentImageZoom(comment.image)}
  />
)}
                {/* Comment description - or deleted message */}
<p
  style={{
    margin: "0 0 8px 0",
    fontSize: "13px",
    color: comment.is_deleted ? "#999999" : "#cccccc",
    fontStyle: comment.is_deleted ? "italic" : "normal",
  }}
>
  {comment.is_deleted ? "author deleted comment" : comment.description}
</p>

                {/* Vote section with delete button for owner */}
<div
  style={{
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid #555555",
    flexWrap: "wrap",
  }}
>
  <button
    style={{
      backgroundColor:
        comment.userVote === 1 ? "#00ff00" : "#555555",
      color: comment.userVote === 1 ? "#000000" : "#ffffff",
      border: "none",
      padding: "4px 8px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s",
    }}
    onClick={() => handleCommentVoteWithAPI(comment.id, idx, 1)}
  >
    {EMOJIS.UPVOTE_INITIAL} {comment.upvotes}
  </button>
  <button
    style={{
      backgroundColor:
        comment.userVote === -1 ? "#ff6666" : "#555555",
      color: "#ffffff",
      border: "none",
      padding: "4px 8px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s",
    }}
    onClick={() => handleCommentVoteWithAPI(comment.id, idx, -1)}
  >
    {EMOJIS.DOWNVOTE_INITIAL} {comment.downvotes}
  </button>
  {currentUsername === comment.username && (
    <button
      style={{
        backgroundColor: "#ff6666",
        color: "#ffffff",
        border: "none",
        padding: "4px 8px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "500",
        transition: "all 0.2s",
      }}
      onClick={() => handleDeleteComment(comment.id, idx)}
    >
      🗑️ Delete
    </button>
  )}
</div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", color: "#999999", padding: "20px" }}>
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>

        <div style={styles.dialogFooter}>
          <button style={styles.submitButton} onClick={() => { closeViewCommentsDialog(); openCommentDialog(); }}>
            Add Comment
          </button>
          <button style={styles.cancelButton} onClick={closeViewCommentsDialog}>Close</button>
        </div>
      </div>
    </div>
  );
};



const renderCommentImageZoomModal = () => {
  if (!isCommentImageZoomOpen || !zoomedCommentImage) return null;

  return (
    <div style={styles.overlay} onClick={closeCommentImageZoom}>
      <div
        style={styles.zoomModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "16px",
            padding: "0 8px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={zoomedCommentImage}
            alt="zoomed-comment"
            style={styles.zoomImage}
          />
        </div>

        <div style={styles.zoomControls}>
          <button
            style={styles.zoomButton_control}
            onClick={closeCommentImageZoom}
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

const renderUserProfileModal = () => {
  if (!isViewingUserProfile || !viewingUserData) return null;

  // ✅ FIXED: Use the correct MainUhubFeatureV001ForUserProfileModal component
  return (
    <MainUhubFeatureV001ForUserProfileModal
      isOpen={isViewingUserProfile}
      onClose={closeUserProfile}
      user={viewingUserData}
      currentUser={currentUser}
      onProductView={(product) => {
        console.log("[MEMEBOX] Viewing product:", product);
      }}
      onBadgeZoomOpen={(badge) => {
        console.log("[MEMEBOX] Zooming badge:", badge);
      }}
    />
  );
};

  const renderFavoritesDialog = () => {
    if (!isFavoritesGridOpen) return null;

    // If a favorite is selected for detail view
    if (isFavoriteDetailOpen && selectedFavoritePost) {
      return (
        <div style={styles.overlay} onClick={closeFavoritesGrid}>
          <div
            style={{
              backgroundColor: "#222222",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
              maxWidth: "600px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              maxHeight: "85vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.dialogHeader}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>
                {selectedFavoritePost.title}
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => closeFavoriteDetail()}
              >
                ✕
              </button>
            </div>

            {/* Content - STACKED IMAGES WITH OVERFLOW */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {/* Stack all images vertically */}
              {selectedFavoritePost.images.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  {selectedFavoritePost.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`favorite-${idx}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                    />
                  ))}
                </div>
              )}

              <p
                style={{
                  fontSize: "13px",
                  color: "#cccccc",
                  textAlign: "center",
                  margin: "16px 0",
                }}
              >
                {selectedFavoritePost.description}
              </p>
            </div>

            {/* Footer */}
            <div style={styles.dialogFooter}>
              <button
                style={{ ...styles.cancelButton, backgroundColor: "#ff6666" }}
                onClick={() => removeFromFavorites(selectedFavoritePost.id)}
              >
                Remove from Favorites
              </button>
              <button
                style={styles.submitButton}
                onClick={() => closeFavoriteDetail()}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Grid view - showing all favorites
    return (
      <div style={styles.overlay} onClick={closeFavoritesGrid}>
        <div
          style={styles.favoritesDialog}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.dialogHeader}>
            <h2 style={{ margin: 0, fontSize: "20px" }}>⭐ Your Favorites</h2>
            <button style={styles.closeButton} onClick={closeFavoritesGrid}>
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            {favoritesPosts.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "16px",
                }}
              >
                {favoritesPosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      backgroundColor: "#333333",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => {
                      setSelectedFavoritePost(post);
                      setZoomImageIndex(0);
                      setIsFavoriteDetailOpen(true);
                    }}
                  >
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ padding: "12px" }}>
                      <h3
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#00ff00",
                        }}
                      >
                        {post.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#999999",
                  padding: "40px 20px",
                }}
              >
                No favorites yet. Start favoriting memes! ⭐
              </div>
            )}
          </div>

          <div style={styles.dialogFooter}>
            <button style={styles.cancelButton} onClick={closeFavoritesGrid}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  
  
  const renderFooter = () => (
    <div style={styles.footer}>
      <p style={styles.footerText}>A GEMMMS#25 Creation: "The MemeBox"</p>
    </div>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <div style={styles.container}>
      {renderNavbar()}
      {renderPostViewer()}
      {renderZoomModal()}
      {renderFooter()}
      {renderUploadDialog()}
      {renderCommentDialog()}
      {renderViewCommentsDialog()}
      {renderCommentImageZoomModal()}
{renderUserProfileModal()}
{renderFavoritesDialog()}
      {renderUserProfileModal()}
    </div>
  );
}

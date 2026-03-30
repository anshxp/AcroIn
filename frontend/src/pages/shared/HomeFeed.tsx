import React, { useEffect, useState } from 'react';
import { PostCard } from '../../components/posts/PostCard';
import { Image, Video, Calendar, FileText, Info, X, Smile } from 'lucide-react';

import type { Post } from '../../types';

import { useAuth } from '../../context/AuthContext';
import '../../styles/homefeed.css';

// Remove local Post interface, use global Post type from types

export const HomeFeed: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);

  const canPost = user?.userType === 'faculty' || user?.userType === 'admin';


  // Apollo Client-based create post placeholder
  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      // TODO: Replace with Apollo Client mutation for creating a post
      // Example: const { data } = await apolloClient.mutate({ mutation: CREATE_POST, variables: { content: postContent } });
      // setPosts([data.createPost, ...posts]);
      setPostContent('');
      setShowCreateModal(false);
    } catch {
      // Optionally show error
    }
  };

  // Apollo Client-based fetch posts placeholder
  useEffect(() => {
    (async () => {
      // TODO: Replace with Apollo Client query for fetching posts
      // Example: const { data } = await apolloClient.query({ query: GET_POSTS });
      // setPosts(data.posts);
      setPosts([]); // Satisfy unused variable check
    })();
  }, []);

  const getUserInitials = () => {
    if (user?.userType === 'faculty') {
      return `${user?.firstname?.[0] || 'U'}${user?.lastName?.[0] || ''}`;
    }
    return user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U';
  };

  const getUserName = () => {
    if (user?.userType === 'faculty') {
      return `Dr. ${user?.firstname || 'User'} ${user?.lastName || ''}`;
    }
    return user?.name || 'User';
  };

  return (
    <div className="home-feed">
      {/* Main Feed */}
      <div className="feed-main">
        {/* Create Post Card - Only for Faculty/Admin */}
        {canPost ? (
          <div className="create-post-card">
            <div className="create-post-input-row">
              <div className="create-post-avatar">
                {getUserInitials()}
              </div>
              <input 
                type="text" 
                className="create-post-input"
                placeholder="Share an announcement, opportunity, or update..."
                onClick={() => setShowCreateModal(true)}
                readOnly
              />
            </div>
            <div className="create-post-actions">
              <button className="create-post-btn photo" onClick={() => setShowCreateModal(true)}>
                <Image size={20} />
                <span>Photo</span>
              </button>
              <button className="create-post-btn video" onClick={() => setShowCreateModal(true)}>
                <Video size={20} />
                <span>Video</span>
              </button>
              <button className="create-post-btn event" onClick={() => setShowCreateModal(true)}>
                <Calendar size={20} />
                <span>Event</span>
              </button>
              <button className="create-post-btn article" onClick={() => setShowCreateModal(true)}>
                <FileText size={20} />
                <span>Article</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="student-notice">
            <Info size={20} />
            <p>This feed shows official announcements from faculty and CDC. Stay updated with placement drives, research opportunities, and important notices.</p>
          </div>
        )}

        {/* Feed Divider */}
        <div className="feed-divider">
          <div className="feed-divider-line"></div>
          <span className="feed-divider-text">Recent posts</span>
          <div className="feed-divider-line"></div>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && canPost && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a post</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-author">
                <div className="modal-author-avatar">
                  {getUserInitials()}
                </div>
                <div className="modal-author-info">
                  <h4>{getUserName()}</h4>
                  <p>Post to Anyone</p>
                </div>
              </div>
              <textarea
                className="modal-textarea"
                placeholder="What do you want to share with students?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <div className="modal-tools">
                <button className="modal-tool-btn"><Image size={20} /></button>
                <button className="modal-tool-btn"><Video size={20} /></button>
                <button className="modal-tool-btn"><Calendar size={20} /></button>
                <button className="modal-tool-btn"><Smile size={20} /></button>
              </div>
              <button 
                className="modal-submit"
                onClick={handleCreatePost}
                disabled={!postContent.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Info, Image, Video, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import type { Post } from '../../types';
import { CreatePostModal } from '../../components/posts/CreatePostModal';
import { PostCard } from '../../components/posts/PostCard';
import '../../styles/homefeed.css';

export const HomeFeed: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const canPost = user?.userType === 'faculty' || user?.userType === 'admin';

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const backendPosts = await postAPI.getAll();
        setPosts(backendPosts);
      } catch {
        setPosts([]);
      }
    };

    loadPosts();
  }, []);

  const getUserInitials = () => {
    if (user?.userType === 'faculty') {
      return `${user?.firstname?.[0] || 'U'}${user?.lastName?.[0] || ''}`;
    }
    return user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U';
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

        {posts.length === 0 && <p className="page-subtitle">No posts available from backend.</p>}
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onPostDeleted={(postId) => setPosts((prev) => prev.filter((item) => item._id !== postId))}
            onPostUpdated={(updatedPost) => setPosts((prev) => prev.map((item) => (item._id === updatedPost._id ? updatedPost : item)))}
          />
        ))}
      </div>

      <CreatePostModal
        isOpen={showCreateModal && canPost}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={(post) => setPosts((prev) => [post, ...prev])}
      />
    </div>
  );
};

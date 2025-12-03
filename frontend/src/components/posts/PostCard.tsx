import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Send, 
  MoreHorizontal,
  Globe,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import type { Post, Comment } from '../../types';
import './posts.css';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onPostUpdated,
  onPostDeleted 
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.id || ''));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const getAuthorInitials = () => {
    const name = post.author.name;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postAPI.unlike(post._id);
        setLikesCount((prev) => prev - 1);
      } else {
        await postAPI.like(post._id);
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      // Toggle locally even if API fails (for demo)
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      await postAPI.addComment(post._id, newComment);
      
      // Add comment locally
      const newCommentObj: Comment = {
        _id: Date.now().toString(),
        author: {
          _id: user?.id || '',
          name: user?.name || `${user?.firstname} ${user?.lastName}`,
          userType: user?.userType as 'student' | 'faculty' | 'admin',
        },
        content: newComment,
        createdAt: new Date().toISOString(),
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postAPI.delete(post._id);
      onPostDeleted?.(post._id);
    } catch (error) {
      // Delete locally for demo
      onPostDeleted?.(post._id);
    }
  };

  const isAuthor = user?.id === post.author._id;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">{getAuthorInitials()}</div>
          <div className="author-info">
            <span className="author-name">{post.author.name}</span>
            <span className="author-title">
              {post.author.designation} • {post.author.department}
            </span>
            <span className="post-meta">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <Globe size={12} />
            </span>
          </div>
        </div>
        
        {isAuthor && (
          <div className="post-menu-container">
            <button 
              className="post-menu-btn" 
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="post-menu">
                <button onClick={() => setShowMenu(false)}>
                  <Edit size={16} />
                  <span>Edit post</span>
                </button>
                <button onClick={handleDelete} className="delete">
                  <Trash2 size={16} />
                  <span>Delete post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((img, idx) => (
              <img key={idx} src={img} alt="Post image" />
            ))}
          </div>
        )}
      </div>

      <div className="post-stats">
        {likesCount > 0 && (
          <span className="likes-count">
            <span className="like-icon">👍</span>
            {likesCount}
          </span>
        )}
        {comments.length > 0 && (
          <span 
            className="comments-count"
            onClick={() => setShowComments(!showComments)}
          >
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="post-actions">
        <button 
          className={`post-action ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <ThumbsUp size={18} />
          <span>Like</span>
        </button>
        <button 
          className="post-action"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>
        <button className="post-action">
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-avatar">
                {comment.author.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{comment.author.name}</span>
                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            </div>
          ))}

          <div className="comment-input">
            <div className="comment-avatar">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              />
              <button 
                className="comment-submit"
                onClick={handleComment}
                disabled={!newComment.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

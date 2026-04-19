import React, { useEffect, useState } from 'react';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Send, 
  MoreHorizontal,
  Globe,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { facultyAPI, postAPI, studentAPI } from '../../services/api';
import type { Post, Comment } from '../../types';
import './posts.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PostCardProps {
  post: Post;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

interface OpportunityViewModel {
  type: string;
  title: string;
  company?: string;
  venue?: string;
  date?: string;
  deadline?: string;
  details?: string;
  applyLink?: string;
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
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [currentUserAvatarUrl, setCurrentUserAvatarUrl] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const loadCurrentUserAvatar = async () => {
      if (!user?.id) {
        setCurrentUserAvatarUrl('');
        return;
      }

      try {
        if (user.userType === 'student') {
          const profileIdentifier = user.email || user.id;
          const profile = await studentAPI.getProfile(profileIdentifier);
          setCurrentUserAvatarUrl(profile.profile_image || '');
          return;
        }

        if (user.userType === 'faculty') {
          const profile = await facultyAPI.getProfile();
          setCurrentUserAvatarUrl(profile.profilepic || '');
          return;
        }

        setCurrentUserAvatarUrl('');
      } catch {
        setCurrentUserAvatarUrl('');
      }
    };

    loadCurrentUserAvatar();
  }, [user?.id, user?.userType]);

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
        const updatedPost = await postAPI.unlike(post._id);
        onPostUpdated?.(updatedPost);
        setLikesCount((prev) => prev - 1);
      } else {
        const updatedPost = await postAPI.like(post._id);
        onPostUpdated?.(updatedPost);
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    }
  };

  const handleComment = async (event?: React.FormEvent | React.KeyboardEvent) => {
    event?.preventDefault();

    const trimmedComment = newComment.trim();
    if (!trimmedComment || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      setCommentError('');

      const updatedPost = await postAPI.addComment(post._id, trimmedComment);
      onPostUpdated?.(updatedPost);

      // Keep local comments in sync with backend response
      setComments(updatedPost.comments || []);
      setNewComment('');
    } catch (error) {
      setCommentError('Failed to post comment. Please try again.');
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postAPI.delete(post._id);
      onPostDeleted?.(post._id);
    } catch {
      return;
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}#post-${post._id}`;
    const contentPreview = (post.content || '').replace(/\s+/g, ' ').trim();
    const shareText = contentPreview.length > 120
      ? `${contentPreview.slice(0, 117)}...`
      : contentPreview || 'Check out this post on Acro-In.';

    try {
      setIsSharing(true);

      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.author.name}`,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback('Shared successfully');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback('Link copied');
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        setShareFeedback('Unable to share right now');
      }
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    if (!shareFeedback) return undefined;

    const timer = window.setTimeout(() => {
      setShareFeedback('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [shareFeedback]);

  const isAuthor = user?.id === post.author._id;

  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${normalizedPath}`;
  };

  const resolveAvatarUrl = (value?: string) => {
    if (!value || !value.trim()) return undefined;
    return resolveImageUrl(value.trim());
  };

  const resolveMediaKind = (url: string) => {
    const cleanUrl = url.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.pdf')) return 'pdf';
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov')) return 'video';
    return 'image';
  };

  const getCurrentUserAvatar = () => {
    const candidate = currentUserAvatarUrl
      || (user as any)?.profile_image
      || (user as any)?.profileImage
      || (user as any)?.profilepic;
    return resolveAvatarUrl(candidate);
  };

  const getCommentAvatarUrl = (comment: Comment) => {
    const explicitCommentAvatar = resolveAvatarUrl(
      (comment.author as any).profileImage
      || (comment.author as any).profile_image
      || (comment.author as any).profilepic
    );

    if (explicitCommentAvatar) {
      return explicitCommentAvatar;
    }

    // Backward compatibility: older comments may not have avatar saved.
    // If the comment belongs to the logged-in user, reuse current profile avatar.
    if (comment.author?._id && user?.id && String(comment.author._id) === String(user.id)) {
      return getCurrentUserAvatar();
    }

    return undefined;
  };

  const formatUserType = (value?: string) => {
    if (!value) return 'Faculty';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const authorDesignation = post.author.designation || formatUserType(post.author.userType);
  const authorDepartment = post.author.department || 'Acropolis Institute';

  const parseOpportunityPost = (content: string): OpportunityViewModel | null => {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return null;

    const headingMatch = lines[0].match(/^New\s+(.+?)\s+opportunity:\s*(.+)$/i);
    if (!headingMatch) return null;

    const model: OpportunityViewModel = {
      type: headingMatch[1] || 'opportunity',
      title: headingMatch[2] || 'Opportunity',
    };

    lines.slice(1).forEach((line) => {
      if (/^Company\s*:/i.test(line)) {
        model.company = line.replace(/^Company\s*:/i, '').trim();
      } else if (/^Venue\s*:/i.test(line)) {
        model.venue = line.replace(/^Venue\s*:/i, '').trim();
      } else if (/^Date\s*:/i.test(line)) {
        model.date = line.replace(/^Date\s*:/i, '').trim();
      } else if (/^Deadline\s*:/i.test(line)) {
        model.deadline = line.replace(/^Deadline\s*:/i, '').trim();
      } else if (/^Details\s*:/i.test(line)) {
        model.details = line.replace(/^Details\s*:/i, '').trim();
      } else if (/^Apply\s*:/i.test(line)) {
        model.applyLink = line.replace(/^Apply\s*:/i, '').trim();
      }
    });

    return model;
  };

  const opportunityPost = parseOpportunityPost(post.content);
  const shouldShowOpportunityDetails =
    Boolean(opportunityPost?.details)
    && !/^\s*(internship|competition|certification|job|workshop)\s+opportunity\s*$/i.test(
      opportunityPost?.details || ''
    );

  return (
    <div className="post-card" id={`post-${post._id}`}>
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">{getAuthorInitials()}</div>
          <div className="author-info">
            <span className="author-name">{post.author.name}</span>
            <span className="author-title">
              {authorDesignation} • {authorDepartment}
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
        {opportunityPost ? (
          <div className="opportunity-post-card">
            <div className="opportunity-post-head">
              <h4>
                <Briefcase size={16} />
                {opportunityPost.title}
              </h4>
              <span className="opportunity-post-type">{opportunityPost.type}</span>
            </div>

            {opportunityPost.company && (
              <p className="opportunity-post-company">{opportunityPost.company}</p>
            )}

            <div className="opportunity-post-meta-row">
              {opportunityPost.venue && (
                <span className="opportunity-post-meta-chip">
                  <MapPin size={13} />
                  {opportunityPost.venue}
                </span>
              )}
              {opportunityPost.date && (
                <span className="opportunity-post-meta-chip">
                  <Calendar size={13} />
                  Date: {opportunityPost.date}
                </span>
              )}
              {opportunityPost.deadline && (
                <span className="opportunity-post-meta-chip">
                  <Clock size={13} />
                  Deadline: {opportunityPost.deadline}
                </span>
              )}
            </div>

            {shouldShowOpportunityDetails && (
              <p className="opportunity-post-details">{opportunityPost.details}</p>
            )}

            {opportunityPost.applyLink && (
              <a
                href={opportunityPost.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="opportunity-post-apply-btn"
              >
                Apply Now <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          <p>{post.content}</p>
        )}
        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((media, idx) => {
              const mediaUrl = resolveImageUrl(media);
              const mediaKind = resolveMediaKind(mediaUrl);

              if (mediaKind === 'video') {
                return <video key={idx} src={mediaUrl} controls className="post-media-video" />;
              }

              if (mediaKind === 'pdf') {
                return (
                  <a
                    key={idx}
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="post-media-pdf"
                  >
                    Open PDF attachment
                  </a>
                );
              }

              return <img key={idx} src={mediaUrl} alt="Post media" />;
            })}
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
        <button
          className={`post-action ${shareFeedback ? 'shared' : ''}`}
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {shareFeedback && (
        <div className="share-feedback">{shareFeedback}</div>
      )}

      {showComments && (
        <div className="post-comments">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              {getCommentAvatarUrl(comment) ? (
                <img
                  className="comment-avatar comment-avatar--image"
                  src={getCommentAvatarUrl(comment)}
                  alt={`${comment.author.name} profile`}
                />
              ) : (
                <div className="comment-avatar">
                  {comment.author.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{comment.author.name}</span>
                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            </div>
          ))}

          <form className="comment-input" onSubmit={handleComment}>
            <div className="comment-composer-meta">
              {getCurrentUserAvatar() ? (
                <img
                  className="comment-avatar comment-avatar--composer comment-avatar--image"
                  src={getCurrentUserAvatar()}
                  alt="Your profile"
                />
              ) : (
                <div className="comment-avatar comment-avatar--composer">
                  {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              )}
              <div className="comment-composer-copy">
                <strong>Join the discussion</strong>
                <span>Press Enter or send to post your comment</span>
              </div>
            </div>

            <div className="comment-input-row">
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  placeholder="Write something thoughtful..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="comment-submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  aria-label="Send comment"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="comment-helper-row">
                <span className="comment-helper-text">
                  {newComment.trim().length > 0 ? `${newComment.trim().length} characters ready` : 'Be respectful and specific.'}
                </span>
                {isSubmittingComment && <span className="comment-helper-text comment-helper-text--active">Posting...</span>}
              </div>
            </div>
          </form>

          {commentError && (
            <p style={{ margin: '10px 0 0', color: '#dc2626', fontSize: '13px' }}>
              {commentError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

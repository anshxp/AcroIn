import * as React from 'react';
import { X, Image, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Post } from '../../types';
import './posts.css';

// Add missing React hooks import
const { useState } = React;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  // Removed local isSubmitting state, will use Apollo's loading state only

  const getUserInitials = () => {
    if (user?.firstname && user?.lastName) {
      return `${user.firstname[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.name?.substring(0, 2).toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (user?.firstname && user?.lastName) {
      return `${user.firstname} ${user.lastName}`;
    }
    return user?.name || 'User';
  };

  const CREATE_POST = gql`
    mutation CreatePost($content: String!) {
      createPost(content: $content) { _id content author { _id name } createdAt likes comments { _id content author { _id name } createdAt } }
    }
  `;
  const [createPost, { loading: isSubmitting }] = useMutation<{ createPost: Post }>(CREATE_POST);
  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      const { data } = await createPost({ variables: { content: content.trim() } });
      if (data?.createPost) onPostCreated(data.createPost);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a post</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="post-author-info">
            <div className="author-avatar">{getUserInitials()}</div>
            <div className="author-details">
              <span className="author-name">{getUserName()}</span>
              <span className="author-meta">
                {user?.designation || user?.userType} • {user?.department || 'Acropolis Institute'}
              </span>
            </div>
          </div>

          <textarea
            className="post-textarea"
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          <div className="post-hint">
            Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to post
          </div>
        </div>

        <div className="modal-footer">
          <div className="post-actions-left">
            <button className="post-action-btn" title="Add image">
              <Image size={20} />
            </button>
          </div>
          <button
            className="post-submit-btn"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <>
                <Send size={18} />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

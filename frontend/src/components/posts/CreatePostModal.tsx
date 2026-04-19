import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Image, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { opportunityAPI, postAPI } from '../../services/api';
import type { Post } from '../../types';
import './posts.css';

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
  const [publishMode, setPublishMode] = useState<'post' | 'opportunity'>('post');
  const [content, setContent] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [opportunityType, setOpportunityType] = useState<'competition' | 'internship' | 'certification'>('competition');
  const [applicationLink, setApplicationLink] = useState('');
  const [opportunityVenue, setOpportunityVenue] = useState('');
  const [opportunityDate, setOpportunityDate] = useState('');
  const [opportunityDeadline, setOpportunityDeadline] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFiles = 4;

  const isImageFile = (file: File) => file.type.startsWith('image/');
  const isVideoFile = (file: File) => file.type.startsWith('video/');
  const isPdfFile = (file: File) => file.type === 'application/pdf';
  const isAllowedFile = (file: File) => isImageFile(file) || isVideoFile(file) || isPdfFile(file);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

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

  const handleSubmit = async () => {
    if (publishMode === 'post' && !content.trim() && selectedFiles.length === 0) return;

    if (publishMode === 'opportunity') {
      const normalizedTitle = opportunityTitle.trim();
      const normalizedLink = applicationLink.trim();
      const normalizedVenue = opportunityVenue.trim();
      if (!normalizedTitle || !normalizedLink || !normalizedVenue || !opportunityDate || !opportunityDeadline) {
        setSubmitError('Opportunity requires title, application link, venue, date, and deadline.');
        return;
      }

      try {
        new URL(normalizedLink);
      } catch {
        setSubmitError('Application link must be a valid URL.');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (publishMode === 'opportunity') {
        await opportunityAPI.create({
          title: opportunityTitle.trim(),
          type: opportunityType,
          company: user?.department || 'Acropolis Institute',
          location: opportunityVenue.trim(),
          eventDate: opportunityDate,
          deadline: opportunityDeadline,
          description: content.trim() || `${opportunityType} opportunity`,
          requirements: [],
          application_link: applicationLink.trim(),
          isActive: true,
          createdBy: user?.id || '',
          createdByRole: (user?.userType === 'admin' ? 'admin' : 'faculty'),
          files: selectedFiles,
        });

        const posts = await postAPI.getAll();
        const generatedPost = posts.find((post) =>
          post.author?._id === user?.id
          && post.content.includes(opportunityTitle.trim())
        );

        if (generatedPost) {
          onPostCreated(generatedPost);
        }

        setContent('');
        setOpportunityTitle('');
        setApplicationLink('');
        setOpportunityVenue('');
        setOpportunityDate('');
        setOpportunityDeadline('');
        setSelectedFiles([]);
        setUploadError('');
        setPublishMode('post');
        onClose();
        return;
      }

      const newPost = await postAPI.create({
        content: content.trim(),
        files: selectedFiles,
      });
      onPostCreated(newPost);
      setContent('');
      setSelectedFiles([]);
      setUploadError('');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    const allowedFiles = picked.filter((file) => isAllowedFile(file));
    if (allowedFiles.length !== picked.length) {
      setUploadError('Only images, videos, or PDF files are allowed.');
    } else {
      setUploadError('');
    }

    setSelectedFiles((prev) => {
      const remainingSlots = Math.max(0, maxFiles - prev.length);
      if (remainingSlots === 0) {
        setUploadError(`You can attach up to ${maxFiles} files.`);
        return prev;
      }

      const nextFiles = [...prev, ...allowedFiles.slice(0, remainingSlots)];

      if (allowedFiles.length > remainingSlots) {
        setUploadError(`You can attach up to ${maxFiles} files.`);
      }

      return nextFiles;
    });

    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
    setUploadError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (publishMode === 'post' && e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{publishMode === 'post' ? 'Create a post' : 'Create an opportunity'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="post-mode-toggle" role="tablist" aria-label="Publish mode">
            <button
              type="button"
              className={`mode-chip ${publishMode === 'post' ? 'active' : ''}`}
              onClick={() => {
                setPublishMode('post');
                setSubmitError('');
              }}
            >
              Post
            </button>
            <button
              type="button"
              className={`mode-chip ${publishMode === 'opportunity' ? 'active' : ''}`}
              onClick={() => {
                setPublishMode('opportunity');
                setUploadError('');
                setSelectedFiles([]);
                setSubmitError('');
              }}
            >
              Opportunity
            </button>
          </div>

          <div className="post-author-info">
            <div className="author-avatar">{getUserInitials()}</div>
            <div className="author-details">
              <span className="author-name">{getUserName()}</span>
              <span className="author-meta">
                {user?.designation || user?.userType} • {user?.department || 'Acropolis Institute'}
              </span>
            </div>
          </div>

          {publishMode === 'opportunity' && (
            <div className="opportunity-fields">
              <input
                className="post-input"
                placeholder="Opportunity title"
                value={opportunityTitle}
                onChange={(e) => setOpportunityTitle(e.target.value)}
              />

              <div className="post-input-row">
                <select
                  className="post-input"
                  value={opportunityType}
                  onChange={(e) => setOpportunityType(e.target.value as 'competition' | 'internship' | 'certification')}
                >
                  <option value="competition">Competition</option>
                  <option value="internship">Internship</option>
                  <option value="certification">Certification</option>
                </select>

                <input
                  className="post-input"
                  placeholder="Venue"
                  value={opportunityVenue}
                  onChange={(e) => setOpportunityVenue(e.target.value)}
                />
              </div>

              <div className="post-input-row">
                <label className="date-input-wrap">
                  <span>Date</span>
                  <input
                    className="post-input"
                    type="date"
                    value={opportunityDate}
                    onChange={(e) => setOpportunityDate(e.target.value)}
                  />
                </label>
                <label className="date-input-wrap">
                  <span>Deadline</span>
                  <input
                    className="post-input"
                    type="date"
                    value={opportunityDeadline}
                    onChange={(e) => setOpportunityDeadline(e.target.value)}
                  />
                </label>
              </div>

              <input
                className="post-input"
                placeholder="Application link (https://...)"
                value={applicationLink}
                onChange={(e) => setApplicationLink(e.target.value)}
              />
            </div>
          )}

          <textarea
            className="post-textarea"
            placeholder={publishMode === 'post' ? 'What do you want to talk about?' : 'Add opportunity details'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          {previewUrls.length > 0 && (
            <div className="post-attachments-grid">
              {previewUrls.map((preview, index) => (
                <div className="attachment-preview" key={`${preview.name}-${index}`}>
                  {preview.type.startsWith('image/') ? (
                    <img src={preview.url} alt={preview.name} />
                  ) : preview.type.startsWith('video/') ? (
                    <video src={preview.url} controls />
                  ) : (
                    <div className="attachment-file-placeholder">
                      <span>PDF</span>
                      <small>{preview.name}</small>
                    </div>
                  )}
                  <button
                    type="button"
                    className="attachment-remove-btn"
                    onClick={() => handleRemoveFile(index)}
                    aria-label={`Remove ${preview.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(uploadError || submitError) && <div className="post-upload-error">{uploadError || submitError}</div>}

          <div className="post-hint">
            {publishMode === 'post' ? (
              <>
                Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to post
              </>
            ) : (
              <>Opportunity creates an announcement post automatically.</>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="post-actions-left">
            {(publishMode === 'post' || publishMode === 'opportunity') && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,application/pdf"
                  multiple
                  className="post-file-input"
                  onChange={handleFileChange}
                />
                <button className="post-action-btn" title="Add file" onClick={handleFilePick} type="button">
                  <Image size={20} />
                </button>
                <span className="post-attachment-count">
                  {selectedFiles.length}/{maxFiles} files (image/video/pdf)
                </span>
              </>
            )}
          </div>
          <button
            className="post-submit-btn"
            onClick={handleSubmit}
            disabled={
              (publishMode === 'post' && !content.trim() && selectedFiles.length === 0)
              || isSubmitting
            }
          >
            {isSubmitting ? (
              <Loader2 size={18} className="spin" />
            ) : (
              <>
                <Send size={18} />
                <span>{publishMode === 'post' ? 'Post' : 'Publish Opportunity'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

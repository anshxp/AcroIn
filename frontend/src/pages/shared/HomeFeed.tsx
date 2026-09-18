import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Info, Image, Video, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import type { Post } from '../../types';
import { CreatePostModal } from '../../components/posts/CreatePostModal';
import { PostCard } from '../../components/posts/PostCard';
import '../../styles/homefeed.css';

export const HomeFeed: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filters, setFilters] = useState({ department: '', postType: '' });
  const canPost = user?.userType === 'faculty' || user?.userType === 'admin';

  useEffect(() => {
    const loadPosts = async () => {
      try { setPosts(await postAPI.getAll()); } catch { setPosts([]); }
    };
    loadPosts();
  }, []);

  const handlePostAuthorClick = (event: React.MouseEvent, post: Post) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.author-name, .author-avatar')) return;

    const author = post.author as any;
    const profileId = author?.profileId;
    if (!profileId) return;

    if (author.userType === 'faculty') navigate(`/faculty/profile/${profileId}`);
    else if (author.userType === 'student') navigate(user?.userType === 'faculty' || user?.userType === 'admin' ? `/faculty/student/${profileId}` : `/student/profile/${profileId}`);
  };

  const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();
  const focusPostId = (searchParams.get('post') || '').trim();
  const departments = useMemo(() => Array.from(new Set(posts.map((post) => String(post.author?.department || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [posts]);
  const getPostType = (content: string) => {
    const match = String(content || '').trim().match(/^New\s+(.+?)\s+opportunity\s*:/i);
    return match ? String(match[1] || 'opportunity').trim().toLowerCase() || 'opportunity' : 'general';
  };
  const postTypes = useMemo(() => {
    const values = Array.from(new Set(posts.map((post) => getPostType(post.content)).filter(Boolean)));
    const order = ['general', 'internship', 'job', 'competition', 'certification', 'workshop', 'opportunity'];
    return values.sort((a, b) => { const li = order.indexOf(a); const ri = order.indexOf(b); return (li === -1 ? Number.MAX_SAFE_INTEGER : li) - (ri === -1 ? Number.MAX_SAFE_INTEGER : ri) || a.localeCompare(b); });
  }, [posts]);
  const hasActiveFilters = Boolean(filters.department || filters.postType);

  const filteredPosts = useMemo(() => posts.filter((post) => {
    const authorName = post.author?.name || '';
    const authorMeta = `${post.author?.designation || ''} ${post.author?.department || ''}`;
    const matchesSearch = !searchQuery || post.content.toLowerCase().includes(searchQuery) || authorName.toLowerCase().includes(searchQuery) || authorMeta.toLowerCase().includes(searchQuery);
    const postDepartment = String(post.author?.department || '').trim();
    return matchesSearch && (!filters.department || postDepartment === filters.department) && (!filters.postType || getPostType(post.content) === filters.postType);
  }), [filters.department, filters.postType, posts, searchQuery]);

  useEffect(() => {
    if (!focusPostId) return;
    const timer = window.setTimeout(() => document.getElementById(`post-${focusPostId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    return () => window.clearTimeout(timer);
  }, [focusPostId, filteredPosts.length]);

  const getUserInitials = () => user?.userType === 'faculty' ? `${user?.firstname?.[0] || 'U'}${user?.lastName?.[0] || ''}` : user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U';

  return (
    <div className="home-feed">
      <div className="feed-main">
        {canPost ? <div className="create-post-card"><div className="create-post-input-row"><div className="create-post-avatar">{getUserInitials()}</div><input type="text" className="create-post-input" placeholder="Share an announcement, opportunity, or update..." onClick={() => setShowCreateModal(true)} readOnly /></div><div className="create-post-actions"><button className="create-post-btn photo" onClick={() => setShowCreateModal(true)}><Image size={20} /><span>Photo</span></button><button className="create-post-btn video" onClick={() => setShowCreateModal(true)}><Video size={20} /><span>Video</span></button><button className="create-post-btn event" onClick={() => setShowCreateModal(true)}><Calendar size={20} /><span>Event</span></button><button className="create-post-btn article" onClick={() => setShowCreateModal(true)}><FileText size={20} /><span>Article</span></button></div></div> : <div className="student-notice"><Info size={20} /><p>This feed shows official announcements from faculty and CDC. Stay updated with placement drives, research opportunities, and important notices.</p></div>}

        <div className="feed-divider"><div className="feed-divider-line"></div><span className="feed-divider-text">Recent posts</span><div className="feed-divider-line"></div></div>
        <div className="feed-filter-panel"><div className="feed-filter-head"><h4>Filters</h4><button type="button" className="feed-filter-clear" onClick={() => setFilters({ department: '', postType: '' })}>Clear</button></div><div className="feed-filter-grid"><div className="feed-filter-field"><span>Department</span><select value={filters.department} onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}><option value="">All Departments</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></div><div className="feed-filter-field"><span>Post Type</span><select value={filters.postType} onChange={(event) => setFilters((prev) => ({ ...prev, postType: event.target.value }))}><option value="">All Types</option>{postTypes.map((postType) => <option key={postType} value={postType}>{postType.split(/[_\s]+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}</option>)}</select></div></div></div>

        {filteredPosts.length === 0 && !searchQuery && !hasActiveFilters && <p className="page-subtitle">No posts available from backend.</p>}
        {filteredPosts.length === 0 && (searchQuery || hasActiveFilters) && <p className="page-subtitle">No posts matched your search or filters.</p>}
        {filteredPosts.map((post) => <div key={post._id} id={`post-${post._id}`} onClick={(event) => handlePostAuthorClick(event, post)} style={focusPostId === post._id ? { outline: '2px solid #2563eb', borderRadius: '14px', transition: 'outline 0.2s ease' } : undefined}><PostCard post={post} onPostDeleted={(postId) => setPosts((prev) => prev.filter((item) => item._id !== postId))} onPostUpdated={(updatedPost) => setPosts((prev) => prev.map((item) => item._id === updatedPost._id ? updatedPost : item))} /></div>)}
      </div>

      <CreatePostModal isOpen={showCreateModal && canPost} onClose={() => setShowCreateModal(false)} onPostCreated={(post) => setPosts((prev) => [post, ...prev])} />
    </div>
  );
};

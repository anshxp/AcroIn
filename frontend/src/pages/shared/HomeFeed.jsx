import React, { useEffect, useState } from 'react';
import { postAPI } from '../../services/api';

export const HomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await postAPI.list();
        setPosts(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) return <div>Loading feed...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!posts.length) return <div>No posts available yet.</div>;

  return (
    <div>
      <h2>Home Feed</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id || post.id}>
            <strong>{post.title || 'Untitled post'}</strong>
            <p>{post.content || post.description || ''}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

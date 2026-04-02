import React, { useEffect, useState } from 'react';
import { adminAPI, facultyAPI, postAPI, studentAPI } from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentsRes, facultyRes, postsRes, adminsRes] = await Promise.all([
          studentAPI.list(),
          facultyAPI.list(),
          postAPI.list(),
          adminAPI.list(),
        ]);

        const students = Array.isArray(studentsRes?.data) ? studentsRes.data : [];
        const faculty = Array.isArray(facultyRes?.data) ? facultyRes.data : [];
        const posts = Array.isArray(postsRes?.data) ? postsRes.data : [];
        const admins = Array.isArray(adminsRes?.data) ? adminsRes.data : [];

        setStats({
          students: students.length,
          faculty: faculty.length,
          posts: posts.length,
          admins: admins.length,
        });

        setRecentActivity(
          posts
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        );
      } catch (err) {
        setError(err.message || 'Error fetching dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return <div>No dashboard data available.</div>;

  return (
    <div className="page-content">
      <h2>Admin Dashboard</h2>
      <div className="stats-grid">
        <div className="stats-card">
          <span className="stats-card-label">Students</span>
          <span className="stats-card-value">{stats.students}</span>
        </div>
        <div className="stats-card">
          <span className="stats-card-label">Faculty</span>
          <span className="stats-card-value">{stats.faculty}</span>
        </div>
        <div className="stats-card">
          <span className="stats-card-label">Posts</span>
          <span className="stats-card-value">{stats.posts}</span>
        </div>
        <div className="stats-card">
          <span className="stats-card-label">Admins</span>
          <span className="stats-card-value">{stats.admins}</span>
        </div>
      </div>

      <h3>Recent Activity</h3>
      {!recentActivity.length ? (
        <p>No recent activity.</p>
      ) : (
        <ul>
          {recentActivity.map((post) => (
            <li key={post._id}>
              <strong>{post.author?.name || 'Unknown user'}</strong>: {post.content || 'No content'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

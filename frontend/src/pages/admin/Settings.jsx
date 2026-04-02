import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/pages.css';

export const AdminSettings = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminAPI.list();
        setAdmins(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err.message || 'Error fetching admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  if (loading) return <div>Loading admin data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-content">
      <h2>Admin Settings</h2>
      <p>This page is powered by current admin records from the backend.</p>
      {!admins.length ? (
        <p>No admin records found.</p>
      ) : (
        <ul>
          {admins.map((admin) => (
            <li key={admin._id}>{admin.user?.email || admin.user?.name || 'Admin user'}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

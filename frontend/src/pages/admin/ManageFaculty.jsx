import React, { useEffect, useState } from 'react';
import { facultyAPI } from '../../services/api';
import '../../styles/pages.css';

export const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await facultyAPI.list();
        setFaculty(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err.message || 'Error fetching faculty');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  if (loading) return <div>Loading faculty...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!faculty.length) return <div>No faculty found.</div>;

  return (
    <div className="page-content">
      <h2>Manage Faculty</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((member) => (
              <tr key={member._id}>
                <td>{`${member.firstname || ''} ${member.lastName || ''}`.trim() || '-'}</td>
                <td>{member.email || '-'}</td>
                <td>{member.department || '-'}</td>
                <td>{member.designation || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { studentAPI } from '../../services/api';
import '../../styles/pages.css';

export const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await studentAPI.list();
        setStudents(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err.message || 'Error fetching students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <div>Loading students...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!students.length) return <div>No students found.</div>;

  return (
    <div className="page-content">
      <h2>Manage Students</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roll</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.name || '-'}</td>
                <td>{student.email || '-'}</td>
                <td>{student.roll || '-'}</td>
                <td>{student.department || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

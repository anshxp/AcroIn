import React, { useEffect, useState } from 'react';
import { competitionAPI, internshipAPI, certificateAPI, projectAPI } from '../../services/studentDataApi';

const ListPage = ({ title, loadItems, renderItem }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await loadItems();
        setItems(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [loadItems]);

  if (loading) return <div>Loading {title.toLowerCase()}...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!items.length) return <div>No {title.toLowerCase()} found.</div>;

  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item._id || item.id}>{renderItem(item)}</li>
        ))}
      </ul>
    </div>
  );
};

export const StudentDashboard = () => <div>Student Dashboard</div>;
export const StudentProfile = () => <div>Student Profile</div>;
export const StudentSkills = () => <div>Student Skills</div>;

export const StudentProjects = () => (
  <ListPage
    title="Projects"
    loadItems={projectAPI.list}
    renderItem={(item) => item.title || item.name || 'Project'}
  />
);

export const StudentInternships = () => (
  <ListPage
    title="Internships"
    loadItems={internshipAPI.list}
    renderItem={(item) => item.title || item.company || 'Internship'}
  />
);

export const StudentCompetitions = () => (
  <ListPage
    title="Competitions"
    loadItems={competitionAPI.list}
    renderItem={(item) => item.title || item.name || 'Competition'}
  />
);

export const StudentCertificates = () => (
  <ListPage
    title="Certificates"
    loadItems={certificateAPI.list}
    renderItem={(item) => item.title || item.name || 'Certificate'}
  />
);

import React, { useState } from 'react';
import { Search, MapPin, Star } from 'lucide-react';

export const SmartSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    skill: '',
  });

  const departments = ['Computer Science', 'Data Science', 'Engineering'];
  const years = ['2024', '2025', '2026'];
  const skills = ['React', 'Python', 'JavaScript', 'Machine Learning', 'Node.js'];

  const students = [
    {
      id: 1,
      name: 'Alex Chen',
      initials: 'AC',
      department: 'Computer Science',
      year: '2024',
      location: 'San Francisco, CA',
      skills: ['React', 'Python', 'Machine Learning', 'TensorFlow'],
      projects: ['AI Chatbot', 'E-commerce Platform'],
      rating: 4.8,
      verified: true,
      color: 'blue',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      initials: 'SJ',
      department: 'Data Science',
      year: '2025',
      location: 'Austin, TX',
      skills: ['Data Analysis', 'R', 'SQL', 'Tableau'],
      projects: ['Sales Analytics Dashboard', 'Customer Segmentation'],
      rating: 4.6,
      verified: true,
      color: 'green',
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      initials: 'MR',
      department: 'Computer Science',
      year: '2024',
      location: 'Seattle, WA',
      skills: ['JavaScript', 'Node.js', 'MongoDB', 'Docker'],
      projects: ['Social Media API', 'Microservices Architecture'],
      rating: 4.7,
      verified: false,
      color: 'purple',
    },
  ];

  const toggleFilter = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type as keyof typeof prev] === value ? '' : value
    }));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Smart Search</h1>
          <p>Find students using AI-powered semantic search</p>
        </div>
      </div>

      {/* Search Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          {/* Search Input */}
          <div className="search-bar" style={{ maxWidth: '100%', marginBottom: '20px' }}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search by skills, projects, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="filters-row">
            <div className="filter-group">
              <span className="filter-label">Department:</span>
              {departments.map((dept) => (
                <button
                  key={dept}
                  className={`filter-chip ${filters.department === dept ? 'active' : ''}`}
                  onClick={() => toggleFilter('department', dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">Year:</span>
              {years.map((year) => (
                <button
                  key={year}
                  className={`filter-chip ${filters.year === year ? 'active' : ''}`}
                  onClick={() => toggleFilter('year', year)}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">Skills:</span>
              {skills.slice(0, 3).map((skill) => (
                <button
                  key={skill}
                  className={`filter-chip ${filters.skill === skill ? 'active' : ''}`}
                  onClick={() => toggleFilter('skill', skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Results */}
      <div className="student-list">
        {students.map((student) => (
          <div key={student.id} className="student-card">
            <div className={`student-avatar`} style={{ background: student.color === 'blue' ? '#dbeafe' : student.color === 'green' ? '#dcfce7' : '#e9d5ff', color: student.color === 'blue' ? '#3b82f6' : student.color === 'green' ? '#22c55e' : '#a855f7' }}>
              {student.initials}
            </div>
            <div className="student-main">
              <div className="student-header">
                <h3 className="student-name">{student.name}</h3>
                {student.verified && (
                  <span className="verified-badge">
                    Verified
                  </span>
                )}
              </div>
              <div className="student-meta">
                <span>{student.department}</span>
                <span className="separator">•</span>
                <span>Class of {student.year}</span>
                <span className="separator">•</span>
                <span><MapPin size={14} /> {student.location}</span>
              </div>
              <div className="student-skills">
                {student.skills.map((skill, i) => (
                  <span key={i} className="student-skill">{skill}</span>
                ))}
              </div>
              <div className="student-projects">
                Recent Projects: <span>{student.projects.join('  ')}</span>
              </div>
            </div>
            <div className="student-actions">
              <div className="student-rating">
                <Star size={16} fill="#fbbf24" />
                {student.rating}
              </div>
              <button className="view-profile-btn">View Profile</button>
              <button className="connect-student-btn">Connect</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

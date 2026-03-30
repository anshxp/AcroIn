import React from 'react';

export const Recommendations: React.FC = () => {

  // Same dashboard content as FacultyDashboard but focused on Recommendations
  const suggestedTeammates = [
    { 
      name: 'Emma Wilson', 
      role: 'Data Science', 
      skills: ['Python', 'ML'], 
      match: 95,
      color: 'blue'
    },
    { 
      name: 'John Doe', 
      role: 'CS', 
      skills: ['React', 'Node.js'], 
      match: 87,
      color: 'green'
    },
    { 
      name: 'Lisa Zhang', 
      role: 'AI', 
      skills: ['TensorFlow', 'PyTorch'], 
      match: 92,
      color: 'purple'
    },
    { 
      name: 'David Park', 
      role: 'Backend', 
      skills: ['Java', 'Spring Boot'], 
      match: 84,
      color: 'orange'
    },
    { 
      name: 'Maria Garcia', 
      role: 'Full Stack', 
      skills: ['Vue.js', 'Django'], 
      match: 89,
      color: 'blue'
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Recommendations</h1>
          <p>AI-powered student recommendations for your requirements</p>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="dashboard-grid full">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Top Recommended Students</h2>
              <p>Based on your search history and requirements</p>
            </div>
          </div>
          <div className="card-body">
            <div className="teammate-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {suggestedTeammates.map((teammate, index) => (
                <div key={index} className="teammate-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div className={`teammate-avatar ${teammate.color}`}>
                    {teammate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="teammate-info">
                    <h4 className="teammate-name">{teammate.name}</h4>
                    <p className="teammate-role">{teammate.role}</p>
                    <div className="teammate-skills">
                      {teammate.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="teammate-actions">
                    <span className="match-score">{teammate.match}% match</span>
                    <button className="connect-btn">Connect</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

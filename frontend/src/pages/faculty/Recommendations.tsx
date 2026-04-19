import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';

interface SuggestedTeammate {
  id: string;
  name: string;
  role: string;
  skills: string[];
  match: number;
  color: string;
  profileImage?: string;
}

export const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [suggestedTeammates, setSuggestedTeammates] = useState<SuggestedTeammate[]>([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const students = await studentAPI.getAllStudents();
        const palette = ['blue', 'green', 'purple', 'orange'];

        const recommendations = students
          .map((student: any, index) => {
            const skills = Array.isArray(student.tech_stack) ? student.tech_stack : [];
            const match = Math.min(99, 60 + skills.length * 8);
            return {
              id: student._id,
              name: student.name || 'Unknown Student',
              role: student.department || 'Student',
              skills: skills.slice(0, 4),
              match,
              color: palette[index % palette.length],
              profileImage: student.profile_image,
            };
          })
          .sort((a, b) => b.match - a.match)
          .slice(0, 8);

        setSuggestedTeammates(recommendations);
      } catch {
        setSuggestedTeammates([]);
      }
    };

    loadRecommendations();
  }, []);

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
                  {teammate.profileImage ? (
                    <img
                      src={teammate.profileImage}
                      alt={`${teammate.name} profile`}
                      className="teammate-avatar"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className={`teammate-avatar ${teammate.color}`}>
                      {teammate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
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
                    <button
                      type="button"
                      className="connect-btn"
                      onClick={() => navigate(`/faculty/student/${teammate.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
              {!suggestedTeammates.length && <p>No recommendations available from backend.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Award,
  Star,
  TrendingUp
} from 'lucide-react';

export const StudentSkills: React.FC = () => {
  const [skills, setSkills] = useState([
    { id: 1, name: 'React', level: 'Advanced', verified: true, endorsements: 24, progress: 90 },
    { id: 2, name: 'Python', level: 'Advanced', verified: true, endorsements: 18, progress: 85 },
    { id: 3, name: 'JavaScript', level: 'Advanced', verified: true, endorsements: 32, progress: 95 },
    { id: 4, name: 'Node.js', level: 'Intermediate', verified: true, endorsements: 15, progress: 70 },
    { id: 5, name: 'Machine Learning', level: 'Intermediate', verified: false, endorsements: 8, progress: 60 },
    { id: 6, name: 'SQL', level: 'Intermediate', verified: true, endorsements: 12, progress: 75 },
    { id: 7, name: 'Docker', level: 'Beginner', verified: false, endorsements: 5, progress: 40 },
    { id: 8, name: 'AWS', level: 'Beginner', verified: false, endorsements: 3, progress: 35 },
  ]);

  const handleAddSkill = () => {
    const newSkill = {
      id: skills.length + 1,
      name: 'New Skill',
      level: 'Beginner' as const,
      verified: false,
      endorsements: 0,
      progress: 10
    };
    setSkills([...skills, newSkill]);
  };

  const skillCategories = [
    { name: 'Programming Languages', count: 4 },
    { name: 'Frameworks', count: 3 },
    { name: 'Tools & Technologies', count: 5 },
    { name: 'Soft Skills', count: 2 },
  ];

  const pendingVerifications = [
    { skill: 'Machine Learning', requestedDate: 'Dec 1, 2024', status: 'Under Review' },
    { skill: 'Docker', requestedDate: 'Nov 28, 2024', status: 'Pending Faculty' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>My Skills</h1>
          <p>Manage and verify your technical skills</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={handleAddSkill}>
            <Plus size={18} />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Skills</h3>
            <div className="stat-value">{skills.length}</div>
            <span className="stat-change positive">+2 this month</span>
          </div>
          <div className="stat-icon blue">
            <Award size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Verified Skills</h3>
            <div className="stat-value">{skills.filter(s => s.verified).length}</div>
            <span className="stat-change positive">75% verified</span>
          </div>
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Endorsements</h3>
            <div className="stat-value">{skills.reduce((acc, s) => acc + s.endorsements, 0)}</div>
            <span className="stat-change positive">+15 this week</span>
          </div>
          <div className="stat-icon purple">
            <Star size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Pending Verification</h3>
            <div className="stat-value">{pendingVerifications.length}</div>
            <span className="stat-change neutral">In progress</span>
          </div>
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Skills List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>All Skills</h2>
              <p>Your technical and soft skills</p>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ 
                  padding: '16px 20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{skill.name}</h4>
                      {skill.verified && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '2px 8px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500
                        }}>
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      )}
                      <span style={{ 
                        padding: '2px 8px',
                        background: skill.level === 'Advanced' ? '#dbeafe' : skill.level === 'Intermediate' ? '#fef3c7' : '#f1f5f9',
                        color: skill.level === 'Advanced' ? '#1d4ed8' : skill.level === 'Intermediate' ? '#b45309' : '#64748b',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {skill.level}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          height: '6px', 
                          background: '#e2e8f0', 
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${skill.progress}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                      </div>
                      <span style={{ fontSize: '13px', color: '#64748b', minWidth: '40px' }}>{skill.progress}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{skill.endorsements}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>endorsements</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Pending Verifications */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h2>
                  <Clock size={20} />
                  Pending Verifications
                </h2>
                <p>Skills awaiting verification</p>
              </div>
            </div>
            <div className="card-body">
              {pendingVerifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingVerifications.map((item, index) => (
                    <div key={index} style={{ 
                      padding: '16px', 
                      background: '#fef3c7', 
                      borderRadius: '10px' 
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                        {item.skill}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Requested: {item.requestedDate}
                      </p>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#b45309'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  No pending verifications
                </p>
              )}
            </div>
          </div>

          {/* Skill Categories */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <TrendingUp size={20} />
                  Skill Categories
                </h2>
                <p>Skills by category</p>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {skillCategories.map((category, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>{category.name}</span>
                    <span style={{ 
                      padding: '4px 12px',
                      background: '#dbeafe',
                      color: '#3b82f6',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Briefcase, 
  Trophy,
  ArrowRight,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { 
      label: 'Profile Score', 
      value: '85%', 
      change: '+5% this month', 
      positive: true,
      icon: <Target size={24} />,
      iconColor: 'blue'
    },
    { 
      label: 'Skills Verified', 
      value: '12', 
      change: '3 pending', 
      positive: true,
      icon: <Award size={24} />,
      iconColor: 'green'
    },
    { 
      label: 'Projects', 
      value: '8', 
      change: '+2 this semester', 
      positive: true,
      icon: <BookOpen size={24} />,
      iconColor: 'purple'
    },
    { 
      label: 'Applications', 
      value: '5', 
      change: '2 in progress', 
      positive: true,
      icon: <Briefcase size={24} />,
      iconColor: 'orange'
    },
  ];

  const upcomingEvents = [
    { title: 'Microsoft Campus Drive', date: 'Dec 20, 2024', type: 'Placement', status: 'registered' },
    { title: 'Google Internship Deadline', date: 'Dec 15, 2024', type: 'Internship', status: 'pending' },
    { title: 'Hackathon 2024', date: 'Dec 25, 2024', type: 'Competition', status: 'registered' },
    { title: 'Resume Workshop', date: 'Dec 10, 2024', type: 'Workshop', status: 'completed' },
  ];

  const recentAchievements = [
    { title: 'React Developer', type: 'Skill Verified', date: '2 days ago', icon: <CheckCircle size={16} /> },
    { title: 'E-commerce Project', type: 'Project Completed', date: '1 week ago', icon: <BookOpen size={16} /> },
    { title: 'Coding Contest Win', type: 'Competition', date: '2 weeks ago', icon: <Trophy size={16} /> },
  ];

  const recommendedOpportunities = [
    { 
      company: 'Amazon', 
      role: 'SDE Intern', 
      match: 92,
      skills: ['React', 'Node.js', 'AWS'],
      deadline: 'Dec 18, 2024'
    },
    { 
      company: 'Google', 
      role: 'Software Engineer', 
      match: 88,
      skills: ['Python', 'ML', 'Algorithms'],
      deadline: 'Dec 15, 2024'
    },
    { 
      company: 'Microsoft', 
      role: 'Data Analyst', 
      match: 85,
      skills: ['SQL', 'Python', 'PowerBI'],
      deadline: 'Dec 20, 2024'
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name || 'Student'}!</p>
        </div>
        <div className="page-actions">
          <Link to="/student/profile" className="btn-secondary">
            View Profile
          </Link>
          <Link to="/home" className="btn-primary">
            <span>View Feed</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <h3>{stat.label}</h3>
              <div className="stat-value">{stat.value}</div>
              <span className={`stat-change ${stat.positive ? 'positive' : 'neutral'}`}>
                {stat.change}
              </span>
            </div>
            <div className={`stat-icon ${stat.iconColor}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div>
          {/* Upcoming Events */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h2>
                  <Clock size={20} />
                  Upcoming Events
                </h2>
                <p>Don't miss these important dates</p>
              </div>
            </div>
            <div className="card-body">
              <div className="activity-list">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-dot" style={{ 
                      background: event.status === 'completed' ? '#22c55e' : 
                                  event.status === 'registered' ? '#3b82f6' : '#f97316' 
                    }}></div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{event.title}</strong>
                      </p>
                      <span className="activity-time">{event.date}</span>
                    </div>
                    <span className="activity-badge">{event.type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer">
              <Link to="/student/calendar" className="card-link">
                View Calendar
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Recommended Opportunities */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <Briefcase size={20} />
                  Recommended For You
                </h2>
                <p>Based on your skills and interests</p>
              </div>
            </div>
            <div className="card-body">
              <div className="teammate-list">
                {recommendedOpportunities.map((opp, index) => (
                  <div key={index} className="teammate-card" style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div className="teammate-avatar blue">
                      {opp.company.substring(0, 2)}
                    </div>
                    <div className="teammate-info">
                      <h4 className="teammate-name">{opp.company}</h4>
                      <p className="teammate-role">{opp.role}</p>
                      <div className="teammate-skills">
                        {opp.skills.map((skill, i) => (
                          <span key={i} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="teammate-actions">
                      <span className="match-score">{opp.match}% match</span>
                      <button className="connect-btn">Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Achievements */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>
                <Trophy size={20} />
                Recent Achievements
              </h2>
              <p>Your latest accomplishments</p>
            </div>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="activity-item" style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: '#dcfce7', 
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {achievement.icon}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{achievement.title}</strong>
                    </p>
                    <span className="activity-time">{achievement.date}</span>
                  </div>
                  <span className="activity-badge">{achievement.type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <Link to="/student/achievements" className="card-link">
              View All Achievements
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

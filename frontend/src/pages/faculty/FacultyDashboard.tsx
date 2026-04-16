import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  Star,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { 
      label: 'Total Students', 
      value: '247', 
      change: '+12 this week', 
      positive: true,
      icon: <Users size={24} />,
      iconColor: 'blue'
    },
    { 
      label: 'Verified Profiles', 
      value: '234', 
      change: '+8 this week', 
      positive: true,
      icon: <Shield size={24} />,
      iconColor: 'green'
    },
    { 
      label: 'Active Searches', 
      value: '89', 
      change: '+23 this week', 
      positive: true,
      icon: <TrendingUp size={24} />,
      iconColor: 'orange'
    },
    { 
      label: 'Recommendations', 
      value: '156', 
      change: '+34 this week', 
      positive: true,
      icon: <Star size={24} />,
      iconColor: 'purple'
    },
  ];

  const recentActivity = [
    { user: 'Alex Chen', action: 'Completed facial verification', time: '2 min ago', type: 'verification' },
    { user: 'Sarah Johnson', action: 'Updated skill profile', time: '5 min ago', type: 'update' },
    { user: 'Mike Rodriguez', action: 'Applied to Google internship', time: '12 min ago', type: 'application' },
    { user: 'Dr. Smith', action: 'Posted new placement opportunity', time: '1 hour ago', type: 'placement' },
  ];

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
  ];

  const insights = [
    { label: 'Profile Completion Rate', value: 87, note: '13 students need profile updates', color: 'blue' },
    { label: 'Skill Verification Rate', value: 94, note: 'Strong verification trend', color: 'green' },
    { label: 'Placement Readiness', value: 76, note: 'Focus on soft skills training', color: 'orange' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Dashboard</h1>
          <p>Welcome back, Dr. {user?.firstname || 'Sarah'} {user?.lastName || 'Chen'}</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary">
            <Plus size={18} />
            <span>New Action</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <h3>{stat.label}</h3>
              <div className="stat-value">{stat.value}</div>
              <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
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
          {/* Recent Activity */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h2>Recent Activity</h2>
                <p>Latest updates from the platform</p>
              </div>
            </div>
            <div className="card-body">
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{activity.user}</strong> {activity.action}
                      </p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <span className="activity-badge">{activity.type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer">
              <Link to="/faculty/activity" className="card-link">
                View All Activity
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* ML-Powered Insights */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <TrendingUp size={20} />
                  ML-Powered Insights
                </h2>
                <p>Real-time analytics and recommendations</p>
              </div>
            </div>
            <div className="card-body">
              <div className="insights-grid">
                {insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-header">
                      <span className="insight-label">{insight.label}</span>
                      <span className="insight-value">{insight.value}%</span>
                    </div>
                    <div className="insight-bar">
                      <div 
                        className={`insight-fill ${insight.color}`}
                        style={{ width: `${insight.value}%` }}
                      ></div>
                    </div>
                    <span className="insight-note">{insight.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Suggested Teammates */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Suggested Teammates</h2>
              <p>Students with complementary skills</p>
            </div>
          </div>
          <div className="card-body">
            <div className="teammate-list">
              {suggestedTeammates.map((teammate, index) => (
                <div key={index} className="teammate-card">
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

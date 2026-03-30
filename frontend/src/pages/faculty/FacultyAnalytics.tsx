import React from 'react';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Eye
} from 'lucide-react';

export const FacultyAnalytics: React.FC = () => {
  const stats = [
    { 
      label: 'Total Profiles', 
      value: '247', 
      change: '+5.2% this month', 
      positive: true,
      icon: <Users size={24} />,
      iconColor: 'blue'
    },
    { 
      label: 'Verified Users', 
      value: '234', 
      change: '94.7% verified', 
      positive: true,
      icon: <Shield size={24} />,
      iconColor: 'green'
    },
    { 
      label: 'Active Searches', 
      value: '1,284', 
      change: '+12.3% this week', 
      positive: true,
      icon: <TrendingUp size={24} />,
      iconColor: 'orange'
    },
    { 
      label: 'Anomalies Detected', 
      value: '3', 
      change: 'Needs attention', 
      positive: false,
      icon: <AlertTriangle size={24} />,
      iconColor: 'red'
    },
  ];

  const trendingSkills = [
    { rank: 1, name: 'Machine Learning', count: 89, change: '+45%' },
    { rank: 2, name: 'React', count: 156, change: '+32%' },
    { rank: 3, name: 'Python', count: 201, change: '+28%' },
    { rank: 4, name: 'Data Science', count: 78, change: '+25%' },
    { rank: 5, name: 'JavaScript', count: 189, change: '+18%' },
  ];

  const studentClusters = [
    { name: 'AI Enthusiasts', members: 45, skills: 'Machine Learning, Deep Learning', activity: 92 },
    { name: 'Full Stack Developers', members: 67, skills: 'React, Node.js, MongoDB', activity: 85 },
    { name: 'Data Analysts', members: 34, skills: 'Python, SQL, Tableau', activity: 78 },
    { name: 'Mobile Developers', members: 28, skills: 'React Native, Flutter', activity: 71 },
  ];

  const anomalyAlerts = [
    { 
      title: 'Suspicious Profile', 
      severity: 'High',
      description: 'Student profile shows inconsistent skill endorsements',
      user: 'John Smith - CS \'24',
      action: 'Review Required'
    },
    { 
      title: 'Fake Endorsements', 
      severity: 'Medium',
      description: 'Unusual endorsement pattern detected',
      user: 'Jane Doe - DS \'25',
      action: 'Investigate'
    },
    { 
      title: 'Duplicate Account', 
      severity: 'Low',
      description: 'Potential duplicate profile detected',
      user: 'Alex Johnson - CS \'26',
      action: 'Verify Identity'
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Analytics Dashboard</h1>
          <p>ML-powered insights and anomaly detection</p>
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
        {/* Trending Skills */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>
                <TrendingUp size={20} />
                Trending Skills
              </h2>
              <p>Most popular skills among students this semester</p>
            </div>
          </div>
          <div className="card-body">
            <div className="trending-list">
              {trendingSkills.map((skill) => (
                <div key={skill.rank} className="trending-item">
                  <div className="trending-rank">#{skill.rank}</div>
                  <div className="trending-info">
                    <h4 className="trending-name">{skill.name}</h4>
                    <span className="trending-count">{skill.count} students</span>
                  </div>
                  <div className="trending-change">
                    <span className="trending-percent">{skill.change}</span>
                    <span className="trending-period">vs last month</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Clusters */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>
                <Users size={20} />
                Student Clusters
              </h2>
              <p>Groups based on skills and interests</p>
            </div>
          </div>
          <div className="card-body">
            <div className="cluster-list">
              {studentClusters.map((cluster, index) => (
                <div key={index} className="cluster-card">
                  <div className="cluster-header">
                    <h4 className="cluster-name">{cluster.name}</h4>
                    <span className="cluster-count">{cluster.members} members</span>
                  </div>
                  <p className="cluster-skills">{cluster.skills}</p>
                  <div className="cluster-activity">
                    <span className="cluster-activity-label">Activity Level</span>
                    <div className="cluster-bar">
                      <div 
                        className="cluster-bar-fill" 
                        style={{ width: `${cluster.activity}%` }}
                      ></div>
                    </div>
                    <span className="cluster-activity-value">{cluster.activity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Alerts */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h2>
              <AlertTriangle size={20} />
              Anomaly Alerts
            </h2>
            <p>AI-detected irregularities requiring attention</p>
          </div>
        </div>
        <div className="card-body">
          <div className="alert-list">
            {anomalyAlerts.map((alert, index) => (
              <div key={index} className="alert-card">
                <div className={`alert-icon ${alert.severity.toLowerCase()}`}>
                  <AlertTriangle size={20} />
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <h4 className="alert-title">{alert.title}</h4>
                    <span className={`alert-severity ${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="alert-desc">{alert.description}</p>
                  <span className="alert-user">{alert.user}</span>
                </div>
                <div className="alert-actions">
                  <button className="alert-btn secondary">
                    <Eye size={16} />
                    View Details
                  </button>
                  <button className="alert-btn primary">
                    {alert.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  Shield, 
  TrendingUp,
  ArrowRight,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const stats = [
    { 
      label: 'Total Students', 
      value: '2,847', 
      change: '+124 this semester', 
      positive: true,
      icon: <Users size={24} />,
      iconColor: 'blue'
    },
    { 
      label: 'Total Faculty', 
      value: '156', 
      change: '+8 this year', 
      positive: true,
      icon: <GraduationCap size={24} />,
      iconColor: 'green'
    },
    { 
      label: 'Verified Profiles', 
      value: '94%', 
      change: '+2% this month', 
      positive: true,
      icon: <Shield size={24} />,
      iconColor: 'purple'
    },
    { 
      label: 'Placement Rate', 
      value: '87%', 
      change: '+5% vs last year', 
      positive: true,
      icon: <TrendingUp size={24} />,
      iconColor: 'orange'
    },
  ];

  const pendingActions = [
    { type: 'Student Verification', count: 23, priority: 'high' },
    { type: 'Faculty Approval', count: 5, priority: 'medium' },
    { type: 'Profile Reviews', count: 12, priority: 'low' },
    { type: 'System Alerts', count: 3, priority: 'high' },
  ];

  const recentActivity = [
    { user: 'Dr. Sharma', action: 'Approved 5 student profiles', time: '10 min ago' },
    { user: 'System', action: 'Backup completed successfully', time: '1 hour ago' },
    { user: 'Admin', action: 'Updated placement criteria', time: '2 hours ago' },
    { user: 'CDC', action: 'Posted new internship opportunity', time: '3 hours ago' },
  ];

  const departmentStats = [
    { name: 'Computer Science', students: 856, faculty: 42, placements: 92 },
    { name: 'Electronics', students: 624, faculty: 38, placements: 85 },
    { name: 'Mechanical', students: 548, faculty: 32, placements: 78 },
    { name: 'Civil', students: 412, faculty: 28, placements: 72 },
    { name: 'IT', students: 407, faculty: 16, placements: 89 },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/settings" className="btn-secondary">
            <Settings size={18} />
            <span>Settings</span>
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
          {/* Pending Actions */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h2>
                  <AlertTriangle size={20} />
                  Pending Actions
                </h2>
                <p>Items requiring attention</p>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingActions.map((action, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: action.priority === 'high' ? '#fef2f2' : action.priority === 'medium' ? '#fef3c7' : '#f8fafc',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%',
                        background: action.priority === 'high' ? '#ef4444' : action.priority === 'medium' ? '#f97316' : '#64748b'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#1e293b' }}>{action.type}</span>
                    </div>
                    <span style={{ 
                      padding: '4px 12px',
                      background: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: action.priority === 'high' ? '#ef4444' : action.priority === 'medium' ? '#f97316' : '#64748b'
                    }}>
                      {action.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Statistics */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Department Overview</h2>
                <p>Statistics by department</p>
              </div>
            </div>
            <div className="card-body">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Department</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Students</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Faculty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Placement %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map((dept, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{dept.name}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', color: '#64748b' }}>{dept.students}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '14px', color: '#64748b' }}>{dept.faculty}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <span style={{ 
                            padding: '4px 10px',
                            background: dept.placements >= 85 ? '#dcfce7' : dept.placements >= 75 ? '#fef3c7' : '#fee2e2',
                            color: dept.placements >= 85 ? '#16a34a' : dept.placements >= 75 ? '#b45309' : '#dc2626',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 600
                          }}>
                            {dept.placements}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest system activity</p>
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
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <Link to="/admin/activity" className="card-link">
              View All Activity
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

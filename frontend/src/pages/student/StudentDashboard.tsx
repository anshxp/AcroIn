import React from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { 
  Clock,
  ArrowRight,
  Briefcase,
  Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string | React.ReactNode;
  iconColor: string;
}

interface UpcomingEvent {
  title: string;
  date: string;
  type: string;
  status: string;
}

interface Achievement {
  title: string;
  type: string;
  date: string;
  icon: string | React.ReactNode;
}

interface Opportunity {
  company: string;
  role: string;
  match: number;
  skills: string[];
  deadline: string;
}

interface DashboardData {
  stats: DashboardStat[];
  upcomingEvents: UpcomingEvent[];
  recentAchievements: Achievement[];
  recommendedOpportunities: Opportunity[];
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const GET_STUDENT_DASHBOARD = gql`
    query GetStudentDashboard {
      stats {
        label
        value
        change
        positive
        icon
        iconColor
      }
      upcomingEvents {
        title
        date
        type
        status
      }
      recentAchievements {
        title
        type
        date
        icon
      }
      recommendedOpportunities {
        company
        role
        match
        skills
        deadline
      }
    }
  `;
  const { data, loading, error } = useQuery<DashboardData>(GET_STUDENT_DASHBOARD);
  const stats = data?.stats || [];
  const upcomingEvents = data?.upcomingEvents || [];
  const recentAchievements = data?.recentAchievements || [];
  const recommendedOpportunities = data?.recommendedOpportunities || [];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
        {stats.map((stat: DashboardStat, index: number) => (
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
                {upcomingEvents.map((event: UpcomingEvent, index: number) => (
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
                {recommendedOpportunities.map((opp: Opportunity, index: number) => (
                  <div key={index} className="teammate-card" style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div className="teammate-avatar blue">
                      {opp.company.substring(0, 2)}
                    </div>
                    <div className="teammate-info">
                      <h4 className="teammate-name">{opp.company}</h4>
                      <p className="teammate-role">{opp.role}</p>
                      <div className="teammate-skills">
                        {opp.skills.map((skill: string, i: number) => (
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
              {recentAchievements.map((achievement: Achievement, index: number) => (
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

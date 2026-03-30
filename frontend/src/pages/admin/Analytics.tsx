// import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { BarChart3, TrendingUp, Users, Briefcase, Award, Target, BookOpen, Calendar } from 'lucide-react';
// Mock data for skills and recent activities (replace with GraphQL data as needed)
const skills = [
  { skill: 'React', growth: '+12%', demand: 80 },
  { skill: 'Node.js', growth: '+8%', demand: 65 },
  { skill: 'Python', growth: '+15%', demand: 90 },
];

const recentActivities = [
  { icon: Users, message: 'New student registered', time: '2 hours ago', type: 'student' },
  { icon: Briefcase, message: 'Internship posted', time: '5 hours ago', type: 'internship' },
  { icon: Award, message: 'Certificate awarded', time: '1 day ago', type: 'certificate' },
];
import '../../styles/pages.css';

const ANALYTICS_QUERY = gql`
  query Analytics {
    students { id department }
    faculties { id department }
    certificates { id }
    internships { id }
    competitions { id }
  }
`;

const AdminAnalytics = () => {
  const { data = {}, loading, error } = useQuery(ANALYTICS_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading analytics.</div>;

  // Example: Calculate stats from data
  const totalStudents = (data as any)?.students?.length || 0;
  const totalFaculty = (data as any)?.faculties?.length || 0;
  const totalCertificates = (data as any)?.certificates?.length || 0;
  const totalInternships = (data as any)?.internships?.length || 0;
  const totalCompetitions = (data as any)?.competitions?.length || 0;


  return (
    <div className="admin-analytics-container">
      <h2>Admin Analytics</h2>
      <div className="analytics-stats">
        <div>Total Students: {totalStudents}</div>
        <div>Total Faculty: {totalFaculty}</div>
        <div>Total Certificates: {totalCertificates}</div>
        <div>Total Internships: {totalInternships}</div>
        <div>Total Competitions: {totalCompetitions}</div>
      </div>

      {/* Skill Demand Section */}
      <div className="analytics-chart-card">
        <div className="chart-header">
          <h3 className="chart-title">
            <BarChart3 size={20} /> Skill Demand
          </h3>
        </div>
        <div className="chart-content">
          <div className="skill-demand-list">
            {skills.map((skill, index) => (
              <div key={index} className="skill-demand-item">
                <div className="skill-demand-info">
                  <span className="skill-name">{skill.skill}</span>
                  <span className="skill-growth positive">{skill.growth}</span>
                </div>
                <div className="skill-demand-bar">
                  <div
                    className="skill-demand-fill"
                    style={{ width: `${skill.demand}%` }}
                  />
                </div>
                <span className="skill-demand-value">{skill.demand}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="analytics-chart-card">
        <div className="chart-header">
          <h3 className="chart-title">
            <Calendar size={20} /> Recent Activity
          </h3>
        </div>
        <div className="chart-content">
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  <activity.icon size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="analytics-chart-card">
        <div className="chart-header">
          <h3 className="chart-title">
            <BookOpen size={20} /> Quick Insights
          </h3>
        </div>
        <div className="chart-content">
          <div className="insights-list">
            <div className="insight-item highlight">
              <div className="insight-icon green">
                <TrendingUp size={18} />
              </div>
              <div className="insight-content">
                <p className="insight-title">Placement rate increased by 5.2%</p>
                <p className="insight-desc">Highest in last 3 years</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon blue">
                <Award size={18} />
              </div>
              <div className="insight-content">
                <p className="insight-title">AWS certifications up by 45%</p>
                <p className="insight-desc">Cloud skills trending</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon orange">
                <Users size={18} />
              </div>
              <div className="insight-content">
                <p className="insight-title">CS department leads placements</p>
                <p className="insight-desc">312 students placed this year</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon purple">
                <Target size={18} />
              </div>
              <div className="insight-content">
                <p className="insight-title">ML skills most in demand</p>
                <p className="insight-desc">28% growth in requirements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminAnalytics;

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  Briefcase,
  Award,
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
  Target,
  BookOpen,
  Building2
} from 'lucide-react';
import '../../styles/pages.css';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface TrendData {
  month: string;
  students: number;
  placements: number;
  certifications: number;
}

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('this-year');
  const [department, setDepartment] = useState('all');

  // Mock analytics data
  const overviewStats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Placement Rate',
      value: '87.3%',
      change: '+5.2%',
      trend: 'up',
      icon: Briefcase,
      color: 'green'
    },
    {
      title: 'Avg. CGPA',
      value: '8.42',
      change: '+0.15',
      trend: 'up',
      icon: GraduationCap,
      color: 'purple'
    },
    {
      title: 'Certifications',
      value: '4,521',
      change: '+23.8%',
      trend: 'up',
      icon: Award,
      color: 'orange'
    }
  ];

  const departmentData: ChartData[] = [
    { label: 'Computer Science', value: 892, color: '#3b82f6' },
    { label: 'Electronics', value: 645, color: '#10b981' },
    { label: 'Mechanical', value: 523, color: '#f59e0b' },
    { label: 'Civil', value: 412, color: '#ef4444' },
    { label: 'Chemical', value: 375, color: '#8b5cf6' }
  ];

  const placementByCompany = [
    { company: 'Google', count: 45, logo: '🔵' },
    { company: 'Microsoft', count: 38, logo: '🟦' },
    { company: 'Amazon', count: 32, logo: '🟠' },
    { company: 'TCS', count: 156, logo: '🔴' },
    { company: 'Infosys', count: 128, logo: '🟣' },
    { company: 'Wipro', count: 98, logo: '🟢' }
  ];

  const trendData: TrendData[] = [
    { month: 'Jan', students: 2650, placements: 180, certifications: 320 },
    { month: 'Feb', students: 2680, placements: 195, certifications: 380 },
    { month: 'Mar', students: 2720, placements: 220, certifications: 450 },
    { month: 'Apr', students: 2750, placements: 245, certifications: 520 },
    { month: 'May', students: 2790, placements: 280, certifications: 610 },
    { month: 'Jun', students: 2847, placements: 312, certifications: 720 }
  ];

  const skillDemand = [
    { skill: 'Python', demand: 92, growth: '+15%' },
    { skill: 'Machine Learning', demand: 88, growth: '+28%' },
    { skill: 'React.js', demand: 85, growth: '+18%' },
    { skill: 'Cloud Computing', demand: 82, growth: '+32%' },
    { skill: 'Data Analysis', demand: 78, growth: '+22%' },
    { skill: 'Java', demand: 75, growth: '+8%' }
  ];

  const recentActivities = [
    { type: 'placement', message: '45 students placed at Google', time: '2 hours ago', icon: Briefcase },
    { type: 'certification', message: '128 new AWS certifications', time: '1 day ago', icon: Award },
    { type: 'registration', message: '56 new student registrations', time: '2 days ago', icon: Users },
    { type: 'event', message: 'Campus drive by Microsoft completed', time: '3 days ago', icon: Building2 }
  ];

  const maxDeptValue = Math.max(...departmentData.map(d => d.value));
  const maxTrendValue = Math.max(...trendData.map(d => Math.max(d.students, d.placements * 10, d.certifications)));

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <BarChart3 size={28} />
            Analytics Dashboard
          </h1>
          <p className="page-subtitle">
            Comprehensive insights and performance metrics for your institution
          </p>
        </div>
        <div className="page-actions">
          <div className="filter-group">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
            </select>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              <option value="cs">Computer Science</option>
              <option value="ec">Electronics</option>
              <option value="me">Mechanical</option>
              <option value="ce">Civil</option>
            </select>
          </div>
          <button className="btn-primary">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        {overviewStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                {stat.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {stat.change} from last period
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="analytics-charts-grid">
        {/* Department Distribution */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <GraduationCap size={20} />
              Students by Department
            </h3>
          </div>
          <div className="chart-content">
            <div className="bar-chart-container">
              {departmentData.map((dept, index) => (
                <div key={index} className="bar-chart-item">
                  <div className="bar-label">{dept.label}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(dept.value / maxDeptValue) * 100}%`,
                        backgroundColor: dept.color
                      }}
                    />
                    <span className="bar-value">{dept.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placement Companies */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <Building2 size={20} />
              Top Recruiting Companies
            </h3>
          </div>
          <div className="chart-content">
            <div className="company-list">
              {placementByCompany.map((company, index) => (
                <div key={index} className="company-item">
                  <div className="company-info">
                    <span className="company-logo">{company.logo}</span>
                    <span className="company-name">{company.company}</span>
                  </div>
                  <div className="company-count">
                    <span className="count-value">{company.count}</span>
                    <span className="count-label">placed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="analytics-chart-card full-width">
        <div className="chart-header">
          <h3 className="chart-title">
            <TrendingUp size={20} />
            Growth Trends (6 Months)
          </h3>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot blue"></span>
              Students
            </span>
            <span className="legend-item">
              <span className="legend-dot green"></span>
              Placements (×10)
            </span>
            <span className="legend-item">
              <span className="legend-dot orange"></span>
              Certifications
            </span>
          </div>
        </div>
        <div className="chart-content">
          <div className="line-chart-container">
            {trendData.map((data, index) => (
              <div key={index} className="line-chart-column">
                <div className="line-chart-bars">
                  <div
                    className="line-bar students"
                    style={{ height: `${(data.students / maxTrendValue) * 100}%` }}
                    title={`Students: ${data.students}`}
                  />
                  <div
                    className="line-bar placements"
                    style={{ height: `${(data.placements * 10 / maxTrendValue) * 100}%` }}
                    title={`Placements: ${data.placements}`}
                  />
                  <div
                    className="line-bar certifications"
                    style={{ height: `${(data.certifications / maxTrendValue) * 100}%` }}
                    title={`Certifications: ${data.certifications}`}
                  />
                </div>
                <span className="line-chart-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="analytics-bottom-grid">
        {/* Skill Demand */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <Target size={20} />
              In-Demand Skills
            </h3>
          </div>
          <div className="chart-content">
            <div className="skill-demand-list">
              {skillDemand.map((skill, index) => (
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
              <Calendar size={20} />
              Recent Activity
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
              <BookOpen size={20} />
              Quick Insights
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
    </div>
  );
};

export default AdminAnalytics;

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Eye
} from 'lucide-react';
import { uiAPI, type FacultyAnalyticsPayload } from '../../services/api';

export const FacultyAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<FacultyAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await uiAPI.getFacultyAnalytics();
        if (active) {
          setAnalytics(payload);
        }
      } catch {
        if (active) {
          setError('Unable to load analytics right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const defaultStats = {
      totalProfiles: 0,
      verifiedUsers: 0,
      activeSearches: 0,
      anomaliesDetected: 0,
      verificationRate: 0,
      profileGrowthPct: 0,
      activeSearchesGrowthPct: 0,
      newProfilesLast30Days: 0,
      projectsTracked: 0,
    };
    const data = analytics?.stats || defaultStats;

    const profileGrowth = `${data.profileGrowthPct >= 0 ? '+' : ''}${data.profileGrowthPct}% vs previous 30 days`;
    const searchGrowth = `${data.activeSearchesGrowthPct >= 0 ? '+' : ''}${data.activeSearchesGrowthPct}% vs previous week`;

    return [
      {
        label: 'Total Profiles',
        value: data.totalProfiles.toLocaleString(),
        change: profileGrowth,
        positive: data.profileGrowthPct >= 0,
        icon: <Users size={24} />,
        iconColor: 'blue',
      },
      {
        label: 'Verified Users',
        value: data.verifiedUsers.toLocaleString(),
        change: `${data.verificationRate}% verified`,
        positive: data.verificationRate >= 50,
        icon: <Shield size={24} />,
        iconColor: 'green',
      },
      {
        label: 'Active Searches',
        value: data.activeSearches.toLocaleString(),
        change: searchGrowth,
        positive: data.activeSearchesGrowthPct >= 0,
        icon: <TrendingUp size={24} />,
        iconColor: 'orange',
      },
      {
        label: 'Anomalies Detected',
        value: data.anomaliesDetected.toLocaleString(),
        change: data.anomaliesDetected ? 'Needs attention' : 'No critical anomalies',
        positive: data.anomaliesDetected === 0,
        icon: <AlertTriangle size={24} />,
        iconColor: 'red',
      },
    ];
  }, [analytics]);

  const trendingSkills = analytics?.trendingSkills || [];
  const studentClusters = analytics?.clusters || [];
  const anomalyAlerts = analytics?.anomalyAlerts || [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>{analytics?.title || 'Analytics Dashboard'}</h1>
          <p>{analytics?.subtitle || 'ML-powered insights and anomaly detection'}</p>
        </div>
      </div>

      {error ? <div className="card" style={{ marginBottom: '16px', color: '#ef4444' }}>{error}</div> : null}

      {/*Stats Grid*/}
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

      {loading ? <div className="card" style={{ marginBottom: '24px' }}>Loading analytics...</div> : null}

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
                    <span className="trending-count">{skill.students} students</span>
                  </div>
                  <div className="trending-change">
                    <span className="trending-percent">
                      {skill.growthPct >= 0 ? '+' : ''}{skill.growthPct}%
                    </span>
                    <span className="trending-period">recent 30d vs previous 30d</span>
                  </div>
                </div>
              ))}
              {!trendingSkills.length ? <p className="page-subtitle">No skill data available yet.</p> : null}
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
              {studentClusters.map((cluster) => (
                <div key={cluster.key} className="cluster-card">
                  <div className="cluster-header">
                    <h4 className="cluster-name">{cluster.name}</h4>
                    <span className="cluster-count">{cluster.members} members</span>
                  </div>
                  <p className="cluster-skills">{cluster.skills.join(', ')}</p>
                  <div className="cluster-activity">
                    <span className="cluster-activity-label">Activity Level</span>
                    <div className="cluster-bar">
                      <div 
                        className="cluster-bar-fill" 
                        style={{ width: `${cluster.activityLevel}%` }}
                      ></div>
                    </div>
                    <span className="cluster-activity-value">{cluster.activityLevel}%</span>
                  </div>
                </div>
              ))}
              {!studentClusters.length ? <p className="page-subtitle">No cluster data available yet.</p> : null}
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
            {!anomalyAlerts.length ? <p className="page-subtitle">No anomaly alerts at the moment.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

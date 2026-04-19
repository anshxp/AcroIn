import { useEffect, useMemo, useState } from 'react';
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
import { certificateAPI, competitionAPI, internshipAPI, studentAPI } from '../../services/api';
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

interface OverviewStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

interface PlacementCompany {
  company: string;
  count: number;
  logo: string;
}

interface SkillDemand {
  skill: string;
  demand: number;
  growth: string;
}

interface ActivityItem {
  type: 'placement' | 'certification' | 'registration' | 'event';
  message: string;
  time: string;
  icon: any;
}

const getPeriodDays = (timeRange: string) => {
  switch (timeRange) {
    case 'this-week':
      return 7;
    case 'this-month':
      return 30;
    case 'this-quarter':
      return 90;
    case 'this-year':
    default:
      return 365;
  }
};

const toDate = (value: any) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const inDateRange = (dateValue: any, from: Date, to: Date) => {
  const parsed = toDate(dateValue);
  if (!parsed) return false;
  return parsed >= from && parsed < to;
};

const pctDelta = (current: number, previous: number) => {
  if (current === 0 && previous === 0) return 0;
  if (previous === 0) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('this-year');
  const [department, setDepartment] = useState('all');

  const [overviewStats, setOverviewStats] = useState<OverviewStat[]>([]);
  const [departmentData, setDepartmentData] = useState<ChartData[]>([]);
  const [placementByCompany, setPlacementByCompany] = useState<PlacementCompany[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [skillDemand, setSkillDemand] = useState<SkillDemand[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [students, internships, certificates, competitions] = await Promise.all([
          studentAPI.getAllStudents(),
          internshipAPI.getAll(),
          certificateAPI.getAll(),
          competitionAPI.getAll(),
        ]);

        const normalizedDepartment = department.toUpperCase();
        const filteredStudents = department === 'all'
          ? students
          : students.filter((student: any) => String(student.department || '').toUpperCase() === normalizedDepartment);
        const filteredStudentIds = new Set(filteredStudents.map((student: any) => String(student._id)));

        const belongsToSelectedDepartment = (item: any) => {
          if (department === 'all') return true;

          const singleStudentId = item?.student ? String(item.student) : null;
          if (singleStudentId && filteredStudentIds.has(singleStudentId)) {
            return true;
          }

          const multipleStudentIds = Array.isArray(item?.students) ? item.students : [];
          return multipleStudentIds.some((studentId: any) => filteredStudentIds.has(String(studentId)));
        };

        const filteredInternships = internships.filter((item: any) => belongsToSelectedDepartment(item));
        const filteredCertificates = certificates.filter((item: any) => belongsToSelectedDepartment(item));
        const filteredCompetitions = competitions.filter((item: any) => belongsToSelectedDepartment(item));

        const periodDays = getPeriodDays(timeRange);
        const now = new Date();
        const currentStart = new Date(now);
        currentStart.setDate(now.getDate() - periodDays);
        const previousStart = new Date(currentStart);
        previousStart.setDate(currentStart.getDate() - periodDays);

        const currentStudentsAdded = filteredStudents.filter((student: any) => inDateRange(student.createdAt, currentStart, now)).length;
        const previousStudentsAdded = filteredStudents.filter((student: any) => inDateRange(student.createdAt, previousStart, currentStart)).length;

        const currentInternships = filteredInternships.filter((item: any) => inDateRange(item.createdAt || item.startDate, currentStart, now));
        const previousInternships = filteredInternships.filter((item: any) => inDateRange(item.createdAt || item.startDate, previousStart, currentStart));

        const currentCertificates = filteredCertificates.filter((item: any) => inDateRange(item.createdAt || item.issue_date, currentStart, now));
        const previousCertificates = filteredCertificates.filter((item: any) => inDateRange(item.createdAt || item.issue_date, previousStart, currentStart));

        const currentCompetitions = filteredCompetitions.filter((item: any) => inDateRange(item.createdAt || item.date, currentStart, now));
        const previousCompetitions = filteredCompetitions.filter((item: any) => inDateRange(item.createdAt || item.date, previousStart, currentStart));

        const placementRate = filteredStudents.length
          ? ((filteredInternships.length / filteredStudents.length) * 100).toFixed(1)
          : '0.0';

        const studentsChange = pctDelta(currentStudentsAdded, previousStudentsAdded);
        const placementsChange = pctDelta(currentInternships.length, previousInternships.length);
        const competitionsChange = pctDelta(currentCompetitions.length, previousCompetitions.length);
        const certificatesChange = pctDelta(currentCertificates.length, previousCertificates.length);

        setOverviewStats([
          {
            title: 'Total Students',
            value: filteredStudents.length.toLocaleString(),
            change: `${studentsChange >= 0 ? '+' : ''}${studentsChange}%`,
            trend: studentsChange >= 0 ? 'up' : 'down',
            icon: Users,
            color: 'blue',
          },
          {
            title: 'Placement Rate',
            value: `${placementRate}%`,
            change: `${placementsChange >= 0 ? '+' : ''}${placementsChange}%`,
            trend: placementsChange >= 0 ? 'up' : 'down',
            icon: Briefcase,
            color: 'green',
          },
          {
            title: 'Competitions',
            value: filteredCompetitions.length.toLocaleString(),
            change: `${competitionsChange >= 0 ? '+' : ''}${competitionsChange}%`,
            trend: competitionsChange >= 0 ? 'up' : 'down',
            icon: GraduationCap,
            color: 'purple',
          },
          {
            title: 'Certifications',
            value: filteredCertificates.length.toLocaleString(),
            change: `${certificatesChange >= 0 ? '+' : ''}${certificatesChange}%`,
            trend: certificatesChange >= 0 ? 'up' : 'down',
            icon: Award,
            color: 'orange',
          },
        ]);

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
        const studentsByDept = filteredStudents.reduce<Record<string, number>>((acc, student: any) => {
          const dept = student.department || 'Unknown';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        const normalizedDeptData = Object.entries(studentsByDept)
          .map(([label, value], index) => ({
            label,
            value,
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        setDepartmentData(normalizedDeptData);

        const companyFrequency = filteredInternships.reduce<Record<string, number>>((acc, internship: any) => {
          const company = internship.company || 'Unknown';
          acc[company] = (acc[company] || 0) + 1;
          return acc;
        }, {});
        setPlacementByCompany(
          Object.entries(companyFrequency)
            .map(([company, count]) => ({
              company,
              count,
              logo: String(company).trim().slice(0, 2).toUpperCase() || 'NA',
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
        );

        const months = Array.from({ length: 6 }, (_, offset) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - offset));
          return date;
        });

        const byMonthCount = (items: any[], dateFields: string[]) =>
          months.map((monthDate) => {
            const month = monthDate.getMonth();
            const year = monthDate.getFullYear();
            return items.filter((item) => {
              const rawDate = dateFields.map((field) => item[field]).find(Boolean);
              if (!rawDate) return false;
              const date = new Date(rawDate);
              return date.getMonth() === month && date.getFullYear() === year;
            }).length;
          });

        const monthlyStudents = byMonthCount(filteredStudents as any[], ['createdAt']);
        const monthlyPlacements = byMonthCount(filteredInternships as any[], ['createdAt', 'startDate']);
        const monthlyCerts = byMonthCount(filteredCertificates as any[], ['createdAt', 'issue_date']);

        setTrendData(
          months.map((month, index) => ({
            month: month.toLocaleString('en-US', { month: 'short' }),
            students: monthlyStudents[index],
            placements: monthlyPlacements[index],
            certifications: monthlyCerts[index],
          }))
        );

        const skillCounts = filteredStudents.reduce<Record<string, number>>((acc, student: any) => {
          const skills = Array.isArray(student.tech_stack) ? student.tech_stack : [];
          skills.forEach((skill: string) => {
            const normalized = String(skill).trim();
            if (!normalized) return;
            acc[normalized] = (acc[normalized] || 0) + 1;
          });
          return acc;
        }, {});

        const recentSkillCounts = filteredStudents
          .filter((student: any) => inDateRange(student.createdAt, currentStart, now))
          .reduce<Record<string, number>>((acc, student: any) => {
            const skills = Array.isArray(student.tech_stack) ? student.tech_stack : [];
            skills.forEach((skill: string) => {
              const normalized = String(skill).trim();
              if (!normalized) return;
              acc[normalized] = (acc[normalized] || 0) + 1;
            });
            return acc;
          }, {});

        const previousSkillCounts = filteredStudents
          .filter((student: any) => inDateRange(student.createdAt, previousStart, currentStart))
          .reduce<Record<string, number>>((acc, student: any) => {
            const skills = Array.isArray(student.tech_stack) ? student.tech_stack : [];
            skills.forEach((skill: string) => {
              const normalized = String(skill).trim();
              if (!normalized) return;
              acc[normalized] = (acc[normalized] || 0) + 1;
            });
            return acc;
          }, {});

        const maxSkillCount = Math.max(1, ...Object.values(skillCounts));
        setSkillDemand(
          Object.entries(skillCounts)
            .map(([skill, count]) => ({
              skill,
              demand: Math.round((count / maxSkillCount) * 100),
              growth: `${pctDelta(recentSkillCounts[skill] || 0, previousSkillCounts[skill] || 0) >= 0 ? '+' : ''}${pctDelta(recentSkillCounts[skill] || 0, previousSkillCounts[skill] || 0)}%`,
            }))
            .sort((a, b) => b.demand - a.demand)
            .slice(0, 6)
        );

        const activities: ActivityItem[] = [
          ...filteredInternships.slice(0, 2).map((internship: any) => ({
            type: 'placement' as const,
            message: `${internship.company || 'Company'} internship recorded`,
            time: internship.createdAt || internship.startDate || new Date().toISOString(),
            icon: Briefcase,
          })),
          ...filteredCertificates.slice(0, 1).map((certificate: any) => ({
            type: 'certification' as const,
            message: `${certificate.title || 'Certificate'} issued`,
            time: certificate.createdAt || certificate.issue_date || new Date().toISOString(),
            icon: Award,
          })),
          ...filteredStudents.slice(0, 1).map((student: any) => ({
            type: 'registration' as const,
            message: `${student.name || 'Student'} registered`,
            time: student.createdAt || new Date().toISOString(),
            icon: Users,
          })),
        ]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 4);

        setRecentActivities(activities);
      } catch {
        setOverviewStats([]);
        setDepartmentData([]);
        setPlacementByCompany([]);
        setTrendData([]);
        setSkillDemand([]);
        setRecentActivities([]);
      }
    };

    loadAnalytics();
  }, [timeRange, department]);

  const maxDeptValue = useMemo(() => Math.max(1, ...departmentData.map((d) => d.value || 0)), [departmentData]);
  const maxTrendValue = useMemo(
    () => Math.max(1, ...trendData.map((d) => Math.max(d.students, d.placements * 10, d.certifications))),
    [trendData]
  );

  const topDepartment = departmentData[0];
  const topSkill = skillDemand[0];
  const topCompany = placementByCompany[0];
  const placementRate = overviewStats.find((item) => item.title === 'Placement Rate')?.value || '0%';

  const escapeCsv = (value: unknown) => {
    const normalized = String(value ?? '').replace(/\r?\n|\r/g, ' ').trim();
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAnalytics = () => {
    const rows: string[][] = [
      ['Section', 'Metric', 'Value', 'Change/Notes'],
    ];

    overviewStats.forEach((stat) => {
      rows.push(['Overview', stat.title, stat.value, `${stat.change} from last period`]);
    });

    departmentData.forEach((item) => {
      rows.push(['Department Distribution', item.label, String(item.value), 'Students']);
    });

    placementByCompany.forEach((item) => {
      rows.push(['Top Companies', item.company, String(item.count), 'Internships']);
    });

    trendData.forEach((item) => {
      rows.push(['Trend', `${item.month} Students`, String(item.students), '']);
      rows.push(['Trend', `${item.month} Placements`, String(item.placements), '']);
      rows.push(['Trend', `${item.month} Certifications`, String(item.certifications), '']);
    });

    skillDemand.forEach((item) => {
      rows.push(['Skill Demand', item.skill, `${item.demand}%`, item.growth]);
    });

    recentActivities.forEach((item) => {
      rows.push(['Recent Activity', item.message, item.time, item.type]);
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    const safeDepartment = department === 'all' ? 'all' : department.toLowerCase();
    downloadCsv(`analytics-${safeDepartment}-${timeRange}-${dateStamp}.csv`, rows);
  };

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
              <option value="CSE">Computer Science</option>
              <option value="AIML">AI & ML</option>
              <option value="DS">Data Science</option>
              <option value="CSIT">CSIT</option>
              <option value="CYBER">Cyber Security</option>
              <option value="ECE">Electronics</option>
              <option value="EEE">Electrical</option>
              <option value="VLSI">VLSI</option>
              <option value="ME">Mechanical</option>
              <option value="CE">Civil</option>
              <option value="IT">Information Technology</option>
              <option value="IL">IL</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleExportAnalytics}>
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
        {!overviewStats.length && <p className="page-subtitle">No analytics available from backend.</p>}
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
              {!departmentData.length && <p className="page-subtitle">No department data available.</p>}
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
              {!placementByCompany.length && <p className="page-subtitle">No company data available.</p>}
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
            {!trendData.length && <p className="page-subtitle">No trend data available.</p>}
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
              {!skillDemand.length && <p className="page-subtitle">No skill demand data available.</p>}
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
                    <span className="activity-time">{new Date(activity.time).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!recentActivities.length && <p className="page-subtitle">No recent activity available.</p>}
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
                  <p className="insight-title">Current placement rate is {placementRate}</p>
                  <p className="insight-desc">Derived from internships and student records</p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon blue">
                  <Award size={18} />
                </div>
                <div className="insight-content">
                  <p className="insight-title">Top skill: {topSkill?.skill || 'N/A'}</p>
                  <p className="insight-desc">Based on current student tech stacks</p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon orange">
                  <Users size={18} />
                </div>
                <div className="insight-content">
                  <p className="insight-title">Largest department: {topDepartment?.label || 'N/A'}</p>
                  <p className="insight-desc">With {topDepartment?.value || 0} students</p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon purple">
                  <Target size={18} />
                </div>
                <div className="insight-content">
                  <p className="insight-title">Top recruiting company: {topCompany?.company || 'N/A'}</p>
                  <p className="insight-desc">{topCompany ? `${topCompany.count} listed opportunities` : 'No opportunities available'}</p>
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

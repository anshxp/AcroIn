import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Award,
  Briefcase,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Loader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { certificateAPI, competitionAPI, facultyAPI, internshipAPI, studentAPI } from '../../services/api';

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCertificates: number;
  totalInternships: number;
  totalCompetitions: number;
}

interface DepartmentStat {
  name: string;
  students: number;
  faculty: number;
}

interface AdminActivity {
  action: string;
  user: string;
  department: string;
  time: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalCertificates: 0,
    totalInternships: 0,
    totalCompetitions: 0,
  });
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [students, faculty, certificates, internships, competitions] = await Promise.all([
          studentAPI.getAllStudents(),
          facultyAPI.getAllFaculty(),
          certificateAPI.getAll(),
          internshipAPI.getAll(),
          competitionAPI.getAll(),
        ]);

        setStats({
          totalStudents: students.length,
          totalFaculty: faculty.length,
          totalCertificates: certificates.length,
          totalInternships: internships.length,
          totalCompetitions: competitions.length,
        });

        const studentByDepartment = students.reduce<Record<string, number>>((acc, student: any) => {
          const dept = student.department || 'Unknown';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        const facultyByDepartment = faculty.reduce<Record<string, number>>((acc, member: any) => {
          const dept = member.department || 'Unknown';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        const allDepartments = Array.from(new Set([...Object.keys(studentByDepartment), ...Object.keys(facultyByDepartment)]));
        const normalizedDepartments = allDepartments
          .map((dept) => ({
            name: dept,
            students: studentByDepartment[dept] || 0,
            faculty: facultyByDepartment[dept] || 0,
          }))
          .sort((a, b) => b.students - a.students)
          .slice(0, 5);

        setDepartmentStats(normalizedDepartments);

        const activities: AdminActivity[] = [
          ...students.slice(0, 2).map((student: any) => ({
            action: 'New student registered',
            user: student.name || 'Unknown Student',
            department: student.department || 'Unknown',
            time: student.createdAt || new Date().toISOString(),
          })),
          ...faculty.slice(0, 2).map((member: any) => ({
            action: 'Faculty profile updated',
            user: `${member.firstname || ''} ${member.lastName || ''}`.trim() || 'Unknown Faculty',
            department: member.department || 'Unknown',
            time: member.updatedAt || member.createdAt || new Date().toISOString(),
          })),
        ]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 4);

        setRecentActivity(activities);
      } catch {
        setStats({
          totalStudents: 0,
          totalFaculty: 0,
          totalCertificates: 0,
          totalInternships: 0,
          totalCompetitions: 0,
        });
        setDepartmentStats([]);
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/admin/students',
    },
    {
      title: 'Total Faculty',
      value: stats.totalFaculty,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/admin/faculty',
    },
    {
      title: 'Certificates',
      value: stats.totalCertificates,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Internships',
      value: stats.totalInternships,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Competitions',
      value: stats.totalCompetitions,
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Dashboard 👋</h1>
        <p className="mt-2 text-purple-100">
          Welcome back, {user?.name}. Here's an overview of the system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const content = (
            <Card hover className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${stat.lightColor} ${stat.textColor} p-3 rounded-xl`}>
                  {stat.icon}
                </div>
              </div>
              {stat.link && (
                <div className="mt-3 flex items-center text-sm text-indigo-600">
                  <span>Manage</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </div>
              )}
            </Card>
          );

          return stat.link ? (
            <Link key={stat.title} to={stat.link}>
              {content}
            </Link>
          ) : (
            <div key={stat.title}>{content}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department_Statistics */}
        <Card>
          <CardHeader
            title="Department Statistics"
            subtitle="Overview by department"
          />
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                    <span className="text-sm text-gray-500">{dept.students} students, {dept.faculty} faculty</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${departmentStats.length ? (dept.students / Math.max(...departmentStats.map((d) => d.students || 1))) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {!departmentStats.length && <p className="text-sm text-gray-500">No department data available.</p>}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" subtitle="Administrative tasks" />
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/students"
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
            >
              <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Students</span>
            </Link>
            <Link
              to="/admin/faculty"
              className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center"
            >
              <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Faculty</span>
            </Link>
            <Link
              to="/admin/settings"
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
            >
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">System Settings</span>
            </Link>
            <div className="p-4 bg-orange-50 rounded-xl text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader title="Recent System Activity" subtitle="Latest actions across the platform" />
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.user} • {activity.department}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{new Date(activity.time).toLocaleString()}</span>
            </div>
          ))}
          {!recentActivity.length && <p className="text-sm text-gray-500">No recent activity available.</p>}
        </div>
      </Card>
    </div>
  );
};

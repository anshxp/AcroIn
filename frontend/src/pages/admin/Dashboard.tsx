
import React from 'react';
import { Users, UserCheck, GraduationCap, TrendingUp, Award, Briefcase, Trophy, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Loader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const ADMIN_DASHBOARD_STATS = gql`
  query AdminDashboardStats {
    students { id department }
    faculties { id department }
    certificates { id }
    internships { id }
    competitions { id }
  }
`;

interface Student {
  id: string;
  department: string;
}

interface Faculty {
  id: string;
  department: string;
}

interface AdminDashboardData {
  students: Student[];
  faculties: Faculty[];
  certificates: { id: string }[];
  internships: { id: string }[];
  competitions: { id: string }[];
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery<AdminDashboardData>(ADMIN_DASHBOARD_STATS);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500">Error loading dashboard data.</div>;
  }

  const totalStudents = data?.students?.length || 0;
  const totalFaculty = data?.faculties?.length || 0;
  const totalCertificates = data?.certificates?.length || 0;
  const totalInternships = data?.internships?.length || 0;
  const totalCompetitions = data?.competitions?.length || 0;

  const departmentsList = ['CSE', 'ECE', 'ME', 'CE', 'IT'];
  const departmentStats = departmentsList.map(dept => ({
    name: dept,
    students: (data?.students || []).filter((s: Student) => s.department === dept).length,
    faculty: (data?.faculties || []).filter((f: Faculty) => f.department === dept).length
  }));

  const statCards = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/admin/students',
    },
    {
      title: 'Total Faculty',
      value: totalFaculty,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/admin/faculty',
    },
    {
      title: 'Certificates',
      value: totalCertificates,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Internships',
      value: totalInternships,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Competitions',
      value: totalCompetitions,
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];

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
        {/* Department Statistics */}
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
                    <span className="text-sm text-gray-500">
                      {dept.students} students, {dept.faculty} faculty
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(dept.students / 400) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
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
          {[
            { action: 'New student registered', user: 'John Doe', department: 'CSE', time: '2 hours ago' },
            { action: 'Faculty profile updated', user: 'Dr. Sarah Johnson', department: 'CSE', time: '5 hours ago' },
            { action: 'Certificate verified', user: 'Jane Smith', department: 'ECE', time: '1 day ago' },
            { action: 'New faculty added', user: 'Prof. Mike Brown', department: 'ME', time: '2 days ago' },
          ].map((activity, index) => (
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
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

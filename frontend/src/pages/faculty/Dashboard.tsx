import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Badge, Loader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  totalStudents: number;
  pendingVerifications: number;
  verifiedToday: number;
  activeOpportunities: number;
}

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pendingVerifications: 0,
    verifiedToday: 0,
    activeOpportunities: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with API calls
    setTimeout(() => {
      setStats({
        totalStudents: 156,
        pendingVerifications: 12,
        verifiedToday: 5,
        activeOpportunities: 3,
      });
      setIsLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/faculty/verify',
    },
    {
      title: 'Verified Today',
      value: stats.verifiedToday,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Active Opportunities',
      value: stats.activeOpportunities,
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/faculty/opportunities',
    },
  ];

  const pendingRequests = [
    { id: '1', student: 'John Doe', type: 'Certificate', title: 'AWS Cloud Practitioner', date: '2024-01-15' },
    { id: '2', student: 'Jane Smith', type: 'Internship', title: 'Google Summer Internship', date: '2024-01-14' },
    { id: '3', student: 'Mike Johnson', type: 'Competition', title: 'Smart India Hackathon', date: '2024-01-13' },
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
        <p className="mt-2 text-green-100">
          Here's your faculty dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const content = (
            <Card hover className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.lightColor} ${stat.textColor} p-3 rounded-xl`}>
                  {stat.icon}
                </div>
              </div>
              {stat.link && (
                <div className="mt-4 flex items-center text-sm text-indigo-600">
                  <span>View all</span>
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
        {/* Pending Verifications */}
        <Card>
          <CardHeader
            title="Pending Verifications"
            subtitle="Students awaiting your approval"
            action={
              <Link
                to="/faculty/verify"
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            }
          />
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{request.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">{request.student}</span>
                    <span className="text-gray-300">•</span>
                    <Badge variant="warning" size="sm">{request.type}</Badge>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(request.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" subtitle="Common tasks" />
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/faculty/verify"
              className="p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-center"
            >
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Verify Requests</span>
            </Link>
            <Link
              to="/faculty/opportunities"
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
            >
              <Bell className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Post Opportunity</span>
            </Link>
            <Link
              to="/faculty/profile"
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
            >
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Profile</span>
            </Link>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Analytics</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader title="Recent Activity" subtitle="Your recent actions" />
        <div className="space-y-4">
          {[
            { action: 'Verified certificate', student: 'John Doe', item: 'AWS Certificate', time: '2 hours ago' },
            { action: 'Posted opportunity', student: '', item: 'Google Internship 2024', time: '5 hours ago' },
            { action: 'Rejected internship', student: 'Jane Smith', item: 'Invalid documentation', time: '1 day ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.action.includes('Verified') ? 'bg-green-100' :
                activity.action.includes('Posted') ? 'bg-blue-100' : 'bg-red-100'
              }`}>
                {activity.action.includes('Verified') ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : activity.action.includes('Posted') ? (
                  <Bell className="w-5 h-5 text-blue-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.action}</span>
                  {activity.student && ` for ${activity.student}`}
                </p>
                <p className="text-xs text-gray-500">{activity.item}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Trophy,
  Award,
  FolderGit2,
  TrendingUp,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Badge, Loader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { certificateAPI, competitionAPI, internshipAPI, projectAPI, studentAPI } from '../../services/api';

interface DashboardStats {
  projects: number;
  internships: number;
  competitions: number;
  certificates: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'internship' | 'competition' | 'certificate';
  title: string;
  date: string;
}

const isDemoStudentAccount = (userId?: string, email?: string) => {
  return Boolean(userId?.startsWith('demo-') || email?.startsWith('demo.'));
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    internships: 0,
    competitions: 0,
    certificates: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const studentIdentifier = user?.email || user?.id;

        if (isDemoStudentAccount(user?.id, user?.email)) {
          setStats({
            projects: 0,
            internships: 0,
            competitions: 0,
            certificates: 0,
          });
          setRecentActivities([]);
          setSkillTags(['React', 'TypeScript', 'Node.js', 'Python']);
          return;
        }

        const profileRequest = isDemoStudentAccount(user?.id, user?.email)
          ? Promise.resolve(null)
          : studentIdentifier
            ? studentAPI.getProfile(studentIdentifier).catch(() => null)
            : Promise.resolve(null);

        const [projects, internships, competitions, certificates, profile] = await Promise.all([
          studentIdentifier ? projectAPI.getByStudent(studentIdentifier) : Promise.resolve([]),
          studentIdentifier ? internshipAPI.getByStudent(studentIdentifier) : Promise.resolve([]),
          studentIdentifier ? competitionAPI.getByStudent(studentIdentifier) : Promise.resolve([]),
          studentIdentifier ? certificateAPI.getByStudent(studentIdentifier) : Promise.resolve([]),
          profileRequest,
        ]);

        setStats({
          projects: projects.length,
          internships: internships.length,
          competitions: competitions.length,
          certificates: certificates.length,
        });

        const combinedActivities: RecentActivity[] = [
          ...projects.slice(0, 3).map((project: any) => ({
            id: project._id,
            type: 'project' as const,
            title: project.title || 'Project',
            date: project.updatedAt || project.createdAt || new Date().toISOString(),
          })),
          ...internships.slice(0, 3).map((internship: any) => ({
            id: internship._id,
            type: 'internship' as const,
            title: `${internship.company || 'Company'} Internship`,
            date: internship.updatedAt || internship.createdAt || new Date().toISOString(),
          })),
          ...competitions.slice(0, 3).map((competition: any) => ({
            id: competition._id,
            type: 'competition' as const,
            title: competition.name || 'Competition',
            date: competition.updatedAt || competition.createdAt || competition.date || new Date().toISOString(),
          })),
          ...certificates.slice(0, 3).map((certificate: any) => ({
            id: certificate._id,
            type: 'certificate' as const,
            title: certificate.title || 'Certificate',
            date: certificate.updatedAt || certificate.createdAt || certificate.issue_date || new Date().toISOString(),
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 6);

        setRecentActivities(combinedActivities);
        setSkillTags(Array.isArray((profile as any)?.tech_stack) ? (profile as any).tech_stack.slice(0, 8) : []);
      } catch {
        setStats({ projects: 0, internships: 0, competitions: 0, certificates: 0 });
        setRecentActivities([]);
        setSkillTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [user?.email, user?.id]);

  const statCards = [
    {
      title: 'Projects',
      value: stats.projects,
      icon: <FolderGit2 className="w-6 h-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/student/projects',
    },
    {
      title: 'Internships',
      value: stats.internships,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/student/internships',
    },
    {
      title: 'Competitions',
      value: stats.competitions,
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/student/competitions',
    },
    {
      title: 'Certificates',
      value: stats.certificates,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/student/certificates',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderGit2 className="w-4 h-4" />;
      case 'internship':
        return <Briefcase className="w-4 h-4" />;
      case 'competition':
        return <Trophy className="w-4 h-4" />;
      case 'certificate':
        return <Award className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'project':
        return 'info';
      case 'internship':
        return 'success';
      case 'competition':
        return 'warning';
      case 'certificate':
        return 'default';
      default:
        return 'default';
    }
  };

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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="mt-2 text-indigo-100">
          Here's an overview of your academic journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
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
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                <span>+2 this month</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Activity"
              subtitle="Your latest additions"
              action={
                <Link
                  to="/student/profile"
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  View all <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              }
            />
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant={getActivityBadgeVariant(activity.type) as any}
                          size="sm"
                        >
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!recentActivities.length && <p className="text-sm text-gray-500">No recent activity available.</p>}
            </div>
          </Card>
        </div>

        {/* Skills Overview */}
        <div>
          <Card>
            <CardHeader title="Tech Stack" subtitle="Your skills" />
            <div className="flex flex-wrap gap-2">
              {skillTags.map((skill) => (
                <Badge key={skill} variant="info">
                  {skill}
                </Badge>
              ))}
              {!skillTags.length && <span className="text-sm text-gray-500">No skills added yet.</span>}
            </div>
            <div className="mt-6">
              <Link
                to="/student/profile"
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                Update skills <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader title="Quick Actions" />
            <div className="space-y-2">
              <Link
                to="/student/projects"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Add Project</span>
                <FolderGit2 className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/student/certificates"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Add Certificate</span>
                <Award className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/student/internships"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Add Internship</span>
                <Briefcase className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

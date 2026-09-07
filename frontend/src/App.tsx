import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout';
import { ProtectedRoute } from './components/auth';
import { ScrollToTop } from './components/common';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  AdminBootstrapPage,
  StudentProfile,
  StudentPublicProfile,
  StudentProjects,
  StudentInternships,
  StudentCompetitions,
  StudentCertificates,
  StudentSkills,
  FacultyProfile,
  VerifyStudents,
  PostOpportunities,
  SmartSearch,
  FacialRecognition,
  Recommendations,
  PlacementHub,
  FacultyAnalytics,
  StudentProfileView,
  ManageStudents,
  ManageFaculty,
  AdminSettings,
  AdminAnalytics,
  DepartmentAuditLogs,
  HomeFeed,
  Notifications,
  ChatList,
  ChatWindow,
} from './pages';
import './App.css';

const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/__internal__/admin-bootstrap-setup-9x7" element={<AdminBootstrapPage />} />
          <Route path="/internal/admin-bootstrap-setup-9x7" element={<AdminBootstrapPage />} />

          <Route
            element={
              <ProtectedRoute allowedUserTypes={['student', 'faculty', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomeFeed />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedUserTypes={['student', 'faculty', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/chat" element={<ChatList />} />
            <Route path="/chat/:chatId" element={<ChatWindow />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/search" element={<SmartSearch />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/profile/:id" element={<StudentPublicProfile />} />
            <Route path="/student/skills" element={<StudentSkills />} />
            <Route path="/student/projects" element={<StudentProjects />} />
            <Route path="/student/internships" element={<StudentInternships />} />
            <Route path="/student/competitions" element={<StudentCompetitions />} />
            <Route path="/student/certificates" element={<StudentCertificates />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedUserTypes={['faculty']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/verification" element={<FacialRecognition />} />
            <Route path="/faculty/recommendations" element={<Recommendations />} />
            <Route path="/faculty/placement" element={<PlacementHub />} />
            <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
            <Route path="/faculty/verify" element={<VerifyStudents />} />
            <Route path="/faculty/opportunities" element={<PostOpportunities />} />
            <Route path="/faculty/student/:id" element={<StudentProfileView />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedUserTypes={['admin', 'faculty']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/faculty" element={<ManageFaculty />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/department/audit-logs" element={<DepartmentAuditLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

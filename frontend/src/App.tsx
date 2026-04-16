import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout';
import { ProtectedRoute } from './components/auth';
import { ScrollToTop } from './components/common';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  StudentDashboard,
  StudentProfile,
  StudentProjects,
  StudentInternships,
  StudentCompetitions,
  StudentCertificates,
  StudentSkills,
  FacultyDashboard,
  FacultyProfile,
  VerifyStudents,
  PostOpportunities,
  SmartSearch,
  FacialRecognition,
  Recommendations,
  PlacementHub,
  FacultyAnalytics,
  AdminDashboard,
  ManageStudents,
  ManageFaculty,
  AdminSettings,
  AdminAnalytics,
  HomeFeed,
} from './pages';
import './App.css';

// Home redirect component
const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LandingPage />;
  }
  
  // All logged in users go to Home Feed
  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Shared Home Feed - accessible by all authenticated users */}
          <Route
            element={
              <ProtectedRoute allowedUserTypes={['student', 'faculty', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomeFeed />} />
          </Route>

          {/* Student Routes */}
          <Route
            element={
              <ProtectedRoute allowedUserTypes={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/skills" element={<StudentSkills />} />
            <Route path="/student/projects" element={<StudentProjects />} />
            <Route path="/student/internships" element={<StudentInternships />} />
            <Route path="/student/competitions" element={<StudentCompetitions />} />
            <Route path="/student/certificates" element={<StudentCertificates />} />
          </Route>

          {/* Faculty Routes */}
          <Route
            element={
              <ProtectedRoute allowedUserTypes={['faculty']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/search" element={<SmartSearch />} />
            <Route path="/faculty/verification" element={<FacialRecognition />} />
            <Route path="/faculty/recommendations" element={<Recommendations />} />
            <Route path="/faculty/placement" element={<PlacementHub />} />
            <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
            <Route path="/faculty/verify" element={<VerifyStudents />} />
            <Route path="/faculty/opportunities" element={<PostOpportunities />} />
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedUserTypes={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/faculty" element={<ManageFaculty />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

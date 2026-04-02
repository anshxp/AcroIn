import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout';
import { ProtectedRoute } from './components/auth';
import { ScrollToTop } from './components/common';
import React from 'react';
import {
  AdminDashboard,
  ManageStudents,
  ManageFaculty,
  AdminSettings,
  AdminAnalytics,
} from './pages/admin';
import {
  LoginPage,
  RegisterPage,
} from './pages/auth';
import {
  FacultyDashboard,
  FacultyProfile,
  VerifyStudents,
  PostOpportunities,
  SmartSearch,
  Recommendations,
  PlacementHub,
  FacultyAnalytics
} from './pages/faculty';
import {
  HomeFeed
} from './pages/shared';
import {
	StudentDashboard,
	StudentProfile,
	StudentProjects,
	StudentInternships,
	StudentCompetitions,
	StudentCertificates,
	StudentSkills,
} from './pages/student';
import {
  LandingPage
} from './pages';
import './App.css';

const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <LandingPage />;
  }
  return <Navigate to="/home" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Shared */}
            <Route path="home" element={<HomeFeed />} />

            {/* STUDENT ROUTES */}
            <Route
              path="student"
              element={
                <ProtectedRoute allowedUserTypes={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="student/profile" element={<StudentProfile />} />
            <Route path="student/projects" element={<StudentProjects />} />
            <Route path="student/internships" element={<StudentInternships />} />
            <Route path="student/competitions" element={<StudentCompetitions />} />
            <Route path="student/certificates" element={<StudentCertificates />} />
            <Route path="student/skills" element={<StudentSkills />} />

            {/* FACULTY ROUTES */}
            <Route
              path="faculty"
              element={
                <ProtectedRoute allowedUserTypes={["faculty"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="faculty/profile" element={<FacultyProfile />} />
            <Route path="faculty/verify" element={<VerifyStudents />} />
            <Route path="faculty/post" element={<PostOpportunities />} />
            <Route path="faculty/search" element={<SmartSearch />} />
            <Route path="faculty/recommendations" element={<Recommendations />} />
            <Route path="faculty/placements" element={<PlacementHub />} />
            <Route path="faculty/analytics" element={<FacultyAnalytics />} />

            {/* ADMIN ROUTES */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedUserTypes={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="admin/students" element={<ManageStudents />} />
            <Route path="admin/faculty" element={<ManageFaculty />} />
            <Route path="admin/settings" element={<AdminSettings />} />
            <Route path="admin/analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

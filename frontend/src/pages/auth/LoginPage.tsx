import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Sparkles, Users, Shield, Brain, ArrowRight, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();

  // Demo credentials for testing
  const DEMO_CREDENTIALS = {
    student: { email: 'demo.student@acroin.edu', password: 'demo123' },
    faculty: { email: 'demo.faculty@acroin.edu', password: 'demo123' },
    admin: { email: 'demo.admin@acroin.edu', password: 'demo123' }
  };

  // Note: keep 'admin' in UI, but we'll handle it explicitly in handleSubmit
  const [userType, setUserType] = useState<'student' | 'faculty' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle demo login (bypasses API)
  const handleDemoLogin = (type: 'student' | 'faculty' | 'admin') => {
    const demoUser = {
      id: `demo-${type}-001`,
      email: DEMO_CREDENTIALS[type].email,
      name: type === 'student' ? 'Demo Student' : type === 'faculty' ? 'Dr. Demo Faculty' : 'Admin User',
      userType: type,
      firstname: type !== 'student' ? 'Demo' : undefined,
      lastName: type !== 'student' ? (type === 'faculty' ? 'Faculty' : 'Admin') : undefined,
      department: type === 'student' ? 'Computer Science' : 'Administration',
      designation: type === 'faculty' ? 'Associate Professor' : type === 'admin' ? 'System Administrator' : undefined,
    };

    localStorage.setItem('token', 'demo-token-' + type);
    localStorage.setItem('user', JSON.stringify(demoUser));
    setUser(demoUser);

    // All users go to home feed
    navigate('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check for demo credentials
      const demoType = Object.entries(DEMO_CREDENTIALS).find(
        ([_, creds]) => creds.email === email && creds.password === password
      );

      if (demoType) {
        handleDemoLogin(demoType[0] as 'student' | 'faculty' | 'admin');
        return;
      }

      // If admin is selected, block or handle separately (no admin login available in current auth context)
      if (userType === 'admin') {
        // Option 1: show user-friendly message
        setError('Admin login is not available on this page. Use the admin portal or contact your site administrator.');
        return;
        // Option 2 (if you actually have an admin login endpoint implemented):
        // await adminLogin({ email, password });
      }

      // At this point userType is narrowed to 'student' | 'faculty' — TypeScript is happy
      await login({ email, password }, userType);

      // All users go to home feed
      navigate('/home');
    } catch (err: any) {
      // Use a defensive extraction for error messages
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <GraduationCap size={28} />
            </div>
            <div className="auth-logo-text">
              <span className="auth-logo-title">Acro-In</span>
              <span className="auth-logo-subtitle">Acropolis Institute</span>
            </div>
          </Link>

          <div className="auth-branding-main">
            <div className="auth-badge">
              <Sparkles size={14} />
              <span>AI-Powered Platform</span>
            </div>

            <h1 className="auth-branding-title">
              Welcome to the<br />
              <span className="auth-gradient-text">Smart Academic Network</span>
            </h1>

            <p className="auth-branding-desc">
              Connect with peers, showcase your achievements, and unlock career opportunities 
              with AI-powered insights.
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon blue">
                  <Users size={20} />
                </div>
                <div className="auth-feature-text">
                  <h4>5,000+ Active Users</h4>
                  <p>Join our growing community</p>
                </div>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon green">
                  <Shield size={20} />
                </div>
                <div className="auth-feature-text">
                  <h4>Verified Profiles</h4>
                  <p>AI-powered identity verification</p>
                </div>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon purple">
                  <Brain size={20} />
                </div>
                <div className="auth-feature-text">
                  <h4>Smart Matching</h4>
                  <p>AI-driven recommendations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-branding-footer">
            <p>© 2024 Acro-In. Acropolis Institute of Technology & Research</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your dashboard</p>
          </div>

          {/* User Type Toggle */}
          <div className="auth-toggle auth-toggle-three">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`auth-toggle-btn ${userType === 'student' ? 'active' : ''}`}
            >
              <GraduationCap size={18} />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('faculty')}
              className={`auth-toggle-btn ${userType === 'faculty' ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`auth-toggle-btn ${userType === 'admin' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="auth-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label>Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-input-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? (
                <span className="auth-loading">Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social auth-social-three">
            <button type="button" className="auth-social-btn">
              {/* Google svg */}
              <span>Google</span>
            </button>
            <button type="button" className="auth-social-btn">
              {/* Facebook svg */}
              <span>Facebook</span>
            </button>
            <button type="button" className="auth-social-btn">
              {/* Apple svg */}
              <span>Apple</span>
            </button>
          </div>

          {/* Demo Login Section */}
          <div className="auth-divider">
            <span>quick demo access</span>
          </div>

          <div className="auth-demo-buttons">
            <button 
              type="button" 
              onClick={() => handleDemoLogin('student')}
              className="auth-demo-btn student"
            >
              <GraduationCap size={16} />
              <span>Demo Student</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('faculty')}
              className="auth-demo-btn faculty"
            >
              <Users size={16} />
              <span>Demo Faculty</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('admin')}
              className="auth-demo-btn admin"
            >
              <Settings size={16} />
              <span>Demo Admin</span>
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-footer-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

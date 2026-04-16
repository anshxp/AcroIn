import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building, GraduationCap, Sparkles, Users, ArrowRight, CheckCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [userType, setUserType] = useState<'student' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Student fields
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll: '',
    email: '',
    password: '',
    department: '',
  });

  // Faculty fields
  const [facultyForm, setFacultyForm] = useState({
    firstname: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    phone: '',
  });

  const departments = [
    { value: 'CSE', label: 'Computer Science & Engineering' },
    { value: 'ECE', label: 'Electronics & Communication Engineering' },
    { value: 'EEE', label: 'Electrical & Electronics Engineering' },
    { value: 'ME', label: 'Mechanical Engineering' },
    { value: 'CE', label: 'Civil Engineering' },
    { value: 'IT', label: 'Information Technology' },
  ];

  const designations = [
    { value: 'Professor', label: 'Professor' },
    { value: 'Associate Professor', label: 'Associate Professor' },
    { value: 'Assistant Professor', label: 'Assistant Professor' },
    { value: 'Lecturer', label: 'Lecturer' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setIsLoading(true);

    try {
      if (userType === 'student') {
        await register(studentForm, 'student');
        navigate('/student/dashboard');
      } else {
        await register({
          ...facultyForm,
          experience: parseInt(facultyForm.experience),
        }, 'faculty');
        navigate('/faculty/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
              <span>Join the Network</span>
            </div>
            
            <h1 className="auth-branding-title">
              Start Your Journey<br />
              <span className="auth-gradient-text">with Acro-In</span>
            </h1>
            
            <p className="auth-branding-desc">
              Create your profile, showcase your skills, and connect with opportunities 
              tailored for your academic growth.
            </p>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <CheckCircle size={18} className="auth-benefit-icon" />
                <span>AI-powered skill validation</span>
              </div>
              <div className="auth-benefit">
                <CheckCircle size={18} className="auth-benefit-icon" />
                <span>Connect with industry mentors</span>
              </div>
              <div className="auth-benefit">
                <CheckCircle size={18} className="auth-benefit-icon" />
                <span>Access exclusive opportunities</span>
              </div>
              <div className="auth-benefit">
                <CheckCircle size={18} className="auth-benefit-icon" />
                <span>Build verified portfolios</span>
              </div>
              <div className="auth-benefit">
                <CheckCircle size={18} className="auth-benefit-icon" />
                <span>Get placement assistance</span>
              </div>
            </div>
          </div>

          <div className="auth-branding-footer">
            <p>© 2025 Acro-In. Acropolis Institute of Technology & Research</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container register">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Join the smart academic network today</p>
          </div>

          {/* User Type Toggle */}
          <div className="auth-toggle">
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
          </div>

          {error && (
            <div className="auth-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {userType === 'student' ? (
              <>
                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Roll Number</label>
                  <div className="auth-input-wrapper">
                    <GraduationCap size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="Enter your roll number"
                      value={studentForm.roll}
                      onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Department</label>
                  <div className="auth-input-wrapper">
                    <Building size={18} className="auth-input-icon" />
                    <select
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                      required
                    >
                      <option value="">Select your department</option>
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
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
              </>
            ) : (
              <>
                <div className="auth-input-row">
                  <div className="auth-input-group">
                    <label>First Name</label>
                    <div className="auth-input-wrapper">
                      <User size={18} className="auth-input-icon" />
                      <input
                        type="text"
                        placeholder="First name"
                        value={facultyForm.firstname}
                        onChange={(e) => setFacultyForm({ ...facultyForm, firstname: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label>Last Name</label>
                    <div className="auth-input-wrapper">
                      <User size={18} className="auth-input-icon" />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={facultyForm.lastName}
                        onChange={(e) => setFacultyForm({ ...facultyForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Phone Number</label>
                  <div className="auth-input-wrapper">
                    <Phone size={18} className="auth-input-icon" />
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={facultyForm.phone}
                      onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-row">
                  <div className="auth-input-group">
                    <label>Department</label>
                    <div className="auth-input-wrapper">
                      <Building size={18} className="auth-input-icon" />
                      <select
                        value={facultyForm.department}
                        onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                        required
                      >
                        <option value="">Select department</option>
                        {departments.map((dept) => (
                          <option key={dept.value} value={dept.value}>{dept.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label>Designation</label>
                    <div className="auth-input-wrapper">
                      <Briefcase size={18} className="auth-input-icon" />
                      <select
                        value={facultyForm.designation}
                        onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                        required
                      >
                        <option value="">Select designation</option>
                        {designations.map((des) => (
                          <option key={des.value} value={des.value}>{des.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="auth-input-row">
                  <div className="auth-input-group">
                    <label>Qualification</label>
                    <div className="auth-input-wrapper">
                      <GraduationCap size={18} className="auth-input-icon" />
                      <input
                        type="text"
                        placeholder="e.g., Ph.D, M.Tech"
                        value={facultyForm.qualification}
                        onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label>Experience (Years)</label>
                    <div className="auth-input-wrapper">
                      <Briefcase size={18} className="auth-input-icon" />
                      <input
                        type="number"
                        placeholder="Years"
                        min="0"
                        value={facultyForm.experience}
                        onChange={(e) => setFacultyForm({ ...facultyForm, experience: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={facultyForm.password}
                      onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
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
              </>
            )}

            <label className="auth-checkbox terms">
              <input 
                type="checkbox" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <a href="#" className="auth-link-inline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="auth-link-inline">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? (
                <span className="auth-loading">Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-footer-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

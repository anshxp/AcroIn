import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  Search,
  Building2,
  BarChart3,
  Shield,
  Brain,
  ArrowRight,
  Sparkles,
  Eye,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  CheckCircle
} from 'lucide-react';
import { Navbar, Footer } from '../components/common';
import '../styles/common.css';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const [dashboardTab, setDashboardTab] = useState<'student' | 'faculty'>('student');

  const landingNavLinks = [
    { label: 'Features', href: '#features' },
    { label: 'AI Integration', href: '#ai-integration' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'About', href: '#about' },
  ];

  return (
    <div className="landing-page">
      <Navbar navLinks={landingNavLinks} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} />
              <span>Next-Gen Networking Platform</span>
            </div>
            
            <h1 className="hero-title">
              Acro-In:<br />
              Connect.<br />
              <span className="text-gradient">Collaborate. Create.</span>
            </h1>
            
            <p className="hero-description">
              The official student-faculty networking platform of Acropolis Institute. 
              Powered by AI for smart connections, skill validation, and career opportunities.
            </p>
            
            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">
                <span>Get Started</span>
                <ArrowRight size={18} />
              </Link>
              <button className="btn-secondary">
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <Users size={20} className="stat-icon blue" />
                <div className="stat-content">
                  <span className="stat-value blue">5K+</span>
                  <span className="stat-label">Active Students</span>
                </div>
              </div>
              <div className="stat-item">
                <Target size={20} className="stat-icon green" />
                <div className="stat-content">
                  <span className="stat-value green">95%</span>
                  <span className="stat-label">Match Accuracy</span>
                </div>
              </div>
              <div className="stat-item">
                <Shield size={20} className="stat-icon orange" />
                <div className="stat-content">
                  <span className="stat-value orange">100%</span>
                  <span className="stat-label">Verified Profiles</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <div className="ai-verified-badge">
                <CheckCircle size={14} />
                <span>AI Verified ✓</span>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                alt="Students collaborating"
                className="hero-img"
              />
              <div className="smart-matching-badge">
                <Sparkles size={14} />
                <span>Smart Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-badge">
            <Zap size={14} />
            <span>Platform Features</span>
          </div>
          
          <h2 className="section-title">
            <span className="text-gradient">Everything You Need</span><br />
            for Campus Excellence
          </h2>
          
          <p className="section-description">
            Acro-In combines cutting-edge AI with intuitive design to create the most 
            comprehensive student-faculty networking platform in academic institutions.
          </p>
          
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stats-card">
              <Users size={24} className="stats-card-icon blue" />
              <span className="stats-card-value blue">5,247</span>
              <span className="stats-card-label">Verified Students</span>
            </div>
            <div className="stats-card">
              <Target size={24} className="stats-card-icon green" />
              <span className="stats-card-value green">95%</span>
              <span className="stats-card-label">Match Accuracy</span>
            </div>
            <div className="stats-card">
              <TrendingUp size={24} className="stats-card-icon orange" />
              <span className="stats-card-value orange">89%</span>
              <span className="stats-card-label">Placement Rate</span>
            </div>
            <div className="stats-card">
              <Brain size={24} className="stats-card-icon purple" />
              <span className="stats-card-value purple">50+</span>
              <span className="stats-card-label">AI Models</span>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="features-grid">
            <div className="feature-card blue-gradient">
              <div className="feature-header">
                <div className="feature-icon blue">
                  <Users size={24} />
                </div>
                <span className="feature-badge blue">Core Feature</span>
              </div>
              <h3 className="feature-title">Smart Networking</h3>
              <p className="feature-description">
                AI-powered connections between students, faculty, and industry professionals.
              </p>
            </div>
            
            <div className="feature-card cyan-gradient">
              <div className="feature-header">
                <div className="feature-icon cyan">
                  <Search size={24} />
                </div>
                <span className="feature-badge cyan">AI Enhanced</span>
              </div>
              <h3 className="feature-title">Semantic Search</h3>
              <p className="feature-description">
                Find teammates, mentors, and opportunities with intelligent search algorithms.
              </p>
            </div>
            
            <div className="feature-card orange-gradient">
              <div className="feature-header">
                <div className="feature-icon orange">
                  <Building2 size={24} />
                </div>
                <span className="feature-badge orange">Recruitment</span>
              </div>
              <h3 className="feature-title">Placement Hub</h3>
              <p className="feature-description">
                Streamlined recruitment with ML-powered candidate matching and analytics.
              </p>
            </div>
            
            <div className="feature-card beige-gradient">
              <div className="feature-header">
                <div className="feature-icon beige">
                  <BarChart3 size={24} />
                </div>
                <span className="feature-badge beige">Analytics</span>
              </div>
              <h3 className="feature-title">Analytics Dashboard</h3>
              <p className="feature-description">
                Comprehensive insights into skills, engagement, and placement trends.
              </p>
            </div>
            
            <div className="feature-card green-gradient">
              <div className="feature-header">
                <div className="feature-icon green">
                  <Shield size={24} />
                </div>
                <span className="feature-badge green">Security</span>
              </div>
              <h3 className="feature-title">Identity Verification</h3>
              <p className="feature-description">
                Facial recognition and liveness detection for secure, verified profiles.
              </p>
            </div>
            
            <div className="feature-card coral-gradient">
              <div className="feature-header">
                <div className="feature-icon coral">
                  <Brain size={24} />
                </div>
                <span className="feature-badge coral">AI Core</span>
              </div>
              <h3 className="feature-title">Skill Intelligence</h3>
              <p className="feature-description">
                AI-driven skill assessment, validation, and recommendation systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section id="ai-integration" className="ai-section">
        <div className="section-container">
          <div className="ai-content">
            <div className="ai-text">
              <div className="section-badge">
                <Zap size={14} />
                <span>AI Technology</span>
              </div>
              
              <h2 className="section-title left-align">
                Powered by<br />
                <span className="text-gradient">Advanced AI</span>
              </h2>
              
              <p className="section-description left-align">
                Our platform leverages cutting-edge machine learning and AI 
                technologies to create intelligent connections, ensure security, 
                and provide personalized experiences for every user.
              </p>
              
              <div className="ai-features-list">
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">
                    <Eye size={20} />
                  </div>
                  <div className="ai-feature-content">
                    <h4>Facial Recognition</h4>
                    <p>Advanced biometric verification with liveness detection</p>
                    <div className="ai-feature-tags">
                      <span>Real-time verification</span>
                      <span>Anti-spoofing</span>
                      <span>99.9% accuracy</span>
                    </div>
                  </div>
                </div>
                
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">
                    <Target size={20} />
                  </div>
                  <div className="ai-feature-content">
                    <h4>Smart Matching</h4>
                    <p>ML algorithms for optimal student-faculty pairing</p>
                    <div className="ai-feature-tags">
                      <span>Skill compatibility</span>
                      <span>Project alignment</span>
                      <span>Personality matching</span>
                    </div>
                  </div>
                </div>
                
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">
                    <TrendingUp size={20} />
                  </div>
                  <div className="ai-feature-content">
                    <h4>Predictive Analytics</h4>
                    <p>Career guidance and placement success predictions</p>
                    <div className="ai-feature-tags">
                      <span>Success probability</span>
                      <span>Skill gap analysis</span>
                      <span>Career pathways</span>
                    </div>
                  </div>
                </div>
                
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="ai-feature-content">
                    <h4>Anomaly Detection</h4>
                    <p>AI-powered security and fraud prevention</p>
                    <div className="ai-feature-tags">
                      <span>Fake profile detection</span>
                      <span>Spam prevention</span>
                      <span>Behavior analysis</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link to="#features" className="btn-primary">
                <span>Explore AI Features</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="ai-visual">
              <div className="ai-visual-wrapper">
                <div className="ai-processing-badge">
                  <Zap size={14} />
                  <span>AI Processing</span>
                  <div className="ai-accuracy">
                    <span className="accuracy-value">99.9%</span>
                    <span className="accuracy-label">Accuracy Rate</span>
                  </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80" 
                  alt="AI Network Visualization"
                  className="ai-img"
                />
                <div className="ml-models-badge">
                  <Brain size={14} />
                  <span>ML Models</span>
                  <div className="models-count">
                    <span className="count-value">50+</span>
                    <span className="count-label">Active Models</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section id="dashboard" className="dashboard-section">
        <div className="section-container">
          <div className="section-badge">
            <BarChart3 size={14} />
            <span>Dashboard Suite</span>
          </div>
          
          <h2 className="section-title">
            <span className="text-gradient">Comprehensive</span><br />
            Dashboard Experience
          </h2>
          
          <p className="section-description">
            Tailored interfaces for every user type, powered by real-time analytics and 
            intelligent insights to drive campus-wide excellence.
          </p>
          
          {/* Dashboard Tabs */}
          <div className="dashboard-tabs">
            <button 
              className={`dashboard-tab ${dashboardTab === 'student' ? 'active' : ''}`}
              onClick={() => setDashboardTab('student')}
            >
              Student
            </button>
            <button 
              className={`dashboard-tab ${dashboardTab === 'faculty' ? 'active' : ''}`}
              onClick={() => setDashboardTab('faculty')}
            >
              Faculty
            </button>
          </div>
          
          <div className="dashboard-content">
            <div className="dashboard-info">
              {dashboardTab === 'student' ? (
                <>
                  <div className="dashboard-header">
                    <GraduationCap size={24} className="dashboard-icon" />
                    <h3>Student Experience</h3>
                  </div>
                  <p className="dashboard-desc">
                    Empowering students with AI-driven insights and connections
                  </p>
                  <ul className="dashboard-features">
                    <li><Target size={16} /> Personalized skill recommendations</li>
                    <li><Brain size={16} /> AI-powered project matching</li>
                    <li><TrendingUp size={16} /> Career pathway guidance</li>
                  </ul>
                </>
              ) : (
                <>
                  <div className="dashboard-header">
                    <Users size={24} className="dashboard-icon" />
                    <h3>Faculty Experience</h3>
                  </div>
                  <p className="dashboard-desc">
                    Comprehensive tools for student mentorship and oversight
                  </p>
                  <ul className="dashboard-features">
                    <li><BarChart3 size={16} /> Student analytics dashboard</li>
                    <li><Shield size={16} /> Verification management</li>
                    <li><Search size={16} /> Skill endorsement system</li>
                  </ul>
                </>
              )}
              
              <Link to="/login" className="btn-primary">
                <span>Explore Dashboards</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="dashboard-preview">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Dashboard Preview"
                className="dashboard-img"
              />
            </div>
          </div>
          
          {/* Dashboard Cards */}
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <div className="dashboard-card-icon blue">
                <GraduationCap size={24} />
              </div>
              <h4>Student Dashboard</h4>
              <p className="card-desc">Personalized learning and networking experience</p>
              <ul className="card-features">
                <li>Skill tracking</li>
                <li>Project showcase</li>
                <li>Mentor connections</li>
                <li>Achievement badges</li>
              </ul>
            </div>
            
            <div className="dashboard-card">
              <div className="dashboard-card-icon gray">
                <Users size={24} />
              </div>
              <h4>Faculty Portal</h4>
              <p className="card-desc">Comprehensive student management and insights</p>
              <ul className="card-features">
                <li>Student analytics</li>
                <li>Project supervision</li>
                <li>Skill endorsements</li>
                <li>Progress tracking</li>
              </ul>
            </div>
            
            <div className="dashboard-card">
              <div className="dashboard-card-icon navy">
                <Building2 size={24} />
              </div>
              <h4>Placement Hub</h4>
              <p className="card-desc">AI-powered recruitment and candidate management</p>
              <ul className="card-features blue-text">
                <li>Smart shortlisting</li>
                <li>Skill matching</li>
                <li>Interview scheduling</li>
                <li>Success analytics</li>
              </ul>
            </div>
            
            <div className="dashboard-card">
              <div className="dashboard-card-icon light-blue">
                <BarChart3 size={24} />
              </div>
              <h4>Analytics Center</h4>
              <p className="card-desc">Data-driven insights for institutional excellence</p>
              <ul className="card-features blue-text">
                <li>Skill trends</li>
                <li>Engagement metrics</li>
                <li>Placement analytics</li>
                <li>Predictive modeling</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

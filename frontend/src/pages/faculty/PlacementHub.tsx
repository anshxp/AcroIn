import React, { useState } from 'react';
import { Upload, TrendingUp, Briefcase } from 'lucide-react';

export const PlacementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requirements' | 'rankings'>('requirements');
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    skills: '',
    experience: '',
    location: '',
    salary: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Placement Dashboard</h1>
          <p>Upload job requirements and get ML-ranked student recommendations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          <Upload size={18} />
          Job Requirements
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setActiveTab('rankings')}
        >
          <TrendingUp size={18} />
          Student Rankings
        </button>
      </div>

      {/* Content */}
      {activeTab === 'requirements' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2>
                <Briefcase size={20} />
                Job Requirements Form
              </h2>
              <p>Enter job details to get AI-powered student recommendations</p>
            </div>
          </div>
          <div className="card-body">
            <form className="form-grid">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="company"
                  className="form-input"
                  placeholder="e.g. Google, Microsoft, Apple"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Position Title</label>
                <input
                  type="text"
                  name="position"
                  className="form-input"
                  placeholder="e.g. Software Engineer, Data Scientist"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input
                  type="text"
                  name="skills"
                  className="form-input"
                  placeholder="e.g. React, Python, Machine Learning"
                  value={formData.skills}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <input
                  type="text"
                  name="experience"
                  className="form-input"
                  placeholder="e.g. Entry Level, 1-2 years, Internship"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. San Francisco, Remote, Hybrid"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  className="form-input"
                  placeholder="e.g. $80,000 - $120,000"
                  value={formData.salary}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full">
                <label className="form-label">Job Description</label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  placeholder="Detailed job description, responsibilities, and requirements..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="form-submit">
                Generate Student Recommendations
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Student Rankings</h2>
              <p>ML-powered rankings based on job requirements</p>
            </div>
          </div>
          <div className="card-body">
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
              Submit job requirements to see ranked student recommendations
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

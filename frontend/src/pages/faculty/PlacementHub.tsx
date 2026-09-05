import React, { useState } from 'react';
import { Upload, TrendingUp, Briefcase } from 'lucide-react';
import {
  recommendationAPI,
  type RecommendationItem,
} from '../../services/recommendationApi';

export const PlacementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requirements' | 'rankings'>('requirements');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rankings, setRankings] = useState<RecommendationItem[]>([]);
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
      [e.target.name]: e.target.value,
    });
  };

  const generateRecommendations = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const requiredSkills = formData.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!formData.position.trim() && !formData.description.trim() && !requiredSkills.length) {
      setLoading(false);
      setError('Enter a position, job description, or at least one required skill.');
      return;
    }

    const requirements = [
      formData.company && `Company: ${formData.company}`,
      formData.position && `Position: ${formData.position}`,
      formData.experience && `Experience: ${formData.experience}`,
      formData.location && `Location: ${formData.location}`,
      formData.salary && `Salary: ${formData.salary}`,
      formData.description && `Description: ${formData.description}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await recommendationAPI.recommend({
        requirements,
        required_skills: requiredSkills,
        top_n: 8,
      });

      setRankings(response.data);
      setActiveTab('rankings');
    } catch (requestError: any) {
      const message = requestError?.response?.data?.detail;
      setError(typeof message === 'string' ? message : 'Unable to generate student recommendations.');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Placement Dashboard</h1>
          <p>Upload job requirements and get ML-ranked student recommendations</p>
        </div>
      </div>

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

      {error && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-body">
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        </div>
      )}

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
            <form className="form-grid" onSubmit={generateRecommendations}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" name="company" className="form-input" placeholder="e.g. Google, Microsoft, Apple" value={formData.company} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Position Title</label>
                <input type="text" name="position" className="form-input" placeholder="e.g. Software Engineer, Data Scientist" value={formData.position} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input type="text" name="skills" className="form-input" placeholder="e.g. React, Python, Machine Learning" value={formData.skills} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <input type="text" name="experience" className="form-input" placeholder="e.g. Entry Level, 1-2 years, Internship" value={formData.experience} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" name="location" className="form-input" placeholder="e.g. San Francisco, Remote, Hybrid" value={formData.location} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input type="text" name="salary" className="form-input" placeholder="e.g. $80,000 - $120,000" value={formData.salary} onChange={handleInputChange} />
              </div>
              <div className="form-group full">
                <label className="form-label">Job Description</label>
                <textarea name="description" className="form-input form-textarea" placeholder="Detailed job description, responsibilities, and requirements..." value={formData.description} onChange={handleInputChange} />
              </div>
              <button type="submit" className="form-submit" disabled={loading}>
                {loading ? 'Generating Recommendations...' : 'Generate Student Recommendations'}
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
              <p>Ranked by the AcroIn recommendation service</p>
            </div>
          </div>
          <div className="card-body">
            {!rankings.length ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                Submit job requirements to see ranked student recommendations.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {rankings.map((student, index) => (
                  <div key={student.student_id || index} style={{ padding: '18px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{student.name}</h3>
                        <p style={{ color: '#64748b', margin: '4px 0' }}>
                          {student.department || 'Student'}{student.cgpa != null ? ` • CGPA ${student.cgpa}` : ''}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {student.matched_skills.map((skill) => (
                            <span key={skill} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                      <strong>{student.match_percent}% match</strong>
                    </div>
                    {student.missing_skills.length > 0 && (
                      <p style={{ color: '#64748b', marginBottom: 0 }}>
                        Missing skills: {student.missing_skills.join(', ')}
                      </p>
                    )}
                    {student.summary && (
                      <p style={{ color: '#475569', marginBottom: 0 }}>{student.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

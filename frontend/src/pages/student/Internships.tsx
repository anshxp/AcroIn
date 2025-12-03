import React, { useState } from 'react';
import { 
  Plus, Search, Briefcase, Calendar, ExternalLink, Trash2, Edit2, 
  X, Building2, MapPin, DollarSign, Clock, CheckCircle2, TrendingUp
} from 'lucide-react';
import '../../styles/pages.css';

interface Internship {
  _id: string;
  company: string;
  position: string;
  duration: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  stipend?: string;
  description: string;
  skills: string[];
  status: 'completed' | 'ongoing' | 'upcoming';
  certificate_link?: string;
  startDate: string;
  endDate?: string;
}

export const StudentInternships: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([
    {
      _id: '1',
      company: 'Google',
      position: 'Software Engineering Intern',
      duration: '3 months',
      location: 'Mountain View, CA',
      type: 'hybrid',
      stipend: '$8,000/month',
      description: 'Worked on the Google Cloud Platform team, developing microservices and implementing new features for the console.',
      skills: ['Go', 'Kubernetes', 'GCP', 'Microservices'],
      status: 'completed',
      certificate_link: 'https://example.com/cert',
      startDate: '2024-01-15',
      endDate: '2024-04-15',
    },
    {
      _id: '2',
      company: 'Microsoft',
      position: 'Data Science Intern',
      duration: '2 months',
      location: 'Seattle, WA',
      type: 'onsite',
      stipend: '$7,500/month',
      description: 'Analyzed user behavior data and built predictive models for Azure services.',
      skills: ['Python', 'Azure ML', 'TensorFlow', 'SQL'],
      status: 'completed',
      startDate: '2023-06-01',
      endDate: '2023-08-01',
    },
    {
      _id: '3',
      company: 'Amazon',
      position: 'Backend Developer Intern',
      duration: '6 months',
      location: 'Remote',
      type: 'remote',
      stipend: '$6,500/month',
      description: 'Building scalable backend services for AWS Lambda and API Gateway.',
      skills: ['Java', 'AWS', 'DynamoDB', 'REST APIs'],
      status: 'ongoing',
      startDate: '2024-09-01',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    duration: '',
    location: '',
    type: 'onsite' as 'remote' | 'onsite' | 'hybrid',
    stipend: '',
    description: '',
    skills: '',
    status: 'ongoing' as 'completed' | 'ongoing' | 'upcoming',
    certificate_link: '',
    startDate: '',
    endDate: '',
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'remote', label: 'Remote' },
  ];

  const stats = {
    total: internships.length,
    completed: internships.filter(i => i.status === 'completed').length,
    ongoing: internships.filter(i => i.status === 'ongoing').length,
    totalMonths: internships.reduce((acc, i) => {
      const months = parseInt(i.duration) || 0;
      return acc + months;
    }, 0),
  };

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch = 
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'remote') return matchesSearch && internship.type === 'remote';
    return matchesSearch && internship.status === activeFilter;
  });

  const handleOpenModal = (internship?: Internship) => {
    if (internship) {
      setEditingInternship(internship);
      setFormData({
        company: internship.company,
        position: internship.position,
        duration: internship.duration,
        location: internship.location,
        type: internship.type,
        stipend: internship.stipend || '',
        description: internship.description || '',
        skills: internship.skills.join(', '),
        status: internship.status,
        certificate_link: internship.certificate_link || '',
        startDate: internship.startDate,
        endDate: internship.endDate || '',
      });
    } else {
      setEditingInternship(null);
      setFormData({
        company: '',
        position: '',
        duration: '',
        location: '',
        type: 'onsite',
        stipend: '',
        description: '',
        skills: '',
        status: 'ongoing',
        certificate_link: '',
        startDate: '',
        endDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const internshipData: Internship = {
      _id: editingInternship?._id || Date.now().toString(),
      company: formData.company,
      position: formData.position,
      duration: formData.duration,
      location: formData.location,
      type: formData.type,
      stipend: formData.stipend || undefined,
      description: formData.description,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      status: formData.status,
      certificate_link: formData.certificate_link || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
    };

    if (editingInternship) {
      setInternships(internships.map((i) => i._id === editingInternship._id ? internshipData : i));
    } else {
      setInternships([internshipData, ...internships]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this internship?')) {
      setInternships(internships.filter((i) => i._id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge status-verified"><CheckCircle2 size={12} /> Completed</span>;
      case 'ongoing':
        return <span className="status-badge status-pending"><Clock size={12} /> Ongoing</span>;
      case 'upcoming':
        return <span className="status-badge status-expired"><Calendar size={12} /> Upcoming</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      remote: '#10b981',
      onsite: '#6366f1',
      hybrid: '#f59e0b',
    };
    return (
      <span className="type-badge" style={{ backgroundColor: `${colors[type]}15`, color: colors[type] }}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getCompanyLogo = (company: string) => {
    const colors: Record<string, string> = {
      google: '#4285f4',
      microsoft: '#00a4ef',
      amazon: '#ff9900',
      meta: '#0668e1',
      apple: '#555555',
    };
    const color = colors[company.toLowerCase()] || '#6366f1';
    return (
      <div className="company-logo" style={{ backgroundColor: `${color}15` }}>
        <Building2 size={24} style={{ color }} />
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Internships</h1>
          <p className="page-subtitle">Track your professional work experience</p>
        </div>
        <button className="add-button" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Add Internship
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#6366f115', color: '#6366f1' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Internships</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f59e0b15', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.ongoing}</span>
            <span className="stat-label">Ongoing</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf615', color: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalMonths}+</span>
            <span className="stat-label">Months Experience</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search internships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internships List */}
      <div className="internships-list">
        {filteredInternships.map((internship) => (
          <div key={internship._id} className="internship-card">
            <div className="internship-header">
              {getCompanyLogo(internship.company)}
              <div className="internship-info">
                <h3 className="internship-position">{internship.position}</h3>
                <p className="internship-company">{internship.company}</p>
              </div>
              <div className="internship-badges">
                {getStatusBadge(internship.status)}
                {getTypeBadge(internship.type)}
              </div>
            </div>

            <div className="internship-meta">
              <span className="meta-item">
                <MapPin size={14} />
                {internship.location}
              </span>
              <span className="meta-item">
                <Calendar size={14} />
                {internship.duration}
              </span>
              {internship.stipend && (
                <span className="meta-item stipend">
                  <DollarSign size={14} />
                  {internship.stipend}
                </span>
              )}
            </div>

            {internship.description && (
              <p className="internship-description">{internship.description}</p>
            )}

            <div className="internship-skills">
              {internship.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>

            <div className="internship-footer">
              <div className="internship-dates">
                <span>
                  {new Date(internship.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {internship.endDate && ` - ${new Date(internship.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                  {!internship.endDate && ' - Present'}
                </span>
              </div>
              <div className="internship-actions">
                {internship.certificate_link && (
                  <a
                    href={internship.certificate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link"
                  >
                    <ExternalLink size={16} />
                    Certificate
                  </a>
                )}
                <button
                  className="action-btn edit"
                  onClick={() => handleOpenModal(internship)}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(internship._id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInternships.length === 0 && (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>No internships found</h3>
          <p>Start adding your professional experience to showcase your work history.</p>
          <button className="add-button" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Add Your First Internship
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingInternship ? 'Edit Internship' : 'Add New Internship'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Software Engineering Intern"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 months"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Work Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'remote' | 'onsite' | 'hybrid' })}
                    required
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'completed' | 'ongoing' | 'upcoming' })}
                    required
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stipend</label>
                  <input
                    type="text"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    placeholder="e.g., $5,000/month"
                  />
                </div>
                <div className="form-group">
                  <label>Certificate Link</label>
                  <input
                    type="url"
                    value={formData.certificate_link}
                    onChange={(e) => setFormData({ ...formData, certificate_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., Python, React, AWS"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your work, responsibilities, and achievements..."
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingInternship ? 'Save Changes' : 'Add Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

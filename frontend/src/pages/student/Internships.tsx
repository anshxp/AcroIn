import React, { useState } from 'react';
import {
  Plus, Search, Briefcase, Calendar, ExternalLink, Trash2, Edit2,
  X, Building2,
} from 'lucide-react';
import '../../styles/pages.css';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

interface Internship {
  id: string;
  company: string;
  position: string;
  duration: string;
  description?: string;
  certificate_link?: string;
  student: string;
}

const GET_INTERNSHIPS = gql`
  query GetInternships {
    internships {
      id
      company
      position
      duration
      description
      certificate_link
      student
    }
  }
`;

export const StudentInternships: React.FC = () => {
  const { data, loading, error } = useQuery<{ internships: Internship[] }>(GET_INTERNSHIPS);
  const internships = data?.internships || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    duration: '',
    description: '',
    certificate_link: '',
  });

  const filteredInternships = internships.filter((i) =>
    i.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (internship?: Internship) => {
    if (internship) {
      setEditingInternship(internship);
      setFormData({
        company: internship.company,
        position: internship.position,
        duration: internship.duration,
        description: internship.description || '',
        certificate_link: internship.certificate_link || '',
      });
    } else {
      setEditingInternship(null);
      setFormData({
        company: '',
        position: '',
        duration: '',
        description: '',
        certificate_link: '',
      });
    }
    setIsModalOpen(true);
  };

  const getCompanyLogo = (company: string) => (
    <div className="company-logo" style={{ backgroundColor: '#6366f115' }} title={company}>
      <Building2 size={24} style={{ color: '#6366f1' }} />
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement create/update via GraphQL mutation
    setIsModalOpen(false);
  };

  if (loading) return <div className="page-container"><p>Loading internships...</p></div>;
  if (error) return <div className="page-container error-message">Error: {error.message}</div>;

  return (
    <div className="page-container internships-page">
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
      </div>

      <div className="internships-list">
        {filteredInternships.map((internship) => (
          <div key={internship.id} className="internship-card">
            <div className="internship-header">
              {getCompanyLogo(internship.company)}
              <div className="internship-info">
                <h3 className="internship-position">{internship.position}</h3>
                <p className="internship-company">{internship.company}</p>
              </div>
            </div>

            <div className="internship-meta">
              <span className="meta-item">
                <Calendar size={14} />
                {internship.duration}
              </span>
            </div>

            {internship.description && (
              <p className="internship-description">{internship.description}</p>
            )}

            <div className="internship-footer">
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
                  onClick={() => {
                    // TODO: implement delete via GraphQL mutation
                    console.log('Delete internship:', internship.id);
                  }}
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
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

              <div className="form-group">
                <label>Certificate Link</label>
                <input
                  type="url"
                  value={formData.certificate_link}
                  onChange={(e) => setFormData({ ...formData, certificate_link: e.target.value })}
                  placeholder="https://..."
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

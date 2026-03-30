import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Plus, Search, Award, Calendar, ExternalLink, Trash2, Edit2, Building, Clock, X } from 'lucide-react';
import '../../styles/pages.css';

interface Certificate {
  id: string;
  title: string;
  organization: string;
  issue_date: string;
  certificate_link?: string;
}

const GET_CERTIFICATES = gql`
  query GetCertificates {
    certificates {
      id
      title
      organization
      issue_date
      certificate_link
    }
  }
`;

export const StudentCertificates: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    issue_date: '',
    certificate_link: '',
  });

  const { data, loading, error } = useQuery<{ certificates: Certificate[] }>(GET_CERTIFICATES);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const certificates = data?.certificates || [];

  const filteredCertificates = certificates.filter(
    (certificate: Certificate) =>
      certificate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (certificate?: Certificate) => {
    if (certificate) {
      setEditingCertificate(certificate);
      setFormData({
        title: certificate.title,
        organization: certificate.organization,
        issue_date: certificate.issue_date ? certificate.issue_date.split('T')[0] : '',
        certificate_link: certificate.certificate_link || '',
      });
    } else {
      setEditingCertificate(null);
      setFormData({
        title: '',
        organization: '',
        issue_date: '',
        certificate_link: '',
      });
    }
    setIsModalOpen(true);
  };

  // TODO: Implement create/update/delete using useMutation if backend supports mutations
  // Remove local CRUD logic and use backend for all operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement create/update logic using useMutation
  };

  const handleDelete = (_id: string) => {
    // Implement delete logic using useMutation
    console.log('Delete certificate:', _id);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getIconClass = (org: string) => {
    const orgLower = org.toLowerCase();
    if (orgLower.includes('aws') || orgLower.includes('amazon')) return 'aws';
    if (orgLower.includes('google')) return 'google';
    if (orgLower.includes('microsoft') || orgLower.includes('azure')) return 'azure';
    return '';
  };

  return (
    <div className="page-container certificates-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Certificates</h1>
          <p>Manage your certifications and credentials</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Certificate</span>
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="cards-grid">
        {filteredCertificates.map((certificate: Certificate) => (
          <div key={certificate.id} className="certificate-card">
            <div className={`certificate-card-icon ${getIconClass(certificate.organization)}`}>
              <Award size={28} />
            </div>
            
            <div className="certificate-card-content">
              <div className="certificate-card-header">
                <h3>{certificate.title}</h3>
                <div className="project-card-actions">
                  <button onClick={() => handleOpenModal(certificate)} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="delete" onClick={() => handleDelete(certificate.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="certificate-card-issuer">
                <Building size={16} />
                <span>{certificate.organization}</span>
              </div>
              
              <div className="certificate-card-date">
                <Calendar size={16} />
                <span>Issued {formatDate(certificate.issue_date)}</span>
              </div>
              
              <div className="certificate-card-footer">
                <span className="pending-badge">
                  <Clock size={14} />
                  Pending
                </span>
                
                {certificate.certificate_link && (
                  <a href={certificate.certificate_link} target="_blank" rel="noopener noreferrer" className="view-link">
                    <ExternalLink size={14} />
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <div className="table-empty">
          <Award size={48} />
          <p>No certificates found. Add your certifications to your profile!</p>
        </div>
      )}

      {/* Certificate Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Certificate Title</label>
                <input
                  type="text"
                  placeholder="e.g., AWS Certified Solutions Architect"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  placeholder="e.g., Amazon Web Services"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Certificate Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.certificate_link}
                  onChange={(e) => setFormData({ ...formData, certificate_link: e.target.value })}
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCertificate ? 'Save Changes' : 'Add Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

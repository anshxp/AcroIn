import React, { useState } from 'react';
import { Plus, Search, Award, Calendar, ExternalLink, Trash2, Edit2, Building, CheckCircle, Clock, X } from 'lucide-react';
import '../../styles/pages.css';

interface Certificate {
  _id: string;
  title: string;
  organization: string;
  issue_date: string;
  certificate_link?: string;
  verified?: boolean;
}

export const StudentCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      _id: '1',
      title: 'AWS Solutions Architect Associate',
      organization: 'Amazon Web Services',
      issue_date: '2024-01-15',
      certificate_link: 'https://aws.amazon.com/verification',
      verified: true,
    },
    {
      _id: '2',
      title: 'Google Cloud Professional Data Engineer',
      organization: 'Google Cloud',
      issue_date: '2023-11-20',
      certificate_link: 'https://cloud.google.com/verify',
      verified: true,
    },
    {
      _id: '3',
      title: 'Meta Frontend Developer Professional',
      organization: 'Meta (Coursera)',
      issue_date: '2023-09-10',
      certificate_link: 'https://coursera.org/verify',
      verified: true,
    },
    {
      _id: '4',
      title: 'Microsoft Azure Fundamentals',
      organization: 'Microsoft',
      issue_date: '2023-07-05',
      certificate_link: 'https://microsoft.com/verify',
      verified: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    issue_date: '',
    certificate_link: '',
  });

  const filteredCertificates = certificates.filter(
    (certificate) =>
      certificate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (certificate?: Certificate) => {
    if (certificate) {
      setEditingCertificate(certificate);
      setFormData({
        title: certificate.title,
        organization: certificate.organization,
        issue_date: certificate.issue_date.split('T')[0],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCertificate) {
      setCertificates(
        certificates.map((c) =>
          c._id === editingCertificate._id ? { ...c, ...formData } : c
        )
      );
    } else {
      const newCertificate: Certificate = {
        _id: Date.now().toString(),
        ...formData,
        verified: false,
      };
      setCertificates([newCertificate, ...certificates]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this certificate?')) {
      setCertificates(certificates.filter((c) => c._id !== id));
    }
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
    <div>
      {/* Page Header */}
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

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Certificates List */}
      {filteredCertificates.length > 0 ? (
        <div className="cards-grid">
          {filteredCertificates.map((certificate) => (
            <div key={certificate._id} className="certificate-card">
              <div className={`certificate-card-icon ${getIconClass(certificate.organization)}`}>
                <Award size={28} />
              </div>
              
              <div className="certificate-card-content">
                <div className="certificate-card-header">
                  <h3>{certificate.title}</h3>
                  <div className="project-card-actions">
                    <button onClick={() => handleOpenModal(certificate)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="delete" onClick={() => handleDelete(certificate._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="certificate-card-issuer">
                  <Building size={14} />
                  {certificate.organization}
                </div>
                
                <div className="certificate-card-date">
                  <Calendar size={14} />
                  {formatDate(certificate.issue_date)}
                </div>

                <div className="certificate-card-footer">
                  {certificate.verified ? (
                    <span className="verified-badge">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  ) : (
                    <span className="pending-badge">
                      <Clock size={12} />
                      Pending
                    </span>
                  )}
                  {certificate.certificate_link && (
                    <a href={certificate.certificate_link} target="_blank" rel="noopener noreferrer" className="view-link">
                      View
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Award size={40} />
          </div>
          <h3>No certificates found</h3>
          <p>Start building your credentials by adding your first certificate</p>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Certificate</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>Certificate Title</label>
                  <input
                    type="text"
                    placeholder="e.g., AWS Solutions Architect"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Issuing Organization</label>
                  <input
                    type="text"
                    placeholder="e.g., Amazon Web Services"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Certificate Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.certificate_link}
                    onChange={(e) => setFormData({ ...formData, certificate_link: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="modal-btn cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn submit">
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

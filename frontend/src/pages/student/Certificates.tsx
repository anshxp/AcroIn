import React, { useEffect, useState } from 'react';
import { Plus, Search, Award, Calendar, ExternalLink, Trash2, Edit2, Building, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { certificateAPI } from '../../services/api';
import '../../styles/pages.css';

interface Certificate {
  _id: string;
  title: string;
  organization: string;
  issue_date: string;
  certificate_link?: string;
  verified?: boolean;
  student?: string;
}

export const StudentCertificates: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [deletingCertificate, setDeletingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    issue_date: '',
    certificate_link: '',
  });

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const studentIdentifier = user?.email || user?.id;
        if (!studentIdentifier) {
          setCertificates([]);
          return;
        }

        const backendCertificates = await certificateAPI.getByStudent(studentIdentifier);
        setCertificates(backendCertificates);
      } catch {
        setCertificates([]);
      }
    };

    loadCertificates();
  }, [user?.email, user?.id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const certificateData = {
      ...formData,
      student: editingCertificate?.student || user?.email || user?.id || '',
    };

    try {
      if (editingCertificate) {
        const updatedCertificate = await certificateAPI.update(editingCertificate._id, certificateData);
        setCertificates(certificates.map((certificate) => (certificate._id === editingCertificate._id ? updatedCertificate : certificate)));
      } else {
        const createdCertificate = await certificateAPI.create(certificateData);
        setCertificates([createdCertificate, ...certificates]);
      }
      setIsModalOpen(false);
    } catch {
      return;
    }
  };

  const handleDelete = (id: string) => {
    const certificateToDelete = certificates.find((certificate) => certificate._id === id) || null;
    setDeletingCertificate(certificateToDelete);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCertificate) return;

    try {
      await certificateAPI.delete(deletingCertificate._id);
      setCertificates(certificates.filter((certificate) => certificate._id !== deletingCertificate._id));
    } catch {
      return;
    }
    setDeletingCertificate(null);
    setIsDeleteModalOpen(false);
  };

  const cancelDelete = () => {
    setDeletingCertificate(null);
    setIsDeleteModalOpen(false);
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
                  <div className="actions">
                    <button type="button" className="action-btn edit" onClick={() => handleOpenModal(certificate)}>
                      <Edit2 size={14} />
                    </button>
                    <button type="button" className="action-btn delete" onClick={() => handleDelete(certificate._id)}>
                      <Trash2 size={14} />
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

      {isDeleteModalOpen && deletingCertificate && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Certificate</h2>
              <button className="modal-close" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-delete-box">
                <p className="confirm-delete-title">Are you sure you want to delete this certificate?</p>
                <p className="confirm-delete-text">
                  <strong>{deletingCertificate.title}</strong> will be removed permanently from your list.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button type="button" className="modal-btn submit delete" onClick={confirmDelete}>
                Delete Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

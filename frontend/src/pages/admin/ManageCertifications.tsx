import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, ExternalLink, X } from 'lucide-react';
import { certificateAPI, studentAPI } from '../../services/api';
import type { Certificate, Student } from '../../types';
import '../../styles/pages.css';

export const ManageCertifications: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    issue_date: '',
    certificate_link: '',
    student: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const [certs, studs] = await Promise.all([
        certificateAPI.getAll(),
        studentAPI.getAll(),
      ]);
      setCertificates(certs);
      setStudents(studs);
    } catch (err) {
      setApiError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.organization && cert.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s._id === studentId);
    return student?.name || 'Unknown';
  };

  const handleOpenModal = (certificate?: Certificate) => {
    if (certificate) {
      setEditingCertificate(certificate);
      setFormData({
        title: certificate.title,
        organization: certificate.organization || '',
        issue_date: certificate.issue_date ? certificate.issue_date.split('T')[0] : '',
        certificate_link: certificate.certificate_link || '',
        student: certificate.student || '',
      });
    } else {
      setEditingCertificate(null);
      setFormData({
        title: '',
        organization: '',
        issue_date: '',
        certificate_link: '',
        student: '',
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setApiError('Title is required');
      return false;
    }
    if (!formData.student) {
      setApiError('Student is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiMessage(null);

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        title: formData.title.trim(),
        organization: formData.organization.trim(),
        issue_date: formData.issue_date,
        certificate_link: formData.certificate_link.trim(),
        student: formData.student,
        verified: true,
      };

      if (editingCertificate) {
        const updated = await certificateAPI.update(editingCertificate._id, payload);
        setCertificates((prev) =>
          prev.map((c) => (c._id === editingCertificate._id ? updated : c))
        );
        setApiMessage('Certificate updated successfully');
      } else {
        const created = await certificateAPI.create(payload as any);
        setCertificates((prev) => [created, ...prev]);
        setApiMessage('Certificate created successfully');
      }

      setIsModalOpen(false);
      setTimeout(() => setApiMessage(null), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to save certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      setApiError(null);
      await certificateAPI.delete(id);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      setApiMessage('Certificate deleted successfully');
      setTimeout(() => setApiMessage(null), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to delete certificate');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Manage Certifications</h1>
          <p>Create and manage student certifications</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Certification</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <p style={{ marginBottom: '16px', color: '#475569', fontSize: '13px' }}>
          Loading certifications...
        </p>
      )}
      {apiMessage && (
        <p style={{ marginBottom: '16px', color: '#166534', fontSize: '13px' }}>{apiMessage}</p>
      )}
      {apiError && (
        <p style={{ marginBottom: '16px', color: '#b91c1c', fontSize: '13px' }}>{apiError}</p>
      )}

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search certifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCertificates.length > 0 ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Organization</th>
                <th>Student</th>
                <th>Issue Date</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((certificate) => (
                <tr key={certificate._id}>
                  <td>{certificate.title}</td>
                  <td>{certificate.organization || '-'}</td>
                  <td>{getStudentName(certificate.student)}</td>
                  <td>{certificate.issue_date ? new Date(certificate.issue_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {certificate.certificate_link ? (
                      <a
                        href={certificate.certificate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenModal(certificate)}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#3b82f6',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(certificate._id)}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <p>No certifications found</p>
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>
                {editingCertificate ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '20px',
                  color: '#64748b',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Title *
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                    required
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Organization
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g., Amazon Web Services"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Issue Date
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Certificate Link
                  <input
                    type="url"
                    value={formData.certificate_link}
                    onChange={(e) => setFormData({ ...formData, certificate_link: e.target.value })}
                    placeholder="https://..."
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Student *
                  <select
                    value={formData.student}
                    onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.roll})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingCertificate ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

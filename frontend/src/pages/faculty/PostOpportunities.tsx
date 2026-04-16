import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, Briefcase, Trash2, Edit2, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { opportunityAPI } from '../../services/api';
import type { Opportunity } from '../../types';
import '../../styles/pages.css';

export const PostOpportunities: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'internship' as 'internship' | 'job' | 'competition' | 'workshop',
    location: '',
    deadline: '',
    description: '',
    requirements: '',
    application_link: '',
  });

  // Load opportunities on mount
  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const data = await opportunityAPI.getAll();
      setOpportunities(data);
    } catch (err) {
      setApiError('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: 'internship', label: 'Internship' },
    { value: 'job', label: 'Job' },
    { value: 'competition', label: 'Competition' },
    { value: 'workshop', label: 'Workshop' },
  ];

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.company && opp.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenModal = (opportunity?: Opportunity) => {
    if (opportunity) {
      setEditingOpportunity(opportunity);
      setFormData({
        title: opportunity.title,
        company: opportunity.company || '',
        type: opportunity.type,
        location: opportunity.location || '',
        deadline: opportunity.deadline ? opportunity.deadline.split('T')[0] : '',
        description: opportunity.description,
        requirements: opportunity.requirements.join(', '),
        application_link: opportunity.application_link,
      });
    } else {
      setEditingOpportunity(null);
      setFormData({
        title: '',
        company: '',
        type: 'internship',
        location: '',
        deadline: '',
        description: '',
        requirements: '',
        application_link: '',
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setApiError('Title is required');
      return false;
    }
    if (!formData.application_link.trim()) {
      setApiError('Application link is required');
      return false;
    }
    try {
      new URL(formData.application_link);
    } catch {
      setApiError('Please enter a valid URL for the application link');
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
        company: formData.company.trim(),
        type: formData.type,
        location: formData.location.trim(),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        description: formData.description.trim(),
        requirements: formData.requirements
          ? formData.requirements.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
        application_link: formData.application_link.trim(),
      };

      if (editingOpportunity) {
        const updated = await opportunityAPI.update(editingOpportunity._id, payload);
        setOpportunities((prev) =>
          prev.map((o) => (o._id === editingOpportunity._id ? updated : o))
        );
        setApiMessage('Opportunity updated successfully');
      } else {
        const created = await opportunityAPI.create(payload as any);
        setOpportunities((prev) => [created, ...prev]);
        setApiMessage('Opportunity posted successfully');
      }

      setIsModalOpen(false);
      setTimeout(() => setApiMessage(null), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to save opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      setApiError(null);
      await opportunityAPI.delete(id);
      setOpportunities((prev) => prev.filter((o) => o._id !== id));
      setApiMessage('Opportunity deleted successfully');
      setTimeout(() => setApiMessage(null), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to delete opportunity');
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'internship':
        return 'info';
      case 'job':
        return 'success';
      case 'competition':
        return 'warning';
      case 'workshop':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Post Opportunities</h1>
          <p>Post internships, jobs, competitions, and workshops for students</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Post Opportunity</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <p style={{ marginBottom: '16px', color: '#475569', fontSize: '13px' }}>
          Loading opportunities...
        </p>
      )}
      {apiMessage && (
        <p style={{ marginBottom: '16px', color: '#166534', fontSize: '13px' }}>{apiMessage}</p>
      )}
      {apiError && (
        <p style={{ marginBottom: '16px', color: '#b91c1c', fontSize: '13px' }}>{apiError}</p>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                      {opportunity.title}
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        background:
                          opportunity.type === 'internship'
                            ? '#dbeafe'
                            : opportunity.type === 'job'
                            ? '#dcfce7'
                            : opportunity.type === 'competition'
                            ? '#fef3c7'
                            : '#f1f5f9',
                        color:
                          opportunity.type === 'internship'
                            ? '#1d4ed8'
                            : opportunity.type === 'job'
                            ? '#16a34a'
                            : opportunity.type === 'competition'
                            ? '#b45309'
                            : '#64748b',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    >
                      {opportunity.type}
                    </span>
                  </div>
                  {opportunity.company && (
                    <p style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 500, margin: 0, marginBottom: '8px' }}>
                      {opportunity.company}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '8px',
                    }}
                  >
                    {opportunity.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} />
                        {opportunity.location}
                      </span>
                    )}
                    {opportunity.deadline && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#475569', margin: 0, marginBottom: '8px', lineHeight: 1.4 }}>
                    {opportunity.description}
                  </p>
                  {opportunity.requirements.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {opportunity.requirements.slice(0, 3).map((req, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '2px 8px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            borderRadius: '12px',
                            fontSize: '11px',
                          }}
                        >
                          {req}
                        </span>
                      ))}
                      {opportunity.requirements.length > 3 && (
                        <span
                          style={{
                            padding: '2px 8px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            borderRadius: '12px',
                            fontSize: '11px',
                          }}
                        >
                          +{opportunity.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  {opportunity.application_link && (
                    <a
                      href={opportunity.application_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#3b82f6',
                        fontSize: '13px',
                        textDecoration: 'none',
                        marginTop: '8px',
                      }}
                    >
                      Apply Now <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                  <button
                    onClick={() => handleOpenModal(opportunity)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      borderRadius: '6px',
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(opportunity._id)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      borderRadius: '6px',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <Briefcase size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p>No opportunities found. Post your first one!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
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
              maxWidth: '600px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
              overflow: 'hidden',
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
                {editingOpportunity ? 'Edit Opportunity' : 'Post New Opportunity'}
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
              <div style={{ display: 'grid', gap: '14px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Title *
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Software Engineering Internship"
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
                  Type *
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Company
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google, Microsoft, etc."
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Location
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Bangalore, India"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Deadline
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the opportunity..."
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '80px',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Requirements (comma-separated)
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g., 3rd year B.Tech, Strong coding skills, Data Structures"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '60px',
                      fontFamily: 'inherit',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Application Link *
                  <input
                    type="url"
                    value={formData.application_link}
                    onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                    placeholder="https://..."
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                    required
                  />
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
                  {isSubmitting ? 'Saving...' : editingOpportunity ? 'Update' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

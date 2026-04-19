import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, Briefcase, Trash2, Edit2, ExternalLink, X, Sparkles, Clock } from 'lucide-react';
import { opportunityAPI } from '../../services/api';
import type { Opportunity } from '../../types';
import '../../styles/pages.css';
import './PostOpportunities.css';

export const PostOpportunities: React.FC = () => {
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
    type: 'internship' as Opportunity['type'],
    location: '',
    eventDate: '',
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
    { value: 'competition', label: 'Competition' },
    { value: 'certification', label: 'Certification' },
    { value: 'job', label: 'Job' },
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
        eventDate: opportunity.eventDate ? opportunity.eventDate.split('T')[0] : '',
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
        eventDate: '',
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
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : undefined,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
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

  const getUrgency = (deadline?: string) => {
    if (!deadline) {
      return { label: 'Open', level: 'open' as const };
    }

    const now = new Date();
    const due = new Date(deadline);
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((due.getTime() - now.getTime()) / msPerDay);

    if (days < 0) {
      return { label: 'Closed', level: 'closed' as const };
    }
    if (days <= 3) {
      return { label: 'Closing Soon', level: 'soon' as const };
    }
    return { label: 'Open', level: 'open' as const };
  };

  const closingSoonCount = opportunities.filter((opp) => getUrgency(opp.deadline).level === 'soon').length;
  const openCount = opportunities.filter((opp) => getUrgency(opp.deadline).level !== 'closed').length;
  const recentCount = opportunities.filter((opp) => {
    const created = new Date(opp.createdAt);
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    return (now.getTime() - created.getTime()) / msPerDay <= 2;
  }).length;

  return (
    <div className="opportunity-board">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Post Opportunities</h1>
          <p>Launch opportunities with a bold board view crafted for discoverability</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Post Opportunity</span>
          </button>
        </div>
      </div>

      <section className="opportunity-hero">
        <div className="opportunity-hero-header">
          <div>
            <h2>Opportunity Board</h2>
            <p>Designed to spotlight internships, competitions, and certifications beyond regular posts.</p>
          </div>
          <Sparkles size={22} />
        </div>
        <div className="opportunity-hero-stats">
          <div className="opportunity-stat-pill">
            <span className="label">Open</span>
            <strong>{openCount}</strong>
          </div>
          <div className="opportunity-stat-pill">
            <span className="label">Closing Soon</span>
            <strong>{closingSoonCount}</strong>
          </div>
          <div className="opportunity-stat-pill">
            <span className="label">New (48h)</span>
            <strong>{recentCount}</strong>
          </div>
        </div>
      </section>

      {isLoading && (
        <p className="opportunity-feedback loading">
          Loading opportunities...
        </p>
      )}
      {apiMessage && (
        <p className="opportunity-feedback success">{apiMessage}</p>
      )}
      {apiError && (
        <p className="opportunity-feedback error">{apiError}</p>
      )}

      {/* Search Bar */}
      <div className="search-bar opportunity-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by title, company, or type"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length > 0 ? (
        <div className="opportunity-list">
          {filteredOpportunities.map((opportunity) => (
            <article key={opportunity._id} className={`opportunity-card opportunity-card-${opportunity.type}`}>
              <div className="opportunity-card-main">
                <div className="opportunity-card-top">
                  <h3>
                    <Briefcase size={17} />
                    <span>
                      {opportunity.title}
                    </span>
                  </h3>
                  <div className="opportunity-card-badges">
                    <span className="opportunity-type-chip">
                      {opportunity.type}
                    </span>
                    <span className={`opportunity-urgency-badge ${getUrgency(opportunity.deadline).level}`}>
                      {getUrgency(opportunity.deadline).label}
                    </span>
                  </div>
                  {opportunity.company && (
                    <p className="opportunity-company">
                      {opportunity.company}
                    </p>
                  )}

                  <div className="opportunity-meta-row">
                    {opportunity.location && (
                      <span className="opportunity-meta-chip">
                        <MapPin size={14} />
                        {opportunity.location}
                      </span>
                    )}
                    {opportunity.eventDate && (
                      <span className="opportunity-meta-chip">
                        <Calendar size={14} />
                        Date: {new Date(opportunity.eventDate).toLocaleDateString()}
                      </span>
                    )}
                    {opportunity.deadline && (
                      <span className="opportunity-meta-chip">
                        <Clock size={14} />
                        Application Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p className="opportunity-description">
                    {opportunity.description}
                  </p>

                  {opportunity.requirements.length > 0 && (
                    <div className="opportunity-tag-row">
                      {opportunity.requirements.slice(0, 3).map((req, idx) => (
                        <span key={idx} className="opportunity-tag">
                          {req}
                        </span>
                      ))}
                      {opportunity.requirements.length > 3 && (
                        <span className="opportunity-tag">
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
                      className="opportunity-apply-btn"
                    >
                      Apply Now <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="opportunity-card-actions">
                  <button
                    onClick={() => handleOpenModal(opportunity)}
                    aria-label="Edit opportunity"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(opportunity._id)}
                    aria-label="Delete opportunity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="opportunity-empty-state">
          <Briefcase size={42} />
          <p>No opportunities found. Post your first one!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="opportunity-modal-overlay">
          <div className="opportunity-modal">
            <div className="opportunity-modal-header">
              <h3>
                {editingOpportunity ? 'Edit Opportunity' : 'Post New Opportunity'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="opportunity-form">
              <div className="opportunity-form-grid">
                <label>
                  Title *
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Software Engineering Internship"
                    required
                  />
                </label>

                <label>
                  Type *
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Opportunity['type'] })}
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Company
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google, Microsoft, etc."
                  />
                </label>

                <label>
                  Location
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Bangalore, India"
                  />
                </label>

                <label>
                  Event Date
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </label>

                <label>
                  Application Deadline
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </label>

                <label className="opportunity-span-2">
                  Description
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the opportunity..."
                  />
                </label>

                <label className="opportunity-span-2">
                  Requirements (comma-separated)
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g., 3rd year B.Tech, Strong coding skills, Data Structures"
                  />
                </label>

                <label className="opportunity-span-2">
                  Application Link *
                  <input
                    type="url"
                    value={formData.application_link}
                    onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </label>
              </div>

              <div className="opportunity-modal-actions">
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

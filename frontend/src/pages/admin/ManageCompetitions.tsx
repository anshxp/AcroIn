import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { competitionAPI } from '../../services/api';
import type { Competition } from '../../types';
import '../../styles/pages.css';

export const ManageCompetitions: React.FC = () => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    date: '',
    application_link: '',
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const data = await competitionAPI.getAll();
      setCompetitions(data);
    } catch (err) {
      setApiError('Failed to load competitions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompetitions = competitions.filter(
    (comp) =>
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.organizer && comp.organizer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenModal = (competition?: Competition) => {
    if (competition) {
      setEditingCompetition(competition);
      setFormData({
        name: competition.name,
        organizer: competition.organizer || '',
        date: competition.date ? competition.date.split('T')[0] : '',
        application_link: competition.application_link || '',
      });
    } else {
      setEditingCompetition(null);
      setFormData({
        name: '',
        organizer: '',
        date: '',
        application_link: '',
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setApiError('Competition name is required');
      return false;
    }
    if (!formData.application_link.trim()) {
      setApiError('Application link is required');
      return false;
    }
    try {
      new URL(formData.application_link);
    } catch {
      setApiError('Please enter a valid URL');
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
        name: formData.name.trim(),
        organizer: formData.organizer.trim(),
        date: formData.date ? new Date(formData.date).toISOString() : null,
        application_link: formData.application_link.trim(),
      };

      if (editingCompetition) {
        const updated = await competitionAPI.update(editingCompetition._id, payload);
        setCompetitions((prev) =>
          prev.map((c) => (c._id === editingCompetition._id ? updated : c))
        );
        setApiMessage('Competition updated successfully');
      } else {
        const created = await competitionAPI.create(payload as any);
        setCompetitions((prev) => [created, ...prev]);
        setApiMessage('Competition created successfully');
      }

      setIsModalOpen(false);
      setTimeout(() => setApiMessage(null), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to save competition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competition?')) return;

    try {
      setApiError(null);
      await competitionAPI.delete(id);
      setCompetitions((prev) => prev.filter((c) => c._id !== id));
      setApiMessage('Competition deleted successfully');
      setTimeout(() => setApiMessage(null), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to delete competition');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Manage Competitions</h1>
          <p>Create and manage competitions for students</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Competition</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <p style={{ marginBottom: '16px', color: '#475569', fontSize: '13px' }}>
          Loading competitions...
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
          placeholder="Search competitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCompetitions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredCompetitions.map((competition) => (
            <div key={competition._id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0, flex: 1 }}>
                  {competition.name}
                </h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleOpenModal(competition)}
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
                    onClick={() => handleDelete(competition._id)}
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
                </div>
              </div>

              {competition.organizer && (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, marginBottom: '8px' }}>
                  {competition.organizer}
                </p>
              )}

              {competition.date && (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, marginBottom: '8px' }}>
                  {new Date(competition.date).toLocaleDateString()}
                </p>
              )}

              {competition.application_link && (
                <a
                  href={competition.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#3b82f6',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  Apply <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <p>No competitions found</p>
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
                {editingCompetition ? 'Edit Competition' : 'Add Competition'}
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
              <div style={{ display: 'grid', gap: '14px' }}>
                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Competition Name *
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Smart India Hackathon 2026"
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
                  Organizer
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="e.g., Ministry of Education"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Date
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
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
                  {isSubmitting ? 'Saving...' : editingCompetition ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

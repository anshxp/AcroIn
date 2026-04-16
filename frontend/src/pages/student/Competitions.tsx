import React, { useEffect, useState } from 'react';
import { Plus, Search, Trophy, Calendar, ExternalLink, Trash2, Edit2, Medal, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { competitionAPI } from '../../services/api';
import '../../styles/pages.css';

interface Competition {
  _id: string;
  name: string;
  organizer: string;
  position?: string;
  date: string;
  certificate_link?: string;
  application_link?: string;
  student?: string;
}

export const StudentCompetitions: React.FC = () => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [deletingCompetition, setDeletingCompetition] = useState<Competition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    position: '',
    date: '',
    certificate_link: '',
  });

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const studentIdentifier = user?.email || user?.id;
        if (!studentIdentifier) {
          setCompetitions([]);
          return;
        }

        const backendCompetitions = await competitionAPI.getByStudent(studentIdentifier);
        setCompetitions(backendCompetitions);
      } catch {
        setCompetitions([]);
      }
    };

    loadCompetitions();
  }, [user?.email, user?.id]);

  const filteredCompetitions = competitions.filter(
    (competition) =>
      competition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competition.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (competition?: Competition) => {
    if (competition) {
      setEditingCompetition(competition);
      setFormData({
        name: competition.name,
        organizer: competition.organizer,
        position: competition.position || '',
        date: competition.date.split('T')[0],
        certificate_link: competition.certificate_link || '',
      });
    } else {
      setEditingCompetition(null);
      setFormData({
        name: '',
        organizer: '',
        position: '',
        date: '',
        certificate_link: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const competitionData = {
      ...formData,
      student: editingCompetition?.student || user?.email || user?.id || '',
    };

    try {
      if (editingCompetition) {
        const updatedCompetition = await competitionAPI.update(editingCompetition._id, competitionData);
        setCompetitions(competitions.map((competition) => (competition._id === editingCompetition._id ? updatedCompetition : competition)));
      } else {
        const createdCompetition = await competitionAPI.create(competitionData);
        setCompetitions([createdCompetition, ...competitions]);
      }
      setIsModalOpen(false);
    } catch {
      return;
    }
  };

  const handleDelete = (id: string) => {
    const competitionToDelete = competitions.find((competition) => competition._id === id) || null;
    setDeletingCompetition(competitionToDelete);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCompetition) return;

    try {
      await competitionAPI.delete(deletingCompetition._id);
      setCompetitions(competitions.filter((competition) => competition._id !== deletingCompetition._id));
    } catch {
      return;
    }
    setDeletingCompetition(null);
    setIsDeleteModalOpen(false);
  };

  const cancelDelete = () => {
    setDeletingCompetition(null);
    setIsDeleteModalOpen(false);
  };

  const getPositionBadge = (position: string) => {
    const pos = position.toLowerCase();
    if (pos.includes('1st') || pos.includes('first') || pos.includes('winner')) {
      return 'gold';
    } else if (pos.includes('2nd') || pos.includes('second')) {
      return 'silver';
    } else if (pos.includes('3rd') || pos.includes('third')) {
      return 'bronze';
    }
    return 'participant';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Competitions</h1>
          <p>Track your competition achievements</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Competition</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search competitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Competitions Grid */}
      {filteredCompetitions.length > 0 ? (
        <div className="cards-grid cards-grid-3">
          {filteredCompetitions.map((competition) => (
            <div key={competition._id} className="competition-card">
              {competition.position && (
                <div className={`competition-card-badge ${getPositionBadge(competition.position)}`}>
                  {competition.position}
                </div>
              )}
              
              <div className="competition-card-icon">
                <Trophy size={28} />
              </div>
              
              <h3>{competition.name}</h3>
              <p className="competition-card-org">{competition.organizer}</p>
              
              <div className="competition-card-meta">
                <span>
                  <Medal size={16} />
                  {competition.position || 'Participant'}
                </span>
                <span>
                  <Calendar size={16} />
                  {formatDate(competition.date)}
                </span>
              </div>

              <div className="competition-card-footer">
                {competition.certificate_link ? (
                  <a href={competition.certificate_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                    View Certificate
                  </a>
                ) : (
                  <span></span>
                )}
                <div className="actions">
                  <button type="button" className="action-btn edit" onClick={() => handleOpenModal(competition)}>
                    <Edit2 size={14} />
                  </button>
                  <button type="button" className="action-btn delete" onClick={() => handleDelete(competition._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Trophy size={40} />
          </div>
          <h3>No competitions found</h3>
          <p>Start tracking your achievements by adding your first competition</p>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Competition</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCompetition ? 'Edit Competition' : 'Add New Competition'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>Competition Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Smart India Hackathon"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Organizer</label>
                  <input
                    type="text"
                    placeholder="e.g., Ministry of Education"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Position/Achievement</label>
                  <input
                    type="text"
                    placeholder="e.g., 1st Place, Top 10"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  {editingCompetition ? 'Save Changes' : 'Add Competition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deletingCompetition && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Competition</h2>
              <button className="modal-close" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-delete-box">
                <p className="confirm-delete-title">Are you sure you want to delete this competition?</p>
                <p className="confirm-delete-text">
                  <strong>{deletingCompetition.name}</strong> will be removed permanently from your list.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button type="button" className="modal-btn submit delete" onClick={confirmDelete}>
                Delete Competition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

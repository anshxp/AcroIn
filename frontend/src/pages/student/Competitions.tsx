import React, { useState } from 'react';
import { Plus, Search, Trophy, Calendar, ExternalLink, Trash2, Edit2, Medal, X } from 'lucide-react';
import '../../styles/pages.css';

interface Competition {
  _id: string;
  name: string;
  organizer: string;
  position?: string;
  date: string;
  certificate_link?: string;
}

export const StudentCompetitions: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([
    {
      _id: '1',
      name: 'Smart India Hackathon',
      organizer: 'Ministry of Education, India',
      position: '1st Place',
      date: '2024-01-15',
      certificate_link: 'https://example.com/cert',
    },
    {
      _id: '2',
      name: 'ACM ICPC Regional',
      organizer: 'ACM',
      position: 'Top 50',
      date: '2023-12-10',
    },
    {
      _id: '3',
      name: 'Google Code Jam',
      organizer: 'Google',
      position: 'Round 2 Qualifier',
      date: '2023-09-20',
    },
    {
      _id: '4',
      name: 'Microsoft Imagine Cup',
      organizer: 'Microsoft',
      position: '2nd Place',
      date: '2024-03-05',
      certificate_link: 'https://example.com/cert2',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    position: '',
    date: '',
    certificate_link: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCompetition) {
      setCompetitions(
        competitions.map((c) =>
          c._id === editingCompetition._id ? { ...c, ...formData } : c
        )
      );
    } else {
      const newCompetition: Competition = {
        _id: Date.now().toString(),
        ...formData,
      };
      setCompetitions([newCompetition, ...competitions]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this competition?')) {
      setCompetitions(competitions.filter((c) => c._id !== id));
    }
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
                  <button onClick={() => handleOpenModal(competition)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="delete" onClick={() => handleDelete(competition._id)}>
                    <Trash2 size={16} />
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
    </div>
  );
};

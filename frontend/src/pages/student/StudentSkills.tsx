import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Award,
  Star,
  TrendingUp,
  PencilLine,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import type { StudentSkill } from '../../types';
import { SKILL_CATALOG, SKILL_CATEGORIES } from '../../constants/skillCatalog';

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

interface Skill {
  id: string;
  category?: string;
  name: string;
  level: SkillLevel;
  verified: boolean;
  endorsements: number;
  progress: number;
}

const toUiSkill = (skill: StudentSkill, fallbackId: string): Skill => ({
  id: skill._id || fallbackId,
  category: skill.category || 'General',
  name: skill.name,
  level: skill.level,
  verified: skill.verified,
  endorsements: skill.endorsements,
  progress: skill.progress,
});

const isDemoStudentAccount = (userId?: string, email?: string) => {
  return Boolean(userId?.startsWith('demo-') || email?.startsWith('demo.'));
};

export const StudentSkills: React.FC = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id'>>({
    category: '',
    name: 'New Skill',
    level: 'Beginner' as const,
    verified: false,
    endorsements: 0,
    progress: 10,
  });
  const [newSkillName, setNewSkillName] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');

  const resetSkillForm = () => {
    setEditingSkillId(null);
    setNewSkill({
      category: '',
      name: 'New Skill',
      level: 'Beginner' as const,
      verified: false,
      endorsements: 0,
      progress: 10,
    });
    setNewSkillName('');
    setCustomSkillName('');
  };

  const openSkillModal = (skill?: Skill) => {
    if (!skill) {
      resetSkillForm();
      setIsAddSkillModalOpen(true);
      return;
    }

    const matchesCatalog = Boolean(skill.category && SKILL_CATALOG[skill.category]?.includes(skill.name));
    setEditingSkillId(skill.id);
    setNewSkill({
      category: skill.category || '',
      name: skill.name,
      level: skill.level,
      verified: skill.verified,
      endorsements: skill.endorsements,
      progress: skill.progress,
    });
    setNewSkillName(matchesCatalog ? skill.name : '__custom__');
    setCustomSkillName(matchesCatalog ? '' : skill.name);
    setIsAddSkillModalOpen(true);
  };

  useEffect(() => {
    const fetchSkills = async () => {
      if ((!user?.id && !user?.email) || user?.userType !== 'student') return;

      if (isDemoStudentAccount(user?.id, user?.email)) {
        setIsLoadingSkills(false);
        return;
      }

      try {
        setIsLoadingSkills(true);
        setApiError(null);

        const studentIdentifier = user.email || user.id;
        const skillsFromApi = await studentAPI.getSkills(studentIdentifier);

        if (!skillsFromApi.length) {
          setSkills([]);
          return;
        }

        setSkills(skillsFromApi.map((skill, index) => toUiSkill(skill, `skill-${index + 1}`)));
      } catch {
        setApiError('Unable to load skills from server. Showing local data.');
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [user?.email, user?.id, user?.userType]);

  const handleOpenAddSkillModal = () => {
    openSkillModal();
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSkill.category) {
      setApiError('Please select a skill category first.');
      return;
    }

    const resolvedName = newSkillName === '__custom__' ? customSkillName.trim() : newSkillName.trim();
    if (!resolvedName) {
      setApiError('Please select or enter a skill name.');
      return;
    }

    if ((!user?.id && !user?.email) || user.userType !== 'student') {
      setApiError('Student account is required to save skills.');
      return;
    }

    const payload: Omit<StudentSkill, '_id'> = {
      category: newSkill.category,
      name: resolvedName,
      level: newSkill.level,
      verified: false,
      endorsements: Math.max(0, newSkill.endorsements),
      progress: Math.min(100, Math.max(0, newSkill.progress)),
    };

    if (isDemoStudentAccount(user?.id, user?.email)) {
      setApiMessage('Skill saved locally for demo account.');
      setSkills((prevSkills) => [...prevSkills, toUiSkill(payload, `skill-${prevSkills.length + 1}`)]);
      return;
    }

    try {
      setIsSubmittingSkill(true);
      setApiError(null);
      setApiMessage(null);

      const studentIdentifier = user.email || user.id;
      const response = editingSkillId
        ? await studentAPI.updateSkill(studentIdentifier, editingSkillId, payload)
        : await studentAPI.addSkill(studentIdentifier, payload);

      if (Array.isArray(response.skills)) {
        setSkills(response.skills.map((skill, index) => toUiSkill(skill, `skill-${index + 1}`)));
      } else if (response.skill) {
        setSkills((prevSkills) => {
          const mappedSkill = toUiSkill(response.skill, `skill-${prevSkills.length + 1}`);
          if (!editingSkillId) {
            return [...prevSkills, mappedSkill];
          }

          return prevSkills.map((skill) => (skill.id === editingSkillId ? mappedSkill : skill));
        });
      }

      setApiMessage(editingSkillId ? 'Skill updated and saved to database.' : 'Skill added and saved to database.');
      setIsAddSkillModalOpen(false);
      resetSkillForm();
    } catch {
      setApiError('Unable to save skill to server. Please try again.');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const skillCategoryMap = skills.reduce((acc, skill) => {
    const categoryName = skill.category || 'General';
    acc.set(categoryName, (acc.get(categoryName) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  const skillCategories = Array.from(skillCategoryMap.entries()).map(([name, count]) => ({ name, count }));

  const pendingVerifications = skills
    .filter((skill) => !skill.verified)
    .map((skill) => ({
      skill: skill.name,
      requestedDate: 'Awaiting verification',
      status: 'Pending Faculty',
    }));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>My Skills</h1>
          <p>Manage and verify your technical skills</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={handleOpenAddSkillModal}>
            <Plus size={18} />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {isLoadingSkills && (
        <p style={{ marginBottom: '16px', color: '#475569', fontSize: '13px' }}>
          Loading skills from database...
        </p>
      )}
      {apiMessage && (
        <p style={{ marginBottom: '16px', color: '#166534', fontSize: '13px' }}>{apiMessage}</p>
      )}
      {apiError && (
        <p style={{ marginBottom: '16px', color: '#b91c1c', fontSize: '13px' }}>{apiError}</p>
      )}

      {isAddSkillModalOpen && (
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
              maxWidth: '520px',
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
                {editingSkillId ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button
                onClick={() => setIsAddSkillModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '20px',
                  color: '#64748b',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Close add skill dialog"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSkill} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'grid', gap: '8px', padding: '12px', border: '1px solid #dbe4f3', borderRadius: '12px', background: '#f8fbff' }}>
                  <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Skill Category</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                    {SKILL_CATEGORIES.map((category) => {
                      const isActive = newSkill.category === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setNewSkill((prev) => ({ ...prev, category }));
                            setNewSkillName('');
                            setCustomSkillName('');
                          }}
                          style={{
                            border: `1px solid ${isActive ? '#2563eb' : '#cbd5e1'}`,
                            background: isActive ? '#eff6ff' : '#ffffff',
                            color: isActive ? '#1d4ed8' : '#334155',
                            borderRadius: '12px',
                            padding: '10px 12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            boxShadow: isActive ? '0 8px 18px rgba(37, 99, 235, 0.12)' : 'none',
                          }}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                  {!newSkill.category && (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Pick a category first to load matching skills.</span>
                  )}
                </div>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Skill Name
                  <select
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    disabled={!newSkill.category}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: newSkillName ? '#0f172a' : '#94a3b8',
                    }}
                  >
                    <option value="" disabled hidden>Select skill</option>
                    {(newSkill.category ? SKILL_CATALOG[newSkill.category] || [] : []).map((skillNameOption) => (
                      <option key={skillNameOption} value={skillNameOption}>{skillNameOption}</option>
                    ))}
                    <option value="__custom__">Other (type manually)</option>
                  </select>
                </label>

                {newSkillName === '__custom__' && (
                  <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                    Custom Skill Name
                    <input
                      type="text"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </label>
                )}

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Level
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill((prev) => ({ ...prev, level: e.target.value as SkillLevel }))}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: '#64748b',
                    }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                    Progress (%)
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newSkill.progress}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, progress: Number(e.target.value) || 0 }))}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                    Endorsements
                    <input
                      type="number"
                      min={0}
                      value={newSkill.endorsements}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, endorsements: Number(e.target.value) || 0 }))}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </label>
                </div>

                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Verification is handled by faculty after review.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddSkillModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmittingSkill}>
                  {isSubmittingSkill ? 'Saving...' : editingSkillId ? 'Save Changes' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Total Skills</h3>
            <div className="stat-value">{skills.length}</div>
          </div>
          <div className="stat-icon blue">
            <Award size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Verified Skills</h3>
            <div className="stat-value">{skills.filter(s => s.verified).length}</div>
          </div>
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Endorsements</h3>
            <div className="stat-value">{skills.reduce((acc, s) => acc + s.endorsements, 0)}</div>
          </div>
          <div className="stat-icon purple">
            <Star size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Pending Verification</h3>
            <div className="stat-value">{pendingVerifications.length}</div>
          </div>
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/*Skills List*/}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>All Skills</h2>
              <p>Your technical and soft skills</p>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ 
                  padding: '16px 20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{skill.name}</h4>
                      <span style={{
                        padding: '2px 8px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>
                        {skill.category || 'General'}
                      </span>
                      {skill.verified && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          padding: '2px 8px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500
                        }}>
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      )}
                      <span style={{ 
                        padding: '2px 8px',
                        background: skill.level === 'Advanced' ? '#dbeafe' : skill.level === 'Intermediate' ? '#fef3c7' : '#f1f5f9',
                        color: skill.level === 'Advanced' ? '#1d4ed8' : skill.level === 'Intermediate' ? '#b45309' : '#64748b',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500
                      }}>
                        {skill.level}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          height: '6px', 
                          background: '#e2e8f0', 
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${skill.progress}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                      </div>
                      <span style={{ fontSize: '13px', color: '#64748b', minWidth: '40px' }}>{skill.progress}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{skill.endorsements}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>endorsements</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openSkillModal(skill)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <PencilLine size={14} />
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Pending Verifications */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h2>
                  <Clock size={20} />
                  Pending Verifications
                </h2>
                <p>Skills awaiting verification</p>
              </div>
            </div>
            <div className="card-body">
              {pendingVerifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingVerifications.map((item, index) => (
                    <div key={index} style={{ 
                      padding: '16px', 
                      background: '#fef3c7', 
                      borderRadius: '10px' 
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                        {item.skill}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Requested: {item.requestedDate}
                      </p>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 500, 
                        color: '#b45309'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  No pending verifications
                </p>
              )}
            </div>
          </div>

          {/* Skill Categories */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <TrendingUp size={20} />
                  Skill Categories
                </h2>
                <p>Skills by category</p>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {skillCategories.map((category, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>{category.name}</span>
                    <span style={{ 
                      padding: '4px 12px',
                      background: '#dbeafe',
                      color: '#3b82f6',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}>
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

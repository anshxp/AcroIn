import React, { useEffect, useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { facultyAPI } from '../../services/api';
import type { Faculty } from '../../types';
import { SKILL_CATALOG, SKILL_CATEGORIES } from '../../constants/skillCatalog';
import '../../styles/pages.css';
import './FacultyProfile.css';

interface FacultyProfileForm {
  firstname: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  experience: number;
  dob: string;
  linkedin: string;
  headof: string[];
  subjects: string[];
  techstacks: string[];
}

const toList = (value?: string[]) => (Array.isArray(value) ? value : []);

export const FacultyProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newClub, setNewClub] = useState('');
  const [apiMessage, setApiMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const [profile, setProfile] = useState<FacultyProfileForm>({
    firstname: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    qualification: '',
    experience: 0,
    dob: '',
    linkedin: '',
    headof: [],
    subjects: [],
    techstacks: [],
  });

  const [draftProfile, setDraftProfile] = useState<FacultyProfileForm>(profile);

  const loadFacultyProfile = async () => {
    try {
      setIsLoading(true);
      setApiError('');

      const faculty: Faculty = await facultyAPI.getProfile();
      const normalized: FacultyProfileForm = {
        firstname: faculty.firstname || '',
        lastName: faculty.lastName || '',
        email: faculty.email || '',
        phone: faculty.phone || '',
        department: faculty.department || '',
        designation: faculty.designation || '',
        qualification: faculty.qualification || '',
        experience: typeof faculty.experience === 'number' ? faculty.experience : 0,
        dob: faculty.dob || '',
        linkedin: faculty.linkedin || '',
        headof: toList(faculty.headof),
        subjects: toList(faculty.subjects),
        techstacks: toList(faculty.techstacks),
      };

      setProfile(normalized);
      setDraftProfile(normalized);
      if (user) {
        const syncedUser = {
          ...user,
          email: normalized.email,
          name: `${normalized.firstname} ${normalized.lastName}`.trim() || user.name,
          firstname: normalized.firstname,
          lastName: normalized.lastName,
          department: normalized.department,
          designation: normalized.designation,
        };
        setUser(syncedUser);
        localStorage.setItem('user', JSON.stringify(syncedUser));
      }
    } catch {
      setApiError('Unable to load faculty profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyProfile();
  }, []);

  const beginEdit = () => {
    setApiMessage('');
    setApiError('');
    setDraftProfile(profile);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftProfile(profile);
    setIsEditing(false);
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      setApiError('');
      setApiMessage('');

      const payload = {
        email: draftProfile.email.trim(),
        firstname: draftProfile.firstname.trim(),
        lastName: draftProfile.lastName.trim(),
        phone: draftProfile.phone.trim(),
        department: draftProfile.department.trim(),
        designation: draftProfile.designation.trim(),
        qualification: draftProfile.qualification.trim(),
        experience: Number.isFinite(draftProfile.experience) ? draftProfile.experience : 0,
        dob: draftProfile.dob,
        linkedin: draftProfile.linkedin.trim(),
        headof: draftProfile.headof,
        subjects: draftProfile.subjects,
        techstacks: draftProfile.techstacks,
      };

      const updated = await facultyAPI.updateProfile(payload);

      const next: FacultyProfileForm = {
        firstname: updated.firstname || '',
        lastName: updated.lastName || '',
        email: updated.email || draftProfile.email,
        phone: updated.phone || '',
        department: updated.department || '',
        designation: updated.designation || '',
        qualification: updated.qualification || '',
        experience: typeof updated.experience === 'number' ? updated.experience : 0,
        dob: updated.dob || '',
        linkedin: updated.linkedin || '',
        headof: toList(updated.headof),
        subjects: toList(updated.subjects),
        techstacks: toList(updated.techstacks),
      };

      setProfile(next);
      setDraftProfile(next);
      setIsEditing(false);
      setApiMessage('Profile updated successfully.');

      if (user) {
        const syncedUser = {
          ...user,
          email: next.email,
          name: `${next.firstname} ${next.lastName}`.trim() || user.name,
          firstname: next.firstname,
          lastName: next.lastName,
          department: next.department,
          designation: next.designation,
        };
        setUser(syncedUser);
        localStorage.setItem('user', JSON.stringify(syncedUser));
      }
    } catch {
      setApiError('Unable to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkillCategory) {
      setApiError('Please select a skill category first.');
      return;
    }

    const source = newSkillName === '__custom__' ? customSkillName : newSkillName;
    const normalized = source.trim();
    if (!normalized) return;

    if (draftProfile.techstacks.includes(normalized)) {
      setNewSkillName('');
      setCustomSkillName('');
      return;
    }

    setDraftProfile((prev) => ({ ...prev, techstacks: [...prev.techstacks, normalized] }));
    setNewSkillName('');
    setCustomSkillName('');
  };

  const removeSkill = (skill: string) => {
    setDraftProfile((prev) => ({
      ...prev,
      techstacks: prev.techstacks.filter((item) => item !== skill),
    }));
  };

  const addSubject = () => {
    const normalized = newSubject.trim();
    if (!normalized) return;

    if (draftProfile.subjects.includes(normalized)) {
      setNewSubject('');
      return;
    }

    setDraftProfile((prev) => ({ ...prev, subjects: [...prev.subjects, normalized] }));
    setNewSubject('');
  };

  const removeSubject = (subject: string) => {
    setDraftProfile((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((item) => item !== subject),
    }));
  };

  const addClub = () => {
    const normalized = newClub.trim();
    if (!normalized) return;

    if (draftProfile.headof.includes(normalized)) {
      setNewClub('');
      return;
    }

    setDraftProfile((prev) => ({ ...prev, headof: [...prev.headof, normalized] }));
    setNewClub('');
  };

  const removeClub = (club: string) => {
    setDraftProfile((prev) => ({
      ...prev,
      headof: prev.headof.filter((item) => item !== club),
    }));
  };

  const current = isEditing ? draftProfile : profile;
  const fullName = `${current.firstname} ${current.lastName}`.trim() || 'Faculty Member';

  if (isLoading) {
    return (
      <div className="page-container">
        <p className="page-subtitle">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container faculty-profile-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>{fullName}</h1>
          <p>{current.designation || 'Faculty'} • {current.department || 'Department not set'}</p>
        </div>
        <div className="page-actions">
          {!isEditing && (
            <button className="btn-primary" onClick={beginEdit} type="button">Edit Profile</button>
          )}
          {isEditing && (
            <>
              <button className="btn-secondary" onClick={cancelEdit} type="button">Cancel</button>
              <button className="btn-primary" onClick={saveProfile} type="button" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {apiMessage && <p className="faculty-profile-message success">{apiMessage}</p>}
      {apiError && <p className="faculty-profile-message error">{apiError}</p>}

      <div className="faculty-profile-grid">
        <section className="card faculty-profile-card">
          <h2>Contact Information</h2>
          <div className="faculty-profile-form-grid">
            <label>
              Email
              <input
                value={current.email}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, email: event.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                value={current.phone}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, phone: event.target.value })}
              />
            </label>
            <label className="faculty-profile-full-width">
              LinkedIn
              <input
                value={current.linkedin}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, linkedin: event.target.value })}
              />
            </label>
            <label>
              Date of Birth
              <input
                type="date"
                value={current.dob}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, dob: event.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="card faculty-profile-card">
          <h2>Professional Information</h2>
          <div className="faculty-profile-form-grid">
            <label>
              First Name
              <input
                value={current.firstname}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, firstname: event.target.value })}
              />
            </label>
            <label>
              Last Name
              <input
                value={current.lastName}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, lastName: event.target.value })}
              />
            </label>
            <label>
              Department
              <input
                value={current.department}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, department: event.target.value })}
              />
            </label>
            <label>
              Designation
              <input
                value={current.designation}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, designation: event.target.value })}
              />
            </label>
            <label>
              Qualification
              <input
                value={current.qualification}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, qualification: event.target.value })}
              />
            </label>
            <label>
              Experience (Years)
              <input
                type="number"
                min="0"
                value={String(current.experience || 0)}
                disabled={!isEditing}
                onChange={(event) => setDraftProfile({ ...draftProfile, experience: Number(event.target.value) })}
              />
            </label>
          </div>
        </section>

        <section className="card faculty-profile-card faculty-profile-full">
          <h2>Subjects & Clubs</h2>
          <div className="faculty-badge-section">
            <div className="faculty-badge-heading-row">
              <h3>Subjects</h3>
              {isEditing && (
                <div className="faculty-inline-add">
                  <input
                    value={newSubject}
                    onChange={(event) => setNewSubject(event.target.value)}
                    placeholder="Add subject"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addSubject();
                      }
                    }}
                  />
                  <button type="button" className="btn-secondary" onClick={addSubject}>Add</button>
                </div>
              )}
            </div>
            <div className="faculty-badges">
              {current.subjects.length === 0 && <span className="faculty-empty">No subjects added</span>}
              {current.subjects.map((subject) => (
                <span key={subject} className="faculty-badge">
                  {subject}
                  {isEditing && (
                    <button type="button" onClick={() => removeSubject(subject)} aria-label={`Remove ${subject}`}>
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="faculty-badge-section">
            <div className="faculty-badge-heading-row">
              <h3>Head Of</h3>
              {isEditing && (
                <div className="faculty-inline-add">
                  <input
                    value={newClub}
                    onChange={(event) => setNewClub(event.target.value)}
                    placeholder="Add club"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addClub();
                      }
                    }}
                  />
                  <button type="button" className="btn-secondary" onClick={addClub}>Add</button>
                </div>
              )}
            </div>
            <div className="faculty-badges">
              {current.headof.length === 0 && <span className="faculty-empty">No clubs assigned</span>}
              {current.headof.map((club) => (
                <span key={club} className="faculty-badge">
                  {club}
                  {isEditing && (
                    <button type="button" onClick={() => removeClub(club)} aria-label={`Remove ${club}`}>
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="card faculty-profile-card faculty-profile-full">
          <h2>Tech Stack</h2>
          <div className="faculty-badges">
            {current.techstacks.length === 0 && <span className="faculty-empty">No skills added</span>}
            {current.techstacks.map((skill) => (
              <span key={skill} className="faculty-badge">
                {skill}
                {isEditing && (
                  <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="faculty-skill-add">
              <div className="faculty-skill-category-panel">
                <div className="faculty-skill-category-label">Skill Category</div>
                <div className="faculty-skill-category-picker">
                {SKILL_CATEGORIES.map((category) => {
                  const isActive = newSkillCategory === category;
                  return (
                    <button
                      type="button"
                      key={category}
                      className={`faculty-skill-category-chip ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setNewSkillCategory(category);
                        setNewSkillName('');
                        setCustomSkillName('');
                      }}
                    >
                      {category}
                    </button>
                  );
                })}
                </div>
              </div>
              <select
                value={newSkillName}
                onChange={(event) => setNewSkillName(event.target.value)}
                disabled={!newSkillCategory}
                className="faculty-skill-select"
              >
                <option value="" disabled hidden>Select skill</option>
                {(newSkillCategory ? SKILL_CATALOG[newSkillCategory] || [] : []).map((skillName) => (
                  <option key={skillName} value={skillName}>{skillName}</option>
                ))}
                <option value="__custom__">Other (type manually)</option>
              </select>
              {newSkillName === '__custom__' && (
                <input
                  placeholder="Enter custom skill"
                  value={customSkillName}
                  onChange={(event) => setCustomSkillName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSkill();
                    }
                  }}
                />
              )}
              <button className="btn-primary" type="button" onClick={addSkill}>
                <Plus size={14} />
                Add
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

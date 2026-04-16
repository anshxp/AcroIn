import React, { useEffect, useState } from 'react';
import { 
  Camera, 
  Save, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  MapPin,
  GraduationCap,
  Edit3,
  Briefcase,
  Calendar,
  Link as LinkIcon,
  CheckCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { certificateAPI, projectAPI, studentAPI } from '../../services/api';
import type { StudentExperience, StudentSkill } from '../../types';
import '../../styles/profile.css';

interface ProfileForm {
  name: string;
  roll: string;
  email: string;
  department: string;
  year: string;
  semester: string;
  phone: string;
  birthday: string;
  address: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  bio: string;
  tech_stack: string[];
}

const isDemoStudentAccount = (userId?: string, email?: string) => {
  return Boolean(userId?.startsWith('demo-') || email?.startsWith('demo.'));
};

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: 'New Experience',
    company: 'Company Name',
    duration: 'Jan 2026 - Present',
    type: 'Internship',
    verified: false,
  });
  const [projectCount, setProjectCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  
  const [profile, setProfile] = useState<ProfileForm>({
    name: user?.name || 'Demo Student',
    roll: '21CS001',
    email: user?.email || 'demo.student@acroin.edu',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '6th Semester',
    phone: '+91 9876543210',
    birthday: '',
    address: '',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev',
    location: 'Indore, MP',
    bio: 'Passionate software developer with interest in web technologies and machine learning. Currently exploring AI/ML and building full-stack applications.',
    tech_stack: [],
  });

  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [experience, setExperience] = useState<StudentExperience[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const profileImageInputRef = React.useRef<HTMLInputElement>(null);
  const coverImageInputRef = React.useRef<HTMLInputElement>(null);

  const persistProfile = async (
    nextProfile: ProfileForm,
    nextSkills: StudentSkill[],
    nextExperience: StudentExperience[],
    successMessage = 'Profile saved to database.',
    closeEditor = false
  ) => {
    if ((!user?.id && !user?.email) || user?.userType !== 'student') {
      setApiError('Student account is required to save profile.');
      return false;
    }

    if (isDemoStudentAccount(user?.id, user?.email)) {
      setApiMessage(successMessage);
      if (closeEditor) {
        setIsEditing(false);
      }
      return true;
    }

    try {
      setIsSaving(true);
      setApiError(null);
      setApiMessage(null);

      const identifier = user.email || user.id;
      const payload = {
        name: nextProfile.name.trim(),
        roll: nextProfile.roll.trim(),
        email: nextProfile.email.trim(),
        department: nextProfile.department.trim(),
        year: nextProfile.year.trim(),
        semester: nextProfile.semester.trim(),
        phone: nextProfile.phone.trim(),
        birthday: nextProfile.birthday,
        address: nextProfile.address.trim(),
        linkedin: nextProfile.linkedin.trim(),
        github: nextProfile.github.trim(),
        portfolio: nextProfile.portfolio.trim(),
        location: nextProfile.location.trim(),
        bio: nextProfile.bio.trim(),
        tech_stack: nextProfile.tech_stack,
        skills: nextSkills,
        experiences: nextExperience,
      };

      await studentAPI.updateProfile(identifier, payload);
      setApiMessage(successMessage);
      if (closeEditor) {
        setIsEditing(false);
      }
      return true;
    } catch {
      setApiError('Unable to save profile. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    profileScore: 85,
    skillsVerified: skills.filter((skill) => skill.verified).length,
    projectsCount: projectCount,
    certificatesCount: certificateCount,
  };

  useEffect(() => {
    const loadStudentProfile = async () => {
      if ((!user?.id && !user?.email) || user?.userType !== 'student') {
        return;
      }

      if (isDemoStudentAccount(user?.id, user?.email)) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setApiError(null);
        const identifier = user.email || user.id;
        const student = await studentAPI.getProfile(identifier);

        const normalizedSkills = Array.isArray(student.skills)
          ? student.skills
          : (student.tech_stack || []).map((name) => ({
              name,
              level: 'Beginner' as const,
              verified: false,
              endorsements: 0,
              progress: 10,
            }));

        setSkills(normalizedSkills);
        setExperience(Array.isArray(student.experiences) ? student.experiences : []);
        setProfileImageUrl(student.profile_image || '');
        setCoverImageUrl(student.cover_image || '');
        setProfile({
          name: student.name || user.name || 'Demo Student',
          roll: student.roll || 'NA',
          email: student.email || user.email || '',
          department: student.department || 'Department',
          year: student.year || '',
          semester: student.semester || '',
          phone: student.phone || '',
          birthday: student.birthday || '',
          address: student.address || '',
          linkedin: student.linkedin || '',
          github: student.github || '',
          portfolio: student.portfolio || '',
          location: student.location || '',
          bio: student.bio || '',
          tech_stack: normalizedSkills.map((skill) => skill.name),
        });
      } catch {
        setApiError('Unable to load profile from database.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentProfile();
  }, [user?.email, user?.id, user?.name, user?.userType]);

  useEffect(() => {
    const loadStudentCounts = async () => {
      if ((!user?.id && !user?.email) || user?.userType !== 'student') {
        return;
      }

      if (isDemoStudentAccount(user?.id, user?.email)) {
        setProjectCount(0);
        setCertificateCount(0);
        return;
      }

      try {
        const identifier = user.email || user.id;
        const [projects, certificates] = await Promise.all([
          projectAPI.getByStudent(identifier),
          certificateAPI.getByStudent(identifier),
        ]);
        setProjectCount(projects.length);
        setCertificateCount(certificates.length);
      } catch {
        setProjectCount(0);
        setCertificateCount(0);
      }
    };

    loadStudentCounts();
  }, [user?.email, user?.id, user?.userType]);

  const handleAddSkill = async () => {
    const normalizedSkill = newSkill.trim();
    if (!normalizedSkill) {
      return;
    }

    if (!profile.tech_stack.includes(normalizedSkill)) {
      const nextProfile: ProfileForm = {
        ...profile,
        tech_stack: [...profile.tech_stack, normalizedSkill],
      };
      const nextSkills: StudentSkill[] = [
        ...skills,
        {
          name: normalizedSkill,
          level: 'Beginner',
          verified: false,
          endorsements: 0,
          progress: 10,
        },
      ];

      setProfile(nextProfile);
      setSkills(nextSkills);
      setNewSkill('');
      await persistProfile(nextProfile, nextSkills, experience, 'Skill saved to database.');
    }
  };

  const handleOpenExperienceModal = () => {
    setNewExperience({
      title: 'New Experience',
      company: 'Company Name',
      duration: 'Jan 2026 - Present',
      type: 'Internship',
      verified: false,
    });
    setIsExperienceModalOpen(true);
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextExperience: StudentExperience[] = [
      {
        title: newExperience.title.trim() || 'New Experience',
        company: newExperience.company.trim() || 'Company Name',
        duration: newExperience.duration.trim() || 'Jan 2026 - Present',
        type: newExperience.type.trim() || 'Internship',
        verified: newExperience.verified,
      },
      ...experience,
    ];

    setExperience(nextExperience);
    await persistProfile(profile, skills, nextExperience, 'Experience saved to database.');

    setIsExperienceModalOpen(false);
  };

  const handleRemoveSkill = async (skill: string) => {
    const nextSkills = skills.filter((item) => item.name !== skill);
    const nextProfile: ProfileForm = {
      ...profile,
      tech_stack: profile.tech_stack.filter((s) => s !== skill),
    };

    setSkills(nextSkills);
    setProfile(nextProfile);
    await persistProfile(nextProfile, nextSkills, experience, 'Skill update saved to database.');
  };

  const handleSave = async () => {
    if (!profile.birthday) {
      setApiError('Please add your birthday before saving profile.');
      return;
    }

    if (!profile.address.trim()) {
      setApiError('Please add your address before saving profile.');
      return;
    }

    await persistProfile(profile, skills, experience, 'Profile saved to database.', true);
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isDemoStudentAccount(user?.id, user?.email)) {
      setApiMessage('Profile image upload not supported for demo account.');
      return;
    }

    if (!user?.email && !user?.id) {
      setApiError('User identification required to upload image.');
      return;
    }

    try {
      setIsSaving(true);
      const identifier = user.email || user.id;
      const result = await studentAPI.uploadProfileImage(identifier, file);
      setProfileImageUrl(result.profile_image);
      setApiMessage('Profile image uploaded successfully.');
    } catch {
      setApiError('Failed to upload profile image.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isDemoStudentAccount(user?.id, user?.email)) {
      setApiMessage('Cover image upload not supported for demo account.');
      return;
    }

    if (!user?.email && !user?.id) {
      setApiError('User identification required to upload image.');
      return;
    }

    try {
      setIsSaving(true);
      const identifier = user.email || user.id;
      const result = await studentAPI.uploadCoverImage(identifier, file);
      setCoverImageUrl(result.cover_image);
      setApiMessage('Cover image uploaded successfully.');
    } catch {
      setApiError('Failed to upload cover image.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="profile-page">
      {isLoading && (
        <p style={{ marginBottom: '16px', color: '#475569', fontSize: '13px' }}>
          Loading profile...
        </p>
      )}
      {apiMessage && (
        <p style={{ marginBottom: '16px', color: '#166534', fontSize: '13px' }}>{apiMessage}</p>
      )}
      {apiError && (
        <p style={{ marginBottom: '16px', color: '#b91c1c', fontSize: '13px' }}>{apiError}</p>
      )}

      {/*Profile Header Card*/}
      <div className="profile-header-card">
        <div 
          className="profile-cover"
          style={{
            backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!coverImageUrl && <div className="profile-cover-gradient"></div>}
          {isEditing && (
            <>
              <button 
                type="button"
                className="cover-edit-btn"
                onClick={() => coverImageInputRef.current?.click()}
                disabled={isSaving}
              >
                <Camera size={16} />
                <span>{isSaving ? 'Uploading...' : 'Change Cover'}</span>
              </button>
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
        
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div 
              className="profile-avatar"
              style={{
                backgroundImage: profileImageUrl ? `url(${profileImageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!profileImageUrl && <span>{getInitials(profile.name)}</span>}
              {isEditing && (
                <>
                  <button 
                    type="button"
                    className="avatar-edit-btn"
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={isSaving}
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </div>
            <div className="profile-verified-badge">
              <CheckCircle size={16} />
              <span>Verified</span>
            </div>
          </div>
          
          <div className="profile-info-section">
            <div className="profile-name-row">
              <div>
                <h1 className="profile-name">{profile.name}</h1>
                <p className="profile-tagline">{profile.department}</p>
                <div className="profile-meta">
                  <span><GraduationCap size={14} /> {profile.roll}</span>
                  <span><Calendar size={14} /> {profile.year}</span>
                  <span><MapPin size={14} /> {profile.location}</span>
                </div>
              </div>
              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                      <Save size={16} />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={() => setIsEditing(true)}>
                    <Edit3 size={16} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Stats Bar */}
        <div className="profile-stats-bar">
          <div className="profile-stat-item">
            <div className="stat-value">{stats.profileScore}%</div>
            <div className="stat-label">Profile Score</div>
          </div>
          <div className="profile-stat-item">
            <div className="stat-value">{stats.skillsVerified}</div>
            <div className="stat-label">Skills Verified</div>
          </div>
          <div className="profile-stat-item">
            <div className="stat-value">{stats.projectsCount}</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="profile-stat-item">
            <div className="stat-value">{stats.certificatesCount}</div>
            <div className="stat-label">Certificates</div>
          </div>
        </div>
      </div>

      {isExperienceModalOpen && (
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
              maxWidth: '540px',
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
                Add Experience
              </h3>
              <button
                type="button"
                onClick={() => setIsExperienceModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '20px',
                  color: '#64748b',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Close add experience dialog"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddExperience} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Title
                  <input
                    type="text"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Company
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                    Duration
                    <input
                      type="text"
                      value={newExperience.duration}
                      onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                    Type
                    <input
                      type="text"
                      value={newExperience.type}
                      onChange={(e) => setNewExperience({ ...newExperience, type: e.target.value })}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </label>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newExperience.verified}
                    onChange={(e) => setNewExperience({ ...newExperience, verified: e.target.checked })}
                  />
                  Verified experience
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsExperienceModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profile-grid">
        {/* Left Column */}
        <div className="profile-left-column">
          {/* About Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>About</h2>
                <p>Tell others about yourself</p>
              </div>
            </div>
            <div className="card-body">
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="profile-textarea"
                  rows={4}
                  placeholder="Write something about yourself..."
                />
              ) : (
                <p className="profile-bio">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <Star size={20} />
                  Tech Stack & Skills
                </h2>
                <p>Your technical expertise</p>
              </div>
            </div>
            <div className="card-body">
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <div key={`${skill.name}-${index}`} className={`skill-tag skill-color-${index % 6}`}>
                    <span>{skill.name}</span>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="skill-remove"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="add-skill-form">
                  <input
                    type="text"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="skill-input"
                  />
                  <button onClick={handleAddSkill} className="btn-add-skill">
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <Briefcase size={20} />
                  Experience
                </h2>
                <p>Internships & work history</p>
              </div>
              {isEditing && (
                <button type="button" className="btn-add" onClick={handleOpenExperienceModal}>
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="experience-list">
                {experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-icon">
                      <Briefcase size={20} />
                    </div>
                    <div className="experience-content">
                      <div className="experience-header">
                        <h4>{exp.title}</h4>
                        {exp.verified && (
                          <span className="verified-tag">
                            <CheckCircle size={12} />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="experience-company">{exp.company}</p>
                      <div className="experience-meta">
                        <span>{exp.duration}</span>
                        <span className="experience-type">{exp.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right-column">
          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Contact Information</h2>
                <p>How to reach you</p>
              </div>
            </div>
            <div className="card-body">
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon">
                    <Mail size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Email</span>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="contact-input"
                      />
                    ) : (
                      <span className="contact-value">{profile.email}</span>
                    )}
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <Phone size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Phone</span>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="contact-input"
                      />
                    ) : (
                      <span className="contact-value">{profile.phone}</span>
                    )}
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <Calendar size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Birthday</span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profile.birthday}
                        onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                        className="contact-input"
                        required
                      />
                    ) : (
                      <span className="contact-value">{profile.birthday || 'Not added'}</span>
                    )}
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Address</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        className="contact-input"
                        placeholder="Enter your address"
                        required
                      />
                    ) : (
                      <span className="contact-value">{profile.address || 'Not added'}</span>
                    )}
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon linkedin">
                    <Linkedin size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">LinkedIn</span>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.linkedin}
                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        className="contact-input"
                      />
                    ) : (
                      profile.linkedin ? (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                          {profile.linkedin.replace('https://', '')}
                        </a>
                      ) : (
                        <span className="contact-value">Not added</span>
                      )
                    )}
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon github">
                    <Github size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">GitHub</span>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.github}
                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        className="contact-input"
                      />
                    ) : (
                      profile.github ? (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                          {profile.github.replace('https://', '')}
                        </a>
                      ) : (
                        <span className="contact-value">Not added</span>
                      )
                    )}
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon portfolio">
                    <LinkIcon size={18} />
                  </div>
                  <div className="contact-content">
                    <span className="contact-label">Portfolio</span>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.portfolio}
                        onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                        className="contact-input"
                      />
                    ) : (
                      profile.portfolio ? (
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="contact-link">
                          {profile.portfolio.replace('https://', '')}
                        </a>
                      ) : (
                        <span className="contact-value">Not added</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <GraduationCap size={20} />
                  Academic Information
                </h2>
                <p>Your academic details</p>
              </div>
            </div>
            <div className="card-body">
              <div className="academic-grid">
                <div className="academic-item">
                  <span className="academic-label">Roll Number</span>
                  <span className="academic-value">{profile.roll}</span>
                </div>
                <div className="academic-item">
                  <span className="academic-label">Department</span>
                  <span className="academic-value">{profile.department}</span>
                </div>
                <div className="academic-item">
                  <span className="academic-label">Year</span>
                  <span className="academic-value">{profile.year}</span>
                </div>
                <div className="academic-item">
                  <span className="academic-label">Semester</span>
                  <span className="academic-value">{profile.semester}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

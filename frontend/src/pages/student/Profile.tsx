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
import { SKILL_CATALOG, SKILL_CATEGORIES } from '../../constants/skillCatalog';
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
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
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
  const [verificationStatus, setVerificationStatus] = useState<'not_verified' | 'verified' | 'strongly_verified'>('not_verified');
  const [faceVerificationStatus, setFaceVerificationStatus] = useState<'none' | 'partial' | 'complete'>('none');
  const [isFaceUploading, setIsFaceUploading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<'front' | 'left' | 'right'>('front');
  const [faceShots, setFaceShots] = useState<{
    front?: { file: File; preview: string };
    left?: { file: File; preview: string };
    right?: { file: File; preview: string };
  }>({});
  const frontFaceInputRef = React.useRef<HTMLInputElement>(null);
  const leftFaceInputRef = React.useRef<HTMLInputElement>(null);
  const rightFaceInputRef = React.useRef<HTMLInputElement>(null);
  const faceVideoRef = React.useRef<HTMLVideoElement>(null);
  const faceCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const faceStreamRef = React.useRef<MediaStream | null>(null);
  
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
    skillsVerified: skills.filter((skill) => skill.verified).length,
    projectsCount: projectCount,
    certificatesCount: certificateCount,
  };

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semesterOptions = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester',
  ];

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
              category: 'General',
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
        setVerificationStatus(student.verificationStatus || 'not_verified');
        setFaceVerificationStatus(student.faceVerificationStatus || 'none');
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
    if (!newSkillCategory) {
      setApiError('Please select a skill category.');
      return;
    }

    const selectedName = newSkillName === '__custom__' ? customSkillName : newSkillName;
    const normalizedSkill = selectedName.trim();
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
          category: newSkillCategory,
          name: normalizedSkill,
          level: 'Beginner',
          verified: false,
          endorsements: 0,
          progress: 10,
        },
      ];

      setProfile(nextProfile);
      setSkills(nextSkills);
      setNewSkillCategory('');
      setNewSkillName('');
      setCustomSkillName('');
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

  const handleFaceShotSelected = (angle: 'front' | 'left' | 'right', file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setApiError('Only image files are allowed for face enrollment.');
      return;
    }

    setFaceShots((prev) => {
      if (prev[angle]?.preview) {
        URL.revokeObjectURL(prev[angle]!.preview);
      }

      return {
        ...prev,
        [angle]: {
          file,
          preview: URL.createObjectURL(file),
        },
      };
    });
  };

  const stopCamera = () => {
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach((track) => track.stop());
      faceStreamRef.current = null;
    }

    if (faceVideoRef.current) {
      faceVideoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const startCamera = async (angle: 'front' | 'left' | 'right') => {
    setCaptureMode(angle);
    setCameraError(null);

    try {
      if (faceStreamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      faceStreamRef.current = stream;

      if (faceVideoRef.current) {
        faceVideoRef.current.srcObject = stream;
        await faceVideoRef.current.play();
      }

      setIsCameraActive(true);
    } catch {
      setCameraError('Camera access failed. Allow camera permission or upload images manually.');
      setIsCameraActive(false);
    }
  };

  const captureCurrentFrame = async () => {
    if (!isCameraActive || !faceVideoRef.current || !faceCanvasRef.current) {
      setCameraError('Camera is not active.');
      return;
    }

    const video = faceVideoRef.current;
    const canvas = faceCanvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError('Unable to process camera frame.');
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((capturedBlob) => resolve(capturedBlob), 'image/jpeg', 0.92);
    });

    if (!blob) {
      setCameraError('Failed to capture image. Please try again.');
      return;
    }

    const file = new File([blob], `face-${captureMode}-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFaceShotSelected(captureMode, file);
    setCameraError(null);
  };

  const handleEnrollFace = async () => {
    if (isDemoStudentAccount(user?.id, user?.email)) {
      setApiMessage('Face enrollment is not supported for demo account.');
      return;
    }

    if (!user?.email && !user?.id) {
      setApiError('User identification required for face enrollment.');
      return;
    }

    if (!faceShots.front?.file || !faceShots.left?.file || !faceShots.right?.file) {
      setApiError('Please capture all three images: front, left, and right.');
      return;
    }

    try {
      setIsFaceUploading(true);
      setApiError(null);
      const identifier = user.email || user.id;
      const result = await studentAPI.enrollFace(identifier, {
        front: faceShots.front.file,
        left: faceShots.left.file,
        right: faceShots.right.file,
      });

      const normalizedFaceStatus =
        result.faceVerificationStatus === 'none'
        || result.faceVerificationStatus === 'partial'
        || result.faceVerificationStatus === 'complete'
          ? result.faceVerificationStatus
          : 'complete';

      setFaceVerificationStatus(normalizedFaceStatus);
      setApiMessage(result.message || 'Face details enrolled successfully.');
      stopCamera();
    } catch (error: any) {
      setApiError(error?.response?.data?.message || 'Failed to enroll face details. Please try again with clear images.');
    } finally {
      setIsFaceUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isFacultyVerified = verificationStatus === 'verified' || verificationStatus === 'strongly_verified';
  const faceStatusLabel =
    faceVerificationStatus === 'complete'
      ? 'Face Complete'
      : faceVerificationStatus === 'partial'
      ? 'Face Partial'
      : 'Face Not Enrolled';

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
            <div className={`profile-verified-badge ${isFacultyVerified ? '' : 'not-verified'}`}>
              <CheckCircle size={16} />
              <span>{isFacultyVerified ? 'Verified by Faculty' : 'Not Verified'}</span>
            </div>
            <div className={`profile-face-badge ${faceVerificationStatus}`}>
              <Camera size={14} />
              <span>{faceStatusLabel}</span>
            </div>
          </div>
          
          <div className="profile-info-section">
            <div className="profile-name-row">
              <div>
                <h1 className="profile-name">{profile.name}</h1>
                <p className="profile-tagline">{profile.department}</p>
                <div className="profile-meta">
                  <span><GraduationCap size={14} /> {profile.roll}</span>
                  <span><Calendar size={14} /> {profile.year || 'Year not set'}</span>
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
                    <span>{skill.category ? `${skill.category}: ${skill.name}` : skill.name}</span>
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
                  <select
                    value={newSkillCategory}
                    onChange={(e) => {
                      setNewSkillCategory(e.target.value);
                      setNewSkillName('');
                      setCustomSkillName('');
                    }}
                    className="skill-input skill-select"
                  >
                    <option value="">Select category</option>
                    {SKILL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="skill-input skill-select"
                    disabled={!newSkillCategory}
                  >
                    <option value="">Select skill name</option>
                    {(newSkillCategory ? SKILL_CATALOG[newSkillCategory] || [] : []).map((skillName) => (
                      <option key={skillName} value={skillName}>{skillName}</option>
                    ))}
                    <option value="__custom__">Other (type manually)</option>
                  </select>

                  {newSkillName === '__custom__' && (
                    <input
                      type="text"
                      placeholder="Enter custom skill"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="skill-input"
                    />
                  )}
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
          {/* Face Enrollment */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <Camera size={20} />
                  Face Verification
                </h2>
                <p>Capture front, left, and right photos using your camera</p>
              </div>
            </div>
            <div className="card-body">
              <div className="face-camera-panel">
                <div className="face-camera-head">
                  <p>
                    Camera mode: capture your {captureMode} face image
                  </p>
                  {isCameraActive ? (
                    <button type="button" className="btn-secondary" onClick={stopCamera}>
                      Stop Camera
                    </button>
                  ) : (
                    <button type="button" className="btn-secondary" onClick={() => startCamera(captureMode)}>
                      Start Camera
                    </button>
                  )}
                </div>

                <div className="face-camera-video-wrap">
                  <video ref={faceVideoRef} className="face-camera-video" playsInline muted />
                  {!isCameraActive && <div className="face-camera-overlay">Camera preview will appear here</div>}
                </div>

                <div className="face-camera-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={captureCurrentFrame}
                    disabled={!isCameraActive || isFaceUploading}
                  >
                    <Camera size={16} />
                    <span>Capture {captureMode}</span>
                  </button>
                </div>

                {cameraError && <p className="face-camera-error">{cameraError}</p>}
                <canvas ref={faceCanvasRef} style={{ display: 'none' }} />
              </div>

              <div className="face-capture-grid">
                {(['front', 'left', 'right'] as const).map((angle) => {
                  const shot = faceShots[angle];
                  const title = angle.charAt(0).toUpperCase() + angle.slice(1);
                  const inputRef =
                    angle === 'front' ? frontFaceInputRef : angle === 'left' ? leftFaceInputRef : rightFaceInputRef;

                  return (
                    <div className="face-capture-item" key={angle}>
                      <div className="face-capture-preview">
                        {shot ? (
                          <img src={shot.preview} alt={`${title} capture`} />
                        ) : (
                          <div className="face-capture-placeholder">
                            <Camera size={20} />
                            <span>{title}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setCaptureMode(angle);
                          startCamera(angle);
                        }}
                        disabled={isFaceUploading}
                      >
                        Capture {title}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => inputRef.current?.click()}
                        disabled={isFaceUploading}
                      >
                        {shot ? `Upload ${title} Again` : `Upload ${title}`}
                      </button>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={(e) => handleFaceShotSelected(angle, e.target.files?.[0])}
                        style={{ display: 'none' }}
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn-primary face-enroll-btn"
                onClick={handleEnrollFace}
                disabled={
                  isFaceUploading
                  || !faceShots.front?.file
                  || !faceShots.left?.file
                  || !faceShots.right?.file
                }
              >
                <Camera size={16} />
                <span>{isFaceUploading ? 'Enrolling...' : 'Enroll Face Details'}</span>
              </button>
            </div>
          </div>

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
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.roll}
                      onChange={(e) => setProfile({ ...profile, roll: e.target.value })}
                      className="contact-input"
                      placeholder="Enter roll number"
                    />
                  ) : (
                    <span className="academic-value">{profile.roll || 'Not added'}</span>
                  )}
                </div>
                <div className="academic-item">
                  <span className="academic-label">Department</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="contact-input"
                      placeholder="Enter department"
                    />
                  ) : (
                    <span className="academic-value">{profile.department || 'Not added'}</span>
                  )}
                </div>
                <div className="academic-item">
                  <span className="academic-label">Year</span>
                  {isEditing ? (
                    <select
                      value={profile.year}
                      onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                      className="contact-input"
                    >
                      <option value="">Select year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="academic-value">{profile.year || 'Not added'}</span>
                  )}
                </div>
                <div className="academic-item">
                  <span className="academic-label">Semester</span>
                  {isEditing ? (
                    <select
                      value={profile.semester}
                      onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                      className="contact-input"
                    >
                      <option value="">Select semester</option>
                      {semesterOptions.map((semester) => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="academic-value">{profile.semester || 'Not added'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

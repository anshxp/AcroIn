import React, { useState, useEffect } from 'react';
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
  Award,
  Briefcase,
  Calendar,
  Link as LinkIcon,
  CheckCircle,
  Star
} from 'lucide-react';
// import { useAuth } from '../../context/AuthContext'; // Unused
import '../../styles/profile.css';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

interface StudentProfileData {
  name: string;
  roll: string;
  email: string;
  department: string;
  year: number;
  semester: number;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  bio: string;
  tech_stack: string[];
}

interface StudentStats {
  profileScore: number;
  skillsVerified: number;
  projectsCount: number;
  certificatesCount: number;
  connectionsCount: number;
}

interface StudentAchievement {
  title: string;
  description: string;
  icon: string;
}

interface StudentExperience {
  title: string;
  company: string;
  duration: string;
  type: string;
  verified: boolean;
}

interface ProfileResponse {
  profile: StudentProfileData;
  stats: StudentStats;
  achievements: StudentAchievement[];
  experience: StudentExperience[];
}

export const StudentProfile: React.FC = () => {
  // const { user } = useAuth(); // Unused
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  const GET_STUDENT_PROFILE = gql`
    query GetStudentProfile {
      profile {
        name
        roll
        email
        department
        year
        semester
        phone
        linkedin
        github
        portfolio
        location
        bio
        tech_stack
      }
      stats {
        profileScore
        skillsVerified
        projectsCount
        certificatesCount
        connectionsCount
      }
      achievements {
        title
        description
        icon
      }
      experience {
        title
        company
        duration
        type
        verified
      }
    }
  `;
  
  const { data, loading, error } = useQuery<ProfileResponse>(GET_STUDENT_PROFILE);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);

  useEffect(() => {
    if (data?.profile) {
      setProfile(data.profile);
    }
  }, [data]);

  if (loading && !profile) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const stats = data?.stats || {
    profileScore: 85,
    skillsVerified: 12,
    projectsCount: 5,
    certificatesCount: 8,
    connectionsCount: 150
  };
  const achievements = data?.achievements || [];
  const experience = data?.experience || [];

  const handleAddSkill = () => {
    if (newSkill.trim() && profile && !profile.tech_stack.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        tech_stack: [...profile.tech_stack, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    if (profile) {
      setProfile({
        ...profile,
        tech_stack: profile.tech_stack.filter((s: string) => s !== skill),
      });
    }
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  };

  if (!profile) return <div>No profile data found</div>;

  return (
    <div className="profile-page">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-cover">
          <div className="profile-cover-gradient"></div>
          {isEditing && (
            <button className="cover-edit-btn">
              <Camera size={16} />
              <span>Change Cover</span>
            </button>
          )}
        </div>
        
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span>{getInitials(profile.name)}</span>
              {isEditing && (
                <button className="avatar-edit-btn">
                  <Camera size={16} />
                </button>
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
                      <span>Save Changes</span>
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
          <div className="profile-stat-item">
            <div className="stat-value">{stats.connectionsCount}</div>
            <div className="stat-label">Connections</div>
          </div>
        </div>
      </div>

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
                {profile.tech_stack.map((skill: string, index: number) => (
                  <div key={skill} className={`skill-tag skill-color-${index % 6}`}>
                    <span>{skill}</span>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
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
                <button className="btn-add">
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="experience-list">
                {experience.map((exp: StudentExperience, index: number) => (
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
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                        {profile.linkedin ? profile.linkedin.replace('https://', '') : 'LinkedIn profile'}
                      </a>
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
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                        {profile.github ? profile.github.replace('https://', '') : 'GitHub profile'}
                      </a>
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
                      <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="contact-link">
                        {profile.portfolio ? profile.portfolio.replace('https://', '') : 'Portfolio'}
                      </a>
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

          {/* Achievements */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>
                  <Award size={20} />
                  Achievements
                </h2>
                <p>Your badges & milestones</p>
              </div>
            </div>
            <div className="card-body">
              <div className="achievements-grid">
                {achievements.map((achievement: StudentAchievement, index: number) => (
                  <div key={index} className="achievement-item">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-content">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                    </div>
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

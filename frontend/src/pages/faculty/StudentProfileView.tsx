import React, { useEffect, useState } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  FolderKanban,
  Link2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trophy,
  UserRound,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { facultyAPI, studentAPI } from '../../services/api';
import type { Student } from '../../types';
import '../../styles/pages.css';

export const StudentProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [verifyingProfile, setVerifyingProfile] = useState(false);
  const [verifyingAllSkills, setVerifyingAllSkills] = useState(false);
  const [verifyingSkillId, setVerifyingSkillId] = useState<string | null>(null);
  const [verifyingCertificateId, setVerifyingCertificateId] = useState<string | null>(null);
  const [verifyingAllCertificates, setVerifyingAllCertificates] = useState(false);

  const getInitials = (name?: string) => (name || 'ST')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const studentSkills = student?.skills || [];
  const verifiedSkillsCount = studentSkills.filter((skill) => skill.verified).length;

  const refreshStudentAfterVerification = (
    updatedStudent: Student,
    overrides?: Partial<Student>
  ) => {
    setStudent({
      ...updatedStudent,
      ...overrides,
    });
  };

  const handleVerifyProfile = async () => {
    if (!student) return;

    try {
      setVerifyingProfile(true);
      setError(null);
      setFeedback(null);

      const result = await facultyAPI.verifyStudent(student._id);
      refreshStudentAfterVerification(student, {
        verificationStatus: result?.verificationStatus || 'verified',
        verifiedAt: result?.verifiedAt || new Date().toISOString(),
      });
      setFeedback(result?.message || 'Student profile verified successfully.');
    } catch {
      setError('Unable to verify the student profile. Check department, face status, and completeness.');
    } finally {
      setVerifyingProfile(false);
    }
  };

  const handleVerifySkill = async (skillId: string) => {
    if (!student) return;

    try {
      setVerifyingSkillId(skillId);
      setError(null);
      setFeedback(null);

      const result = await facultyAPI.verifyStudentSkill(student._id, skillId);
      refreshStudentAfterVerification(student, {
        verificationStatus: result?.verificationStatus || student.verificationStatus,
        skills: studentSkills.map((skill) => (
          skill._id === skillId ? { ...skill, verified: true } : skill
        )),
      });
      setFeedback(result?.message || 'Skill verified successfully.');
    } catch {
      setError('Unable to verify this skill. Ensure the student belongs to your department.');
    } finally {
      setVerifyingSkillId(null);
    }
  };

  const handleVerifyAllSkills = async () => {
    if (!student) return;

    try {
      setVerifyingAllSkills(true);
      setError(null);
      setFeedback(null);

      const result = await facultyAPI.verifyAllStudentSkills(student._id);
      refreshStudentAfterVerification(student, {
        verificationStatus: result?.verificationStatus || student.verificationStatus,
        skills: studentSkills.map((skill) => ({ ...skill, verified: true })),
      });
      setFeedback(result?.message || 'All skills verified successfully.');
    } catch {
      setError('Unable to verify all skills. Ensure the student belongs to your department.');
    } finally {
      setVerifyingAllSkills(false);
    }
  };

  const handleVerifyCertificate = async (certificateId: string) => {
    if (!student) return;

    try {
      setVerifyingCertificateId(certificateId);
      setError(null);
      setFeedback(null);

      const result = await facultyAPI.verifyStudentCertificate(student._id, certificateId);
      refreshStudentAfterVerification(student, {
        certificates: (student.certificates || []).map((certificate: any) => (
          certificate._id === certificateId ? { ...certificate, verified: true } : certificate
        )),
      });
      setFeedback(result?.message || 'Certificate verified successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to verify this certificate. Ensure the student belongs to your department.');
    } finally {
      setVerifyingCertificateId(null);
    }
  };

  const handleVerifyAllCertificates = async () => {
    if (!student) return;

    try {
      setVerifyingAllCertificates(true);
      setError(null);
      setFeedback(null);

      const result = await facultyAPI.verifyAllStudentCertificates(student._id);
      refreshStudentAfterVerification(student, {
        certificates: (student.certificates || []).map((certificate: any) => ({ ...certificate, verified: true })),
      });
      setFeedback(result?.message || 'All certificates verified successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to verify all certificates. Ensure the student belongs to your department.');
    } finally {
      setVerifyingAllCertificates(false);
    }
  };

  useEffect(() => {
    const loadStudent = async () => {
      if (!id) {
        setError('Student identifier is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await studentAPI.getStudentById(id);
        setStudent(data);
      } catch {
        setError('Unable to load student profile.');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Student Profile</h1>
          <p>Full profile details for matched student.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate('/faculty/verification')}>
            Back to Facial Recognition
          </button>
          {student && (
            <span className="verified-badge">
              Face: {student.faceVerificationStatus || 'none'}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="card-body">Loading profile...</div>
        </div>
      )}

      {error && (
        <div className="card">
          <div className="card-body" style={{ color: '#b91c1c' }}>{error}</div>
        </div>
      )}

      {feedback && (
        <div className="card">
          <div className="card-body" style={{ color: '#166534' }}>{feedback}</div>
        </div>
      )}

      {student && !loading && !error && (
        <>
          <div
            className="card"
            style={{
              marginBottom: '20px',
              border: '1px solid #dbeafe',
              background: 'linear-gradient(120deg, #eff6ff 0%, #f8fafc 50%, #eef2ff 100%)',
            }}
          >
            <div
              className="card-body"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {student.profile_image ? (
                  <img
                    src={student.profile_image}
                    alt={`${student.name} profile`}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #ffffff',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.15)',
                    }}
                  />
                ) : (
                  <div
                    className="student-avatar"
                    style={{
                      width: '72px',
                      height: '72px',
                      fontSize: '22px',
                      border: '3px solid #ffffff',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.15)',
                    }}
                  >
                    {getInitials(student.name)}
                  </div>
                )}

                <div>
                  <h3 className="student-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <UserRound size={16} />
                    {student.name}
                  </h3>
                  <div className="student-meta" style={{ marginBottom: '6px' }}>
                    <span>{student.roll}</span>
                    <span className="separator">•</span>
                    <span>{student.department}</span>
                    <span className="separator">•</span>
                    <span>{student.year || student.semester || 'N/A'}</span>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {student.verificationStatus || 'not_verified'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="verified-badge">Profile {student.profileCompleteness || 0}%</span>
                <span className="verified-badge">Face: {student.faceVerificationStatus || 'none'}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Faculty Review</span>
                <strong style={{ color: '#0f172a' }}>{student.verificationStatus || 'not_verified'}</strong>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Skills verified: {verifiedSkillsCount}/{studentSkills.length || 0}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleVerifyProfile}
                  disabled={verifyingProfile}
                >
                  <ShieldCheck size={16} />
                  <span>{verifyingProfile ? 'Verifying...' : 'Verify Profile'}</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleVerifyAllSkills}
                  disabled={verifyingAllSkills || !studentSkills.length}
                >
                  <CheckCircle2 size={16} />
                  <span>{verifyingAllSkills ? 'Verifying Skills...' : 'Verify All Skills'}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleVerifyAllCertificates}
                  disabled={verifyingAllCertificates || !(student.certificates || []).length}
                >
                  <Award size={16} />
                  <span>{verifyingAllCertificates ? 'Verifying Certificates...' : 'Verify All Certificates'}</span>
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div className="card">
              <div className="card-body" style={{ display: 'grid', gap: '4px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Projects</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderKanban size={16} color="#2563eb" />
                  <strong style={{ fontSize: '20px', color: '#0f172a' }}>{(student.projects || []).length}</strong>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ display: 'grid', gap: '4px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Internships</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={16} color="#059669" />
                  <strong style={{ fontSize: '20px', color: '#0f172a' }}>{(student.internships || []).length}</strong>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ display: 'grid', gap: '4px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Certificates</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={16} color="#d97706" />
                  <strong style={{ fontSize: '20px', color: '#0f172a' }}>{(student.certificates || []).length}</strong>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body" style={{ display: 'grid', gap: '4px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Competitions</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={16} color="#7c3aed" />
                  <strong style={{ fontSize: '20px', color: '#0f172a' }}>{(student.competitions || []).length}</strong>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <h2>Contact</h2>
                <p>Student communication details</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '10px' }}>
              <p style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} /> {student.email || 'N/A'}
              </p>
              <p style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} /> {student.phone || 'N/A'}
              </p>
              <p style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={15} /> {student.location || student.address || 'N/A'}
              </p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <h2>About</h2>
                <p>Summary and verification status</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '8px' }}>
              <p style={{ margin: 0, color: '#334155' }}>{student.bio || 'No bio provided.'}</p>
              <p style={{ margin: 0, color: '#334155' }}><strong>Verification:</strong> {student.verificationStatus || 'not_verified'}</p>
              <p style={{ margin: 0, color: '#334155' }}><strong>Face Status:</strong> {student.faceVerificationStatus || 'none'}</p>
            </div>
          </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <h2>Skills</h2>
                <p>Tech stack and declared skills</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '12px' }}>
              {studentSkills.length > 0 ? (
                studentSkills.map((skill) => (
                  <div
                    key={skill._id || skill.name}
                    style={{
                      padding: '14px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'grid', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#1e293b' }}>{skill.name}</strong>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', fontSize: '12px', fontWeight: 600 }}>
                          {skill.category || 'General'}
                        </span>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                          {skill.level}
                        </span>
                      </div>
                      <div style={{ width: '100%', maxWidth: '280px' }}>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${skill.progress}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span className={`verified-badge ${skill.verified ? '' : 'not-verified'}`}>
                        {skill.verified ? 'Verified' : 'Pending'}
                      </span>
                      {!skill.verified && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleVerifySkill(skill._id || skill.name)}
                          disabled={verifyingSkillId === (skill._id || skill.name)}
                        >
                          <CheckCircle2 size={16} />
                          <span>{verifyingSkillId === (skill._id || skill.name) ? 'Verifying...' : 'Verify Skill'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span style={{ color: '#64748b' }}>No skills added.</span>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <h2>Links</h2>
                <p>Public student links</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '10px' }}>
              {[student.linkedin, student.github, student.portfolio]
                .filter(Boolean)
                .map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Link2 size={14} /> {url}
                  </a>
                ))}
              {!student.linkedin && !student.github && !student.portfolio && (
                <span style={{ color: '#64748b' }}>No external links shared.</span>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <h2>Projects</h2>
                <p>Academic and personal projects</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '12px' }}>
              {(student.projects || []).length > 0 ? (
                student.projects.map((project: any, idx: number) => (
                  <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>
                      {project.title || 'Untitled Project'}
                    </p>
                    <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '14px' }}>
                      {project.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {project.github_link && (
                        <a
                          href={project.github_link}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#2563eb', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Link2 size={12} /> GitHub
                        </a>
                      )}
                      {project.live_link && (
                        <a
                          href={project.live_link}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#2563eb', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Link2 size={12} /> Live
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span style={{ color: '#64748b' }}>No projects added.</span>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <h2>Internships</h2>
                <p>Work experience and internships</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '12px' }}>
              {(student.internships || []).length > 0 ? (
                student.internships.map((internship: any, idx: number) => (
                  <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>
                      {internship.company || 'Company Name'}
                    </p>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>
                      {internship.position || 'Position'} • {internship.duration || internship.period || 'Duration'}
                    </p>
                    <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                      {internship.description || 'No description provided.'}
                    </p>
                  </div>
                ))
              ) : (
                <span style={{ color: '#64748b' }}>No internships added.</span>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <h2>Certificates</h2>
                <p>Certifications and achievements</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleVerifyAllCertificates}
                  disabled={verifyingAllCertificates || !(student.certificates || []).length}
                >
                  <Award size={16} />
                  <span>{verifyingAllCertificates ? 'Verifying...' : 'Verify Certificates'}</span>
                </button>
              </div>
              {(student.certificates || []).length > 0 ? (
                student.certificates.map((cert: any, idx: number) => (
                  <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #d97706', display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>
                          {cert.title || 'Certificate'}
                        </p>
                        <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>
                          {cert.organization || 'Organization'} • {cert.issue_date || 'Date'}
                        </p>
                      </div>
                      <span className={`verified-badge ${cert.verified ? '' : 'not-verified'}`}>
                        {cert.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    {(() => {
                      const certificateLink = cert.certificate_link
                        || cert.certificateLink
                        || cert.credentialUrl
                        || cert.link
                        || cert.url;

                      if (!certificateLink) return null;

                      return (
                        <div style={{ display: 'grid', gap: '4px' }}>
                          <span style={{ color: '#64748b', fontSize: '13px' }}>Certificate Link</span>
                          <a
                            href={certificateLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#2563eb',
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              wordBreak: 'break-all',
                            }}
                          >
                            <Link2 size={12} /> {certificateLink}
                          </a>
                        </div>
                      );
                    })()}
                    {!cert.verified && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleVerifyCertificate(cert._id || `${cert.title || 'certificate'}-${idx}`)}
                          disabled={verifyingCertificateId === (cert._id || `${cert.title || 'certificate'}-${idx}`)}
                        >
                          <CheckCircle2 size={16} />
                          <span>{verifyingCertificateId === (cert._id || `${cert.title || 'certificate'}-${idx}`) ? 'Verifying...' : 'Verify Certificate'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <span style={{ color: '#64748b' }}>No certificates added.</span>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <h2>Competitions</h2>
                <p>Competitions and contests participated</p>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: '12px' }}>
              {(student.competitions || []).length > 0 ? (
                student.competitions.map((comp: any, idx: number) => (
                  <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #7c3aed' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>
                      {comp.name || 'Competition'}
                    </p>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>
                      {comp.organizer || 'Organizer'} • {comp.date ? new Date(comp.date).getFullYear() : 'Year'}
                    </p>
                  </div>
                ))
              ) : (
                <span style={{ color: '#64748b' }}>No competitions added.</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

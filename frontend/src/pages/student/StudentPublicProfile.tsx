import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Briefcase, FolderKanban, Github, Linkedin, Mail, MapPin, Trophy } from 'lucide-react';
import { studentAPI } from '../../services/api';
import type { Student } from '../../types';
import '../../styles/pages.css';

export const StudentPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadStudent = async () => {
      if (!id) {
        setError('Student identifier is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await studentAPI.getAllStudents();
        const students: any[] = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : [];
        const selected = students.find((item) => String(item?._id || item?.id || '') === id);

        if (!selected) {
          throw new Error('Student not found');
        }

        if (mounted) setStudent(selected as Student);
      } catch {
        if (mounted) setError('Unable to load this student profile. The profile may not be available.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStudent();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return <div className="card"><div className="card-body">Loading student profile...</div></div>;
  }

  if (error || !student) {
    return (
      <div className="card">
        <div className="card-body">
          <p style={{ color: '#b91c1c', marginBottom: '16px' }}>{error || 'Student profile not found.'}</p>
          <button type="button" className="btn-secondary" onClick={() => navigate('/student/search')}>
            <ArrowLeft size={16} /> Back to Smart Search
          </button>
        </div>
      </div>
    );
  }

  const skills = Array.isArray(student.skills)
    ? student.skills.map((skill: any) => typeof skill === 'string' ? skill : skill?.name).filter(Boolean)
    : (student.tech_stack || []);
  const projects = Array.isArray(student.projects) ? student.projects : [];
  const internships = Array.isArray(student.internships) ? student.internships : [];
  const certificates = Array.isArray(student.certificates) ? student.certificates : [];
  const competitions = Array.isArray(student.competitions) ? student.competitions : [];
  const stats: Array<{ label: string; count: number; Icon: React.ComponentType<{ size?: number }> }> = [
    { label: 'Projects', count: projects.length, Icon: FolderKanban },
    { label: 'Internships', count: internships.length, Icon: Briefcase },
    { label: 'Certificates', count: certificates.length, Icon: Award },
    { label: 'Competitions', count: competitions.length, Icon: Trophy },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <button type="button" className="btn-secondary" onClick={() => navigate('/student/search')} style={{ marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to Smart Search
          </button>
          <h1>{student.name || 'Student Profile'}</h1>
          <p>Student profile and academic information</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
            {student.profile_image ? (
              <img src={student.profile_image} alt={`${student.name} profile`} style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div className="student-avatar" style={{ width: '84px', height: '84px', fontSize: '24px', flexShrink: 0 }}>
                {(student.name || 'ST').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>{student.name || 'Student'}</h2>
              <div className="student-meta" style={{ flexWrap: 'wrap' }}>
                <span>{student.department || 'Department not specified'}</span>
                {student.roll && <><span className="separator">•</span><span>{student.roll}</span></>}
                {(student.year || student.semester) && <><span className="separator">•</span><span>{student.year || student.semester}</span></>}
                {(student.location || student.address) && <><span className="separator">•</span><span><MapPin size={14} /> {student.location || student.address}</span></>}
              </div>
              {student.verificationStatus && <span className="verified-badge" style={{ display: 'inline-block', marginTop: '10px' }}>{student.verificationStatus.replace('_', ' ')}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {student.email && <a className="btn-secondary" href={`mailto:${student.email}`}><Mail size={16} /> Contact</a>}
            {student.linkedin && <a className="btn-secondary" href={student.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>}
            {student.github && <a className="btn-secondary" href={student.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>}
          </div>
        </div>
      </div>

      {student.bio && <div className="card" style={{ marginBottom: '20px' }}><div className="card-header"><div><h2>About</h2><p>Profile summary</p></div></div><div className="card-body"><p style={{ margin: 0, color: '#334155', lineHeight: 1.7 }}>{student.bio}</p></div></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {stats.map(({ label, count, Icon }) => (
          <div className="card" key={label}><div className="card-body" style={{ display: 'grid', gap: '6px' }}><span style={{ color: '#64748b', fontSize: '12px' }}>{label}</span><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon size={17} /><strong style={{ fontSize: '20px' }}>{count}</strong></div></div></div>
        ))}
      </div>

      {skills.length > 0 && <div className="card" style={{ marginBottom: '20px' }}><div className="card-header"><div><h2>Skills</h2><p>Technical skills</p></div></div><div className="card-body"><div className="student-skills">{skills.map((skill, index) => <span className="student-skill" key={`${skill}-${index}`}>{skill}</span>)}</div></div></div>}

      {projects.length > 0 && <div className="card" style={{ marginBottom: '20px' }}><div className="card-header"><div><h2>Projects</h2><p>Recent academic and personal projects</p></div></div><div className="card-body" style={{ display: 'grid', gap: '14px' }}>{projects.map((project: any) => <div key={project._id || project.title} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}><strong>{project.title || 'Project'}</strong>{project.description && <p style={{ margin: '6px 0 0', color: '#64748b' }}>{project.description}</p>}{Array.isArray(project.technologies) && project.technologies.length > 0 && <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '13px' }}>{project.technologies.join(', ')}</p>}</div>)}</div></div>}
    </div>
  );
};

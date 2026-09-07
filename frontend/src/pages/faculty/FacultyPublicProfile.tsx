import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { facultyAPI } from '../../services/api';
import '../../styles/pages.css';

export const FacultyPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) { setError('Faculty identifier is missing.'); setLoading(false); return; }
      try {
        const response = await facultyAPI.getAllFaculty();
        const list = Array.isArray(response) ? response : [];
        const selected = list.find((item: any) => String(item?._id || item?.id || '') === id);
        if (!selected) throw new Error('Faculty not found');
        if (mounted) setFaculty(selected);
      } catch {
        if (mounted) setError('Unable to load this faculty profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="card"><div className="card-body">Loading faculty profile...</div></div>;
  if (error || !faculty) return <div className="card"><div className="card-body"><p style={{ color: '#b91c1c' }}>{error || 'Faculty profile not found.'}</p><button type="button" className="btn-secondary" onClick={() => navigate('/chat')}><ArrowLeft size={16} /> Back to Messages</button></div></div>;
  const name = faculty.name || `${faculty.firstname || ''} ${faculty.lastName || ''}`.trim() || 'Faculty';
  const avatar = faculty.profilepic || faculty.profile_image;
  const initials = name.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();

  return <div className="page-container">
    <div className="page-header"><div className="page-title-section"><button type="button" className="btn-secondary" onClick={() => navigate('/chat')} style={{ marginBottom: '12px' }}><ArrowLeft size={16} /> Back to Messages</button><h1>{name}</h1><p>Faculty profile</p></div></div>
    <div className="card"><div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
      {avatar ? <img src={avatar} alt={`${name} profile`} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }} /> : <div className="student-avatar" style={{ width: 88, height: 88, fontSize: 24 }}>{initials}</div>}
      <div style={{ display: 'grid', gap: '7px' }}><h2 style={{ margin: 0 }}>{name}</h2><span>{faculty.designation || 'Faculty'}{faculty.department ? ` • ${faculty.department}` : ''}</span>{faculty.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={14} />{faculty.location}</span>}{faculty.email && <a href={`mailto:${faculty.email}`} className="btn-secondary" style={{ width: 'fit-content' }}><Mail size={16} /> Contact</a>}</div>
    </div></div>
    {faculty.bio && <div className="card" style={{ marginTop: 20 }}><div className="card-header"><div><h2>About</h2></div></div><div className="card-body"><p>{faculty.bio}</p></div></div>}
  </div>;
};

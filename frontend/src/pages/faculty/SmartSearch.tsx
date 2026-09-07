import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

interface SearchStudent {
  id: string; name: string; initials: string; profileImage?: string; roll: string; department: string; year: string; semester?: string; location: string; skills: string[]; certifications: string[]; projects: string[]; searchBlob: string; rating: number; verified: boolean; verificationStatus: string; color: string;
}
interface SearchFilters { department: string; year: string; skill: string; certification: string; verification: string; }

const DEPARTMENTS = ['CSE','AIML','DS','CSIT','CYBER','ECE','EEE','VLSI','ME','CE','IT','IL'];
const DEFAULT_SKILLS = ['JavaScript','Python','SQL','React','Node.js','MongoDB'];

export const SmartSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ department:'', year:'', skill:'', certification:'', verification:'' });
  const [students, setStudents] = useState<SearchStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const isStudentUser = user?.userType === 'student';
  const normalizeText = (value: unknown) => String(value || '').trim().toLowerCase();

  useEffect(() => { setSearchQuery(searchParams.get('query') || ''); }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    const loadStudents = async () => {
      setLoading(true); setLoadError('');
      try {
        const response = await studentAPI.getAllStudents();
        const backendStudents: any[] = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : Array.isArray((response as any)?.items)
              ? (response as any).items
              : [];

        const colors = ['blue','green','purple','orange'];
        const normalized = backendStudents.map((student: any, index) => {
          const name = student.name || 'Unknown Student';
          const techStack = Array.isArray(student.tech_stack) ? student.tech_stack : [];
          const profileSkills = Array.isArray(student.skills) ? student.skills.map((skill:any) => typeof skill === 'string' ? skill : skill?.name).filter(Boolean) : [];
          const skills = Array.from(new Set([...techStack, ...profileSkills]));
          const certifications = Array.isArray(student.certificates) ? student.certificates.flatMap((c:any) => [c?.title, c?.organization]).filter(Boolean) : [];
          const projectRecords = Array.isArray(student.projects) ? student.projects : [];
          const projects = projectRecords.slice(0,2).map((p:any) => p?.title || 'Project');
          const projectKeywords = projectRecords.flatMap((p:any) => [p?.title,p?.description,...(Array.isArray(p?.technologies) ? p.technologies : [])]).filter(Boolean);
          const normalizedVerification = normalizeText(student.verificationStatus);
          const verificationStatus = normalizedVerification === 'strongly_verified' ? 'strongly_verified' : normalizedVerification === 'verified' ? 'verified' : 'unverified';
          const isVerified = verificationStatus === 'verified' || verificationStatus === 'strongly_verified';
          const yearLabel = student.year || student.semester || 'N/A';
          const departmentLabel = student.department || 'Unknown';
          const locationLabel = student.location || student.address || 'Campus';
          const rollLabel = student.roll || '';
          const semesterLabel = student.semester || '';
          const searchBlob = [name,rollLabel,departmentLabel,yearLabel,semesterLabel,locationLabel,...skills,...certifications,...projectKeywords].map(normalizeText).filter(Boolean).join(' ');
          return { id:String(student._id || student.id || ''), name, initials:name.split(' ').map((p:string)=>p[0]).join('').slice(0,2).toUpperCase(), profileImage:student.profile_image, roll:rollLabel, department:departmentLabel, year:yearLabel, semester:semesterLabel, location:locationLabel, skills, certifications, projects, searchBlob, rating:Math.min(5,3+skills.length*0.25+(isVerified?0.5:0)), verified:isVerified, verificationStatus, color:colors[index%colors.length] };
        }).filter((student) => student.id);

        if (mounted) {
          setStudents(isStudentUser ? normalized.filter(s => s.verificationStatus === 'verified' || s.verificationStatus === 'strongly_verified') : normalized);
        }
      } catch (error: any) {
        if (mounted) { setStudents([]); setLoadError(error?.response?.data?.message || 'Unable to load students. Check that the backend is running and you are logged in.'); }
      } finally { if (mounted) setLoading(false); }
    };
    loadStudents();
    return () => { mounted = false; };
  }, [isStudentUser]);

  const departments = useMemo(() => Array.from(new Set([...DEPARTMENTS,...students.map(s=>s.department)])).filter(Boolean).sort(), [students]);
  const years = useMemo(() => Array.from(new Set(students.map(s=>s.year))).filter(Boolean).sort(), [students]);
  const skills = useMemo(() => Array.from(new Set([...DEFAULT_SKILLS,...students.flatMap(s=>s.skills)])).filter(Boolean).sort(), [students]);
  const certifications = useMemo(() => Array.from(new Set(students.flatMap(s=>s.certifications))).filter(Boolean).sort(), [students]);
  const verificationOptions = useMemo(() => ['strongly_verified','verified','unverified'], []);

  const filteredStudents = students.filter(student => {
    const query = normalizeText(searchQuery);
    return (!query || student.searchBlob.includes(query))
      && (!filters.department || student.department === filters.department)
      && (!filters.year || student.year === filters.year)
      && (!filters.skill || student.skills.includes(filters.skill))
      && (!filters.certification || student.certifications.includes(filters.certification))
      && (isStudentUser || !filters.verification || student.verificationStatus === filters.verification);
  });

  const updateFilter = (type:keyof SearchFilters,value:string) => setFilters(prev=>({...prev,[type]:value}));
  const clearFilters = () => setFilters({department:'',year:'',skill:'',certification:'',verification:''});

  return <div>
    <div className="page-header"><div className="page-title-section"><h1>{isStudentUser ? 'Student Smart Search' : 'Smart Search'}</h1><p>{isStudentUser ? 'Discover peers by department, skills, certifications, and project interests.' : 'Find students using AI-powered semantic search'}</p></div></div>
    <div className="card" style={{marginBottom:'24px'}}><div className="card-body">
      <div className="search-bar" style={{maxWidth:'100%',marginBottom:'20px'}}><Search size={20}/><input type="text" placeholder={isStudentUser ? 'Search peers by skills, certifications, projects...' : 'Search by skills, projects, or interests...'} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></div>
      <div className="smart-search-filter-panel" style={{display:'block',visibility:'visible',opacity:1}}>
        <div className="smart-search-filter-head"><h4>Filters</h4><button type="button" className="filter-chip" onClick={clearFilters}>Clear Filters</button></div>
        <div className="smart-search-filter-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'16px'}}>
          <div className="filter-group smart-search-filter-field"><span className="filter-label">Department</span><select className="smart-search-select" value={filters.department} onChange={e=>updateFilter('department',e.target.value)}><option value="">All Departments</option>{departments.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
          <div className="filter-group smart-search-filter-field"><span className="filter-label">Year</span><select className="smart-search-select" value={filters.year} onChange={e=>updateFilter('year',e.target.value)}><option value="">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
          <div className="filter-group smart-search-filter-field"><span className="filter-label">Skill</span><select className="smart-search-select" value={filters.skill} onChange={e=>updateFilter('skill',e.target.value)}><option value="">All Skills</option>{skills.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          <div className="filter-group smart-search-filter-field"><span className="filter-label">Certification</span><select className="smart-search-select" value={filters.certification} onChange={e=>updateFilter('certification',e.target.value)}><option value="">All Certifications</option>{certifications.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          {!isStudentUser && <div className="filter-group smart-search-filter-field"><span className="filter-label">Verification</span><select className="smart-search-select" value={filters.verification} onChange={e=>updateFilter('verification',e.target.value)}><option value="">All</option>{verificationOptions.map(v=><option key={v} value={v}>{v.split('_').map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(' ')}</option>)}</select></div>}
        </div>
      </div>
    </div></div>
    {loadError && <div className="card" style={{marginBottom:'16px'}}><div className="card-body"><p style={{margin:0,color:'#b91c1c'}}>{loadError}</p></div></div>}
    <div className="student-list">
      {loading ? <p>Loading students...</p> : filteredStudents.map(student=><div key={student.id} className="student-card">
        {student.profileImage ? <img src={student.profileImage} alt={`${student.name} profile`} className="student-avatar" style={{objectFit:'cover'}}/> : <div className="student-avatar" style={{background:student.color==='blue'?'#dbeafe':student.color==='green'?'#dcfce7':'#e9d5ff',color:student.color==='blue'?'#3b82f6':student.color==='green'?'#22c55e':'#a855f7'}}>{student.initials}</div>}
        <div className="student-main"><div className="student-header"><h3 className="student-name">{student.name}</h3>{student.verified&&<span className="verified-badge">Verified</span>}</div><div className="student-meta"><span>{student.department}</span><span className="separator">•</span><span>Class of {student.year}</span><span className="separator">•</span><span><MapPin size={14}/> {student.location}</span></div><div className="student-skills">{student.skills.map((skill,i)=><span key={i} className="student-skill">{skill}</span>)}</div><div className="student-projects">Recent Projects: <span>{student.projects.join('  ')}</span></div></div>
        <div className="student-actions"><div className="student-rating"><Star size={16} fill="#fbbf24"/>{student.rating}</div><button className="view-profile-btn" type="button" onClick={()=>navigate(isStudentUser?'/student/profile':`/faculty/student/${student.id}`)}>{isStudentUser?'View My Profile':'View Profile'}</button></div>
      </div>)}
      {!loading && !filteredStudents.length && <p>No students matched from backend data.</p>}
    </div>
  </div>;
};

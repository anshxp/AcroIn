import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

interface SearchStudent {
  id: string;
  name: string;
  initials: string;
  profileImage?: string;
  roll: string;
  department: string;
  year: string;
  semester?: string;
  location: string;
  skills: string[];
  certifications: string[];
  projects: string[];
  searchBlob: string;
  rating: number;
  verified: boolean;
  verificationStatus: string;
  color: string;
}

interface SearchFilters {
  department: string;
  year: string;
  skill: string;
  certification: string;
  verification: string;
}

export const SmartSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    department: '',
    year: '',
    skill: '',
    certification: '',
    verification: '',
  });
  const [students, setStudents] = useState<SearchStudent[]>([]);
  const isStudentUser = user?.userType === 'student';

  const normalizeText = (value: unknown) => String(value || '').trim().toLowerCase();

  useEffect(() => {
    setSearchQuery(searchParams.get('query') || '');
  }, [searchParams]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const backendStudents = await studentAPI.getAllStudents();
        const colors = ['blue', 'green', 'purple', 'orange'];

        const normalized = backendStudents
          .map((student: any, index) => {
            const name = student.name || 'Unknown Student';
            const techStack = Array.isArray(student.tech_stack) ? student.tech_stack : [];
            const profileSkills = Array.isArray(student.skills)
              ? student.skills
                  .map((skill: any) => (typeof skill === 'string' ? skill : skill?.name))
                  .filter(Boolean)
              : [];
            const skills = Array.from(new Set([...techStack, ...profileSkills]));
            const certifications = Array.isArray(student.certificates)
              ? student.certificates
                  .flatMap((certificate: any) => [certificate?.title, certificate?.organization])
                  .filter(Boolean)
              : [];
            const projectRecords = Array.isArray(student.projects) ? student.projects : [];
            const projects = projectRecords
              .slice(0, 2)
              .map((project: any) => project?.title || 'Project');
            const projectKeywords = projectRecords.flatMap((project: any) => {
              const technologies = Array.isArray(project?.technologies) ? project.technologies : [];
              return [project?.title, project?.description, ...technologies];
            }).filter(Boolean);

            const normalizedVerification = normalizeText(student.verificationStatus);
            const verificationStatus =
              normalizedVerification === 'strongly_verified'
                ? 'strongly_verified'
                : normalizedVerification === 'verified'
                  ? 'verified'
                  : 'unverified';
            const isVerified = verificationStatus === 'verified' || verificationStatus === 'strongly_verified';
            const yearLabel = student.year || student.semester || 'N/A';
            const departmentLabel = student.department || 'Unknown';
            const locationLabel = student.location || student.address || 'Campus';
            const rollLabel = student.roll || '';
            const semesterLabel = student.semester || '';
            const searchBlob = [
              name,
              rollLabel,
              departmentLabel,
              yearLabel,
              semesterLabel,
              locationLabel,
              ...skills,
              ...certifications,
              ...projectKeywords,
            ]
              .map((value) => normalizeText(value))
              .filter(Boolean)
              .join(' ');

          return {
            id: student._id,
            name,
            initials: name
              .split(' ')
              .map((part: string) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            profileImage: student.profile_image,
            roll: rollLabel,
            department: departmentLabel,
            year: yearLabel,
            semester: semesterLabel,
            location: locationLabel,
            skills,
            certifications,
            projects,
            searchBlob,
            rating: Math.min(5, 3 + skills.length * 0.25 + (isVerified ? 0.5 : 0)),
            verified: isVerified,
            verificationStatus,
            color: colors[index % colors.length],
          };
        });

        const visibleStudents = isStudentUser
          ? normalized.filter((student) => student.verificationStatus === 'verified' || student.verificationStatus === 'strongly_verified')
          : normalized;

        setStudents(visibleStudents);
      } catch {
        setStudents([]);
      }
    };

    loadStudents();
  }, [isStudentUser]);

  const departments = useMemo(
    () => Array.from(new Set(students.map((student) => student.department))).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [students]
  );
  const years = useMemo(
    () => Array.from(new Set(students.map((student) => student.year))).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [students]
  );
  const skills = useMemo(() => {
    const values = students.flatMap((student) => student.skills);
    return Array.from(new Set(values)).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [students]);
  const certifications = useMemo(() => {
    const values = students.flatMap((student) => student.certifications);
    return Array.from(new Set(values)).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [students]);
  const verificationOptions = useMemo(() => {
    const values = students.map((student) => student.verificationStatus).filter(Boolean);
    const uniqueValues = Array.from(new Set(values));
    const order = ['strongly_verified', 'verified', 'unverified'];
    return uniqueValues.sort((a, b) => {
      const leftIndex = order.indexOf(a);
      const rightIndex = order.indexOf(b);
      const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
      return leftRank - rightRank || a.localeCompare(b);
    });
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const query = normalizeText(searchQuery);
    const matchesSearch =
      !query ||
      student.searchBlob.includes(query);

    const matchesDepartment = !filters.department || student.department === filters.department;
    const matchesYear = !filters.year || student.year === filters.year;
    const matchesSkill = !filters.skill || student.skills.includes(filters.skill);
    const matchesCertification = !filters.certification || student.certifications.includes(filters.certification);
    const matchesVerification =
      isStudentUser ||
      !filters.verification ||
      student.verificationStatus === filters.verification;

    return (
      matchesSearch
      && matchesDepartment
      && matchesYear
      && matchesSkill
      && matchesCertification
      && matchesVerification
    );
  });

  const updateFilter = (type: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      year: '',
      skill: '',
      certification: '',
      verification: '',
    });
  };

  return (
    <div>
      {/*Page Header*/}
      <div className="page-header">
        <div className="page-title-section">
          <h1>{isStudentUser ? 'Student Smart Search' : 'Smart Search'}</h1>
          <p>
            {isStudentUser
              ? 'Discover peers by department, skills, certifications, and project interests.'
              : 'Find students using AI-powered semantic search'}
          </p>
        </div>
      </div>

      {/* Search Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          {/* Search Input */}
          <div className="search-bar" style={{ maxWidth: '100%', marginBottom: '20px' }}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder={isStudentUser ? 'Search peers by skills, certifications, projects...' : 'Search by skills, projects, or interests...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="smart-search-filter-panel">
            <div className="smart-search-filter-head">
              <h4>Filters</h4>
              <button type="button" className="filter-chip" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>

            <div className="smart-search-filter-grid">
              <div className="filter-group smart-search-filter-field">
                <span className="filter-label">Department</span>
                <select className="smart-search-select" value={filters.department} onChange={(e) => updateFilter('department', e.target.value)}>
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              </div>

              <div className="filter-group smart-search-filter-field">
              <span className="filter-label">Year</span>
              <select className="smart-search-select" value={filters.year} onChange={(e) => updateFilter('year', e.target.value)}>
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              </div>

              <div className="filter-group smart-search-filter-field">
              <span className="filter-label">Skill</span>
              <select className="smart-search-select" value={filters.skill} onChange={(e) => updateFilter('skill', e.target.value)}>
                <option value="">All Skills</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              </div>

                <div className="filter-group smart-search-filter-field">
                <span className="filter-label">Certification</span>
                <select className="smart-search-select" value={filters.certification} onChange={(e) => updateFilter('certification', e.target.value)}>
                  <option value="">All Certifications</option>
                  {certifications.map((certification) => (
                    <option key={certification} value={certification}>{certification}</option>
                  ))}
                </select>
                </div>

              {!isStudentUser && (
                <div className="filter-group smart-search-filter-field">
                <span className="filter-label">Verification</span>
                <select className="smart-search-select" value={filters.verification} onChange={(e) => updateFilter('verification', e.target.value)}>
                  <option value="">All</option>
                  {verificationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Results */}
      <div className="student-list">
        {filteredStudents.map((student) => (
          <div key={student.id} className="student-card">
            {student.profileImage ? (
              <img
                src={student.profileImage}
                alt={`${student.name} profile`}
                className="student-avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className={`student-avatar`} style={{ background: student.color === 'blue' ? '#dbeafe' : student.color === 'green' ? '#dcfce7' : '#e9d5ff', color: student.color === 'blue' ? '#3b82f6' : student.color === 'green' ? '#22c55e' : '#a855f7' }}>
                {student.initials}
              </div>
            )}
            <div className="student-main">
              <div className="student-header">
                <h3 className="student-name">{student.name}</h3>
                {student.verified && (
                  <span className="verified-badge">
                    Verified
                  </span>
                )}
              </div>
              <div className="student-meta">
                <span>{student.department}</span>
                <span className="separator">•</span>
                <span>Class of {student.year}</span>
                <span className="separator">•</span>
                <span><MapPin size={14} /> {student.location}</span>
              </div>
              <div className="student-skills">
                {student.skills.map((skill, i) => (
                  <span key={i} className="student-skill">{skill}</span>
                ))}
              </div>
              <div className="student-projects">
                Recent Projects: <span>{student.projects.join('  ')}</span>
              </div>
            </div>
            <div className="student-actions">
              <div className="student-rating">
                <Star size={16} fill="#fbbf24" />
                {student.rating}
              </div>
              <button
                className="view-profile-btn"
                type="button"
                onClick={() => navigate(isStudentUser ? '/student/profile' : `/faculty/student/${student.id}`)}
              >
                {isStudentUser ? 'View My Profile' : 'View Profile'}
              </button>
            </div>
          </div>
        ))}
        {!filteredStudents.length && <p>No students matched from backend data.</p>}
      </div>
    </div>
  );
};

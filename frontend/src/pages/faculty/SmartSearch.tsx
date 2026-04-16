import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { studentAPI } from '../../services/api';

interface SearchStudent {
  id: string;
  name: string;
  initials: string;
  department: string;
  year: string;
  location: string;
  skills: string[];
  projects: string[];
  rating: number;
  verified: boolean;
  color: string;
}

export const SmartSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    skill: '',
  });
  const [students, setStudents] = useState<SearchStudent[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const backendStudents = await studentAPI.getAllStudents();
        const colors = ['blue', 'green', 'purple', 'orange'];

        const normalized = backendStudents.map((student: any, index) => {
          const name = student.name || 'Unknown Student';
          const skills = Array.isArray(student.tech_stack) ? student.tech_stack : [];
          const projects = Array.isArray(student.projects)
            ? student.projects
                .slice(0, 2)
                .map((project: any) => project?.title || 'Project')
            : [];

          return {
            id: student._id,
            name,
            initials: name
              .split(' ')
              .map((part: string) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            department: student.department || 'Unknown',
            year: student.roll ? String(student.roll).slice(0, 2) : 'N/A',
            location: student.location || 'Campus',
            skills,
            projects,
            rating: Math.min(5, 3 + skills.length * 0.25),
            verified: true,
            color: colors[index % colors.length],
          };
        });

        setStudents(normalized);
      } catch {
        setStudents([]);
      }
    };

    loadStudents();
  }, []);

  const departments = useMemo(() => Array.from(new Set(students.map((student) => student.department))).filter(Boolean), [students]);
  const years = useMemo(() => Array.from(new Set(students.map((student) => student.year))).filter(Boolean), [students]);
  const skills = useMemo(() => {
    const values = students.flatMap((student) => student.skills);
    return Array.from(new Set(values)).filter(Boolean);
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.skills.some((skill) => skill.toLowerCase().includes(query)) ||
      student.projects.some((project) => project.toLowerCase().includes(query));

    const matchesDepartment = !filters.department || student.department === filters.department;
    const matchesYear = !filters.year || student.year === filters.year;
    const matchesSkill = !filters.skill || student.skills.includes(filters.skill);

    return matchesSearch && matchesDepartment && matchesYear && matchesSkill;
  });

  const toggleFilter = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type as keyof typeof prev] === value ? '' : value
    }));
  };

  return (
    <div>
      {/*Page Header*/}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Smart Search</h1>
          <p>Find students using AI-powered semantic search</p>
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
              placeholder="Search by skills, projects, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="filters-row">
            <div className="filter-group">
              <span className="filter-label">Department:</span>
              {departments.map((dept) => (
                <button
                  key={dept}
                  className={`filter-chip ${filters.department === dept ? 'active' : ''}`}
                  onClick={() => toggleFilter('department', dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">Year:</span>
              {years.map((year) => (
                <button
                  key={year}
                  className={`filter-chip ${filters.year === year ? 'active' : ''}`}
                  onClick={() => toggleFilter('year', year)}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">Skills:</span>
              {skills.slice(0, 3).map((skill) => (
                <button
                  key={skill}
                  className={`filter-chip ${filters.skill === skill ? 'active' : ''}`}
                  onClick={() => toggleFilter('skill', skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Results */}
      <div className="student-list">
        {filteredStudents.map((student) => (
          <div key={student.id} className="student-card">
            <div className={`student-avatar`} style={{ background: student.color === 'blue' ? '#dbeafe' : student.color === 'green' ? '#dcfce7' : '#e9d5ff', color: student.color === 'blue' ? '#3b82f6' : student.color === 'green' ? '#22c55e' : '#a855f7' }}>
              {student.initials}
            </div>
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
              <button className="view-profile-btn">View Profile</button>
              <button className="connect-student-btn">Connect</button>
            </div>
          </div>
        ))}
        {!filteredStudents.length && <p>No students matched from backend data.</p>}
      </div>
    </div>
  );
};

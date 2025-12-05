import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
  Shield,
  X,
  Users,
  Briefcase,
  Award,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  BookOpen,
} from 'lucide-react';
import '../../styles/pages.css';

interface Faculty {
  _id: string;
  firstname: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  qualification: string;
  experience: number;
  phone: string;
  subjects: string[];
  skills: string[];
  techstacks: string[];
  headof: string[];
  role: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export const ManageFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([
    {
      _id: '1',
      firstname: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@university.edu',
      department: 'CSE',
      designation: 'Associate Professor',
      qualification: 'Ph.D in Computer Science',
      experience: 12,
      phone: '+91 9876543210',
      subjects: ['Data Structures', 'Machine Learning'],
      skills: ['Python', 'TensorFlow'],
      techstacks: ['Python', 'R', 'PyTorch'],
      headof: ['AI/ML Club'],
      role: ['faculty', 'dept_admin'],
      status: 'active',
      createdAt: '2024-01-10',
    },
    {
      _id: '2',
      firstname: 'Prof. Michael',
      lastName: 'Brown',
      email: 'michael.b@university.edu',
      department: 'CSE',
      designation: 'Professor',
      qualification: 'Ph.D in Software Engineering',
      experience: 20,
      phone: '+91 9876543211',
      subjects: ['Software Engineering', 'OOPS'],
      skills: ['Java', 'Architecture'],
      techstacks: ['Java', 'Spring Boot'],
      headof: [],
      role: ['faculty'],
      status: 'active',
      createdAt: '2024-01-05',
    },
    {
      _id: '3',
      firstname: 'Dr. Emily',
      lastName: 'Davis',
      email: 'emily.d@university.edu',
      department: 'ECE',
      designation: 'Assistant Professor',
      qualification: 'Ph.D in Electronics',
      experience: 8,
      phone: '+91 9876543212',
      subjects: ['Digital Electronics', 'VLSI'],
      skills: ['VHDL', 'Circuit Design'],
      techstacks: ['VHDL', 'Verilog'],
      headof: ['Electronics Club'],
      role: ['faculty'],
      status: 'active',
      createdAt: '2024-01-02',
    },
    {
      _id: '4',
      firstname: 'Dr. Robert',
      lastName: 'Wilson',
      email: 'robert.w@university.edu',
      department: 'ME',
      designation: 'Professor',
      qualification: 'Ph.D in Mechanical Engineering',
      experience: 15,
      phone: '+91 9876543213',
      subjects: ['Thermodynamics', 'Fluid Mechanics'],
      skills: ['AutoCAD', 'SolidWorks'],
      techstacks: ['MATLAB', 'ANSYS'],
      headof: ['Robotics Club'],
      role: ['faculty', 'super_admin'],
      status: 'active',
      createdAt: '2024-01-01',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'CSE', label: 'Computer Science' },
    { value: 'ECE', label: 'Electronics' },
    { value: 'ME', label: 'Mechanical' },
    { value: 'CE', label: 'Civil' },
    { value: 'IT', label: 'Information Technology' },
  ];

  const stats = {
    total: faculty.length,
    active: faculty.filter(f => f.status === 'active').length,
    deptAdmins: faculty.filter(f => f.role.includes('dept_admin')).length,
    avgExperience: Math.round(faculty.reduce((acc, f) => acc + f.experience, 0) / faculty.length),
  };

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      `${f.firstname} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || f.department === filterDepartment;
    const matchesRole = filterRole === 'all' || f.role.includes(filterRole);
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewFaculty = (f: Faculty) => {
    setSelectedFaculty(f);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleEditFaculty = (f: Faculty) => {
    setSelectedFaculty(f);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteFaculty = (id: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      setFaculty(faculty.filter((f) => f._id !== id));
    }
  };

  const getInitials = (firstname: string, lastName: string) => {
    return `${firstname[0]}${lastName[0]}`.toUpperCase();
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      CSE: '#3b82f6',
      ECE: '#8b5cf6',
      ME: '#f59e0b',
      CE: '#10b981',
      IT: '#ec4899',
    };
    return colors[dept] || '#64748b';
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('super_admin')) {
      return <span className="role-badge super-admin"><Shield size={12} /> Super Admin</span>;
    }
    if (roles.includes('dept_admin')) {
      return <span className="role-badge dept-admin"><Shield size={12} /> Dept Admin</span>;
    }
    return <span className="role-badge faculty">Faculty</span>;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Manage Faculty</h1>
          <p className="page-subtitle">View and manage all faculty members</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={18} />
            Export
          </button>
          <button className="add-button">
            <Plus size={18} />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f615', color: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Faculty</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active Faculty</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf615', color: '#8b5cf6' }}>
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.deptAdmins}</span>
            <span className="stat-label">Dept Admins</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f59e0b15', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.avgExperience} yrs</span>
            <span className="stat-label">Avg Experience</span>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="data-table-card">
        <div className="data-table-header">
          <div className="data-table-filters">
            <div className="filter-input">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="dept_admin">Dept Admin</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <button className="btn-icon">
            <Filter size={18} />
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Role</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFaculty.map((f) => (
              <tr key={f._id}>
                <td>
                  <div className="table-user">
                    <div 
                      className="table-user-avatar" 
                      style={{ background: `linear-gradient(135deg, ${getDepartmentColor(f.department)} 0%, ${getDepartmentColor(f.department)}dd 100%)` }}
                    >
                      {getInitials(f.firstname, f.lastName)}
                    </div>
                    <div className="table-user-info">
                      <h4>{f.firstname} {f.lastName}</h4>
                      <p>{f.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="designation-text">{f.designation}</span>
                </td>
                <td>
                  <span 
                    className="department-badge"
                    style={{ 
                      backgroundColor: `${getDepartmentColor(f.department)}15`,
                      color: getDepartmentColor(f.department)
                    }}
                  >
                    {f.department}
                  </span>
                </td>
                <td>
                  {getRoleBadge(f.role)}
                </td>
                <td>
                  <span className="experience-text">{f.experience} years</span>
                </td>
                <td>
                  <span className={`status-pill ${f.status}`}>
                    {f.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="view"
                      onClick={() => handleViewFaculty(f)}
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEditFaculty(f)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="role"
                      title="Change Role"
                    >
                      <Shield size={16} />
                    </button>
                    <button 
                      className="delete"
                      onClick={() => handleDeleteFaculty(f._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFaculty.length === 0 && (
          <div className="table-empty">
            <Users size={48} />
            <p>No faculty members found</p>
          </div>
        )}

        <div className="data-table-footer">
          <p>Showing {paginatedFaculty.length} of {filteredFaculty.length} faculty members</p>
          <div className="pagination">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={currentPage === page ? 'active' : ''}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      {isModalOpen && selectedFaculty && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isViewMode ? 'Faculty Details' : 'Edit Faculty'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-form">
              {/* Faculty Profile Header */}
              <div className="student-profile-header">
                <div 
                  className="student-avatar-large"
                  style={{ background: `linear-gradient(135deg, ${getDepartmentColor(selectedFaculty.department)} 0%, ${getDepartmentColor(selectedFaculty.department)}dd 100%)` }}
                >
                  {getInitials(selectedFaculty.firstname, selectedFaculty.lastName)}
                </div>
                <div className="student-profile-info">
                  <h3>{selectedFaculty.firstname} {selectedFaculty.lastName}</h3>
                  <p>{selectedFaculty.designation} • {selectedFaculty.department}</p>
                  {getRoleBadge(selectedFaculty.role)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="faculty-details-grid">
                <div className="detail-item">
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <p>{selectedFaculty.email}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Phone size={16} />
                  <div>
                    <label>Phone</label>
                    <p>{selectedFaculty.phone}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Building2 size={16} />
                  <div>
                    <label>Department</label>
                    <p>{selectedFaculty.department}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <div>
                    <label>Experience</label>
                    <p>{selectedFaculty.experience} years</p>
                  </div>
                </div>
              </div>

              {/* Qualification */}
              <div className="detail-section">
                <label><Award size={14} /> Qualification</label>
                <p>{selectedFaculty.qualification}</p>
              </div>

              {/* Subjects */}
              <div className="tech-stack-section">
                <label><BookOpen size={14} /> Subjects</label>
                <div className="tech-tags">
                  {selectedFaculty.subjects.map((subject) => (
                    <span key={subject} className="tech-tag blue">{subject}</span>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="tech-stack-section">
                <label>Tech Stack</label>
                <div className="tech-tags">
                  {selectedFaculty.techstacks.map((tech) => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

              {/* Head Of */}
              {selectedFaculty.headof.length > 0 && (
                <div className="tech-stack-section">
                  <label>Head Of</label>
                  <div className="tech-tags">
                    {selectedFaculty.headof.map((club) => (
                      <span key={club} className="tech-tag green">{club}</span>
                    ))}
                  </div>
                </div>
              )}

              {!isViewMode && (
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary">
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

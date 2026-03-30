import * as React from 'react';
import { useState } from 'react';
import { Search, Trash2, Edit2, Eye, Shield, X, Users, Briefcase, Award, Clock, Filter, ChevronLeft, ChevronRight, Mail, Phone, Building2, BookOpen } from 'lucide-react';
import '../../styles/pages.css';
const GET_FACULTY = gql`
  query GetFaculty {
    faculties {
      id
      firstname
      lastName
      email
      department
      designation
  // Apollo/GraphQL code removed for MERN migration
      phone
      subjects
      skills
      techstacks
      headof
      role
      createdAt
    }
  }
`;

export const ManageFaculty: React.FC = () => {
  const { data, loading, error } = useQuery(GET_FACULTY);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading faculty.</div>;

  const faculty = (data as any)?.faculties || [];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'CSE', label: 'Computer Science' },
    { value: 'ECE', label: 'Electronics' },
    { value: 'ME', label: 'Mechanical' },
    { value: 'CE', label: 'Civil' },
    { value: 'IT', label: 'Information Technology' },
  ];

  const filteredFaculty = faculty.filter((f: any) => {
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

  // Helper: getDepartmentColor
  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'CSE': return '#3b82f6';
      case 'ECE': return '#10b981';
      case 'ME': return '#f59e0b';
      case 'CE': return '#6366f1';
      case 'IT': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  // Helper: getInitials
  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  // Helper: getRoleBadge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="role-badge super">Super Admin</span>;
      case 'dept_admin':
        return <span className="role-badge admin">Dept Admin</span>;
      case 'faculty':
      default:
        return <span className="role-badge faculty">Faculty</span>;
    }
  };

  // Stats calculation
  const stats = {
    total: faculty.length,
    active: faculty.length, // Adjust if you have an 'active' property
    deptAdmins: faculty.filter((f: any) => f.role === 'dept_admin').length,
    avgExperience: faculty.length > 0 ? (faculty.reduce((acc: number, f: any) => acc + (f.experience || 0), 0) / faculty.length).toFixed(1) : 0,
  };

  // Handlers
  const handleViewFaculty = (f: any) => {
    setSelectedFaculty(f);
    setIsViewMode(true);
    setIsModalOpen(true);
  };
  const handleEditFaculty = (f: any) => {
    setSelectedFaculty(f);
    setIsViewMode(false);
    setIsModalOpen(true);
  };
  const handleDeleteFaculty = (_id: string) => {
    // Implement delete logic here
    alert('Delete faculty: ' + _id);
  };

  return (
    <div className="manage-faculty">
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
            {paginatedFaculty.map((f: any) => (
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
              onClick={() => setCurrentPage((p: number) => p - 1)}
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
              onClick={() => setCurrentPage((p: number) => p + 1)}
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
                  {selectedFaculty.subjects && selectedFaculty.subjects.map((subject: string) => (
                    <span key={subject} className="tech-tag blue">{subject}</span>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="tech-stack-section">
                <label>Tech Stack</label>
                <div className="tech-tags">
                  {selectedFaculty.techstacks && selectedFaculty.techstacks.map((tech: string) => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

              {/* Head Of */}
              {selectedFaculty.headof && selectedFaculty.headof.length > 0 && (
                <div className="tech-stack-section">
                  <label>Head Of</label>
                  <div className="tech-tags">
                    {selectedFaculty.headof.map((club: string) => (
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

export default ManageFaculty;

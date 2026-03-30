import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, Eye, Download, X, Users, GraduationCap, TrendingUp, Award, Filter, ChevronLeft, ChevronRight, Mail, Building2 } from 'lucide-react';
import '../../styles/pages.css';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      id
      name
      roll
      email
      department
      tech_stack
      createdAt
    }
  }
`;

interface Student {
  _id?: string;
  name: string;
  roll: string;
  email: string;
  department: string;
  tech_stack: string[];
  createdAt?: string;
  status: string;
  projectsCount: number;
  internshipsCount: number;
  competitionsCount: number;
  certificatesCount: number;
}

export const ManageStudents: React.FC = () => {
  const { data, loading, error } = useQuery<{ students: Student[] }>(GET_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading students.</div>;

  const students = data?.students || [];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'CSE', label: 'Computer Science' },
    { value: 'ECE', label: 'Electronics' },
    { value: 'ME', label: 'Mechanical' },
    { value: 'CE', label: 'Civil' },
    { value: 'IT', label: 'Information Technology' },
  ];

  const filteredStudents = students.filter((student: Student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    // Status filtering can be implemented if backend provides status
    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: students.length,
    active: students.length,
    totalProjects: students.reduce((acc: number, s: Student) => acc + (s.projectsCount || 0), 0),
    totalCertificates: students.reduce((acc: number, s: Student) => acc + (s.certificatesCount || 0), 0),
  };

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (id: string) => {
    console.log('Delete student:', id);
  };

  return (
    <div className="page-container admin-management">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Manage Students</h1>
          <p>View, verify, and manage student accounts</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => {
            setSelectedStudent({
              name: '',
              roll: '',
              email: '',
              department: 'CSE',
              tech_stack: [],
              status: 'active',
              projectsCount: 0,
              internshipsCount: 0,
              competitionsCount: 0,
              certificatesCount: 0
            });
            setIsViewMode(false);
            setIsModalOpen(true);
          }}>
            <Plus size={18} />
            <span>Add Student</span>
          </button>
          <button className="btn-secondary">
            <Download size={18} />
            <span>Export</span>
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
            <span className="stat-label">Total Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10b98115', color: '#10b981' }}>
            <GraduationCap size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Active Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf615', color: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalProjects}</span>
            <span className="stat-label">Total Projects</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f59e0b15', color: '#f59e0b' }}>
            <Award size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalCertificates}</span>
            <span className="stat-label">Total Certificates</span>
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
                placeholder="Search by name, roll, or email..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button className="btn-icon">
            <Filter size={18} />
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Department</th>
              <th>Tech Stack</th>
              <th>Stats</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student: Student) => (
              <tr key={student._id}>
                <td>
                  <div className="table-user">
                    <div 
                      className="table-user-avatar" 
                      style={{ background: `linear-gradient(135deg, ${getDepartmentColor(student.department)} 0%, ${getDepartmentColor(student.department)}dd 100%)` }}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div className="table-user-info">
                      <h4>{student.name}</h4>
                      <p>{student.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="roll-number">{student.roll}</span>
                </td>
                <td>
                  <span 
                    className="department-badge"
                    style={{ 
                      backgroundColor: `${getDepartmentColor(student.department)}15`,
                      color: getDepartmentColor(student.department)
                    }}
                  >
                    {student.department}
                  </span>
                </td>
                <td>
                  <div className="table-tech-stack">
                    {student.tech_stack.slice(0, 2).map((tech: string) => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                    {student.tech_stack.length > 2 && (
                      <span className="tech-tag more">+{student.tech_stack.length - 2}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="student-stats">
                    <span title="Projects">{student.projectsCount} P</span>
                    <span title="Internships">{student.internshipsCount} I</span>
                    <span title="Certificates">{student.certificatesCount} C</span>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="view"
                      onClick={() => handleViewStudent(student)}
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEditStudent(student)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="delete"
                      onClick={() => student._id && handleDeleteStudent(student._id)}
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

        {filteredStudents.length === 0 && (
          <div className="table-empty">
            <Users size={48} />
            <p>No students found</p>
          </div>
        )}

        <div className="data-table-footer">
          <p>Showing {paginatedStudents.length} of {filteredStudents.length} students</p>
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
      {isModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isViewMode ? 'Student Details' : 'Edit Student'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-form">
              {/* Student Profile Header */}
              <div className="student-profile-header">
                <div 
                  className="student-avatar-large"
                  style={{ background: `linear-gradient(135deg, ${getDepartmentColor(selectedStudent.department)} 0%, ${getDepartmentColor(selectedStudent.department)}dd 100%)` }}
                >
                  {getInitials(selectedStudent.name)}
                </div>
                <div className="student-profile-info">
                  <h3>{selectedStudent.name}</h3>
                  <p>{selectedStudent.roll} • {selectedStudent.department}</p>
                  <span className={`status-pill ${selectedStudent.status}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="student-stats-row">
                <div className="mini-stat">
                  <span className="mini-stat-value">{selectedStudent.projectsCount}</span>
                  <span className="mini-stat-label">Projects</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">{selectedStudent.internshipsCount}</span>
                  <span className="mini-stat-label">Internships</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">{selectedStudent.competitionsCount}</span>
                  <span className="mini-stat-label">Competitions</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-value">{selectedStudent.certificatesCount}</span>
                  <span className="mini-stat-label">Certificates</span>
                </div>
              </div>

              {/* Details */}
              <div className="student-details-grid">
                <div className="detail-item">
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <p>{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Building2 size={16} />
                  <div>
                    <label>Department</label>
                    <p>{selectedStudent.department}</p>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="tech-stack-section">
                <label>Tech Stack</label>
                <div className="tech-tags">
                  {selectedStudent.tech_stack.map((tech: string) => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

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

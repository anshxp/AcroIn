import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
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
import { useAuth } from '../../context/AuthContext';
import { adminAPI, facultyAPI } from '../../services/api';
import '../../styles/pages.css';

interface Faculty {
  _id: string;
  firstname: string;
  lastName: string;
  email: string;
  profileImage: string;
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

interface FacultyCreateForm {
  firstname: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  qualification: string;
  experience: string;
  phone: string;
  role: 'faculty' | 'dept_admin';
}

export const ManageFaculty: React.FC = () => {
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [brokenImageMap, setBrokenImageMap] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isSavingFaculty, setIsSavingFaculty] = useState(false);
  const [isUpdatingFaculty, setIsUpdatingFaculty] = useState(false);
  const [editError, setEditError] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleTargetFaculty, setRoleTargetFaculty] = useState<Faculty | null>(null);
  const [selectedRole, setSelectedRole] = useState<FacultyCreateForm['role']>('faculty');
  const [roleError, setRoleError] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetFaculty, setDeleteTargetFaculty] = useState<Faculty | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingFaculty, setIsDeletingFaculty] = useState(false);
  const [createForm, setCreateForm] = useState<FacultyCreateForm>({
    firstname: '',
    lastName: '',
    email: '',
    password: '',
    department: 'CSE',
    designation: 'Assistant Professor',
    qualification: '',
    experience: '',
    phone: '',
    role: 'faculty',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const canCreateDepartmentAdmin = user?.role?.includes('super_admin') ?? false;
  const allowedCreateRoles: FacultyCreateForm['role'][] = canCreateDepartmentAdmin
    ? ['faculty', 'dept_admin']
    : ['faculty'];

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const backendFaculty = await facultyAPI.getAllFaculty();
        const normalizedFaculty = backendFaculty.map((f: any) => ({
          _id: f._id,
          firstname: f.firstname || 'Faculty',
          lastName: f.lastName || '',
          email: f.email || 'N/A',
          profileImage: f.profilepic || f.profile_image || f.profileImage || '',
          department: f.department || 'N/A',
          designation: f.designation || 'Faculty',
          qualification: f.qualification || 'N/A',
          experience: Number(f.experience) || 0,
          phone: f.phone || 'N/A',
          subjects: Array.isArray(f.subjects) ? f.subjects : [],
          skills: Array.isArray(f.skills) ? f.skills : [],
          techstacks: Array.isArray(f.techstacks) ? f.techstacks : [],
          headof: Array.isArray(f.headof) ? f.headof : [],
          role: Array.isArray(f.role) ? f.role : ['faculty'],
          status: (f.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
          createdAt: f.createdAt || new Date().toISOString(),
        }));

        setFaculty(normalizedFaculty);
      } catch {
        setFaculty([]);
      }
    };

    loadFaculty();
  }, []);

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'CSE', label: 'Computer Science' },
    { value: 'AIML', label: 'AI & ML' },
    { value: 'DS', label: 'Data Science' },
    { value: 'CSIT', label: 'CSIT' },
    { value: 'CYBER', label: 'Cyber Security' },
    { value: 'ECE', label: 'Electronics' },
    { value: 'EEE', label: 'Electrical' },
    { value: 'VLSI', label: 'VLSI' },
    { value: 'ME', label: 'Mechanical' },
    { value: 'CE', label: 'Civil' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'IL', label: 'IL' },
  ];

  const stats = {
    total: faculty.length,
    active: faculty.filter(f => f.status === 'active').length,
    deptAdmins: faculty.filter(f => f.role.includes('dept_admin')).length,
    avgExperience: faculty.length
      ? Math.round(faculty.reduce((acc, f) => acc + f.experience, 0) / faculty.length)
      : 0,
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

  const openCreateModal = () => {
    setCreateError('');
    setCreateForm({
      firstname: '',
      lastName: '',
      email: '',
      password: '',
      department: 'CSE',
      designation: 'Assistant Professor',
      qualification: '',
      experience: '',
      phone: '',
      role: allowedCreateRoles[0],
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateFaculty = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError('');
    setIsSavingFaculty(true);

    try {
      const selectedRole = allowedCreateRoles.includes(createForm.role) ? createForm.role : allowedCreateRoles[0];

      const response = await adminAPI.createFaculty({
        firstname: createForm.firstname.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        department: createForm.department,
        designation: createForm.designation.trim(),
        qualification: createForm.qualification.trim(),
        experience: Number(createForm.experience) || 0,
        phone: createForm.phone.trim(),
        role: selectedRole,
      });

      const createdFaculty = response?.faculty;
      if (createdFaculty) {
        setFaculty((prev) => [
          {
            _id: createdFaculty._id,
            firstname: createdFaculty.firstname || createForm.firstname.trim(),
            lastName: createdFaculty.lastName || createForm.lastName.trim(),
            email: createdFaculty.email || createForm.email.trim().toLowerCase(),
            profileImage: createdFaculty.profilepic || createdFaculty.profile_image || createdFaculty.profileImage || '',
            department: createdFaculty.department || createForm.department,
            designation: createdFaculty.designation || createForm.designation.trim(),
            qualification: createdFaculty.qualification || createForm.qualification.trim(),
            experience: Number(createdFaculty.experience) || Number(createForm.experience) || 0,
            phone: createdFaculty.phone || createForm.phone.trim(),
            subjects: Array.isArray(createdFaculty.subjects) ? createdFaculty.subjects : [],
            skills: Array.isArray(createdFaculty.skills) ? createdFaculty.skills : [],
            techstacks: Array.isArray(createdFaculty.techstacks) ? createdFaculty.techstacks : [],
            headof: Array.isArray(createdFaculty.headof) ? createdFaculty.headof : [],
            role: Array.isArray(createdFaculty.role) ? createdFaculty.role : [selectedRole],
            status: 'active',
            createdAt: createdFaculty.createdAt || new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        const refetched = await facultyAPI.getAllFaculty();
        setFaculty(refetched.map((f: any) => ({
          _id: f._id,
          firstname: f.firstname || 'Faculty',
          lastName: f.lastName || '',
          email: f.email || 'N/A',
          profileImage: f.profilepic || f.profile_image || f.profileImage || '',
          department: f.department || 'N/A',
          designation: f.designation || 'Faculty',
          qualification: f.qualification || 'N/A',
          experience: Number(f.experience) || 0,
          phone: f.phone || 'N/A',
          subjects: Array.isArray(f.subjects) ? f.subjects : [],
          skills: Array.isArray(f.skills) ? f.skills : [],
          techstacks: Array.isArray(f.techstacks) ? f.techstacks : [],
          headof: Array.isArray(f.headof) ? f.headof : [],
          role: Array.isArray(f.role) ? f.role : ['faculty'],
          status: f.status === 'inactive' ? 'inactive' : 'active',
          createdAt: f.createdAt || new Date().toISOString(),
        })));
      }

      setIsCreateModalOpen(false);
      setCurrentPage(1);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || err?.message || 'Unable to create faculty account');
    } finally {
      setIsSavingFaculty(false);
    }
  };

  const openDeleteModal = (targetFaculty: Faculty) => {
    setDeleteTargetFaculty(targetFaculty);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeletingFaculty) return;
    setIsDeleteModalOpen(false);
    setDeleteTargetFaculty(null);
    setDeleteError('');
  };

  const handleDeleteFaculty = async () => {
    if (!deleteTargetFaculty) return;

    setDeleteError('');
    setIsDeletingFaculty(true);

    try {
      await facultyAPI.deleteFaculty(deleteTargetFaculty._id);
      setFaculty((prev) => prev.filter((f) => f._id !== deleteTargetFaculty._id));
      closeDeleteModal();
    } catch {
      setDeleteError('Unable to delete this faculty member. Please try again.');
    } finally {
      setIsDeletingFaculty(false);
    }
  };

  const openRoleModal = (targetFaculty: Faculty) => {
    const currentRole = targetFaculty.role?.includes('dept_admin')
        ? 'dept_admin'
        : 'faculty';

    setRoleTargetFaculty(targetFaculty);
    setSelectedRole(currentRole);
    setRoleError('');
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    if (isUpdatingRole) return;
    setIsRoleModalOpen(false);
    setRoleTargetFaculty(null);
    setRoleError('');
  };

  const handleRoleChange = async () => {
    if (!roleTargetFaculty) return;

    setRoleError('');
    setIsUpdatingRole(true);

    try {
      const updated = await facultyAPI.updateFaculty(roleTargetFaculty._id, { role: [selectedRole] });
      setFaculty((prev) => prev.map((f) => (
        f._id === roleTargetFaculty._id
          ? {
              ...f,
              role: Array.isArray((updated as any).role) ? (updated as any).role : [selectedRole],
            }
          : f
      )));

      closeRoleModal();
    } catch {
      setRoleError('Unable to change role. You might not have permission for this action.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleSaveFacultyChanges = async () => {
    if (!selectedFaculty) return;

    setEditError('');
    setIsUpdatingFaculty(true);

    try {
      const payload = {
        firstname: selectedFaculty.firstname,
        lastName: selectedFaculty.lastName,
        department: selectedFaculty.department,
        designation: selectedFaculty.designation,
        qualification: selectedFaculty.qualification,
        experience: selectedFaculty.experience,
        phone: selectedFaculty.phone,
      };

      const updated = await facultyAPI.updateFaculty(selectedFaculty._id, payload);

      setFaculty((prev) => prev.map((f) => (
        f._id === selectedFaculty._id
          ? {
              ...f,
              firstname: (updated as any).firstname ?? f.firstname,
              lastName: (updated as any).lastName ?? f.lastName,
              department: (updated as any).department ?? f.department,
              designation: (updated as any).designation ?? f.designation,
              qualification: (updated as any).qualification ?? f.qualification,
              experience: Number((updated as any).experience) || 0,
              phone: (updated as any).phone ?? f.phone,
            }
          : f
      )));

      setIsModalOpen(false);
      setSelectedFaculty(null);
    } catch (err: any) {
      setEditError(err?.response?.data?.message || 'Unable to save faculty changes');
    } finally {
      setIsUpdatingFaculty(false);
    }
  };

  const getInitials = (firstname: string, lastName: string) => {
    return `${firstname[0]}${lastName[0]}`.toUpperCase();
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      CSE: '#3b82f6',
      AIML: '#6366f1',
      DS: '#0ea5e9',
      CSIT: '#1d4ed8',
      CYBER: '#0f766e',
      ECE: '#8b5cf6',
      EEE: '#7c3aed',
      VLSI: '#9333ea',
      ME: '#f59e0b',
      CE: '#10b981',
      IT: '#ec4899',
      IL: '#64748b',
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

  const resolveImageUrl = (url?: string) => {
    if (!url || !url.trim()) return undefined;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${API_BASE_URL}${normalizedPath}`;
  };

  const markImageBroken = (key: string) => {
    setBrokenImageMap((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  const escapeCsv = (value: unknown) => {
    const normalized = String(value ?? '').replace(/\r?\n|\r/g, ' ').trim();
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFaculty = () => {
    const header = [
      'First Name',
      'Last Name',
      'Email',
      'Department',
      'Designation',
      'Role',
      'Experience',
      'Phone',
      'Status',
      'Subjects',
      'Tech Stacks',
      'Created At',
    ];

    const rows = filteredFaculty.map((item) => ([
      item.firstname,
      item.lastName,
      item.email,
      item.department,
      item.designation,
      item.role.join(' | '),
      String(item.experience),
      item.phone,
      item.status,
      item.subjects.join(' | '),
      item.techstacks.join(' | '),
      new Date(item.createdAt).toISOString(),
    ]));

    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`faculty-${dateStamp}.csv`, [header, ...rows]);
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
          <button className="btn-secondary" onClick={handleExportFaculty}>
            <Download size={18} />
            Export
          </button>
          <button className="add-button" onClick={openCreateModal}>
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
                  {(() => {
                    const imageKey = `faculty-table-${f._id}`;
                    const imageUrl = resolveImageUrl(f.profileImage);
                    const canShowImage = Boolean(imageUrl && !brokenImageMap[imageKey]);

                    return (
                  <div className="table-user">
                    <div 
                      className="table-user-avatar" 
                      style={{ background: `linear-gradient(135deg, ${getDepartmentColor(f.department)} 0%, ${getDepartmentColor(f.department)}dd 100%)` }}
                    >
                      {canShowImage ? (
                        <img
                          src={imageUrl}
                          alt={`${f.firstname} ${f.lastName}`}
                          className="avatar-image"
                          onError={() => markImageBroken(imageKey)}
                        />
                      ) : (
                        getInitials(f.firstname, f.lastName)
                      )}
                    </div>
                    <div className="table-user-info">
                      <h4>{f.firstname} {f.lastName}</h4>
                      <p>{f.email}</p>
                    </div>
                  </div>
                    );
                  })()}
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
                      onClick={() => openRoleModal(f)}
                      title="Change Role"
                    >
                      <Shield size={16} />
                    </button>
                    <button 
                      className="delete"
                      onClick={() => openDeleteModal(f)}
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

      {/* Change Role Modal */}
      {isRoleModalOpen && roleTargetFaculty && (
        <div className="modal-overlay" onClick={closeRoleModal}>
          <div className="modal-content role-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Faculty Role</h2>
              <button className="modal-close" onClick={closeRoleModal} disabled={isUpdatingRole}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <p className="role-modal-subtitle">
                Select a role for <strong>{roleTargetFaculty.firstname} {roleTargetFaculty.lastName}</strong>
              </p>

              <div className="role-options-grid">
                <button
                  type="button"
                  className={`role-option-card ${selectedRole === 'faculty' ? 'active faculty' : 'faculty'}`}
                  onClick={() => setSelectedRole('faculty')}
                >
                  <span className="role-option-title">Faculty</span>
                  <span className="role-option-description">Can verify students in own department.</span>
                </button>

                <button
                  type="button"
                  className={`role-option-card ${selectedRole === 'dept_admin' ? 'active dept' : 'dept'}`}
                  onClick={() => setSelectedRole('dept_admin')}
                >
                  <span className="role-option-title">Department Admin</span>
                  <span className="role-option-description">Can manage faculty workflows for department-level operations.</span>
                </button>

              </div>

              {roleError && (
                <div className="auth-error" style={{ marginTop: '12px' }}>
                  <span>{roleError}</span>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeRoleModal} disabled={isUpdatingRole}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleRoleChange} disabled={isUpdatingRole}>
                  {isUpdatingRole ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Faculty Modal */}
      {isDeleteModalOpen && deleteTargetFaculty && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content modal-confirm" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Faculty</h2>
              <button className="modal-close" onClick={closeDeleteModal} disabled={isDeletingFaculty}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning-banner">
                <AlertTriangle size={18} />
                <span>This action will permanently remove this faculty account.</span>
              </div>

              <div className="confirm-delete-box">
                <p className="confirm-delete-title">Are you sure you want to continue?</p>
                <p className="confirm-delete-text">
                  You are deleting <strong>{deleteTargetFaculty.firstname} {deleteTargetFaculty.lastName}</strong>. This cannot be undone.
                </p>
              </div>

              <div className="delete-faculty-preview">
                {(() => {
                  const imageKey = `faculty-delete-${deleteTargetFaculty._id}`;
                  const imageUrl = resolveImageUrl(deleteTargetFaculty.profileImage);
                  const canShowImage = Boolean(imageUrl && !brokenImageMap[imageKey]);

                  return (
                    <div className="delete-faculty-avatar" style={{ background: `linear-gradient(135deg, ${getDepartmentColor(deleteTargetFaculty.department)} 0%, ${getDepartmentColor(deleteTargetFaculty.department)}dd 100%)` }}>
                      {canShowImage ? (
                        <img
                          src={imageUrl}
                          alt={`${deleteTargetFaculty.firstname} ${deleteTargetFaculty.lastName}`}
                          className="avatar-image"
                          onError={() => markImageBroken(imageKey)}
                        />
                      ) : (
                        getInitials(deleteTargetFaculty.firstname, deleteTargetFaculty.lastName)
                      )}
                    </div>
                  );
                })()}
                <div className="delete-faculty-meta">
                  <h4>{deleteTargetFaculty.firstname} {deleteTargetFaculty.lastName}</h4>
                  <p>{deleteTargetFaculty.email}</p>
                  <span>{deleteTargetFaculty.department}</span>
                </div>
              </div>

              {deleteError && (
                <div className="auth-error" style={{ marginTop: '4px' }}>
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="modal-btn cancel" onClick={closeDeleteModal} disabled={isDeletingFaculty}>
                Cancel
              </button>
              <button type="button" className="modal-btn submit delete" onClick={handleDeleteFaculty} disabled={isDeletingFaculty}>
                {isDeletingFaculty ? 'Deleting...' : 'Delete Faculty'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Faculty Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Faculty / Faculty Admin</h2>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreateFaculty}>
              {createError && (
                <div className="auth-error">
                  <span>{createError}</span>
                </div>
              )}

              <div className="faculty-details-grid" style={{ marginBottom: 0 }}>
                <div className="detail-item">
                  <Users size={16} />
                  <div>
                    <label>First Name</label>
                    <input
                      type="text"
                      value={createForm.firstname}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, firstname: event.target.value }))}
                      placeholder="Ankit"
                      required
                    />
                  </div>
                </div>
                <div className="detail-item">
                  <Users size={16} />
                  <div>
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={createForm.lastName}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))}
                      placeholder="Sharma"
                      required
                    />
                  </div>
                </div>
                <div className="detail-item">
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="faculty@acropolis.in"
                      required
                    />
                  </div>
                </div>
                <div className="detail-item">
                  <Shield size={16} />
                  <div>
                    <label>Role</label>
                    <select
                      value={createForm.role}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as FacultyCreateForm['role'] }))}
                      disabled={allowedCreateRoles.length === 1}
                    >
                      {allowedCreateRoles.includes('faculty') && <option value="faculty">Faculty</option>}
                      {allowedCreateRoles.includes('dept_admin') && <option value="dept_admin">Department Admin</option>}
                    </select>
                  </div>
                </div>
                <div className="detail-item">
                  <Building2 size={16} />
                  <div>
                    <label>Department</label>
                    <select
                      value={createForm.department}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, department: event.target.value }))}
                    >
                      {departments.filter((dept) => dept.value !== 'all').map((dept) => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <div>
                    <label>Experience (years)</label>
                    <input
                      type="number"
                      min={0}
                      value={createForm.experience}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, experience: event.target.value }))}
                      placeholder="8"
                    />
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <label>Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Create a strong password"
                  minLength={8}
                  required
                />
              </div>

              <div className="detail-section">
                <label>Designation</label>
                <input
                  type="text"
                  value={createForm.designation}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, designation: event.target.value }))}
                  placeholder="Assistant Professor"
                  required
                />
              </div>

              <div className="detail-section">
                <label>Qualification</label>
                <input
                  type="text"
                  value={createForm.qualification}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, qualification: event.target.value }))}
                  placeholder="PhD in Computer Science"
                />
              </div>

              <div className="detail-section">
                <label>Phone</label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="9876543210"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSavingFaculty}>
                  {isSavingFaculty ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {editError && (
                <div className="auth-error" style={{ marginBottom: '12px' }}>
                  <span>{editError}</span>
                </div>
              )}

              {/* Faculty Profile Header */}
              {(() => {
                const imageKey = `faculty-modal-${selectedFaculty._id}`;
                const imageUrl = resolveImageUrl(selectedFaculty.profileImage);
                const canShowImage = Boolean(imageUrl && !brokenImageMap[imageKey]);

                return (
                  <div className="student-profile-header">
                    <div 
                      className="student-avatar-large"
                      style={{ background: `linear-gradient(135deg, ${getDepartmentColor(selectedFaculty.department)} 0%, ${getDepartmentColor(selectedFaculty.department)}dd 100%)` }}
                    >
                      {canShowImage ? (
                        <img
                          src={imageUrl}
                          alt={`${selectedFaculty.firstname} ${selectedFaculty.lastName}`}
                          className="avatar-image"
                          onError={() => markImageBroken(imageKey)}
                        />
                      ) : (
                        getInitials(selectedFaculty.firstname, selectedFaculty.lastName)
                      )}
                    </div>
                    <div className="student-profile-info">
                      <h3>{selectedFaculty.firstname} {selectedFaculty.lastName}</h3>
                      <p>{selectedFaculty.designation} • {selectedFaculty.department}</p>
                      {getRoleBadge(selectedFaculty.role)}
                    </div>
                  </div>
                );
              })()}

              {isViewMode ? (
                <>
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
                </>
              ) : (
                <div className="faculty-edit-shell">
                  <div className="faculty-edit-headline">
                    <h4>Edit Faculty Profile</h4>
                    <p>Update core profile fields and administrative metadata.</p>
                  </div>

                  <div className="faculty-edit-grid">
                    <div className="faculty-edit-field">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={selectedFaculty.firstname}
                        onChange={(event) => setSelectedFaculty((prev) => prev ? { ...prev, firstname: event.target.value } : prev)}
                        placeholder="First name"
                      />
                    </div>

                    <div className="faculty-edit-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={selectedFaculty.lastName}
                        onChange={(event) => setSelectedFaculty((prev) => prev ? { ...prev, lastName: event.target.value } : prev)}
                        placeholder="Last name"
                      />
                    </div>

                    <div className="faculty-edit-field full-width">
                      <label>Email</label>
                      <input
                        type="email"
                        value={selectedFaculty.email}
                        disabled
                        className="readonly-input"
                      />
                    </div>

                    <div className="faculty-edit-field">
                      <label>Department</label>
                      <select
                        value={selectedFaculty.department}
                        onChange={(event) => setSelectedFaculty((prev) => prev ? { ...prev, department: event.target.value } : prev)}
                      >
                        {departments
                          .filter((dept) => dept.value !== 'all')
                          .map((dept) => (
                            <option key={dept.value} value={dept.value}>{dept.label}</option>
                          ))}
                      </select>
                    </div>

                    <div className="faculty-edit-field">
                      <label>Experience (Years)</label>
                      <input
                        type="number"
                        min={0}
                        value={selectedFaculty.experience}
                        onChange={(event) => setSelectedFaculty((prev) => prev ? { ...prev, experience: Number(event.target.value) || 0 } : prev)}
                      />
                    </div>

                    <div className="faculty-edit-field">
                      <label>Phone</label>
                      <input
                        type="text"
                        value={selectedFaculty.phone}
                        onChange={(event) => setSelectedFaculty((prev) => prev ? { ...prev, phone: event.target.value } : prev)}
                        placeholder="9876543210"
                      />
                    </div>

                    <div className="faculty-edit-field">
                      <label>Designation</label>
                      <input
                        type="text"
                        value={selectedFaculty.designation}
                        onChange={(event) => setSelectedFaculty((prev) => prev ? { ...prev, designation: event.target.value } : prev)}
                        placeholder="Assistant Professor"
                      />
                    </div>

                    <div className="faculty-edit-field full-width">
                      <label>Qualification</label>
                      <input
                        type="text"
                        value={selectedFaculty.qualification}
                        onChange={(event) => setSelectedFaculty((prev) => prev ? { ...prev, qualification: event.target.value } : prev)}
                        placeholder="PhD / M.Tech / MSc"
                      />
                    </div>
                  </div>

                  <div className="faculty-edit-meta-grid">
                    <div className="faculty-meta-card">
                      <label><BookOpen size={14} /> Subjects</label>
                      <div className="tech-tags">
                        {selectedFaculty.subjects.length > 0 ? (
                          selectedFaculty.subjects.map((subject) => (
                            <span key={subject} className="tech-tag blue">{subject}</span>
                          ))
                        ) : (
                          <span className="meta-empty-text">No subjects listed</span>
                        )}
                      </div>
                    </div>

                    <div className="faculty-meta-card">
                      <label>Tech Stack</label>
                      <div className="tech-tags">
                        {selectedFaculty.techstacks.length > 0 ? (
                          selectedFaculty.techstacks.map((tech) => (
                            <span key={tech} className="tech-tag">{tech}</span>
                          ))
                        ) : (
                          <span className="meta-empty-text">No tech stack listed</span>
                        )}
                      </div>
                    </div>

                    <div className="faculty-meta-card">
                      <label>Head Of</label>
                      <div className="tech-tags">
                        {selectedFaculty.headof.length > 0 ? (
                          selectedFaculty.headof.map((club) => (
                            <span key={club} className="tech-tag green">{club}</span>
                          ))
                        ) : (
                          <span className="meta-empty-text">No clubs assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isViewMode && (
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSaveFacultyChanges} disabled={isUpdatingFaculty}>
                    {isUpdatingFaculty ? 'Saving...' : 'Save Changes'}
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

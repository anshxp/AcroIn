import axios from 'axios';
import type {
  Student,
  StudentSkill,
  Faculty,
  Internship,
  Competition,
  Certificate,
  Project,
  LoginCredentials,
  StudentRegisterData,
  FacultyRegisterData,
  AuthResponse,
  Post,
  CreatePostData,
  Opportunity,
  NotificationItem,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const unwrapData = <T>(responseData: any): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }

  return responseData as T;
};

export interface FacultyAnalyticsPayload {
  title: string;
  subtitle: string;
  stats: {
    totalProfiles: number;
    verifiedUsers: number;
    activeSearches: number;
    anomaliesDetected: number;
    verificationRate: number;
    profileGrowthPct: number;
    activeSearchesGrowthPct: number;
    newProfilesLast30Days: number;
    projectsTracked: number;
  };
  trendingSkills: Array<{
    rank: number;
    name: string;
    students: number;
    growthPct: number;
  }>;
  clusters: Array<{
    key: string;
    name: string;
    members: number;
    skills: string[];
    activityLevel: number;
  }>;
  anomalyAlerts: Array<{
    title: string;
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    user: string;
    action: string;
  }>;
}

export interface AdminSystemSettings {
  _id?: string;
  key?: string;
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    supportEmail: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    autoApproval: boolean;
  };
  security: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    maintenanceMode: boolean;
  };
  upload: {
    maxFileSizeMb: number;
    allowedFileTypes: string[];
  };
  database: {
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    lastBackupAt: string | null;
  };
}

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  studentLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/student/login', credentials);
    return response.data;
  },

  facultyLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/faculty/login', credentials);
    return response.data;
  },

  studentRegister: async (data: StudentRegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/student/register', data);
    return response.data;
  },

  facultyRegister: async (data: FacultyRegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/faculty/register', data);
    return response.data;
  },

  bootstrapAdminRegister: async (
    data: { name: string; email: string; password: string },
    bootstrapKey: string
  ): Promise<AuthResponse> => {
    const response = await api.post('/auth/internal/admin-bootstrap', data, {
      headers: {
        'x-bootstrap-key': bootstrapKey,
      },
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Student APIs
export const studentAPI = {
  getProfile: async (identifier: string): Promise<Student> => {
    const response = await api.get(`/students/${identifier}`);
    return response.data;
  },

  updateProfile: async (identifier: string, data: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${identifier}`, data);
    return response.data;
  },

  getAllStudents: async (): Promise<Student[]> => {
    const response = await api.get('/students');
    return response.data;
  },

  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/students');
    return response.data;
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  getSkills: async (id: string): Promise<StudentSkill[]> => {
    const response = await api.get(`/students/${id}/skills`);
    return response.data.skills || [];
  },

  addSkill: async (
    id: string,
    data: Omit<StudentSkill, '_id'>
  ): Promise<{ skill: StudentSkill; skills: StudentSkill[]; message: string }> => {
    const response = await api.post(`/students/${id}/skills`, data);
    return response.data;
  },

  updateSkill: async (
    id: string,
    skillId: string,
    data: Omit<StudentSkill, '_id'>
  ): Promise<{ skill: StudentSkill; skills: StudentSkill[]; message: string }> => {
    const response = await api.put(`/students/${id}/skills/${skillId}`, data);
    return response.data;
  },

  uploadProfileImage: async (identifier: string, file: File): Promise<{ profile_image: string }> => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await api.post(`/students/${identifier}/upload-profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadCoverImage: async (identifier: string, file: File): Promise<{ cover_image: string }> => {
    const formData = new FormData();
    formData.append('coverImage', file);
    const response = await api.post(`/students/${identifier}/upload-cover-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  enrollFace: async (
    identifier: string,
    files: { front: File; left: File; right: File }
  ): Promise<{ success: boolean; message: string; faceVerificationStatus: string }> => {
    const formData = new FormData();
    formData.append('front', files.front);
    formData.append('left', files.left);
    formData.append('right', files.right);

    const response = await api.post(`/students/${identifier}/face/enroll`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Faculty APIs
export const facultyAPI = {
  getProfile: async (): Promise<Faculty> => {
    const response = await api.get('/faculty/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<Faculty>): Promise<Faculty> => {
    const response = await api.put('/faculty/profile', data);
    return response.data;
  },

  getAllFaculty: async (): Promise<Faculty[]> => {
    const response = await api.get('/faculty');
    return response.data;
  },

  getFacultyById: async (id: string): Promise<Faculty> => {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  },

  updateFaculty: async (id: string, data: Partial<Faculty>): Promise<Faculty> => {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  },

  deleteFaculty: async (id: string): Promise<void> => {
    await api.delete(`/faculty/${id}`);
  },

  faceSearch: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('face', file);
    const response = await api.post('/faculty/face-search', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  verifyStudent: async (identifier: string): Promise<any> => {
    const response = await api.post(`/faculty/verify-student/${identifier}`);
    return response.data;
  },

  verifyStudentSkill: async (studentId: string, skillId: string): Promise<any> => {
    const response = await api.post(`/faculty/verify-student/${studentId}/skills/${skillId}/verify`);
    return response.data;
  },

  verifyAllStudentSkills: async (studentId: string): Promise<any> => {
    const response = await api.post(`/faculty/verify-student/${studentId}/skills/verify-all`);
    return response.data;
  },

  verifyStudentCertificate: async (studentId: string, certificateId: string): Promise<any> => {
    const response = await api.post(`/faculty/verify-student/${studentId}/certificates/${certificateId}/verify`);
    return response.data;
  },

  verifyAllStudentCertificates: async (studentId: string): Promise<any> => {
    const response = await api.post(`/faculty/verify-student/${studentId}/certificates/verify-all`);
    return response.data;
  },
};

export const adminAPI = {
  createFaculty: async (data: {
    firstname: string;
    lastName: string;
    email: string;
    password: string;
    department: string;
    designation: string;
    qualification: string;
    experience: number;
    phone: string;
    role: 'faculty' | 'dept_admin' | 'super_admin';
    subjects?: string[];
    skills?: string[];
    techstacks?: string[];
    headof?: string[];
  }): Promise<any> => {
    const response = await api.post('/admin/faculty/create', data);
    return response.data;
  },

  assignRole: async (userId: string, role: 'faculty' | 'dept_admin' | 'super_admin' | 'admin'): Promise<any> => {
    const response = await api.post('/admin/assign-role', { userId, role });
    return response.data;
  },
};

// Internship APIs
export const internshipAPI = {
  getAll: async (): Promise<Internship[]> => {
    const response = await api.get('/internships');
    return unwrapData<Internship[]>(response.data);
  },

  getByStudent: async (studentId: string): Promise<Internship[]> => {
    const response = await api.get(`/internships/student/${studentId}`);
    return unwrapData<Internship[]>(response.data);
  },

  create: async (data: Omit<Internship, '_id' | 'createdAt' | 'updatedAt' | 'student'> & { student?: string }): Promise<Internship> => {
    const response = await api.post('/internships', data);
    return unwrapData<Internship>(response.data);
  },

  update: async (id: string, data: Partial<Internship>): Promise<Internship> => {
    const response = await api.put(`/internships/${id}`, data);
    return unwrapData<Internship>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/internships/${id}`);
  },
};

// Competition APIs
export const competitionAPI = {
  getAll: async (): Promise<Competition[]> => {
    const response = await api.get('/competitions');
    return unwrapData<Competition[]>(response.data);
  },

  getByStudent: async (studentId: string): Promise<Competition[]> => {
    const response = await api.get(`/competitions/student/${studentId}`);
    return unwrapData<Competition[]>(response.data);
  },

  create: async (data: Omit<Competition, '_id' | 'createdAt' | 'updatedAt' | 'student'> & { student?: string }): Promise<Competition> => {
    const response = await api.post('/competitions', data);
    return unwrapData<Competition>(response.data);
  },

  update: async (id: string, data: Partial<Competition>): Promise<Competition> => {
    const response = await api.put(`/competitions/${id}`, data);
    return unwrapData<Competition>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/competitions/${id}`);
  },
};

// Certificate APIs
export const certificateAPI = {
  getAll: async (): Promise<Certificate[]> => {
    const response = await api.get('/certificates');
    return unwrapData<Certificate[]>(response.data);
  },

  getByStudent: async (studentId: string): Promise<Certificate[]> => {
    const response = await api.get(`/certificates/student/${studentId}`);
    return unwrapData<Certificate[]>(response.data);
  },

  create: async (data: Omit<Certificate, '_id' | 'createdAt' | 'updatedAt' | 'student'> & { student?: string }): Promise<Certificate> => {
    const response = await api.post('/certificates', data);
    return unwrapData<Certificate>(response.data);
  },

  update: async (id: string, data: Partial<Certificate>): Promise<Certificate> => {
    const response = await api.put(`/certificates/${id}`, data);
    return unwrapData<Certificate>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/certificates/${id}`);
  },
};

// Notification APIs
export const notificationAPI = {
  getByUser: async (userId: string): Promise<NotificationItem[]> => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<NotificationItem> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

// Project APIs
export const projectAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return unwrapData<Project[]>(response.data);
  },

  getByStudent: async (studentId: string): Promise<Project[]> => {
    const response = await api.get(`/projects/student/${studentId}`);
    return unwrapData<Project[]>(response.data);
  },

  create: async (data: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return unwrapData<Project>(response.data);
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return unwrapData<Project>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Post APIs (LinkedIn-style posts)
export const postAPI = {
  getAll: async (): Promise<Post[]> => {
    const response = await api.get('/posts');
    return unwrapData<Post[]>(response.data);
  },

  getById: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  create: async (data: CreatePostData): Promise<Post> => {
    const files = Array.isArray(data.files) ? data.files : [];

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('content', data.content);

      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return unwrapData<Post>(response.data);
    }

    const response = await api.post('/posts', {
      content: data.content,
      images: data.images,
    });
    return unwrapData<Post>(response.data);
  },

  update: async (id: string, data: Partial<CreatePostData>): Promise<Post> => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  like: async (id: string): Promise<Post> => {
    const response = await api.post(`/posts/${id}/like`);
    return unwrapData<Post>(response.data);
  },

  unlike: async (id: string): Promise<Post> => {
    const response = await api.post(`/posts/${id}/unlike`);
    return unwrapData<Post>(response.data);
  },

  addComment: async (id: string, content: string): Promise<Post> => {
    const response = await api.post(`/posts/${id}/comments`, { content });
    return unwrapData<Post>(response.data);
  },

  deleteComment: async (postId: string, commentId: string): Promise<Post> => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return unwrapData<Post>(response.data);
  },
};

export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    const response = await api.get('/opportunities');
    return Array.isArray(response.data) ? response.data : [];
  },

  getById: async (id: string): Promise<Opportunity> => {
    const response = await api.get(`/opportunities/${id}`);
    return unwrapData<Opportunity>(response.data);
  },

  create: async (data: Omit<Opportunity, '_id' | 'createdAt' | 'updatedAt'> & { files?: File[] }): Promise<Opportunity> => {
    const files = Array.isArray(data.files) ? data.files : [];

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('type', data.type);
      if (data.company) formData.append('company', data.company);
      if (data.location) formData.append('location', data.location);
      if (data.eventDate) formData.append('eventDate', data.eventDate);
      if (data.deadline) formData.append('deadline', data.deadline);
      if (data.description) formData.append('description', data.description);
      formData.append('application_link', data.application_link);
      formData.append('isActive', String(data.isActive));
      formData.append('createdBy', data.createdBy);
      formData.append('createdByRole', data.createdByRole);

      (Array.isArray(data.requirements) ? data.requirements : []).forEach((requirement) => {
        formData.append('requirements', requirement);
      });

      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/opportunities', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrapData<Opportunity>(response.data);
    }

    const response = await api.post('/opportunities', data);
    return unwrapData<Opportunity>(response.data);
  },

  update: async (id: string, data: Partial<Opportunity>): Promise<Opportunity> => {
    const response = await api.put(`/opportunities/${id}`, data);
    return unwrapData<Opportunity>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/opportunities/${id}`);
  },
};

export const uiAPI = {
  getFacultyAnalytics: async (): Promise<FacultyAnalyticsPayload> => {
    const response = await api.get('/ui/faculty/analytics');
    return unwrapData<FacultyAnalyticsPayload>(response.data);
  },

  getAdminSettings: async (): Promise<AdminSystemSettings> => {
    const response = await api.get('/ui/admin/settings');
    return unwrapData<AdminSystemSettings>(response.data);
  },

  updateAdminSettings: async (payload: AdminSystemSettings): Promise<AdminSystemSettings> => {
    const response = await api.put('/ui/admin/settings', payload);
    return unwrapData<AdminSystemSettings>(response.data);
  },
};

export default api;

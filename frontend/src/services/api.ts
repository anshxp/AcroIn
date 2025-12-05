import axios from 'axios';
import type {
  Student,
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
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Student APIs
export const studentAPI = {
  getProfile: async (): Promise<Student> => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<Student>): Promise<Student> => {
    const response = await api.put('/student/profile', data);
    return response.data;
  },

  getAllStudents: async (): Promise<Student[]> => {
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

  deleteFaculty: async (id: string): Promise<void> => {
    await api.delete(`/faculty/${id}`);
  },
};

// Internship APIs
export const internshipAPI = {
  getAll: async (): Promise<Internship[]> => {
    const response = await api.get('/internships');
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<Internship[]> => {
    const response = await api.get(`/internships/student/${studentId}`);
    return response.data;
  },

  create: async (data: Omit<Internship, '_id' | 'createdAt' | 'updatedAt'>): Promise<Internship> => {
    const response = await api.post('/internships', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Internship>): Promise<Internship> => {
    const response = await api.put(`/internships/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/internships/${id}`);
  },
};

// Competition APIs
export const competitionAPI = {
  getAll: async (): Promise<Competition[]> => {
    const response = await api.get('/competitions');
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<Competition[]> => {
    const response = await api.get(`/competitions/student/${studentId}`);
    return response.data;
  },

  create: async (data: Omit<Competition, '_id' | 'createdAt' | 'updatedAt'>): Promise<Competition> => {
    const response = await api.post('/competitions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Competition>): Promise<Competition> => {
    const response = await api.put(`/competitions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/competitions/${id}`);
  },
};

// Certificate APIs
export const certificateAPI = {
  getAll: async (): Promise<Certificate[]> => {
    const response = await api.get('/certificates');
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<Certificate[]> => {
    const response = await api.get(`/certificates/student/${studentId}`);
    return response.data;
  },

  create: async (data: Omit<Certificate, '_id' | 'createdAt' | 'updatedAt'>): Promise<Certificate> => {
    const response = await api.post('/certificates', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Certificate>): Promise<Certificate> => {
    const response = await api.put(`/certificates/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/certificates/${id}`);
  },
};

// Project APIs
export const projectAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getByStudent: async (studentId: string): Promise<Project[]> => {
    const response = await api.get(`/projects/student/${studentId}`);
    return response.data;
  },

  create: async (data: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Post APIs (LinkedIn-style posts)
export const postAPI = {
  getAll: async (): Promise<Post[]> => {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch {
      // Return mock data if API not available
      return getMockPosts();
    }
  },

  getById: async (id: string): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  create: async (data: CreatePostData): Promise<Post> => {
    try {
      const response = await api.post('/posts', data);
      return response.data;
    } catch {
      // Return mock created post if API not available
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        _id: Date.now().toString(),
        author: {
          _id: user.id,
          name: user.name || `${user.firstname} ${user.lastName}`,
          designation: user.designation,
          department: user.department,
          userType: user.userType,
        },
        content: data.content,
        images: data.images,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  update: async (id: string, data: Partial<CreatePostData>): Promise<Post> => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  like: async (id: string): Promise<Post> => {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    } catch {
      // Return mock response
      return {} as Post;
    }
  },

  unlike: async (id: string): Promise<Post> => {
    try {
      const response = await api.post(`/posts/${id}/unlike`);
      return response.data;
    } catch {
      return {} as Post;
    }
  },

  addComment: async (id: string, content: string): Promise<Post> => {
    try {
      const response = await api.post(`/posts/${id}/comments`, { content });
      return response.data;
    } catch {
      return {} as Post;
    }
  },

  deleteComment: async (postId: string, commentId: string): Promise<Post> => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
};

// Mock posts for demo
const getMockPosts = (): Post[] => [
  {
    _id: '1',
    author: {
      _id: 'f1',
      name: 'Dr. Rajesh Kumar',
      designation: 'Professor',
      department: 'Computer Science',
      userType: 'faculty',
    },
    content: '🎉 Excited to announce that our department has been awarded the "Center of Excellence" status by AICTE! This recognition is a testament to the hard work of our faculty and students.\n\nWe are committed to pushing the boundaries of innovation in AI and Machine Learning. Congratulations to everyone involved!',
    images: [],
    likes: ['s1', 's2', 's3', 's4', 's5'],
    comments: [
      {
        _id: 'c1',
        author: { _id: 's1', name: 'Rahul Sharma', userType: 'student' },
        content: 'Congratulations sir! This is a proud moment for all of us.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '2',
    author: {
      _id: 'f2',
      name: 'Dr. Priya Patel',
      designation: 'Associate Professor',
      department: 'Information Technology',
      userType: 'faculty',
    },
    content: '📢 Upcoming Campus Placement Drive!\n\nCompanies visiting next week:\n• TCS - Dec 10\n• Infosys - Dec 11\n• Wipro - Dec 12\n• Cognizant - Dec 13\n\nAll eligible students please update your profiles and ensure your documents are verified. Best of luck! 🍀',
    images: [],
    likes: ['s1', 's3', 's5', 's7', 's9', 's11', 's13'],
    comments: [
      {
        _id: 'c2',
        author: { _id: 's2', name: 'Priya Singh', userType: 'student' },
        content: 'Thank you for the update ma\'am! Looking forward to it.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        _id: 'c3',
        author: { _id: 's4', name: 'Amit Kumar', userType: 'student' },
        content: 'Is there any criteria for TCS?',
        createdAt: new Date(Date.now() - 900000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: '3',
    author: {
      _id: 'a1',
      name: 'Admin User',
      designation: 'System Administrator',
      department: 'Administration',
      userType: 'admin',
    },
    content: '🔔 Important Notice:\n\nThe college will remain closed on December 25th and 26th for Christmas holidays. All pending verifications will be processed after the holidays.\n\nWishing everyone a Merry Christmas! 🎄',
    images: [],
    likes: ['s2', 's4', 's6'],
    comments: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default api;

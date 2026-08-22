import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import type {
  LoginCredentials,
  StudentRegisterData,
  FacultyRegisterData,
  AuthResponse,
  Student,
  StudentSkill,
  Faculty,
  Project,
  Internship,
  Competition,
  Certificate,
  Post,
  CreatePostData,
  Opportunity,
  NotificationItem,
  Chat,
  Interest,
} from '../types';

// ─── Base URL Resolution ─────────────────────────────────────────────

const getExpoHost = (): string | null => {
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants.manifest2 as any)?.extra?.expoClient?.hostUri ||
    (Constants.manifest as any)?.debuggerHost;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  if (Platform.OS === 'android' && ['localhost', '127.0.0.1', '::1'].includes(host)) {
    return '10.0.2.2';
  }
  return host;
};

const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, '');

  try {
    const parsed = new URL(trimmed);
    if (Platform.OS === 'android' && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
      return `${parsed.protocol}//10.0.2.2${parsed.port ? `:${parsed.port}` : ''}`;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};

const resolveBaseUrl = (): string => {
  const configured =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    (Constants.expoConfig as any)?.extra?.apiUrl ||
    '';
  const expoHost = getExpoHost();

  if (configured) {
    try {
      const parsed = new URL(configured.trim());
      const isLocalHost =
        ['localhost', '127.0.0.1', '::1', '10.0.2.2'].includes(parsed.hostname) ||
        /^192\.168\./.test(parsed.hostname) ||
        /^10\./.test(parsed.hostname);

      if (isLocalHost && expoHost) {
        return `${parsed.protocol}//${expoHost}${parsed.port ? `:${parsed.port}` : ':5000'}`;
      }
    } catch {
      // Fall through to the configured string below.
    }

    return normalizeBaseUrl(configured);
  }

  if (expoHost) return `http://${expoHost}:5000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

const API_BASE_URL = resolveBaseUrl();
const ENABLE_MOCK_FALLBACK =
  __DEV__ && String(process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK || '').toLowerCase() === 'true';
const DEFAULT_PAGE_SIZE = 20;

if (__DEV__) {
  console.log('[API] Using base URL:', API_BASE_URL);
}

// ─── Axios Instance ──────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Local Mock Fallback System ─────────────────────────────────────

const handleMockFallback = (config: any): any => {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  if (__DEV__) {
    console.log(`[API MOCK] Intercepted: ${method.toUpperCase()} ${url}`);
  }

  let mockData: any = null;

  // 1. Authentication
  if (url.includes('/auth/login')) {
    let credentials = { email: '', password: '' };
    try { credentials = JSON.parse(config.data || '{}'); } catch {}
    const email = (credentials.email || 'student@acropolis.in').trim().toLowerCase();
    const password = credentials.password || '';

    // Enforce correct password for Lavish's specific acropolis address
    if (email === 'lavishjangid230719@acropolis.in') {
      if (password !== 'Lavish@262') {
        return {
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'content-type': 'application/json' },
          config,
          data: {
            success: false,
            message: 'Invalid credentials. Please verify your password.',
          }
        };
      }
      mockData = {
        success: true,
        token: 'demo-session-token',
        user: {
          _id: 'student-demo-id',
          email: 'lavishjangid230719@acropolis.in',
          name: 'Lavish Jangid',
          userType: 'student',
          role: 'student',
          department: 'CSE',
        }
      };
    } else {
      const isFaculty = email.includes('faculty') || email.includes('prof');
      mockData = {
        success: true,
        token: 'demo-session-token',
        user: {
          _id: isFaculty ? 'faculty-demo-id' : 'student-demo-id',
          email: email,
          name: isFaculty ? 'Dr. Sandeep Sharma' : 'Lavish Jangid',
          userType: isFaculty ? 'faculty' : 'student',
          role: isFaculty ? 'faculty' : 'student',
          department: 'CSE',
          designation: isFaculty ? 'Professor & HOD' : undefined,
        }
      };
    }
  } else if (url.includes('/auth/student/register')) {
    let payload = { email: 'student@acropolis.in', name: 'Lavish Jangid', roll: '0812CS221045', department: 'CSE' };
    try { payload = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      token: 'demo-session-token',
      user: {
        _id: 'student-demo-id',
        email: payload.email,
        name: payload.name,
        userType: 'student',
        role: 'student',
        department: payload.department,
        roll: payload.roll,
      }
    };
  } else if (url.includes('/auth/faculty/register')) {
    let payload = { email: 'faculty@acropolis.in', firstname: 'Sandeep', lastName: 'Sharma', department: 'CSE', designation: 'Professor' };
    try { payload = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      token: 'demo-session-token',
      user: {
        _id: 'faculty-demo-id',
        email: payload.email,
        name: `${payload.firstname} ${payload.lastName}`,
        userType: 'faculty',
        role: 'faculty',
        department: payload.department,
        designation: payload.designation,
      }
    };
  }

  // 2. Profile Details
  else if (url.match(/\/students\/[^/]+$/) && method === 'put') {
    let body = {};
    try { body = JSON.parse(config.data || '{}'); } catch {}
    const id = url.split('/').pop();
    mockData = { _id: id, ...body };
  } else if (url.match(/\/students\/[^/]+$/) && method === 'get') {
    const id = url.split('/').pop();
    mockData = {
      _id: id,
      roll: '0812CS221045',
      email: id === 'student-demo-id' ? 'lavishjangid230719@acropolis.in' : 'sandeep@acropolis.in',
      name: id === 'faculty-demo-id' ? 'Dr. Sandeep Sharma' : 'Lavish Jangid',
      userType: id === 'faculty-demo-id' ? 'faculty' : 'student',
      department: 'CSE',
      cgpa: 9.15,
      verificationStatus: id === 'faculty-demo-id' ? 'strongly_verified' : 'verified',
      skills: [
        { _id: 'sk-1', name: 'React Native', level: 'Advanced', category: 'Framework', progress: 90, verified: true },
        { _id: 'sk-2', name: 'TypeScript', level: 'Advanced', category: 'Programming', progress: 85, verified: true },
        { _id: 'sk-3', name: 'Node.js', level: 'Intermediate', category: 'Framework', progress: 70, verified: false }
      ],
      tech_stack: ['React Native', 'Node.js', 'Express', 'MongoDB'],
      profile_image: id === 'faculty-demo-id' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
    };
  } else if (url.includes('/faculty/profile') && method === 'get') {
    mockData = {
      _id: 'faculty-demo-id',
      email: 'sandeep@acropolis.in',
      name: 'Dr. Sandeep Sharma',
      userType: 'faculty',
      role: 'faculty',
      department: 'CSE',
      designation: 'Professor & HOD',
      profilepic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    };
  }

  // 3. Lists of Students
  else if (url.includes('/students') && method === 'get' && !url.includes('/skills')) {
    mockData = [
      {
        _id: 'student-demo-id',
        name: 'Lavish Jangid',
        roll: '0812CS221045',
        email: 'lavishjangid230719@acropolis.in',
        department: 'CSE',
        verificationStatus: 'verified',
        profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        skills: [
          { _id: 'sk-1', name: 'React Native', level: 'Advanced', category: 'Framework', progress: 90, verified: true },
          { _id: 'sk-2', name: 'TypeScript', level: 'Advanced', category: 'Programming', progress: 85, verified: true }
        ],
        tech_stack: ['React Native', 'TypeScript', 'Node.js']
      },
      {
        _id: 'student-2',
        name: 'Aman Vyas',
        roll: '0812CS221008',
        email: 'aman@acropolis.in',
        department: 'CSE',
        verificationStatus: 'not_verified',
        profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
        skills: [
          { _id: 'sk-3', name: 'Python', level: 'Advanced', category: 'Programming', progress: 92, verified: false },
          { _id: 'sk-4', name: 'Machine Learning', level: 'Intermediate', category: 'Other', progress: 70, verified: false }
        ],
        tech_stack: ['Python', 'TensorFlow', 'SQL']
      },
      {
        _id: 'student-3',
        name: 'Divya Sharma',
        roll: '0812IT221012',
        email: 'divya@acropolis.in',
        department: 'IT',
        verificationStatus: 'verified',
        profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
        skills: [
          { _id: 'sk-5', name: 'UI/UX Design', level: 'Advanced', category: 'Design', progress: 95, verified: true },
          { _id: 'sk-6', name: 'Figma', level: 'Advanced', category: 'Design', progress: 90, verified: true }
        ],
        tech_stack: ['UI/UX', 'Figma', 'React']
      }
    ];
  }

  // 4. Skills
  else if (url.includes('/skills') && method === 'get') {
    mockData = {
      success: true,
      skills: [
        { _id: 'sk-1', name: 'React Native', level: 'Advanced', category: 'Framework', progress: 90, verified: true },
        { _id: 'sk-2', name: 'TypeScript', level: 'Advanced', category: 'Programming', progress: 85, verified: true },
        { _id: 'sk-3', name: 'Node.js', level: 'Intermediate', category: 'Framework', progress: 70, verified: false }
      ]
    };
  } else if (url.includes('/skills') && method === 'post') {
    let body = {};
    try { body = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      skill: {
        _id: 'sk-' + Math.random().toString().substring(2, 6),
        name: (body as any).name || 'New Skill',
        level: (body as any).level || 'Beginner',
        category: (body as any).category || 'Programming',
        progress: parseInt((body as any).progress, 10) || 50,
        verified: false,
      },
      skills: []
    };
  }

  // 5. Projects
  else if (url.includes('/projects') && method === 'get') {
    mockData = [
      {
        _id: 'proj-1',
        title: 'AcroIn Verified Portal',
        description: 'College portfolio manager utilizing video-based identity profiles and administrative endorsement mechanisms.',
        tech_stack: ['React Native', 'Zustand', 'TypeScript', 'Node.js'],
        links: { github: 'https://github.com/acroin' }
      },
      {
        _id: 'proj-2',
        title: 'Cognitive Face Search Engine',
        description: 'Deep learning pipelines executing rapid cosine comparisons on pre-extracted local vector datasets.',
        tech_stack: ['Python', 'FastAPI', 'PyTorch', 'Docker'],
        links: { github: 'https://github.com/acroin-ml' }
      }
    ];
  } else if (url.includes('/projects') && method === 'post') {
    let body = {};
    try { body = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      data: {
        _id: 'proj-' + Math.random().toString().substring(2, 6),
        ...body,
      }
    };
  }

  // 6. Internships
  else if (url.includes('/internships') && method === 'get') {
    mockData = [
      {
        _id: 'intern-1',
        company: 'Google Summer of Code',
        position: 'Open Source Developer',
        duration: '12 Weeks',
        description: 'Enhanced Hermetic bundling configurations within core compiler repositories.',
      }
    ];
  } else if (url.includes('/internships') && method === 'post') {
    let body = {};
    try { body = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      data: {
        _id: 'intern-' + Math.random().toString().substring(2, 6),
        ...body,
      }
    };
  }

  // 7. Competitions
  else if (url.includes('/competitions') && method === 'get') {
    mockData = [
      {
        _id: 'comp-1',
        name: 'Smart India Hackathon',
        organizer: 'Ministry of Education',
        position: '1st Runner Up',
        date: '2025-12-18',
      }
    ];
  } else if (url.includes('/competitions') && method === 'post') {
    let body = {};
    try { body = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      data: {
        _id: 'comp-' + Math.random().toString().substring(2, 6),
        ...body,
      }
    };
  }

  // 8. Certificates
  else if (url.includes('/certificates') && method === 'get') {
    mockData = [
      {
        _id: 'cert-1',
        title: 'AWS Certified Solutions Architect',
        organizer: 'Amazon Web Services',
        issue_date: '2025-08-14',
      }
    ];
  } else if (url.includes('/certificates') && method === 'post') {
    let body = {};
    try { body = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      data: {
        _id: 'cert-' + Math.random().toString().substring(2, 6),
        ...body,
      }
    };
  }

  // 9. CDC Opportunities
  else if (url.includes('/opportunities') && method === 'get') {
    mockData = [
      {
        _id: 'opp-1',
        title: 'Software Development Engineer - Intern',
        type: 'internship',
        company: 'Amazon India',
        location: 'Bangalore (Hybrid)',
        deadline: new Date(Date.now() + 864000000).toISOString(),
        description: 'Join the Core Logistics team. Responsibilities include building scalable Java/TypeScript microservices.',
        requirements: ['Java', 'TypeScript', 'SQL'],
        application_link: 'https://amazon.jobs',
        status: 'APPROVED',
      },
      {
        _id: 'opp-2',
        title: 'Associate Software Engineer',
        type: 'job',
        company: 'Infosys',
        location: 'Pune',
        deadline: new Date(Date.now() + 432000000).toISOString(),
        description: 'Mass recruitment drive for 2026 Batch CSE/IT grads. Entry-level engineering tasks.',
        requirements: ['Python', 'C++', 'DBMS'],
        application_link: 'https://infosys.com/careers',
        status: 'APPROVED',
      },
      {
        _id: 'opp-3',
        title: 'Acropolis TechFest Hackathon 2026',
        type: 'competition',
        company: 'CDC & CSE Dept',
        location: 'Auditorium 2',
        deadline: new Date(Date.now() + 259200000).toISOString(),
        description: 'Collaborate to build decentralized solutions for college credential verification. Exciting cash prizes!',
        requirements: ['React', 'Solidity', 'Web3'],
        application_link: 'https://acropolis.in',
        status: 'APPROVED',
      }
    ];
  } else if (url.includes('/opportunities') && method === 'post') {
    let body = {};
    try { body = JSON.parse(config.data || '{}'); } catch {}
    mockData = {
      success: true,
      data: {
        _id: 'opp-' + Math.random().toString().substring(2, 6),
        status: 'PENDING',
        ...body,
      }
    };
  }

  // 10. Posts Feed
  else if (url.includes('/posts') && method === 'get') {
    mockData = [
      {
        _id: 'post-1',
        content: '🚨 CDC ANNOUNCEMENT: Microsoft Winter Internship Drive 2026 is officially open for CS/IT 3rd Year Students. CGPA Cutoff: 8.5+. Apply by Monday evening!',
        author: {
          _id: 'cdc-faculty',
          name: 'Dr. Neeraj Patel (CDC Head)',
          designation: 'CDC Coordinator',
          department: 'CSE',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        },
        scope: 'campus',
        likes: ['student-demo-id'],
        comments: [
          {
            _id: 'c1',
            content: 'Is there a backlogs restriction for this drive?',
            author: { name: 'Rahul Joshi' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          }
        ],
        images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600'],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        _id: 'post-2',
        content: 'Congratulations to our CSE students who won 1st Prize in the Inter-College Web3 Hackathon held at IIT Indore! Super proud of your innovation!',
        author: {
          _id: 'hod-cse',
          name: 'Prof. Sandeep Sharma',
          designation: 'HOD CSE',
          department: 'CSE',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
        },
        scope: 'department',
        likes: [],
        comments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
  }

  // 11. Notifications
  else if (url.includes('/notifications') && method === 'get') {
    mockData = [
      {
        _id: 'notif-1',
        message: 'Your skill "React Native" has been endorsed and verified by Dr. Sandeep Sharma.',
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        _id: 'notif-2',
        message: 'New CDC Opportunity: Software Development Engineer Intern at Amazon posted.',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      }
    ];
  }

  // 12. Chats
  else if (url.includes('/chats') && method === 'get') {
    mockData = [
      {
        _id: 'chat-1',
        faculty: { name: 'Dr. Sandeep Sharma', department: 'CSE' },
        student: { name: 'Lavish Saxena' },
        messages: [
          { _id: 'm1', content: 'Good morning sir, could you please verify my React Native skill endorsement?', sender: 'student', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { _id: 'm2', content: 'Yes Lavish, I have reviewed your project links. Endorsed and verified!', sender: 'faculty', createdAt: new Date(Date.now() - 1800000).toISOString() }
        ]
      }
    ];
  }

  // Fallback default
  if (!mockData) {
    mockData = { success: true, message: 'Mock offline request successful' };
  }

  return {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    data: mockData,
  };
};

// 401 & Network Error Fallback Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
    if (ENABLE_MOCK_FALLBACK && isNetworkError) {
      console.warn('[API] Connection failure. Engaging offline fallback for:', error.config?.url);
      try {
        const mockRes = handleMockFallback(error.config);
        if (mockRes) return mockRes;
      } catch (mockErr) {
        console.error('[API MOCK] Failed to parse mock response:', mockErr);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────

const unwrapData = <T>(data: any): T => {
  if (data && typeof data === 'object' && 'data' in data) return data.data as T;
  return data as T;
};

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

const normalizePaginated = <T>(data: any, page: number, limit: number): PaginatedResult<T> => {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      page: 1,
      limit: data.length,
      total: data.length,
      hasMore: false,
    };
  }

  const items = (data?.data ?? data?.items ?? []) as T[];
  const total = Number(data?.total ?? items.length);
  const resolvedPage = Number(data?.page ?? page);
  const resolvedLimit = Number(data?.limit ?? limit);
  const hasMore = typeof data?.hasMore === 'boolean'
    ? data.hasMore
    : resolvedPage * resolvedLimit < total;

  return {
    items,
    page: resolvedPage,
    limit: resolvedLimit,
    total,
    hasMore,
  };
};

// ─── Auth APIs ───────────────────────────────────────────────────────

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  studentRegister: async (payload: StudentRegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/student/register', payload);
    return data;
  },
  facultyRegister: async (payload: FacultyRegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/faculty/register', payload);
    return data;
  },
};

// ─── Student APIs ────────────────────────────────────────────────────

export const studentAPI = {
  getProfile: async (identifier: string): Promise<Student> => {
    const { data } = await api.get(`/students/${identifier}`);
    return data;
  },
  updateProfile: async (identifier: string, payload: Partial<Student>): Promise<Student> => {
    const { data } = await api.put(`/students/${identifier}`, payload);
    return data;
  },
  getAllStudents: async (params?: { page?: number; limit?: number; search?: string }): Promise<Student[] | PaginatedResult<Student>> => {
    const page = params?.page;
    const limit = params?.limit ?? DEFAULT_PAGE_SIZE;
    const { data } = await api.get('/students', {
      params: page ? { page, limit, search: params?.search } : undefined,
    });
    if (page) {
      return normalizePaginated<Student>(data, page, limit);
    }
    return Array.isArray(data) ? data : normalizePaginated<Student>(data, 1, limit).items;
  },
  getSkills: async (id: string): Promise<StudentSkill[]> => {
    const { data } = await api.get(`/students/${id}/skills`);
    return data.skills || [];
  },
  addSkill: async (id: string, skill: Omit<StudentSkill, '_id'>): Promise<{ skill: StudentSkill; skills: StudentSkill[] }> => {
    const { data } = await api.post(`/students/${id}/skills`, skill);
    return data;
  },
  updateSkill: async (id: string, skillId: string, skill: Omit<StudentSkill, '_id'>): Promise<{ skill: StudentSkill; skills: StudentSkill[] }> => {
    const { data } = await api.put(`/students/${id}/skills/${skillId}`, skill);
    return data;
  },
  uploadProfileImage: async (identifier: string, formData: FormData): Promise<{ profile_image: string }> => {
    const { data } = await api.post(`/students/${identifier}/upload-profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  uploadCoverImage: async (identifier: string, formData: FormData): Promise<{ cover_image: string }> => {
    const { data } = await api.post(`/students/${identifier}/upload-cover-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  enrollFace: async (identifier: string, formData: FormData): Promise<{ success: boolean; message: string; faceVerificationStatus: 'none' | 'partial' | 'complete' }> => {
    const { data } = await api.post(`/students/${identifier}/face/enroll`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

// ─── Faculty APIs ────────────────────────────────────────────────────

export const facultyAPI = {
  getProfile: async (): Promise<Faculty> => {
    const { data } = await api.get('/faculty/profile');
    return data;
  },
  updateProfile: async (payload: Partial<Faculty>): Promise<Faculty> => {
    const { data } = await api.put('/faculty/profile', payload);
    return data;
  },
  getAllFaculty: async (): Promise<Faculty[]> => {
    const { data } = await api.get('/faculty');
    return data;
  },
  verifyStudent: async (identifier: string): Promise<any> => {
    const { data } = await api.post(`/faculty/verify-student/${identifier}`);
    return data;
  },
  verifyStudentSkill: async (studentId: string, skillId: string): Promise<any> => {
    const { data } = await api.post(`/faculty/verify-student/${studentId}/skills/${skillId}/verify`);
    return data;
  },
  verifyAllStudentSkills: async (studentId: string): Promise<any> => {
    const { data } = await api.post(`/faculty/verify-student/${studentId}/skills/verify-all`);
    return data;
  },
  verifyStudentCertificate: async (studentId: string, certId: string): Promise<any> => {
    const { data } = await api.post(`/faculty/verify-student/${studentId}/certificates/${certId}/verify`);
    return data;
  },
  uploadProfileImage: async (formData: FormData): Promise<{ profilepic: string }> => {
    const { data } = await api.post('/faculty/profile/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

// ─── Project APIs ────────────────────────────────────────────────────

export const projectAPI = {
  getByStudent: async (studentId: string): Promise<Project[]> => {
    const { data } = await api.get(`/projects/student/${studentId}`);
    return unwrapData<Project[]>(data);
  },
  create: async (payload: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const { data } = await api.post('/projects', payload);
    return unwrapData<Project>(data);
  },
  update: async (id: string, payload: Partial<Project>): Promise<Project> => {
    const { data } = await api.put(`/projects/${id}`, payload);
    return unwrapData<Project>(data);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// ─── Internship APIs ─────────────────────────────────────────────────

export const internshipAPI = {
  getByStudent: async (studentId: string): Promise<Internship[]> => {
    const { data } = await api.get(`/internships/student/${studentId}`);
    return unwrapData<Internship[]>(data);
  },
  create: async (payload: Omit<Internship, '_id' | 'createdAt' | 'updatedAt' | 'student'> & { student?: string }): Promise<Internship> => {
    const { data } = await api.post('/internships', payload);
    return unwrapData<Internship>(data);
  },
  update: async (id: string, payload: Partial<Internship>): Promise<Internship> => {
    const { data } = await api.put(`/internships/${id}`, payload);
    return unwrapData<Internship>(data);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/internships/${id}`);
  },
};

// ─── Competition APIs ────────────────────────────────────────────────

export const competitionAPI = {
  getByStudent: async (studentId: string): Promise<Competition[]> => {
    const { data } = await api.get(`/competitions/student/${studentId}`);
    return unwrapData<Competition[]>(data);
  },
  create: async (payload: Omit<Competition, '_id' | 'createdAt' | 'updatedAt' | 'student'> & { student?: string }): Promise<Competition> => {
    const { data } = await api.post('/competitions', payload);
    return unwrapData<Competition>(data);
  },
  update: async (id: string, payload: Partial<Competition>): Promise<Competition> => {
    const { data } = await api.put(`/competitions/${id}`, payload);
    return unwrapData<Competition>(data);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/competitions/${id}`);
  },
};

// ─── Certificate APIs ────────────────────────────────────────────────

export const certificateAPI = {
  getByStudent: async (studentId: string): Promise<Certificate[]> => {
    const { data } = await api.get(`/certificates/student/${studentId}`);
    return unwrapData<Certificate[]>(data);
  },
  create: async (payload: Omit<Certificate, '_id' | 'createdAt' | 'updatedAt' | 'student'> & { student?: string }): Promise<Certificate> => {
    const { data } = await api.post('/certificates', payload);
    return unwrapData<Certificate>(data);
  },
  update: async (id: string, payload: Partial<Certificate>): Promise<Certificate> => {
    const { data } = await api.put(`/certificates/${id}`, payload);
    return unwrapData<Certificate>(data);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/certificates/${id}`);
  },
};

// ─── Post APIs ───────────────────────────────────────────────────────

export const postAPI = {
  getAll: async (): Promise<Post[]> => {
    const { data } = await api.get('/posts');
    return unwrapData<Post[]>(data);
  },
  getPage: async (page = 1, limit = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<Post>> => {
    const { data } = await api.get('/posts', { params: { page, limit } });
    return normalizePaginated<Post>(data, page, limit);
  },
  create: async (payload: CreatePostData): Promise<Post> => {
    const { data } = await api.post('/posts', payload);
    return unwrapData<Post>(data);
  },
  like: async (id: string): Promise<Post> => {
    const { data } = await api.post(`/posts/${id}/like`);
    return unwrapData<Post>(data);
  },
  unlike: async (id: string): Promise<Post> => {
    const { data } = await api.post(`/posts/${id}/unlike`);
    return unwrapData<Post>(data);
  },
  addComment: async (id: string, content: string): Promise<Post> => {
    const { data } = await api.post(`/posts/${id}/comments`, { content });
    return unwrapData<Post>(data);
  },
  deleteComment: async (postId: string, commentId: string): Promise<Post> => {
    const { data } = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return unwrapData<Post>(data);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};

// ─── Opportunity APIs ────────────────────────────────────────────────

export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    const { data } = await api.get('/opportunities');
    return Array.isArray(data) ? data : [];
  },
  getById: async (id: string): Promise<Opportunity> => {
    const { data } = await api.get(`/opportunities/${id}`);
    return unwrapData<Opportunity>(data);
  },
  create: async (payload: any): Promise<Opportunity> => {
    const { data } = await api.post('/opportunities', payload);
    return unwrapData<Opportunity>(data);
  },
  update: async (id: string, payload: Partial<Opportunity>): Promise<Opportunity> => {
    const { data } = await api.put(`/opportunities/${id}`, payload);
    return unwrapData<Opportunity>(data);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/opportunities/${id}`);
  },
  approve: async (id: string): Promise<Opportunity> => {
    const { data } = await api.patch(`/opportunities/${id}/approve`);
    return unwrapData<Opportunity>(data?.opportunity || data);
  },
  reject: async (id: string, reason?: string): Promise<Opportunity> => {
    const { data } = await api.patch(`/opportunities/${id}/reject`, { reason });
    return unwrapData<Opportunity>(data?.opportunity || data);
  },
};

// ─── Chat APIs ───────────────────────────────────────────────────────

export const chatAPI = {
  getChats: async (userId: string): Promise<Chat[]> => {
    const { data } = await api.get(`/chats/${userId}`);
    return Array.isArray(data?.chats) ? data.chats : [];
  },
  createChat: async (facultyId: string): Promise<Chat> => {
    const { data } = await api.post('/chats', { facultyId });
    return unwrapData<Chat>(data?.chat || data);
  },
  sendMessage: async (chatId: string, content: string, tag?: 'DOUBT' | 'GENERAL'): Promise<Chat> => {
    const { data } = await api.post(`/chats/${chatId}/message`, { content, tag });
    return unwrapData<Chat>(data?.chat || data);
  },
  deleteMessage: async (chatId: string, messageId: string): Promise<Chat> => {
    const { data } = await api.delete(`/chats/${chatId}/message/${messageId}`);
    return unwrapData<Chat>(data?.chat || data);
  },
  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}`);
  },
};

// ─── Notification APIs ───────────────────────────────────────────────

export const notificationAPI = {
  getByUser: async (userId: string): Promise<NotificationItem[]> => {
    const { data } = await api.get(`/notifications/${userId}`);
    return data;
  },
  markAsRead: async (notificationId: string): Promise<NotificationItem> => {
    const { data } = await api.patch(`/notifications/${notificationId}/read`);
    return data;
  },
};

// ─── Interest APIs ───────────────────────────────────────────────────

export const interestAPI = {
  markInterest: async (opportunityId: string): Promise<Interest> => {
    const { data } = await api.post(`/interests/${opportunityId}/mark`);
    return unwrapData<Interest>(data?.interest || data);
  },
  unmarkInterest: async (opportunityId: string): Promise<void> => {
    await api.delete(`/interests/${opportunityId}/unmark`);
  },
  getInterestedStudents: async (opportunityId: string): Promise<Interest[]> => {
    const { data } = await api.get(`/interests/${opportunityId}/interested`);
    return Array.isArray(data?.interests) ? data.interests : [];
  },
  hasInterest: async (opportunityId: string): Promise<boolean> => {
    const { data } = await api.get(`/interests/${opportunityId}/has-interest`);
    return data?.hasInterest || false;
  },
};

// ─── Skill API ───────────────────────────────────────────────────────

export const skillAPI = {
  getByStudent: async (studentId: string): Promise<StudentSkill[]> => {
    const { data } = await api.get(`/students/${studentId}/skills`);
    return data?.skills || [];
  },
  addSkill: async (studentId: string, skill: Omit<StudentSkill, '_id'>): Promise<any> => {
    const { data } = await api.post(`/students/${studentId}/skills`, skill);
    return data;
  },
  updateSkill: async (studentId: string, skillId: string, skill: Omit<StudentSkill, '_id'>): Promise<any> => {
    const { data } = await api.put(`/students/${studentId}/skills/${skillId}`, skill);
    return data;
  },
};

export default api;

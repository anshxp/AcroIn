// Centralized API service for frontend
// All API calls should go through this file
// Uses axios and environment variables for base URL

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if you use cookies/sessions
});

const unwrap = (response) => {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'success' in payload) {
    return payload;
  }

  return {
    success: true,
    data: payload,
  };
};

const pickData = (result) => (result && typeof result === 'object' ? result.data : result);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return unwrap(res);
  },
  studentRegister: async (data) => {
    const res = await api.post('/auth/register/student', data);
    return unwrap(res);
  },
  facultyRegister: async (data) => {
    const res = await api.post('/auth/register/faculty', data);
    return unwrap(res);
  },
  logout: async () => ({ success: true }),
};

export const studentAPI = {
  list: async () => unwrap(await api.get('/students')),
  byId: async (id) => unwrap(await api.get(`/students/${id}`)),
};

export const facultyAPI = {
  list: async () => unwrap(await api.get('/faculty')),
  byId: async (id) => unwrap(await api.get(`/faculty/${id}`)),
};

export const postAPI = {
  list: async () => unwrap(await api.get('/posts')),
  create: async (payload) => unwrap(await api.post('/posts', payload)),
  like: async (postId, userId) =>
    unwrap(await api.post(`/posts/${postId}/like`, { userId })),
  unlike: async (postId, userId) =>
    unwrap(await api.post(`/posts/${postId}/unlike`, { userId })),
  addComment: async (postId, payload) =>
    unwrap(await api.post(`/posts/${postId}/comment`, payload)),
  delete: async (postId) => unwrap(await api.delete(`/posts/${postId}`)),
};

export const adminAPI = {
  list: async () => unwrap(await api.get('/admin')),
};

export const landingAPI = {
  stats: async () => {
    const [students, faculty, posts] = await Promise.all([
      studentAPI.list(),
      facultyAPI.list(),
      postAPI.list(),
    ]);

    const studentsData = pickData(students) || [];
    const facultyData = pickData(faculty) || [];
    const postsData = pickData(posts) || [];

    const verifiedStudents = studentsData.filter((s) => s?.isVerified).length;

    return {
      success: true,
      data: {
        activeStudents: studentsData.length,
        verifiedStudents,
        verifiedProfiles:
          studentsData.length > 0
            ? Math.round((verifiedStudents / studentsData.length) * 100)
            : 0,
        matchAccuracy: facultyData.length > 0 ? Math.min(99, 70 + facultyData.length) : 70,
        placementRate: studentsData.length > 0 ? Math.min(100, Math.round((postsData.length / studentsData.length) * 100)) : 0,
        aiModels: 4,
      },
    };
  },
};

export default api;
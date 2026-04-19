const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL
  || process.env.EXPO_PUBLIC_BACKEND_URL
  || 'http://localhost:5000';

const toJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }

  return payload;
};

const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  return toJsonResponse(response);
};

export const authAPI = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  registerStudent: (payload) => request('/auth/register/student', { method: 'POST', body: payload }),
  registerFaculty: (payload) => request('/auth/register/faculty', { method: 'POST', body: payload }),
};

export const studentAPI = {
  getProfile: (identifier, token) => request(`/students/${encodeURIComponent(identifier)}`, { token }),
  updateProfile: (identifier, payload, token) => request(`/students/${encodeURIComponent(identifier)}`, { method: 'PUT', body: payload, token }),
};

export const facultyAPI = {
  getProfile: (token) => request('/faculty/profile', { token }),
  updateProfile: (payload, token) => request('/faculty/profile', { method: 'PUT', body: payload, token }),
};

export default {
  authAPI,
  studentAPI,
  facultyAPI,
};
import api from './api';

const extract = async (promise) => {
  const res = await promise;
  const payload = res?.data;
  if (payload && typeof payload === 'object' && 'success' in payload) {
    return payload.data || [];
  }
  return payload || [];
};

export const projectAPI = {
  list: async () => extract(api.get('/posts')),
};

export const internshipAPI = {
  list: async () => extract(api.get('/internships')),
};

export const competitionAPI = {
  list: async () => extract(api.get('/competitions')),
};

export const certificateAPI = {
  list: async () => extract(api.get('/certificates')),
};

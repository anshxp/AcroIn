const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error('VITE_API_URL must be configured for production builds.');
}

export const API_BASE_URL = (configuredApiUrl || 'http://localhost:5000').replace(/\/+$/, '');

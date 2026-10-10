const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const isValidApiUrl = (value: string | undefined): value is string => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.host);
  } catch {
    return false;
  }
};

if (import.meta.env.PROD && !isValidApiUrl(configuredApiUrl)) {
  throw new Error('A valid absolute HTTP(S) VITE_API_URL must be configured for production builds.');
}

export const API_BASE_URL = (isValidApiUrl(configuredApiUrl) ? configuredApiUrl : 'http://localhost:5000').replace(/\/+$/, '');

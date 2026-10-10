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

const isValidProductionApiUrl = (() => {
  if (!isValidApiUrl(configuredApiUrl)) return false;
  try {
    return new URL(configuredApiUrl).protocol === 'https:';
  } catch {
    return false;
  }
})();

if (import.meta.env.PROD && !isValidProductionApiUrl) {
  throw new Error('A valid absolute HTTPS VITE_API_URL must be configured for production builds.');
}

export const API_BASE_URL = (isValidApiUrl(configuredApiUrl) ? configuredApiUrl : 'http://localhost:5000').replace(/\/+$/, '');

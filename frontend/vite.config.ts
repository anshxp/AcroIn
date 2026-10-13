import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL?.trim();

  if (!apiUrl) {
    throw new Error('VITE_API_URL must be configured.');
  }

  let parsedApiUrl: URL;

  try {
    parsedApiUrl = new URL(apiUrl);
  } catch {
    throw new Error('VITE_API_URL must be a valid absolute URL.');
  }

  if (mode === 'production' && parsedApiUrl.protocol !== 'https:') {
    throw new Error('Production frontend builds require VITE_API_URL to use HTTPS.');
  }

  if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
    throw new Error('VITE_API_URL must use HTTP or HTTPS.');
  }

  return {
    plugins: [react()],
  };
});

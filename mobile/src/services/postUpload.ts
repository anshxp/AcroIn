import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export interface PostUploadAsset {
  uri: string;
  name: string;
  type: string;
  size?: number | null;
}

const resolveApiBaseUrl = (): string => {
  const configured = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL || (Constants.expoConfig as any)?.extra?.apiUrl || '';
  const hostUri = (Constants.expoConfig as any)?.hostUri || (Constants.manifest2 as any)?.extra?.expoClient?.hostUri || (Constants.manifest as any)?.debuggerHost;
  const expoHost = hostUri ? hostUri.split(':')[0] : null;

  if (configured) {
    try {
      const parsed = new URL(configured.trim());
      const localHost = ['localhost', '127.0.0.1', '::1', '10.0.2.2'].includes(parsed.hostname) || /^192\.168\./.test(parsed.hostname) || /^10\./.test(parsed.hostname);
      if (localHost && expoHost) return `${parsed.protocol}//${expoHost}${parsed.port ? `:${parsed.port}` : ':5000'}`;
      if (Platform.OS === 'android' && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) return `${parsed.protocol}//10.0.2.2${parsed.port ? `:${parsed.port}` : ''}`;
      return configured.trim().replace(/\/+$/, '');
    } catch { return configured.trim().replace(/\/+$/, ''); }
  }

  if (expoHost) return `http://${expoHost}:5000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
};

const client = axios.create({ baseURL: resolveApiBaseUrl(), timeout: 120000 });

export async function createPostWithAttachments(input: {
  content: string;
  scope: 'campus' | 'department';
  files: PostUploadAsset[];
}) {
  const form = new FormData();
  form.append('content', input.content.trim());
  form.append('scope', input.scope);

  input.files.forEach((file) => {
    form.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    } as any);
  });

  const token = useAuthStore.getState().token;
  const { data } = await client.post('/posts', form, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'multipart/form-data',
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return data?.data ?? data;
}

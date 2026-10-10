import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

const TOKEN_KEY = 'acroin.mobile.token';
const USER_KEY = 'acroin.mobile.user';

const normalizeIdentifier = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    const normalized = String(value).trim();
    return normalized && normalized !== '[object Object]' ? normalized : '';
  }

  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    const nested = candidate._id ?? candidate.id ?? candidate.$oid;
    if (nested !== undefined && nested !== value) return normalizeIdentifier(nested);

    // ObjectId-like values have a useful toString; plain objects do not.
    const objectConstructor = (value as { constructor?: { name?: string } }).constructor;
    if (objectConstructor?.name === 'ObjectId' && typeof candidate.toString === 'function') {
      const normalized = candidate.toString().trim();
      return normalized && normalized !== '[object Object]' ? normalized : '';
    }
  }

  return '';
};

const normalizeUser = (value: unknown): User | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const candidate = value as Record<string, unknown>;
  const id = normalizeIdentifier(candidate.id ?? candidate._id ?? candidate.authUserId);
  const email = typeof candidate.email === 'string' ? candidate.email.trim() : '';
  const userType = candidate.userType;

  if (!id || !email || !['student', 'faculty', 'admin'].includes(String(userType))) return null;

  const authUserId = normalizeIdentifier(candidate.authUserId ?? candidate.id ?? candidate._id);
  const profileId = normalizeIdentifier(candidate.profileId);
  return {
    ...(candidate as unknown as User),
    id,
    ...(authUserId ? { authUserId } : {}),
    ...(profileId ? { profileId } : {}),
    email,
    userType: userType as User['userType'],
  };
};

interface AuthState {
  token: string | null;
  user: User | null;
  isReady: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (token: string, user: User) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadSession: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isReady: false,
  isLoading: false,

  setAuth: async (token: string, user: User) => {
    const normalizedUser = normalizeUser(user);
    if (!token.trim() || !normalizedUser) {
      set({ token: null, user: null });
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      throw new Error('Invalid authentication response');
    }

    set({ token, user: normalizedUser });
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(normalizedUser));
  },

  setUser: async (user: User) => {
    const normalizedUser = normalizeUser(user);
    if (!normalizedUser) throw new Error('Invalid user profile');
    set({ user: normalizedUser });
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(normalizedUser));
  },

  clearAuth: async () => {
    set({ token: null, user: null });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  loadSession: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);
      const parsedUser: unknown = storedUser ? JSON.parse(storedUser) : null;
      const normalizedUser = normalizeUser(parsedUser);

      // Clear legacy demo sessions and malformed or incomplete persisted sessions.
      const isLegacy =
        storedToken === 'demo-token' ||
        storedToken === 'demo-session-token' ||
        (parsedUser && typeof parsedUser === 'object' &&
          ['demo-user', 'student-demo-id', 'faculty-demo-id'].includes(
            String((parsedUser as Record<string, unknown>)._id ?? (parsedUser as Record<string, unknown>).id ?? '')
          ));

      if (isLegacy || !storedToken || !normalizedUser) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        set({ token: null, user: null });
      } else {
        set({ token: storedToken, user: normalizedUser });
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(normalizedUser));
      }
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      set({ token: null, user: null });
    } finally {
      set({ isReady: true });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

const TOKEN_KEY = 'acroin.mobile.token';
const USER_KEY = 'acroin.mobile.user';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isReady: false,
  isLoading: false,

  setAuth: async (token: string, user: User) => {
    set({ token, user });
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  setUser: async (user: User) => {
    set({ user });
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
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
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      // Clear legacy demo sessions
      const isLegacy =
        storedToken === 'demo-token' ||
        storedToken === 'demo-session-token' ||
        parsedUser?._id === 'demo-user' ||
        parsedUser?._id === 'student-demo-id';

      if (isLegacy) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } else if (storedToken && parsedUser) {
        set({ token: storedToken, user: parsedUser });
      }
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } finally {
      set({ isReady: true });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

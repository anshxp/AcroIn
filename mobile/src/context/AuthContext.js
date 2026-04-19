import React, { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../services/api";

export const AuthContext = createContext({
  token: null,
  user: null,
  isReady: false,
  setUser: () => {},
  signIn: async () => {},
  signOut: async () => {},
});

const TOKEN_KEY = "acroin.mobile.token";
const USER_KEY = "acroin.mobile.user";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } finally {
        setIsReady(true);
      }
    };

    loadSession();
  }, []);

  const signIn = async ({ email, password }) => {
    const response = await authAPI.login({ email, password });

    if (!response?.token || !response?.user) {
      throw new Error(response?.message || "Login failed");
    }

    setToken(response.token);
    setUser(response.user);
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, user, isReady, setUser, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

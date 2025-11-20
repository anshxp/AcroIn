// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../services/apolloClient';
import { LOGIN, REGISTER } from '../services/queries';
import { useMutation } from '@apollo/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      if (token && u) setUser(JSON.parse(u));
      setLoadingAuth(false);
    })();
  }, []);

  const login = async ({ email, password }) => {
    const res = await client.mutate({ mutation: LOGIN, variables: { email, password } });
    const payload = res.data.login;
    await AsyncStorage.setItem('token', payload.token);
    await AsyncStorage.setItem('user', JSON.stringify(payload.user));
    setUser(payload.user);
    return payload.user;
  };

  const register = async ({ name, email, password, role }) => {
    const res = await client.mutate({ mutation: REGISTER, variables: { name, email, password, role } });
    const payload = res.data.register;
    await AsyncStorage.setItem('token', payload.token);
    await AsyncStorage.setItem('user', JSON.stringify(payload.user));
    setUser(payload.user);
    return payload.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loadingAuth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

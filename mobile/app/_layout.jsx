// app/_layout.jsx
import React, { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ApolloProvider } from '@apollo/client';
import client from '../services/apolloClient';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

function RootNavigationInner() {
  const { user, loadingAuth } = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loadingAuth) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth) {
      if (user.role === 'STUDENT') router.replace('/(student)/dashboard');
      if (user.role === 'FACULTY') router.replace('/(faculty)/faculty-dashboard');
      if (user.role === 'ADMIN') router.replace('/(admin)/admin-dashboard');
    }
  }, [user, loadingAuth, segments]);

  if (loadingAuth) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="(student)/dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="(student)/profile" options={{ headerShown: false }} />
      <Stack.Screen name="(student)/skills" options={{ headerShown: false }} />
      <Stack.Screen name="(student)/projects" options={{ headerShown: false }} />
      <Stack.Screen name="(student)/competitions" options={{ headerShown: false }} />
      <Stack.Screen name="(faculty)/faculty-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="(faculty)/verify-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="(faculty)/post-opportunities" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)/admin-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)/manage-faculty" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)/manage-students" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <RootNavigationInner />
      </AuthProvider>
    </ApolloProvider>
  );
}

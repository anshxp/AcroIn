// app/(faculty)/faculty-dashboard.jsx
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function FacultyDashboard() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:24 }}>Faculty Dashboard</Text>
      <Text style={{ marginVertical:8 }}>Welcome, {user?.name}</Text>
      <Button title="Verify Students" onPress={() => router.push('/(faculty)/verify-dashboard')} />
      <Button title="Post Opportunities" onPress={() => router.push('/(faculty)/post-opportunities')} />
      <View style={{ marginTop:20 }}><Button title="Logout" color="red" onPress={logout} /></View>
    </View>
  );
}

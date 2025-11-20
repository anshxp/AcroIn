// app/(admin)/admin-dashboard.jsx
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:24 }}>Admin Dashboard</Text>
      <Text style={{ marginVertical:8 }}>Welcome, {user?.name}</Text>
      <Button title="Manage Faculty" onPress={() => router.push('/(admin)/manage-faculty')} />
      <Button title="Manage Students" onPress={() => router.push('/(admin)/manage-students')} />
      <View style={{ marginTop:20 }}><Button title="Logout" color="red" onPress={logout} /></View>
    </View>
  );
}

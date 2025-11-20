// app/(student)/dashboard.jsx
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:24 }}>Student Dashboard</Text>
      <Text style={{ marginVertical:8 }}>Hello, {user?.name}</Text>
      <Button title="Profile" onPress={() => router.push('/(student)/profile')} />
      <Button title="Skills" onPress={() => router.push('/(student)/skills')} />
      <Button title="Projects" onPress={() => router.push('/(student)/projects')} />
      <Button title="Competitions" onPress={() => router.push('/(student)/competitions')} />
      <View style={{ marginTop:20 }}><Button title="Logout" color="red" onPress={logout} /></View>
    </View>
  );
}

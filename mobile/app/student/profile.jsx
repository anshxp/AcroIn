// app/(student)/profile.jsx
import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useContext(AuthContext);
  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:22 }}>Profile</Text>
      <Text style={{ marginTop:8 }}>Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Role: {user?.role}</Text>
      <Text>Department: {user?.department || '-'}</Text>
    </View>
  );
}

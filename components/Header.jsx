// components/Header.jsx
import React from 'react';
import { View, Text } from 'react-native';

export default function Header({ title }) {
  return (
    <View style={{ padding:12, borderBottomWidth:1 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>{title}</Text>
    </View>
  );
}

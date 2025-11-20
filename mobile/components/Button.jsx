// components/Button.jsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function Button({ title, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#bbb' : '#2563eb',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 6
      }}>
      <Text style={{ color: '#fff', fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
}


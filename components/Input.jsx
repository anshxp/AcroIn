// components/Input.jsx
import React from 'react';
import { TextInput, View } from 'react-native';

export default function Input({ value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
  return (
    <View style={{ marginBottom:12 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={{ borderWidth:1, borderColor:'#ddd', padding:12, borderRadius:8, backgroundColor:'#fff' }}
      />
    </View>
  );
}

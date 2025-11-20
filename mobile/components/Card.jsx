// components/Card.jsx
import React from 'react';
import { View } from 'react-native';

export default function Card({ children, style }) {
  return (
    <View style={[{ padding:12, borderWidth:1, borderRadius:10, marginVertical:8, backgroundColor:'#fff' }, style]}>
      {children}
    </View>
  );
}

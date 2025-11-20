import React, { useState, useContext } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    try {
      const user = await login({ email, password });

      if (user?.role === 'STUDENT') router.replace('/student/dashboard');
      if (user?.role === 'FACULTY') router.replace('/faculty/faculty-dashboard');
      if (user?.role === 'ADMIN') router.replace('/admin/admin-dashboard');

    } catch (e) {
      Alert.alert('Login failed', e.message || 'Check credentials');
    }
  };

  return (
    <View style={{ flex:1, padding:20, justifyContent:'center' }}>
      <Text style={{ textAlign:'center', fontSize:28, marginBottom:24 }}>AcroIn — Login</Text>
      <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={submit} />
      <Text style={{ textAlign:'center', marginTop:16, color:'#2563eb' }}
        onPress={() => router.push('/auth/register')}>
        Create account
      </Text>
    </View>
  );
}

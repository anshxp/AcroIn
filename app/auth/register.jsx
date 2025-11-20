import React, { useState, useContext } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';

export default function Register() {
  const router = useRouter();
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');

  const submit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields');
      return;
    }

    try {
      const user = await register({ name, email, password, role });

      if (user.role === 'STUDENT') router.replace('/student/dashboard');
      if (user.role === 'FACULTY') router.replace('/faculty/faculty-dashboard');
      if (user.role === 'ADMIN') router.replace('/admin/admin-dashboard');

    } catch (e) {
      Alert.alert('Register failed', e.message || 'Try again');
    }
  };

  return (
    <View style={{ flex:1, padding:20, justifyContent:'center' }}>
      <Text style={{ textAlign:'center', fontSize:26, marginBottom:16 }}>Create Account</Text>
      
      <Input placeholder="Full name" value={name} onChangeText={setName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <View style={{ flexDirection:'row', justifyContent:'space-between', marginVertical:12 }}>
        {['STUDENT','FACULTY'].map(r => (
          <TouchableOpacity
            key={r}
            onPress={() => setRole(r)}
            style={{
              padding:10,
              borderWidth:1,
              borderColor: role === r ? '#2563eb' : '#ccc',
              borderRadius:8,
              width:'48%',
              alignItems:'center'
            }}>
            <Text style={{ color: role === r ? '#2563eb' : '#333' }}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Register" onPress={submit} />

      <Text style={{ textAlign:'center', marginTop:12, color:'#2563eb' }}
        onPress={() => router.push('/auth/login')}>
        Already have an account? Login
      </Text>
    </View>
  );
}

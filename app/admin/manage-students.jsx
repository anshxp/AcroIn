// app/(admin)/manage-students.jsx
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { gql, useQuery } from '@apollo/client';
const GET_STUD = gql` query { getAllStudents { id name email department } }`;

export default function ManageStudents() {
  const { data, loading, error } = useQuery(GET_STUD);
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading</Text>;

  return (
    <ScrollView style={{ padding:20 }}>
      <Text style={{ fontSize:22 }}>Students</Text>
      {data.getAllStudents.map(s => (
        <View key={s.id} style={{ padding:12, borderWidth:1, marginVertical:8, borderRadius:8 }}>
          <Text style={{ fontWeight:'600' }}>{s.name}</Text>
          <Text>{s.email}</Text>
          <Text>{s.department}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

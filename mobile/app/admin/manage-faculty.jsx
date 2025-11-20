// app/(admin)/manage-faculty.jsx
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { gql, useQuery } from '@apollo/client';
const GET_FAC = gql` query { getAllFaculty { id name email department } }`;

export default function ManageFaculty() {
  const { data, loading, error } = useQuery(GET_FAC);
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading</Text>;

  return (
    <ScrollView style={{ padding:20 }}>
      <Text style={{ fontSize:22 }}>Faculty</Text>
      {data.getAllFaculty.map(f => (
        <View key={f.id} style={{ padding:12, borderWidth:1, marginVertical:8, borderRadius:8 }}>
          <Text style={{ fontWeight:'600' }}>{f.name}</Text>
          <Text>{f.email}</Text>
          <Text>{f.department}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// app/(student)/skills.jsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { gql, useQuery } from '@apollo/client';
const GET_SKILLS = gql`
  query GetStudentSkills($id: ID!) {
    getStudentSkills(id: $id) { id name }
  }
`;

export default function Skills({ route }) {
  // placeholder: replace id with real user id (AuthContext)
  const { data, loading, error } = useQuery(GET_SKILLS, { variables: { id: "SELF" }, skip: false });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading skills</Text>;

  return (
    <ScrollView style={{ padding:20 }}>
      <Text style={{ fontSize:22 }}>Skills</Text>
      {data?.getStudentSkills?.map(s => (
        <View key={s.id} style={{ padding:10, borderWidth:1, marginVertical:8, borderRadius:8 }}>
          <Text>{s.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// app/(student)/projects.jsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { gql, useQuery } from '@apollo/client';
const GET_PROJECTS = gql`
  query GetStudentProjects($id: ID!) {
    getStudentProjects(id: $id) { id title description verified }
  }
`;

export default function Projects() {
  const { data, loading, error } = useQuery(GET_PROJECTS, { variables: { id: "SELF" } });
  if (loading) return <Text>Loading projects...</Text>;
  if (error) return <Text>Error loading projects</Text>;

  return (
    <ScrollView style={{ padding:20 }}>
      <Text style={{ fontSize:22 }}>Projects</Text>
      {data?.getStudentProjects?.map(p=>(
        <View key={p.id} style={{ padding:12, borderWidth:1, marginVertical:8, borderRadius:8 }}>
          <Text style={{ fontWeight:'600' }}>{p.title}</Text>
          <Text>{p.description}</Text>
          <Text>Verified: {p.verified ? 'Yes' : 'No'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

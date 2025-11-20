// app/(student)/competitions.jsx
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { gql, useQuery } from '@apollo/client';
const GET_COMP = gql` query { getCompetitions { id title description } }`;

export default function Competitions() {
  const { data, loading, error } = useQuery(GET_COMP);
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading competitions</Text>;

  return (
    <ScrollView style={{ padding:20 }}>
      <Text style={{ fontSize:22 }}>Competitions</Text>
      {data?.getCompetitions?.map(c => (
        <View key={c.id} style={{ padding:12, borderWidth:1, marginVertical:8, borderRadius:8 }}>
          <Text style={{ fontWeight:'600' }}>{c.title}</Text>
          <Text>{c.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

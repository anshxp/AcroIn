// app/(faculty)/post-opportunities.jsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import { gql, useMutation } from '@apollo/client';

const POST_COMP = gql` mutation PostCompetition($title:String!, $description:String!) { postCompetition(title:$title, description:$description) { id title } }`;

export default function PostOpportunities() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [post, { loading }] = useMutation(POST_COMP);

  const submit = async () => {
    if (!title || !desc) { Alert.alert('Fill all'); return; }
    try { await post({ variables: { title, description: desc } }); Alert.alert('Posted'); setTitle(''); setDesc(''); }
    catch(e){ Alert.alert('Error', e.message); }
  };

  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:22 }}>Post Opportunity</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderWidth:1,padding:10,marginTop:12 }} />
      <TextInput placeholder="Description" value={desc} onChangeText={setDesc} style={{ borderWidth:1,padding:10,marginTop:12, height:100 }} multiline />
      <Button title={loading ? 'Posting...' : 'Post'} onPress={submit} />
    </View>
  );
}

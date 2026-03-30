import * as React from 'react';
import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

interface FaceResponse {
  success: boolean;
  message: string;
  data: unknown;
}

const FaceRecognition: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<FaceResponse | null>(null);
  const [mode, setMode] = useState<'add' | 'search'>('add');
  const [error, setError] = useState('');

  const ADD_FACE = gql`
    mutation AddFace($image: Upload!, $userId: String!) {
      addFace(image: $image, userId: $userId) {
        success
        message
        data
      }
    }
  `;

  const SEARCH_FACE = gql`
    mutation SearchFace($image: Upload!) {
      searchFace(image: $image) {
        success
        message
        data
      }
    }
  `;

  const [addFace, { loading: addLoading }] = useMutation<{ addFace: FaceResponse }>(ADD_FACE);
  const [searchFace, { loading: searchLoading }] = useMutation<{ searchFace: FaceResponse }>(SEARCH_FACE);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      if (!image) throw new Error('Please select an image');
      if (mode === 'add') {
        if (!userId) throw new Error('User ID required');
        const { data } = await addFace({ variables: { image, userId } });
        if (data?.addFace) setResult(data.addFace);
      } else {
        const { data } = await searchFace({ variables: { image } });
        if (data?.searchFace) setResult(data.searchFace);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Error occurred');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Face Recognition</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setMode('add')} disabled={mode === 'add'}>Add Face</button>
        <button onClick={() => setMode('search')} disabled={mode === 'search'} style={{ marginLeft: 8 }}>Search Face</button>
      </div>
      <form onSubmit={handleSubmit}>
        {mode === 'add' && (
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            style={{ marginBottom: 12, width: '100%' }}
          />
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: 12, width: '100%' }} />
        <button type="submit" disabled={addLoading || searchLoading} style={{ width: '100%' }}>
          {(addLoading || searchLoading) ? 'Processing...' : mode === 'add' ? 'Add Face' : 'Search Face'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 4 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;

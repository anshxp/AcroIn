import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, LoadingSpinner, ErrorBanner, Button } from '../../components/ui';
import { facultyAPI, chatAPI } from '../../services/apiClient';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Faculty } from '../../types';

export default function NewChatScreen({ navigation }: any) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingId, setCreatingId] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setError('');
        const list = await facultyAPI.getAllFaculty();
        setFaculty(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load faculty list'));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const startChat = async (member: Faculty) => {
    setCreatingId(member._id);
    try {
      const chat = await chatAPI.createChat(member._id);
      const name = `${member.firstname || ''} ${member.lastName || ''}`.trim() || member.email;
      navigation.replace('ChatWindow', { chatId: chat._id, participantName: name });
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Could not start chat'));
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Message</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {isLoading ? (
          <LoadingSpinner message="Loading faculty..." />
        ) : error ? (
          <View style={s.errorWrap}>
            <ErrorBanner message={error} />
          </View>
        ) : faculty.length === 0 ? (
          <Text style={s.empty}>No faculty available to message.</Text>
        ) : (
          faculty.map((member) => {
            const name = `${member.firstname || ''} ${member.lastName || ''}`.trim() || member.email;
            return (
              <TouchableOpacity
                key={member._id}
                style={[s.row, shadows.soft]}
                onPress={() => startChat(member)}
                disabled={creatingId === member._id}
              >
                <Avatar name={name} imageUrl={member.profilepic} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{name}</Text>
                  <Text style={s.meta}>{member.designation || 'Faculty'} · {member.department}</Text>
                </View>
                {creatingId === member._id ? (
                  <LoadingSpinner />
                ) : (
                  <Ionicons name="chatbubble-outline" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  content: { padding: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  meta: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSecondary, padding: spacing.xl },
  errorWrap: { padding: spacing.md },
});

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, EmptyState, LoadingSpinner, ErrorBanner, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { getAuthUserId } from '../../utils/authIds';
import { getOtherParticipantName } from '../../utils/chatHelpers';
import { getApiErrorMessage } from '../../utils/apiError';
import { useChats } from '../../hooks/useApi';
import { colors, spacing, radii, typography, shadows } from '../../theme';

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const authUserId = getAuthUserId(user);
  const { data: chats, isLoading, isError, error, refetch } = useChats(authUserId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getLastMessage = (chat: any) => {
    if (!chat.messages?.length) return 'No messages yet';
    const last = chat.messages[chat.messages.length - 1];
    return last.content?.substring(0, 60) + (last.content?.length > 60 ? '...' : '');
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return d.toLocaleDateString();
  };

  const openChat = (chat: any) => {
    const name = getOtherParticipantName(chat, authUserId);
    navigation.navigate('ChatWindow', { chatId: chat._id, participantName: name });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Messages</Text>
        {user?.userType === 'student' && (
          <TouchableOpacity style={s.newChatBtn} onPress={() => navigation.navigate('NewChat')}>
            <Ionicons name="create-outline" size={22} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        {isLoading ? (
          <LoadingSpinner message="Loading conversations..." />
        ) : isError ? (
          <View style={s.errorWrap}>
            <ErrorBanner message={getApiErrorMessage(error, 'Could not load messages')} />
            <Button title="Retry" onPress={() => refetch()} variant="secondary" />
          </View>
        ) : !chats?.length ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations"
            subtitle={
              user?.userType === 'student'
                ? 'Tap the compose button to message a faculty member'
                : 'Messages with students will appear here'
            }
            action={
              user?.userType === 'student' ? (
                <Button title="New Message" onPress={() => navigation.navigate('NewChat')} variant="secondary" />
              ) : undefined
            }
          />
        ) : (
          chats.map((chat: any) => {
            const name = getOtherParticipantName(chat, authUserId);
            return (
              <TouchableOpacity
                key={chat._id}
                style={[s.chatItem, shadows.soft]}
                onPress={() => openChat(chat)}
              >
                <Avatar name={name} size={48} />
                <View style={s.chatInfo}>
                  <View style={s.chatTop}>
                    <Text style={s.chatName} numberOfLines={1}>{name}</Text>
                    <Text style={s.chatTime}>{formatTime(chat.updatedAt || chat.createdAt)}</Text>
                  </View>
                  <Text style={s.chatPreview} numberOfLines={1}>{getLastMessage(chat)}</Text>
                </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.md },
  errorWrap: { gap: spacing.sm, paddingVertical: spacing.md },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.textPrimary, flex: 1 },
  chatTime: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  chatPreview: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
});

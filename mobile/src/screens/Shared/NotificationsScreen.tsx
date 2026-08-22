import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, LoadingSpinner, ErrorBanner, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { getAuthUserId } from '../../utils/authIds';
import { getApiErrorMessage } from '../../utils/apiError';
import { useNotifications, useMarkAsRead } from '../../hooks/useApi';
import { colors, spacing, radii, typography, shadows } from '../../theme';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  alert: 'alert-circle-outline',
  message: 'chatbubble-outline',
  profile_view: 'eye-outline',
  system: 'settings-outline',
  certificate: 'ribbon-outline',
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const authUserId = getAuthUserId(user);
  const { data: notifications, isLoading, isError, error, refetch } = useNotifications(authUserId);
  const markAsReadMut = useMarkAsRead();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => { setRefreshing(true); await refetch(); setRefreshing(false); }, [refetch]);

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Notifications</Text>
        {notifications && notifications.length > 0 && (
          <Text style={s.badgeCount}>{notifications.filter((n: any) => !n.read).length} new</Text>
        )}
      </View>
      <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}>
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <View style={{ gap: spacing.sm, paddingVertical: spacing.md }}>
            <ErrorBanner message={getApiErrorMessage(error, 'Could not load notifications')} />
            <Button title="Retry" onPress={() => refetch()} variant="secondary" />
          </View>
        ) : !notifications?.length ? (
          <EmptyState icon="notifications-off-outline" title="No notifications" subtitle="You're all caught up!" />
        ) : notifications.map((notif: any) => (
          <TouchableOpacity
            key={notif._id}
            style={[s.notifItem, !notif.read && s.notifUnread, shadows.soft]}
            onPress={() => !notif.read && markAsReadMut.mutate(notif._id)}
          >
            <View style={[s.notifIcon, !notif.read && s.notifIconUnread]}>
              <Ionicons name={ICONS[notif.type] || 'notifications-outline'} size={20} color={!notif.read ? colors.accent : colors.gray[400]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.notifMessage, !notif.read && s.notifMessageUnread]}>{notif.message}</Text>
              <Text style={s.notifTime}>{formatTime(notif.createdAt)}</Text>
            </View>
            {!notif.read && <View style={s.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  badgeCount: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.accent, backgroundColor: colors.blue[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  content: { paddingHorizontal: spacing.md },
  notifItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.xs, gap: spacing.sm },
  notifUnread: { backgroundColor: colors.blue[50] },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  notifIconUnread: { backgroundColor: colors.blue[100] },
  notifMessage: { fontSize: typography.sizes.sm, color: colors.textPrimary, lineHeight: 19 },
  notifMessageUnread: { fontWeight: typography.weights.semibold },
  notifTime: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});

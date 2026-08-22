import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState, QueryState } from '../../components/ui';
import { useOpportunities, useMarkInterest, useUnmarkInterest } from '../../hooks/useApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Opportunity } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  internship: '#10B981',
  job: '#3B82F6',
  competition: '#F59E0B',
  workshop: '#8B5CF6',
  certification: '#EC4899',
};

export default function BrowseOpportunitiesScreen({ navigation }: any) {
  const { data: opportunities, isLoading, isError, error, refetch } = useOpportunities();
  const markInterest = useMarkInterest();
  const unmarkInterest = useUnmarkInterest();
  const [refreshing, setRefreshing] = useState(false);
  const [interestMap, setInterestMap] = useState<Record<string, boolean>>({});

  const approved = (opportunities || []).filter(
    (o: Opportunity) => o.status === 'APPROVED' || !o.status
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openApplication = async (link: string) => {
    const url = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open application link');
    }
  };

  const toggleInterest = async (opp: Opportunity) => {
    const interested = interestMap[opp._id];
    try {
      if (interested) {
        await unmarkInterest.mutateAsync(opp._id);
        setInterestMap((prev) => ({ ...prev, [opp._id]: false }));
      } else {
        await markInterest.mutateAsync(opp._id);
        setInterestMap((prev) => ({ ...prev, [opp._id]: true }));
      }
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Could not update interest'));
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>CDC Opportunities</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
      >
        <QueryState
          isLoading={isLoading && !refreshing}
          isError={isError}
          errorMessage={getApiErrorMessage(error)}
          isEmpty={!isLoading && approved.length === 0}
          emptyIcon="megaphone-outline"
          emptyTitle="No opportunities yet"
          emptySubtitle="When faculty post approved opportunities, they will appear here."
          onRetry={() => refetch()}
        >
          {approved.map((opp: Opportunity) => (
            <View key={opp._id} style={[s.card, shadows.card]}>
              <View style={s.cardTop}>
                <View style={[s.typeBadge, { backgroundColor: (TYPE_COLORS[opp.type] || colors.accent) + '20' }]}>
                  <Text style={[s.typeText, { color: TYPE_COLORS[opp.type] || colors.accent }]}>
                    {opp.type.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={s.title}>{opp.title}</Text>
              {opp.company ? (
                <Text style={s.subtitle}>
                  {opp.company}
                  {opp.location ? ` · ${opp.location}` : ''}
                </Text>
              ) : null}
              <Text style={s.desc} numberOfLines={4}>{opp.description}</Text>
              {opp.deadline ? (
                <Text style={s.deadline}>Deadline: {new Date(opp.deadline).toLocaleDateString()}</Text>
              ) : null}
              <View style={s.actions}>
                <Button title="Apply" onPress={() => openApplication(opp.application_link)} variant="secondary" />
                <Button
                  title={interestMap[opp._id] ? 'Interested ✓' : 'Mark Interest'}
                  onPress={() => toggleInterest(opp)}
                  loading={markInterest.isPending || unmarkInterest.isPending}
                />
              </View>
            </View>
          ))}
        </QueryState>
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
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', marginBottom: spacing.xs },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm },
  typeText: { fontSize: 10, fontWeight: typography.weights.bold },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
  desc: { fontSize: typography.sizes.sm, color: colors.textPrimary, marginTop: spacing.xs, lineHeight: 20 },
  deadline: { fontSize: typography.sizes.xs, color: colors.warning, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});

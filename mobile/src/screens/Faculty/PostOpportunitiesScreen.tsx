import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, Card, EmptyState, LoadingSpinner, ErrorBanner } from '../../components/ui';
import { useOpportunities, useCreateOpportunity } from '../../hooks/useApi';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import { Modal } from 'react-native';
import type { Opportunity } from '../../types';

const TYPE_OPTIONS = ['internship', 'job', 'competition', 'workshop', 'certification'] as const;

export default function PostOpportunitiesScreen({ navigation }: any) {
  const { data: opportunities, isLoading, refetch } = useOpportunities();
  const createMut = useCreateOpportunity();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'internship' as string, company: '', location: '',
    deadline: '', description: '', requirements: '', application_link: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => { setRefreshing(true); await refetch(); setRefreshing(false); }, [refetch]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.application_link.trim()) {
      Alert.alert('Error', 'Title, description, and application link are required');
      return;
    }
    try {
      await createMut.mutateAsync({
        ...form,
        requirements: form.requirements.split(',').map((r) => r.trim()).filter(Boolean),
      });
      setShowModal(false);
      setForm({ title: '', type: 'internship', company: '', location: '', deadline: '', description: '', requirements: '', application_link: '' });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create');
    }
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      internship: '#10B981', job: '#3B82F6', competition: '#F59E0B',
      workshop: '#8B5CF6', certification: '#EC4899',
    };
    return map[type] || colors.accent;
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Opportunities</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={s.addBtn}>
          <Ionicons name="add" size={22} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}>
        {isLoading ? <LoadingSpinner /> : !opportunities?.length ? (
          <EmptyState icon="megaphone-outline" title="No opportunities" subtitle="Post opportunities for students" action={<Button title="Post Opportunity" onPress={() => setShowModal(true)} variant="secondary" />} />
        ) : opportunities.map((opp: Opportunity) => (
          <View key={opp._id} style={[s.card, shadows.card]}>
            <View style={s.cardTop}>
              <View style={[s.typeBadge, { backgroundColor: getTypeColor(opp.type) + '20' }]}>
                <Text style={[s.typeBadgeText, { color: getTypeColor(opp.type) }]}>{opp.type.toUpperCase()}</Text>
              </View>
              {opp.status && (
                <View style={[s.statusBadge, { backgroundColor: opp.status === 'APPROVED' ? colors.successLight : opp.status === 'REJECTED' ? colors.errorLight : colors.warningLight }]}>
                  <Text style={[s.statusText, { color: opp.status === 'APPROVED' ? colors.success : opp.status === 'REJECTED' ? colors.error : colors.warning }]}>{opp.status}</Text>
                </View>
              )}
            </View>
            <Text style={s.cardTitle}>{opp.title}</Text>
            {opp.company && <Text style={s.cardCompany}>{opp.company}{opp.location ? ` · ${opp.location}` : ''}</Text>}
            <Text style={s.cardDesc} numberOfLines={3}>{opp.description}</Text>
            {opp.deadline && <Text style={s.cardDeadline}>Deadline: {new Date(opp.deadline).toLocaleDateString()}</Text>}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={colors.textPrimary} /></TouchableOpacity>
            <Text style={s.modalTitle}>Post Opportunity</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps="handled">
            <Input label="Title" placeholder="Opportunity title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
            <View>
              <Text style={s.chipLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.chipRow}>
                  {TYPE_OPTIONS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[s.typeChip, form.type === t && { backgroundColor: getTypeColor(t) }]}
                      onPress={() => setForm({ ...form, type: t })}
                    >
                      <Text style={[s.typeChipText, form.type === t && { color: 'white' }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <Input label="Company / Organization" placeholder="Company name" value={form.company} onChangeText={(t) => setForm({ ...form, company: t })} />
            <Input label="Location" placeholder="City or Remote" value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />
            <Input label="Deadline" placeholder="YYYY-MM-DD" value={form.deadline} onChangeText={(t) => setForm({ ...form, deadline: t })} />
            <Input label="Description" placeholder="Describe the opportunity" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline numberOfLines={4} style={{ minHeight: 80, textAlignVertical: 'top' }} />
            <Input label="Requirements (comma-separated)" placeholder="React, Node.js..." value={form.requirements} onChangeText={(t) => setForm({ ...form, requirements: t })} />
            <Input label="Application Link" placeholder="https://..." value={form.application_link} onChangeText={(t) => setForm({ ...form, application_link: t })} autoCapitalize="none" />
            <Button title="Post Opportunity" onPress={handleCreate} loading={createMut.isPending} icon="checkmark" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardTop: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill },
  typeBadgeText: { fontSize: 10, fontWeight: typography.weights.bold },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill },
  statusText: { fontSize: 10, fontWeight: typography.weights.bold },
  cardTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  cardCompany: { fontSize: typography.sizes.sm, color: colors.accent, marginTop: 2 },
  cardDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 19 },
  cardDeadline: { fontSize: typography.sizes.xs, color: colors.warning, fontWeight: typography.weights.semibold, marginTop: spacing.xs },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  modalContent: { padding: spacing.md, gap: spacing.sm },
  chipLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.gray[700], marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.gray[100] },
  typeChipText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'capitalize' },
});

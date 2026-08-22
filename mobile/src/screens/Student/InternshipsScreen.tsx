import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, EmptyState, LoadingSpinner, ErrorBanner } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { getProfileId } from '../../utils/authIds';
import { useInternships, useCreateInternship, useUpdateInternship, useDeleteInternship } from '../../hooks/useApi';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Internship } from '../../types';

export default function InternshipsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const profileId = getProfileId(user);
  const { data: internships, isLoading, refetch } = useInternships(profileId);
  const createMut = useCreateInternship();
  const updateMut = useUpdateInternship();
  const deleteMut = useDeleteInternship();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Internship | null>(null);
  const [form, setForm] = useState({ company: '', position: '', duration: '', description: '', certificate_link: '' });
  const [refreshing, setRefreshing] = useState(false);

  const resetForm = () => { setForm({ company: '', position: '', duration: '', description: '', certificate_link: '' }); setEditing(null); };

  const openEdit = (item: Internship) => {
    setEditing(item);
    setForm({ company: item.company, position: item.position, duration: item.duration, description: item.description || '', certificate_link: item.certificate_link || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.position.trim()) { Alert.alert('Error', 'Company and position are required'); return; }
    const payload = { ...form, student: profileId };
    try {
      if (editing) { await updateMut.mutateAsync({ id: editing._id, data: payload }); }
      else { await createMut.mutateAsync(payload as any); }
      setShowModal(false); resetForm();
    } catch (err: any) { Alert.alert('Error', err?.message || 'Failed to save'); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Internship', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Internships</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowModal(true); }} style={styles.addBtn}><Ionicons name="add" size={22} color={colors.textInverse} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} colors={[colors.accent]} />}>
        {isLoading ? <LoadingSpinner /> : !internships || internships.length === 0 ? (
          <EmptyState icon="briefcase-outline" title="No internships yet" subtitle="Add your internship experiences" action={<Button title="Add Internship" onPress={() => { resetForm(); setShowModal(true); }} variant="secondary" />} />
        ) : internships.map((item) => (
          <View key={item._id} style={[styles.card, shadows.card]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.position}</Text>
                <Text style={styles.cardSubtitle}>{item.company}</Text>
                <Text style={styles.cardMeta}>{item.duration}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(item)}><Ionicons name="create-outline" size={20} color={colors.accent} /></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)}><Ionicons name="trash-outline" size={20} color={colors.error} /></TouchableOpacity>
              </View>
            </View>
            {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><Ionicons name="close" size={24} color={colors.textPrimary} /></TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Internship' : 'Add Internship'}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Input label="Company" placeholder="Company name" value={form.company} onChangeText={(t) => setForm({ ...form, company: t })} />
            <Input label="Position" placeholder="e.g., SDE Intern" value={form.position} onChangeText={(t) => setForm({ ...form, position: t })} />
            <Input label="Duration" placeholder="e.g., 3 months" value={form.duration} onChangeText={(t) => setForm({ ...form, duration: t })} />
            <Input label="Description" placeholder="What did you do?" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline numberOfLines={3} style={{ minHeight: 70, textAlignVertical: 'top' }} />
            <Input label="Certificate Link" placeholder="https://..." value={form.certificate_link} onChangeText={(t) => setForm({ ...form, certificate_link: t })} autoCapitalize="none" />
            <Button title={editing ? 'Update' : 'Add Internship'} onPress={handleSave} loading={createMut.isPending || updateMut.isPending} icon="checkmark" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', gap: spacing.sm },
  cardTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  cardSubtitle: { fontSize: typography.sizes.md, color: colors.accent, marginTop: 2 },
  cardMeta: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 4 },
  cardDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 19 },
  cardActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  modalContent: { padding: spacing.md, gap: spacing.sm },
});

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, EmptyState, LoadingSpinner } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { getProfileId } from '../../utils/authIds';
import { useCertificates, useCreateCertificate, useUpdateCertificate, useDeleteCertificate } from '../../hooks/useApi';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Certificate } from '../../types';

export default function CertificatesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const profileId = getProfileId(user);
  const { data: certificates, isLoading, refetch } = useCertificates(profileId);
  const createMut = useCreateCertificate();
  const updateMut = useUpdateCertificate();
  const deleteMut = useDeleteCertificate();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState({ title: '', organization: '', issue_date: '', certificate_link: '' });
  const [refreshing, setRefreshing] = useState(false);
  const resetForm = () => { setForm({ title: '', organization: '', issue_date: '', certificate_link: '' }); setEditing(null); };
  const openEdit = (c: Certificate) => { setEditing(c); setForm({ title: c.title, organization: c.organization, issue_date: c.issue_date, certificate_link: c.certificate_link || '' }); setShowModal(true); };
  const handleSave = async () => {
    if (!form.title.trim() || !form.organization.trim()) { Alert.alert('Error', 'Title and organization are required'); return; }
    try {
      if (editing) await updateMut.mutateAsync({ id: editing._id, data: { ...form, student: profileId } });
      else await createMut.mutateAsync({ ...form, student: profileId } as any);
      setShowModal(false); resetForm();
    } catch (err: any) { Alert.alert('Error', err?.message || 'Failed to save'); }
  };
  const handleDelete = (id: string) => Alert.alert('Delete Certificate', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate(id) }]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={s.headerTitle}>Certificates</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowModal(true); }} style={s.addBtn}><Ionicons name="add" size={22} color={colors.textInverse} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} colors={[colors.accent]} />}>
        {isLoading ? <LoadingSpinner /> : !certificates?.length ? (
          <EmptyState icon="ribbon-outline" title="No certificates" subtitle="Add your certifications" action={<Button title="Add Certificate" onPress={() => { resetForm(); setShowModal(true); }} variant="secondary" />} />
        ) : certificates.map((c) => (
          <View key={c._id} style={[s.card, shadows.card]}>
            <View style={s.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{c.title}</Text>
                <Text style={s.cardSubtitle}>{c.organization}</Text>
                <Text style={s.cardMeta}>Issued: {new Date(c.issue_date).toLocaleDateString()}</Text>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity onPress={() => openEdit(c)}><Ionicons name="create-outline" size={20} color={colors.accent} /></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(c._id)}><Ionicons name="trash-outline" size={20} color={colors.error} /></TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><Ionicons name="close" size={24} color={colors.textPrimary} /></TouchableOpacity>
            <Text style={s.modalTitle}>{editing ? 'Edit Certificate' : 'Add Certificate'}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps="handled">
            <Input label="Title" placeholder="Certificate name" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
            <Input label="Organization" placeholder="Issuing organization" value={form.organization} onChangeText={(t) => setForm({ ...form, organization: t })} />
            <Input label="Issue Date" placeholder="YYYY-MM-DD" value={form.issue_date} onChangeText={(t) => setForm({ ...form, issue_date: t })} />
            <Input label="Certificate Link" placeholder="https://..." value={form.certificate_link} onChangeText={(t) => setForm({ ...form, certificate_link: t })} autoCapitalize="none" />
            <Button title={editing ? 'Update' : 'Add Certificate'} onPress={handleSave} loading={createMut.isPending || updateMut.isPending} icon="checkmark" />
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
  cardHeader: { flexDirection: 'row', gap: spacing.sm },
  cardTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  cardSubtitle: { fontSize: typography.sizes.md, color: colors.accent, marginTop: 2 },
  cardMeta: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  modalContent: { padding: spacing.md, gap: spacing.sm },
});

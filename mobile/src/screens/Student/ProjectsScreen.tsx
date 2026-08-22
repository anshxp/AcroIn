import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, RefreshControl,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, Card, EmptyState, LoadingSpinner, ErrorBanner } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { getProfileId } from '../../utils/authIds';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../hooks/useApi';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Project } from '../../types';

export default function ProjectsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const profileId = getProfileId(user);
  const { data: projects, isLoading, error, refetch } = useProjects(profileId);
  const createMut = useCreateProject();
  const updateMut = useUpdateProject();
  const deleteMut = useDeleteProject();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ title: '', description: '', technologies: '', github_link: '', live_link: '' });
  const [refreshing, setRefreshing] = useState(false);

  const resetForm = () => {
    setForm({ title: '', description: '', technologies: '', github_link: '', live_link: '' });
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      technologies: p.technologies.join(', '),
      github_link: p.github_link || '',
      live_link: p.live_link || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      github_link: form.github_link.trim() || undefined,
      live_link: form.live_link.trim() || undefined,
      student: profileId,
    };

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing._id, data: payload });
      } else {
        await createMut.mutateAsync(payload as any);
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Projects</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} colors={[colors.accent]} />}
      >
        {isLoading && !refreshing ? <LoadingSpinner /> : error ? <ErrorBanner message="Failed to load projects" /> :
          !projects || projects.length === 0 ? (
            <EmptyState icon="folder-outline" title="No projects yet" subtitle="Add your first project to showcase your work" action={<Button title="Add Project" onPress={openAdd} variant="secondary" />} />
          ) : (
            projects.map((p) => (
              <View key={p._id} style={[styles.card, shadows.card]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{p.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={3}>{p.description}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEdit(p)}><Ionicons name="create-outline" size={20} color={colors.accent} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(p._id)}><Ionicons name="trash-outline" size={20} color={colors.error} /></TouchableOpacity>
                  </View>
                </View>
                {p.technologies.length > 0 && (
                  <View style={styles.techRow}>
                    {p.technologies.map((t, i) => (
                      <View key={i} style={styles.techChip}><Text style={styles.techText}>{t}</Text></View>
                    ))}
                  </View>
                )}
                <View style={styles.linkRow}>
                  {p.github_link ? <TouchableOpacity style={styles.linkBtn}><Ionicons name="logo-github" size={16} color={colors.textSecondary} /><Text style={styles.linkText}>GitHub</Text></TouchableOpacity> : null}
                  {p.live_link ? <TouchableOpacity style={styles.linkBtn}><Ionicons name="globe-outline" size={16} color={colors.textSecondary} /><Text style={styles.linkText}>Live</Text></TouchableOpacity> : null}
                </View>
              </View>
            ))
          )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Project' : 'Add Project'}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Input label="Title" placeholder="Project name" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
            <Input label="Description" placeholder="What does it do?" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline numberOfLines={4} style={{ minHeight: 80, textAlignVertical: 'top' }} />
            <Input label="Technologies" placeholder="React, Node.js, MongoDB..." value={form.technologies} onChangeText={(t) => setForm({ ...form, technologies: t })} />
            <Input label="GitHub Link" placeholder="https://github.com/..." value={form.github_link} onChangeText={(t) => setForm({ ...form, github_link: t })} autoCapitalize="none" />
            <Input label="Live Link" placeholder="https://..." value={form.live_link} onChangeText={(t) => setForm({ ...form, live_link: t })} autoCapitalize="none" />
            <Button title={editing ? 'Update Project' : 'Add Project'} onPress={handleSave} loading={createMut.isPending || updateMut.isPending} icon="checkmark" />
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
  cardDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
  cardActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  techChip: { backgroundColor: colors.blue[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  techText: { fontSize: 11, color: colors.accent, fontWeight: typography.weights.semibold },
  linkRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  modalContent: { padding: spacing.md, gap: spacing.sm },
});

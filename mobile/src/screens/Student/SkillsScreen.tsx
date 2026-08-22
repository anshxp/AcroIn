import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, Badge, EmptyState, LoadingSpinner } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { getProfileId } from '../../utils/authIds';
import { useSkills, useAddSkill, useUpdateSkill } from '../../hooks/useApi';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { StudentSkill } from '../../types';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const CATEGORIES = ['Programming', 'Framework', 'Database', 'DevOps', 'Design', 'Soft Skills', 'Other'] as const;

export default function SkillsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const profileId = getProfileId(user);
  const { data: skills, isLoading, refetch } = useSkills(profileId);
  const addMut = useAddSkill();
  const updateMut = useUpdateSkill();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StudentSkill | null>(null);
  const [form, setForm] = useState({ name: '', level: 'Beginner' as string, category: 'Programming', progress: '50' });
  const [refreshing, setRefreshing] = useState(false);

  const resetForm = () => { setForm({ name: '', level: 'Beginner', category: 'Programming', progress: '50' }); setEditing(null); };
  const openEdit = (s: StudentSkill) => {
    setEditing(s);
    setForm({ name: s.name, level: s.level, category: s.category || 'Programming', progress: String(s.progress || 50) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Skill name is required'); return; }
    const payload = {
      name: form.name.trim(),
      level: form.level as any,
      category: form.category,
      progress: parseInt(form.progress, 10) || 50,
      verified: false,
      endorsements: 0,
    };
    try {
      if (editing && editing._id) await updateMut.mutateAsync({ studentId: profileId, skillId: editing._id, skill: payload });
      else await addMut.mutateAsync({ studentId: profileId, skill: payload });
      setShowModal(false); resetForm();
    } catch (err: any) { Alert.alert('Error', err?.message || 'Failed to save'); }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={s.headerTitle}>Skills</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowModal(true); }} style={s.addBtn}><Ionicons name="add" size={22} color={colors.textInverse} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refetch(); setRefreshing(false); }} colors={[colors.accent]} />}>
        {isLoading ? <LoadingSpinner /> : !skills?.length ? (
          <EmptyState icon="sparkles-outline" title="No skills yet" subtitle="Add skills to showcase your expertise" action={<Button title="Add Skill" onPress={() => { resetForm(); setShowModal(true); }} variant="secondary" />} />
        ) : skills.map((skill, idx) => (
          <TouchableOpacity key={skill._id || idx} style={[s.card, shadows.card]} onPress={() => openEdit(skill)}>
            <View style={s.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{skill.name}</Text>
                <View style={s.skillMeta}>
                  <Badge label={skill.level} variant={skill.level === 'Advanced' ? 'success' : skill.level === 'Intermediate' ? 'warning' : 'info'} size="sm" />
                  {skill.category && <Text style={s.categoryText}>{skill.category}</Text>}
                  {skill.verified && <Badge label="Verified" variant="success" size="sm" />}
                </View>
              </View>
              <Text style={s.progressText}>{skill.progress}%</Text>
            </View>
            {/* Progress bar */}
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${Math.min(skill.progress, 100)}%` }]} />
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><Ionicons name="close" size={24} color={colors.textPrimary} /></TouchableOpacity>
            <Text style={s.modalTitle}>{editing ? 'Edit Skill' : 'Add Skill'}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps="handled">
            <Input label="Skill Name" placeholder="e.g., React, Python" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            <View>
              <Text style={s.chipLabel}>Level</Text>
              <View style={s.chipRow}>
                {LEVELS.map((lvl) => (
                  <Chip key={lvl} mode={form.level === lvl ? 'flat' : 'outlined'} onPress={() => setForm({ ...form, level: lvl })}
                    style={[s.chip, form.level === lvl && s.chipActive]} textStyle={[s.chipText, form.level === lvl && s.chipTextActive]}>{lvl}</Chip>
                ))}
              </View>
            </View>
            <View>
              <Text style={s.chipLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.chipRow}>
                  {CATEGORIES.map((cat) => (
                    <Chip key={cat} mode={form.category === cat ? 'flat' : 'outlined'} onPress={() => setForm({ ...form, category: cat })}
                      style={[s.chip, form.category === cat && s.chipActive]} textStyle={[s.chipText, form.category === cat && s.chipTextActive]}>{cat}</Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
            <Input label="Proficiency (%)" placeholder="0-100" value={form.progress} onChangeText={(t) => setForm({ ...form, progress: t })} keyboardType="number-pad" />
            <Button title={editing ? 'Update Skill' : 'Add Skill'} onPress={handleSave} loading={addMut.isPending || updateMut.isPending} icon="checkmark" />
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
  cardHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  cardTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  skillMeta: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' },
  categoryText: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  progressText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.accent },
  progressBar: { height: 6, backgroundColor: colors.gray[200], borderRadius: 3, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  modalContent: { padding: spacing.md, gap: spacing.sm },
  chipLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.gray[700], marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.gray[50] },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: 'white' },
});

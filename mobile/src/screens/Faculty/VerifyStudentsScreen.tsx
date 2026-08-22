import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, EmptyState, LoadingSpinner } from '../../components/ui';
import { studentAPI, facultyAPI, type PaginatedResult } from '../../services/apiClient';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Student } from '../../types';

const toStudentList = (response: Student[] | PaginatedResult<Student>): Student[] =>
  Array.isArray(response) ? response : response.items;

export default function VerifyStudentsScreen({ navigation }: any) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const all = toStudentList(await studentAPI.getAllStudents({ page: 1, limit: 100 }));
      const unverified = all.filter((s: Student) => s.verificationStatus !== 'verified' && s.verificationStatus !== 'strongly_verified');
      setStudents(unverified);
    } catch { setStudents([]); }
    finally { setIsLoading(false); }
  }, []);

  React.useEffect(() => { loadStudents(); }, [loadStudents]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await loadStudents(); setRefreshing(false); }, [loadStudents]);

  const handleVerify = async (student: Student) => {
    Alert.alert('Verify Student', `Verify ${student.name}?`, [
      { text: 'Cancel' },
      {
        text: 'Verify', onPress: async () => {
          try {
            await facultyAPI.verifyStudent(student.roll || student._id);
            Alert.alert('Success', `${student.name} has been verified`);
            loadStudents();
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to verify');
          }
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Verify Students</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}>
        {isLoading ? <LoadingSpinner /> : students.length === 0 ? (
          <EmptyState icon="checkmark-circle-outline" title="All caught up!" subtitle="No students pending verification" />
        ) : students.map((student) => (
          <View key={student._id} style={[s.card, shadows.card]}>
            <View style={s.cardRow}>
              <Avatar name={student.name} imageUrl={student.profile_image} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={s.studentName}>{student.name}</Text>
                <Text style={s.studentInfo}>{student.roll} · {student.department}</Text>
                <Badge
                  label={student.verificationStatus === 'not_verified' ? 'Unverified' : student.verificationStatus || 'Pending'}
                  variant={student.verificationStatus === 'not_verified' ? 'warning' : 'info'}
                  size="sm"
                />
              </View>
              <TouchableOpacity style={s.verifyBtn} onPress={() => handleVerify(student)}>
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={s.verifyBtnText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  studentName: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.textPrimary },
  studentInfo: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2, marginBottom: 4 },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill },
  verifyBtnText: { color: 'white', fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
});

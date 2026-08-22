import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Avatar, Badge, EmptyState, LoadingSpinner, ErrorBanner, Button } from '../../components/ui';
import { studentAPI, type PaginatedResult } from '../../services/apiClient';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Student } from '../../types';

const toStudentList = (response: Student[] | PaginatedResult<Student>): Student[] =>
  Array.isArray(response) ? response : response.items;

export default function SmartSearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [deptFilter, setDeptFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setError('');
    try {
      const all = toStudentList(await studentAPI.getAllStudents({ page: 1, limit: 100 }));
      let filtered = all;
      const q = query.toLowerCase();
      if (q) {
        filtered = filtered.filter((s: Student) =>
          s.name?.toLowerCase().includes(q) || s.roll?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.tech_stack?.some((t: string) => t.toLowerCase().includes(q)) ||
          s.skills?.some((sk) => sk.name.toLowerCase().includes(q))
        );
      }
      if (deptFilter) filtered = filtered.filter((s: Student) => s.department === deptFilter);
      if (skillFilter) {
        const sf = skillFilter.toLowerCase();
        filtered = filtered.filter((s: Student) => s.skills?.some((sk) => sk.name.toLowerCase().includes(sf)));
      }
      setResults(filtered);
    } catch (err) {
      setResults([]);
      setError(getApiErrorMessage(err, 'Search failed'));
    } finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Smart Search</Text>
      </View>

      <View style={s.searchSection}>
        <Input icon="search-outline" placeholder="Search by skills, certifications, projects..." value={query} onChangeText={setQuery} onSubmitEditing={handleSearch} returnKeyType="search" />
        <View style={s.filterRow}>
          <View style={{ flex: 1 }}>
            <Input placeholder="Department filter" value={deptFilter} onChangeText={setDeptFilter} />
          </View>
          <View style={{ flex: 1 }}>
            <Input placeholder="Skill filter" value={skillFilter} onChangeText={setSkillFilter} />
          </View>
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <View style={{ gap: spacing.sm }}>
            <ErrorBanner message={error} />
            <Button title="Retry" onPress={handleSearch} variant="secondary" />
          </View>
        ) : !hasSearched ? (
          <EmptyState icon="search-outline" title="Student Smart Search" subtitle="Discover peers by department, skills, certifications, and project interests." />
        ) : results.length === 0 ? (
          <EmptyState icon="search-outline" title="No students matched" subtitle="No students matched from backend data." />
        ) : (
          <>
            <Text style={s.resultCount}>{results.length} student{results.length !== 1 ? 's' : ''} found</Text>
            {results.map((student) => (
              <TouchableOpacity
                key={student._id}
                style={[s.card, shadows.card]}
                onPress={() => navigation.navigate('StudentProfileView', { id: student._id })}
              >
                <Avatar name={student.name} imageUrl={student.profile_image} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={s.studentName}>{student.name}</Text>
                  <Text style={s.studentInfo}>{student.roll} · {student.department}</Text>
                  {student.skills && student.skills.length > 0 && (
                    <View style={s.skillRow}>
                      {student.skills.slice(0, 4).map((sk, i) => (
                        <Badge key={i} label={sk.name} variant={sk.verified ? 'success' : 'info'} size="sm" />
                      ))}
                      {student.skills.length > 4 && <Text style={s.moreText}>+{student.skills.length - 4}</Text>}
                    </View>
                  )}
                  {student.tech_stack?.length > 0 && (
                    <Text style={s.techText}>{student.tech_stack.slice(0, 4).join(' · ')}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  searchSection: { paddingHorizontal: spacing.md, gap: spacing.xs },
  filterRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  resultCount: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary, marginBottom: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.xs, gap: spacing.sm },
  studentName: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.textPrimary },
  studentInfo: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  skillRow: { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' },
  moreText: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  techText: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 4 },
});

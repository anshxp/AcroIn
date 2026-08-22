import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Avatar, Badge, Button, EmptyState, LoadingSpinner, ErrorBanner } from '../../components/ui';
import { studentAPI, type PaginatedResult } from '../../services/apiClient';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import type { Student } from '../../types';

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setError('');
    try {
      const response = await studentAPI.getAllStudents({ page: 1, limit: 100 });
      const all = Array.isArray(response)
        ? response
        : (response as PaginatedResult<Student>).items;
      const q = query.toLowerCase();
      const filtered = all.filter((s: Student) =>
        s.name?.toLowerCase().includes(q) ||
        s.roll?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.tech_stack?.some((t: string) => t.toLowerCase().includes(q)) ||
        s.skills?.some((sk) => sk.name.toLowerCase().includes(q))
      );
      setResults(filtered);
    } catch (err) {
      setResults([]);
      setError(getApiErrorMessage(err, 'Search failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Smart Search</Text>
      </View>
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.gray[400]} />
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Search students, skills, projects..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {isLoading ? (
          <LoadingSpinner message="Searching..." />
        ) : error ? (
          <View style={s.errorWrap}>
            <ErrorBanner message={error} />
            <Button title="Retry" onPress={handleSearch} variant="secondary" />
          </View>
        ) : !hasSearched ? (
          <EmptyState
            icon="search-outline"
            title="Search for students"
            subtitle="Find students by name, roll, skills, or department"
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No results"
            subtitle={`No students found for "${query}"`}
          />
        ) : (
          results.map((student) => (
            <TouchableOpacity
              key={student._id}
              style={[s.resultCard, shadows.card]}
              onPress={() => navigation.navigate('StudentProfileView', { id: student._id })}
            >
              <Avatar name={student.name} imageUrl={student.profile_image} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={s.studentName}>{student.name}</Text>
                <Text style={s.studentRoll}>{student.roll} · {student.department}</Text>
                {student.tech_stack?.length > 0 && (
                  <View style={s.techRow}>
                    {student.tech_stack.slice(0, 3).map((t, i) => (
                      <Badge key={i} label={t} variant="info" size="sm" />
                    ))}
                    {student.tech_stack.length > 3 && (
                      <Text style={s.moreText}>+{student.tech_stack.length - 3}</Text>
                    )}
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  searchRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  content: { paddingHorizontal: spacing.md },
  errorWrap: { gap: spacing.sm },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  studentName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  studentRoll: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  techRow: { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' },
  moreText: { fontSize: typography.sizes.xs, color: colors.textTertiary },
});

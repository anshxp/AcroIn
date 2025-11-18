import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getFaculties, getAllDepartments } from '@/src/api/queries';
import { FacultyCard, Faculty } from '@/components/faculty-card';

export default function ExploreScreen() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('IT');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    loadDepartments();
    loadFaculties('IT');
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await getAllDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadFaculties = async (dept: string) => {
    try {
      setLoading(true);
      const result: any = await getFaculties(dept, 'Professor');
      setFaculties(result?.faculties || []);
    } catch (error) {
      console.error('Failed to load faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFaculties(selectedDept);
    setRefreshing(false);
  };

  const handleDeptPress = (dept: string) => {
    setSelectedDept(dept);
    loadFaculties(dept);
  };

  const filteredFaculties = faculties.filter(faculty =>
    `${faculty.firstname} ${faculty.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faculty.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Faculty Directory</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Browse and connect with faculty members</ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Department Filter */}
      <View style={styles.deptSection}>
        <ThemedText style={styles.deptLabel}>Departments</ThemedText>
        <FlatList
          data={departments}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ThemedView
              style={[
                styles.deptButton,
                selectedDept === item && styles.deptButtonActive,
              ]}>
              <ThemedText
                style={[
                  styles.deptButtonText,
                  selectedDept === item && styles.deptButtonTextActive,
                ]}
                onPress={() => handleDeptPress(item)}>
                {item}
              </ThemedText>
            </ThemedView>
          )}
        />
      </View>

      {/* Faculty List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <ThemedText style={styles.loadingText}>Loading faculty members...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredFaculties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FacultyCard faculty={item} />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <ThemedText style={styles.emptyText}>No faculty members found</ThemedText>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Stats Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.statsText}>
          Showing {filteredFaculties.length} of {faculties.length} faculty members
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  searchSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  deptSection: {
    paddingVertical: 12,
  },
  deptLabel: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  deptList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  deptButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  deptButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  deptButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  deptButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  statsText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export interface Faculty {
  id: string;
  firstname: string;
  lastName: string;
  email: string;
  profilepic?: string;
  experience: number;
  qualification: string;
  department: string;
  designation: string;
  skills: string[];
  techstacks: string[];
  phone: string;
  linkedin?: string;
}

interface FacultyCardProps {
  faculty: Faculty;
  onPress?: () => void;
}

export function FacultyCard({ faculty, onPress }: FacultyCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ThemedView style={styles.card}>
        {/* Header with name and designation */}
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <ThemedText type="subtitle" style={styles.name}>
              {faculty.firstname} {faculty.lastName}
            </ThemedText>
            <ThemedText style={styles.designation}>{faculty.designation}</ThemedText>
          </View>
          {faculty.experience && (
            <ThemedView style={styles.expBadge}>
              <ThemedText style={styles.expText}>{faculty.experience}y</ThemedText>
            </ThemedView>
          )}
        </View>

        {/* Department and Email */}
        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Department:</ThemedText>
          <ThemedText style={styles.value}>{faculty.department}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Email:</ThemedText>
          <ThemedText style={styles.value}>{faculty.email}</ThemedText>
        </View>

        {/* Skills */}
        {faculty.skills && faculty.skills.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Skills</ThemedText>
            <View style={styles.tagContainer}>
              {faculty.skills.slice(0, 3).map((skill, idx) => (
                <ThemedView key={idx} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{skill}</ThemedText>
                </ThemedView>
              ))}
              {faculty.skills.length > 3 && (
                <ThemedView style={styles.tag}>
                  <ThemedText style={styles.tagText}>+{faculty.skills.length - 3}</ThemedText>
                </ThemedView>
              )}
            </View>
          </View>
        )}

        {/* Tech Stacks */}
        {faculty.techstacks && faculty.techstacks.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Tech Stack</ThemedText>
            <View style={styles.tagContainer}>
              {faculty.techstacks.slice(0, 3).map((tech, idx) => (
                <ThemedView key={idx} style={[styles.tag, styles.techTag]}>
                  <ThemedText style={styles.tagText}>{tech}</ThemedText>
                </ThemedView>
              ))}
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.footer}>
          <ThemedText style={styles.contact}>📱 {faculty.phone}</ThemedText>
          {faculty.linkedin && (
            <ThemedText style={styles.contact}>🔗 LinkedIn</ThemedText>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  designation: {
    fontSize: 13,
    opacity: 0.7,
  },
  expBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e8f4f8',
  },
  expText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
    minWidth: 90,
  },
  value: {
    fontSize: 12,
    flex: 1,
  },
  section: {
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.7,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  techTag: {
    backgroundColor: '#e3f2fd',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 16,
  },
  contact: {
    fontSize: 12,
    opacity: 0.7,
  },
});

import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function StudentHome() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Student Dashboard</ThemedText>
      <ThemedText style={styles.subtitle}>Welcome, Student! Here you can view your profile, upload projects, and connect with peers.</ThemedText>
      {/* Add more student features here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
  },
});
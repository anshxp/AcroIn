import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AdminHome() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Admin Dashboard</ThemedText>
      <ThemedText style={styles.subtitle}>Welcome, Admin! Verify users, moderate content, and manage campus data.</ThemedText>
      {/* Add more admin features here */}
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
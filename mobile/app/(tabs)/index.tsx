import { StyleSheet, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <ThemedView style={styles.hero}>
        <ThemedText type="title" style={styles.heroTitle}>AcroIn</ThemedText>
        <ThemedText style={styles.heroSubtitle}>Faculty Management System</ThemedText>
        <ThemedText style={styles.heroDescription}>
          Connect with faculty, explore expertise, and collaborate with professionals in your institution.
        </ThemedText>
      </ThemedView>

      {/* Features Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>✨ Key Features</ThemedText>
        
        <ThemedView style={styles.featureCard}>
          <ThemedText style={styles.featureIcon}>🔍</ThemedText>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureName}>Browse Faculty</ThemedText>
            <ThemedText style={styles.featureDesc}>Search and explore faculty members across departments</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.featureCard}>
          <ThemedText style={styles.featureIcon}>🎓</ThemedText>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureName}>View Expertise</ThemedText>
            <ThemedText style={styles.featureDesc}>Discover skills, qualifications, and technical expertise</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.featureCard}>
          <ThemedText style={styles.featureIcon}>🤝</ThemedText>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureName}>Connect & Collaborate</ThemedText>
            <ThemedText style={styles.featureDesc}>Reach out via email or LinkedIn for collaboration</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.featureCard}>
          <ThemedText style={styles.featureIcon}>🏢</ThemedText>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureName}>Department Search</ThemedText>
            <ThemedText style={styles.featureDesc}>Filter faculty by department and designation</ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <ThemedText style={styles.sectionTitle}>📊 Quick Stats</ThemedText>
        <View style={styles.statsGrid}>
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>100+</ThemedText>
            <ThemedText style={styles.statLabel}>Faculty Members</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statCard}>
            <ThemedText style={styles.statNumber}>7+</ThemedText>
            <ThemedText style={styles.statLabel}>Departments</ThemedText>
          </ThemedView>
        </View>
      </View>

      {/* How to Use */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>🚀 Getting Started</ThemedText>
        
        <ThemedView style={styles.stepCard}>
          <ThemedView style={styles.stepNumber}>
            <ThemedText style={styles.stepNumberText}>1</ThemedText>
          </ThemedView>
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Go to Faculty Directory</ThemedText>
            <ThemedText style={styles.stepDesc}>Tap the Explore tab to browse all faculty members</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.stepCard}>
          <ThemedView style={styles.stepNumber}>
            <ThemedText style={styles.stepNumberText}>2</ThemedText>
          </ThemedView>
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Filter by Department</ThemedText>
            <ThemedText style={styles.stepDesc}>Select a department to see relevant faculty</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.stepCard}>
          <ThemedView style={styles.stepNumber}>
            <ThemedText style={styles.stepNumberText}>3</ThemedText>
          </ThemedView>
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>View Details & Connect</ThemedText>
            <ThemedText style={styles.stepDesc}>Tap a faculty card to view full profile and contact info</ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Made with ❤️ for academic excellence
        </ThemedText>
        <ThemedText style={styles.footerVersion}>v1.0.0</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  stepCard: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  footerVersion: {
    fontSize: 12,
    opacity: 0.4,
  },
});

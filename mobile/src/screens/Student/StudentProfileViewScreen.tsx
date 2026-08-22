import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, LoadingSpinner, ErrorBanner, Button } from '../../components/ui';
import { useStudentProfile } from '../../hooks/useApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography, shadows } from '../../theme';

export default function StudentProfileViewScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { data: profile, isLoading, isError, error, refetch } = useStudentProfile(id);

  const openLink = async (url?: string) => {
    if (!url?.trim()) return;
    const formatted = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    try {
      await Linking.openURL(formatted);
    } catch {
      Alert.alert('Error', 'Could not open link');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Student Profile</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.errorWrap}>
          <ErrorBanner message={getApiErrorMessage(error, 'Profile not available')} />
          <Button title="Retry" onPress={() => refetch()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Student Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.card, shadows.card]}>
          <Avatar name={profile.name} imageUrl={profile.profile_image} size={72} />
          <Text style={s.name}>{profile.name}</Text>
          <Text style={s.meta}>{profile.roll} · {profile.department}</Text>
          {profile.verificationStatus && (
            <Badge
              label={profile.verificationStatus.replace('_', ' ')}
              variant={profile.verificationStatus.includes('verified') ? 'success' : 'warning'}
              size="sm"
            />
          )}
          {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}
        </View>

        {profile.skills && profile.skills.length > 0 && (
          <View style={[s.section, shadows.card]}>
            <Text style={s.sectionTitle}>Skills</Text>
            <View style={s.chipRow}>
              {profile.skills.map((skill, i) => (
                <Badge
                  key={skill._id || i}
                  label={`${skill.name} · ${skill.level}`}
                  variant={skill.verified ? 'success' : 'info'}
                  size="sm"
                />
              ))}
            </View>
          </View>
        )}

        {profile.tech_stack && profile.tech_stack.length > 0 && (
          <View style={[s.section, shadows.card]}>
            <Text style={s.sectionTitle}>Tech Stack</Text>
            <View style={s.chipRow}>
              {profile.tech_stack.map((t, i) => (
                <Badge key={i} label={t} variant="info" size="sm" />
              ))}
            </View>
          </View>
        )}

        <View style={[s.section, shadows.card]}>
          <Text style={s.sectionTitle}>Links</Text>
          {profile.linkedin ? (
            <TouchableOpacity style={s.linkRow} onPress={() => openLink(profile.linkedin)}>
              <Ionicons name="logo-linkedin" size={18} color={colors.accent} />
              <Text style={s.linkText}>LinkedIn</Text>
            </TouchableOpacity>
          ) : null}
          {profile.github ? (
            <TouchableOpacity style={s.linkRow} onPress={() => openLink(profile.github)}>
              <Ionicons name="logo-github" size={18} color={colors.textPrimary} />
              <Text style={s.linkText}>GitHub</Text>
            </TouchableOpacity>
          ) : null}
          {profile.portfolio ? (
            <TouchableOpacity style={s.linkRow} onPress={() => openLink(profile.portfolio)}>
              <Ionicons name="globe-outline" size={18} color={colors.accent} />
              <Text style={s.linkText}>Portfolio</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary },
  content: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, marginTop: spacing.sm },
  meta: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  bio: { fontSize: typography.sizes.sm, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  section: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  linkText: { fontSize: typography.sizes.sm, color: colors.link },
  errorWrap: { padding: spacing.lg, gap: spacing.md },
});

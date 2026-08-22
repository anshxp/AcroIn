import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Card, CardHeader, EmptyState, LoadingSpinner, ErrorBanner, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useStudentProfile, useFacultyProfile } from '../../hooks/useApi';
import { getProfileId } from '../../utils/authIds';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import FaceEnrollmentModal from '../../components/FaceEnrollmentModal';

export default function ProfileScreen({ navigation }: any) {
  const { user, clearAuth } = useAuthStore();
  const userType = user?.userType || 'student';
  const profileId = getProfileId(user);

  const studentQuery = useStudentProfile(userType === 'student' ? profileId : undefined);
  const facultyQuery = useFacultyProfile(userType === 'faculty');

  const profile = userType === 'student' ? studentQuery.data : facultyQuery.data;
  const isLoading = userType === 'student' ? studentQuery.isLoading : facultyQuery.isLoading;
  const isError = userType === 'student' ? studentQuery.isError : facultyQuery.isError;
  const profileError = userType === 'student' ? studentQuery.error : facultyQuery.error;
  const refetch = userType === 'student' ? studentQuery.refetch : facultyQuery.refetch;

  const [refreshing, setRefreshing] = useState(false);
  const [faceModalVisible, setFaceModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOpenURL = async (url: string) => {
    if (!url) return;
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    try {
      const supported = await Linking.canOpenURL(formattedUrl);
      if (supported) {
        await Linking.openURL(formattedUrl);
      } else {
        Alert.alert('Invalid URL', 'Cannot open the link: ' + url);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while opening the link.');
    }
  };

  const userName = userType === 'student'
    ? (profile as any)?.name || user?.name || 'User'
    : `${(profile as any)?.firstname || ''} ${(profile as any)?.lastName || ''}`.trim() || user?.name || 'User';

  const userEmail = (profile as any)?.email || user?.email || '';
  const department = (profile as any)?.department || user?.department || '';

  const studentMenuItems = [
    { id: 'opportunities', label: 'CDC Opportunities', icon: 'megaphone-outline', color: '#0EA5E9', screen: 'BrowseOpportunities' },
    { id: 'projects', label: 'My Projects', icon: 'folder-outline', color: '#3B82F6', screen: 'Projects' },
    { id: 'internships', label: 'Internships', icon: 'briefcase-outline', color: '#10B981', screen: 'Internships' },
    { id: 'competitions', label: 'Competitions', icon: 'trophy-outline', color: '#F59E0B', screen: 'Competitions' },
    { id: 'certificates', label: 'Certificates', icon: 'ribbon-outline', color: '#EC4899', screen: 'Certificates' },
    { id: 'skills', label: 'Skills', icon: 'sparkles-outline', color: '#8B5CF6', screen: 'Skills' },
  ];

  const facultyMenuItems = [
    { id: 'opportunities', label: 'Post Opportunities', icon: 'megaphone-outline', color: '#10B981', screen: 'PostOpportunities' },
    { id: 'smartsearch', label: 'Smart Search', icon: 'search-outline', color: '#3B82F6', screen: 'SmartSearch' },
    { id: 'verify', label: 'Verify Students', icon: 'checkmark-circle-outline', color: '#F59E0B', screen: 'VerifyStudents' },
  ];

  const menuItems = userType === 'faculty' ? facultyMenuItems : studentMenuItems;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => clearAuth(), style: 'destructive' },
    ]);
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (isError && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <ErrorBanner message={getApiErrorMessage(profileError, 'Could not load profile')} />
          <Button title="Retry" onPress={() => refetch()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const s = profile as any;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />
        }
      >
        {/* Profile Header Card */}
        <View style={[styles.headerCard, shadows.card]}>
          <Avatar
            name={userName}
            imageUrl={
              userType === 'student'
                ? s?.profile_image
                : s?.profilepic
            }
            size={68}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            <View style={styles.badgeRow}>
              <Badge
                label={userType.charAt(0).toUpperCase() + userType.slice(1)}
                variant={userType as any}
              />
              {department && (
                <Badge label={department} variant="info" size="sm" />
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats for Students */}
        {userType === 'student' && s && (
          <View style={styles.statsRow}>
            {[
              { label: 'Projects', count: s.projects?.length || 0, icon: 'folder' },
              { label: 'Skills', count: s.skills?.length || 0, icon: 'sparkles' },
              { label: 'Certs', count: s.certificates?.length || 0, icon: 'ribbon' },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statCard, shadows.soft]}>
                <Text style={styles.statValue}>{stat.count}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Student Specific Profile Sections */}
        {userType === 'student' && s && (
          <View style={styles.detailsContainer}>
            {/* 1. Academic Details Card */}
            <Card style={styles.detailCard}>
              <CardHeader
                title="Academic Details"
                subtitle="University enrollment credentials"
                right={<Ionicons name="school-outline" size={22} color={colors.primary} />}
              />
              <Divider style={styles.cardDivider} />
              <View style={styles.infoGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Roll Number</Text>
                  <Text style={styles.gridValue}>{s.roll || 'Not Set'}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Department</Text>
                  <Text style={styles.gridValue}>{s.department || 'Not Set'}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Academic Year</Text>
                  <Text style={styles.gridValue}>{s.year || 'Not Set'}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Semester</Text>
                  <Text style={styles.gridValue}>{s.semester || 'Not Set'}</Text>
                </View>
                <View style={[styles.gridItem, { width: '100%' }]}>
                  <Text style={styles.gridLabel}>Cumulative CGPA</Text>
                  <View style={styles.cgpaContainer}>
                    <Text style={styles.cgpaValue}>
                      {s.cgpa !== undefined && s.cgpa !== null ? s.cgpa.toFixed(2) : '0.00'}
                    </Text>
                    <Text style={styles.cgpaMax}>/ 10.00</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* 2. Contact Details Card */}
            <Card style={styles.detailCard}>
              <CardHeader
                title="Contact Details"
                subtitle="Reachability & social links"
                right={<Ionicons name="mail-outline" size={22} color={colors.primary} />}
              />
              <Divider style={styles.cardDivider} />
              <View style={styles.contactList}>
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={20} color={colors.accent} style={styles.contactIcon} />
                  <View>
                    <Text style={styles.contactLabel}>Phone Number</Text>
                    <Text style={styles.contactValue}>{s.phone || 'Not Set'}</Text>
                  </View>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={20} color={colors.accent} style={styles.contactIcon} />
                  <View>
                    <Text style={styles.contactLabel}>Institutional Email</Text>
                    <Text style={styles.contactValue}>{s.email || 'Not Set'}</Text>
                  </View>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="location-outline" size={20} color={colors.accent} style={styles.contactIcon} />
                  <View>
                    <Text style={styles.contactLabel}>Current Location</Text>
                    <Text style={styles.contactValue}>
                      {s.location || s.address || 'Not Set'}
                    </Text>
                  </View>
                </View>

                {/* Social Button Links */}
                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={[styles.socialButton, !s.linkedin && styles.socialButtonDisabled]}
                    onPress={() => s.linkedin && handleOpenURL(s.linkedin)}
                    disabled={!s.linkedin}
                  >
                    <Ionicons name="logo-linkedin" size={18} color={s.linkedin ? '#0077B5' : colors.gray[400]} />
                    <Text style={[styles.socialText, !s.linkedin && styles.socialTextDisabled]}>LinkedIn</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, !s.github && styles.socialButtonDisabled]}
                    onPress={() => s.github && handleOpenURL(s.github)}
                    disabled={!s.github}
                  >
                    <Ionicons name="logo-github" size={18} color={s.github ? '#24292e' : colors.gray[400]} />
                    <Text style={[styles.socialText, !s.github && styles.socialTextDisabled]}>GitHub</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, !s.portfolio && styles.socialButtonDisabled]}
                    onPress={() => s.portfolio && handleOpenURL(s.portfolio)}
                    disabled={!s.portfolio}
                  >
                    <Ionicons name="globe-outline" size={18} color={s.portfolio ? colors.accent : colors.gray[400]} />
                    <Text style={[styles.socialText, !s.portfolio && styles.socialTextDisabled]}>Portfolio</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>

            {/* 3. Parent Information Card */}
            <Card style={styles.detailCard}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Parent Information</Text>
                  <Text style={styles.cardSubtitle}>Next of kin & contact details</Text>
                </View>
                {s.parentInfo?.isParentInfoLocked ? (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={12} color={colors.success} />
                    <Text style={styles.lockBadgeText}>Locked</Text>
                  </View>
                ) : (
                  <View style={[styles.lockBadge, { backgroundColor: colors.warningLight }]}>
                    <Ionicons name="lock-open-outline" size={12} color={colors.warning} />
                    <Text style={[styles.lockBadgeText, { color: colors.warning }]}>Editable</Text>
                  </View>
                )}
              </View>
              <Divider style={styles.cardDivider} />
              <View style={styles.parentContainer}>
                {/* Father Info */}
                <View style={styles.parentSection}>
                  <Text style={styles.parentRole}>Father&apos;s Details</Text>
                  <View style={styles.parentRow}>
                    <Ionicons name="person-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.parentValueText} numberOfLines={1} ellipsizeMode="tail">
                      {s.parentInfo?.fatherName || 'Not Set'}
                    </Text>
                  </View>
                  <View style={styles.parentRow}>
                    <Ionicons name="call-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.parentValueText} numberOfLines={1} ellipsizeMode="tail">
                      {s.parentInfo?.fatherPhone || 'Not Set'}
                    </Text>
                  </View>
                  <View style={styles.parentRow}>
                    <Ionicons name="mail-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.parentValueText} numberOfLines={1} ellipsizeMode="tail">
                      {s.parentInfo?.fatherEmail || 'Not Set'}
                    </Text>
                  </View>
                </View>

                <View style={styles.verticalDivider} />

                {/* Mother Info */}
                <View style={styles.parentSection}>
                  <Text style={styles.parentRole}>Mother&apos;s Details</Text>
                  <View style={styles.parentRow}>
                    <Ionicons name="person-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.parentValueText} numberOfLines={1} ellipsizeMode="tail">
                      {s.parentInfo?.motherName || 'Not Set'}
                    </Text>
                  </View>
                  <View style={styles.parentRow}>
                    <Ionicons name="call-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.parentValueText} numberOfLines={1} ellipsizeMode="tail">
                      {s.parentInfo?.motherPhone || 'Not Set'}
                    </Text>
                  </View>
                  <View style={styles.parentRow}>
                    <Ionicons name="mail-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.parentValueText} numberOfLines={1} ellipsizeMode="tail">
                      {s.parentInfo?.motherEmail || 'Not Set'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* 4. Face Verification & Enrollment Card */}
            <Card style={styles.detailCard}>
              <CardHeader
                title="Face Verification"
                subtitle="Biometric identity verification"
                right={<Ionicons name="scan-outline" size={22} color={colors.primary} />}
              />
              <Divider style={styles.cardDivider} />
              
              <View style={styles.biometricContainer}>
                <View style={styles.biometricStatusRow}>
                  <Text style={styles.biometricStatusLabel}>Biometric Status:</Text>
                  {s.faceVerificationStatus === 'complete' ? (
                    <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <Text style={[styles.statusBadgeText, { color: colors.success }]}>Complete</Text>
                    </View>
                  ) : s.faceVerificationStatus === 'partial' ? (
                    <View style={[styles.statusBadge, { backgroundColor: colors.warningLight }]}>
                      <Ionicons name="ellipse" size={10} color={colors.warning} />
                      <Text style={[styles.statusBadgeText, { color: colors.warning }]}>Partial</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: colors.errorLight }]}>
                      <Ionicons name="alert-circle" size={14} color={colors.error} />
                      <Text style={[styles.statusBadgeText, { color: colors.error }]}>Not Enrolled</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.biometricDesc}>
                  Your biometric facial data is used to verify attendance during campus exams and check-ins securely. Click below to enroll/update your face.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.enrollBtn,
                    s.faceVerificationStatus === 'complete' && styles.enrollBtnSecondary,
                  ]}
                  onPress={() => setFaceModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="camera-outline"
                    size={20}
                    color={s.faceVerificationStatus === 'complete' ? colors.primary : '#fff'}
                  />
                  <Text
                    style={[
                      styles.enrollBtnText,
                      s.faceVerificationStatus === 'complete' && styles.enrollBtnTextSecondary,
                    ]}
                  >
                    {s.faceVerificationStatus === 'complete'
                      ? 'Re-enroll Facial Biometrics'
                      : 'Enroll Facial Biometrics'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, shadows.soft]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={22} color="#fff" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Account Section */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={[styles.menuItem, shadows.soft]}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.gray[500] }]}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </View>
            <Text style={styles.menuLabel}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, shadows.soft]}
            onPress={handleLogout}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.error }]}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </View>
            <Text style={styles.menuLabel}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {userType === 'student' && s && (
        <FaceEnrollmentModal
          visible={faceModalVisible}
          onClose={() => setFaceModalVisible(false)}
          studentId={profileId}
          onSuccess={refetch}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { paddingBottom: 20 },
  headerCard: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  badgeRow: { flexDirection: 'row', gap: spacing.xs },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.accent,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsContainer: {
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  cardDivider: {
    marginVertical: spacing.sm,
    backgroundColor: colors.borderLight,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '46%',
    marginBottom: spacing.xs,
  },
  gridLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  cgpaContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cgpaValue: {
    fontSize: 22,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
  },
  cgpaMax: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  contactList: {
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactIcon: {
    width: 24,
  },
  contactLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  contactValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  socialButton: {
    flexDirection: 'row',
    flex: 1,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.background,
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  socialText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  socialTextDisabled: {
    color: colors.textTertiary,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.sm,
    gap: 4,
  },
  lockBadgeText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: typography.weights.bold,
  },
  parentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  parentSection: {
    flex: 1,
    gap: 6,
  },
  parentRole: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  parentValueText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    alignSelf: 'stretch',
  },
  biometricContainer: {
    gap: spacing.sm,
  },
  biometricStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  biometricStatusLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.sm,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  biometricDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  enrollBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  enrollBtnSecondary: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.border,
  },
  enrollBtnText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  enrollBtnTextSecondary: {
    color: colors.primary,
  },
  menuContainer: {
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: radii.md,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  menuLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  divider: { marginVertical: spacing.xs, backgroundColor: colors.border },
});

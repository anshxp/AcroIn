import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Input, Button, ErrorBanner } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/apiClient';
import { buildUserFromAuthResponse } from '../../utils/authIds';
import { isCollegeEmail } from '../../utils/apiError';
import { colors, spacing, radii, typography, shadows } from '../../theme';
import { DEPARTMENTS, DESIGNATIONS } from '../../types';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [userType, setUserType] = useState<'student' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigation = useNavigation<any>();

  // Student form
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll: '',
    email: '',
    password: '',
    department: '',
  });

  // Faculty form
  const [facultyForm, setFacultyForm] = useState({
    firstname: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    phone: '',
  });

  const updateStudentField = (field: string, value: string) =>
    setStudentForm((prev) => ({ ...prev, [field]: value }));
  const updateFacultyField = (field: string, value: string) =>
    setFacultyForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'faculty') {
        throw new Error('Faculty accounts are created by the college admin. Please contact your department to get access.');
      }

      if (userType === 'student') {
        const { name, roll, email, password, department } = studentForm;
        if (!name.trim() || !roll.trim() || !email.trim() || !password.trim() || !department) {
          throw new Error('Please fill in all required fields');
        }
        if (!isCollegeEmail(email)) {
          throw new Error('Please use your college email (@acropolis.in)');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        const response = await authAPI.studentRegister({
          name: name.trim(),
          roll: roll.trim(),
          email: email.trim(),
          password,
          department,
        });

        if (response.success && response.token && response.user) {
          const userData = buildUserFromAuthResponse(response);
          if (!userData) throw new Error(response.message || 'Registration failed');
          await setAuth(response.token, userData);
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            style={styles.hero}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.logoWrap}>
                <MaterialIcons name="school" size={23} color="white" />
                <Text style={styles.logoTitle}>Acro-In</Text>
              </View>
              <View style={styles.mobileBadge}>
                <Ionicons name="rocket" size={12} color="#e2e8f0" />
                <Text style={styles.mobileBadgeText}>Join Now</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Start your journey{'\n'}with Acro-In</Text>
            <Text style={styles.heroDesc}>
              Create your profile, showcase your skills, and connect with opportunities.
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={[styles.formContainer, shadows.card]}>
              <Text style={styles.formTitle}>Create your account</Text>
              <Text style={styles.formSubtitle}>Join the smart academic network today</Text>

              {/* User Type Toggle */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, userType === 'student' && styles.toggleBtnActive]}
                  onPress={() => setUserType('student')}
                >
                  <Ionicons
                    name="school-outline"
                    size={18}
                    color={userType === 'student' ? colors.textInverse : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      userType === 'student' && styles.toggleTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, userType === 'faculty' && styles.toggleBtnActive]}
                  onPress={() => setUserType('faculty')}
                >
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={userType === 'faculty' ? colors.textInverse : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      userType === 'faculty' && styles.toggleTextActive,
                    ]}
                  >
                    Faculty
                  </Text>
                </TouchableOpacity>
              </View>

              {error ? <ErrorBanner message={error} /> : null}

              <View style={styles.form}>
                {userType === 'faculty' ? (
                  <View style={styles.facultyNotice}>
                    <Ionicons name="information-circle-outline" size={22} color={colors.accent} />
                    <Text style={styles.facultyNoticeTitle}>Faculty access is admin-provisioned</Text>
                    <Text style={styles.facultyNoticeText}>
                      Faculty accounts are created by the college administration. If you are faculty, contact your department admin or use the credentials provided to you.
                    </Text>
                    <Button
                      title="Back to Student Sign Up"
                      variant="secondary"
                      onPress={() => setUserType('student')}
                    />
                  </View>
                ) : (
                  <>
                    <Input
                      label="Full Name"
                      icon="person-outline"
                      placeholder="Enter your full name"
                      value={studentForm.name}
                      onChangeText={(t) => updateStudentField('name', t)}
                    />
                    <Input
                      label="Roll Number"
                      icon="id-card-outline"
                      placeholder="Enter your roll number"
                      value={studentForm.roll}
                      onChangeText={(t) => updateStudentField('roll', t)}
                    />
                    <Input
                      label="Email Address"
                      icon="mail-outline"
                      placeholder="Enter your email"
                      value={studentForm.email}
                      onChangeText={(t) => updateStudentField('email', t)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <View>
                      <Text style={styles.chipLabel}>Department</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipRow}
                        contentContainerStyle={styles.chipRowContent}
                      >
                        {DEPARTMENTS.map((dept) => (
                          <Chip
                            key={dept.value}
                            mode={studentForm.department === dept.value ? 'flat' : 'outlined'}
                            onPress={() => updateStudentField('department', dept.value)}
                            style={[
                              styles.chip,
                              studentForm.department === dept.value && styles.chipActive,
                            ]}
                            textStyle={[
                              styles.chipText,
                              studentForm.department === dept.value && styles.chipTextActive,
                            ]}
                          >
                            {dept.value}
                          </Chip>
                        ))}
                      </ScrollView>
                    </View>

                    <Input
                      label="Password"
                      icon="lock-closed-outline"
                      placeholder="Create a password"
                      value={studentForm.password}
                      onChangeText={(t) => updateStudentField('password', t)}
                      secureTextEntry={!showPassword}
                      rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      onRightIconPress={() => setShowPassword(!showPassword)}
                    />
                  </>
                )}

                {userType === 'student' && (
                  <>
                {/* Terms */}
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                    {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                <Button
                  title={isLoading ? 'Creating account...' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                  icon="arrow-forward"
                />
                  </>
                )}
              </View>

              <View style={styles.formFooter}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate('Login')}
                  >
                    Sign in
                  </Text>
                </Text>
              </View>
            </View>

            <Text style={styles.copyText}>
              © 2026 Acro-In · Acropolis Institute of Technology & Research
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  hero: {
    minHeight: height * 0.26,
    paddingHorizontal: spacing.lg,
    paddingTop: 32,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoTitle: { color: 'white', fontSize: 19, fontWeight: typography.weights.bold },
  mobileBadge: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mobileBadgeText: { color: '#e2e8f0', fontSize: 11, fontWeight: typography.weights.bold },
  heroTitle: {
    color: 'white',
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.lg,
    lineHeight: 32,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: spacing.xs,
    lineHeight: 19,
    fontSize: typography.sizes.md,
  },
  formSection: { paddingHorizontal: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.lg },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  formTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  formSubtitle: {
    marginTop: 4,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: radii.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.textInverse,
  },
  form: { gap: 12 },
  facultyNotice: {
    backgroundColor: colors.blue[50],
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  facultyNoticeTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  facultyNoticeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  halfField: { flex: 1 },
  chipLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
    marginBottom: 6,
  },
  chipRow: { maxHeight: 42 },
  chipRowContent: { gap: 8 },
  chip: { backgroundColor: colors.gray[50] },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: 'white' },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: { color: colors.link, fontWeight: typography.weights.semibold },
  formFooter: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  linkText: { color: colors.link, fontWeight: typography.weights.bold },
  copyText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.md,
  },
});

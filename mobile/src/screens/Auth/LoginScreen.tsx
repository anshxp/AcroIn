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
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Input, Button, ErrorBanner } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/apiClient';
import { buildUserFromAuthResponse } from '../../utils/authIds';
import { colors, spacing, radii, typography, shadows } from '../../theme';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      const response = await authAPI.login({ email: email.trim(), password });

      if (response.success && response.token && response.user) {
        const userData = buildUserFromAuthResponse(response);
        if (!userData) {
          throw new Error(response.message || 'Login failed');
        }
        await setAuth(response.token, userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please try again.');
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
                <MaterialIcons name="school" size={24} color="white" />
                <View>
                  <Text style={styles.logoTitle}>Acro-In</Text>
                  <Text style={styles.logoSubtitle}>Acropolis Institute</Text>
                </View>
              </View>
              <View style={styles.mobileBadge}>
                <Ionicons name="phone-portrait" size={12} color="#e2e8f0" />
                <Text style={styles.mobileBadgeText}>Mobile</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Sign in and{'\n'}continue learning</Text>
            <Text style={styles.heroDesc}>
              Fast access to your dashboard, opportunities, and AI recommendations.
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={[styles.formContainer, shadows.card]}>
              <Text style={styles.formTitle}>Welcome back</Text>
              <Text style={styles.formSubtitle}>Use your account credentials</Text>

              {error ? <ErrorBanner message={error} /> : null}

              <View style={styles.form}>
                <Input
                  label="Email"
                  icon="mail-outline"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />

                <Input
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                <View style={styles.formOptions}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text style={styles.checkboxText}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Password Reset', 'Contact your department admin or use the web portal to reset your password.')}>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title={isLoading ? 'Signing in...' : 'Sign In'}
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                  icon="arrow-forward"
                />
              </View>

              <View style={styles.formFooter}>
                <Text style={styles.footerText}>
                  New here?{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate('Register')}
                  >
                    Create account
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
    minHeight: height * 0.33,
    paddingHorizontal: spacing.lg,
    paddingTop: 36,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoTitle: { color: 'white', fontSize: 20, fontWeight: typography.weights.bold },
  logoSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  mobileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  mobileBadgeText: { color: '#e2e8f0', fontSize: 11, fontWeight: typography.weights.bold },
  heroTitle: {
    color: 'white',
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xl,
    lineHeight: 34,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: spacing.xs,
    lineHeight: 20,
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
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  formSubtitle: {
    marginTop: 4,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  form: { gap: 14 },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxText: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  forgotPassword: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.link,
  },
  formFooter: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
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
    paddingHorizontal: spacing.xs,
  },
});

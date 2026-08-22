import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

type BadgeVariant = 'student' | 'faculty' | 'admin' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  student: { bg: colors.badge.student, text: colors.badge.studentText },
  faculty: { bg: colors.badge.faculty, text: colors.badge.facultyText },
  admin: { bg: colors.badge.admin, text: colors.badge.adminText },
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  error: { bg: colors.errorLight, text: colors.error },
  info: { bg: colors.infoLight, text: colors.info },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'info',
  style,
  size = 'md',
}) => {
  const { bg, text } = variantColors[variant];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg },
        size === 'sm' && styles.sm,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          size === 'sm' && styles.textSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  textSm: {
    fontSize: 10,
  },
});

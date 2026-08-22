import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, radii, typography, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && shadows.elevated,
        variant === 'default' && shadows.card,
        variant === 'flat' && styles.flat,
        padding !== 'none' && paddingStyles[padding],
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, right }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

const paddingStyles = StyleSheet.create({
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.xl },
});

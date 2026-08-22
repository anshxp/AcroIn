import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={18}
              color={variantStyles[variant].text.color}
              style={{ marginRight: spacing.xs }}
            />
          )}
          <Text
            style={[
              styles.text,
              variantStyles[variant].text,
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={18}
              color={variantStyles[variant].text.color}
              style={{ marginLeft: spacing.xs }}
            />
          )}
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#94a3b8', '#94a3b8'] : [colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, styles.primaryBase]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        variantStyles[variant].container,
        isDisabled && styles.disabledContainer,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    minHeight: 50,
  },
  primaryBase: {
    borderRadius: radii.md,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  fullWidth: {
    width: '100%',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

const variantStyles = {
  primary: {
    container: {} as ViewStyle,
    text: { color: colors.textInverse } as TextStyle,
  },
  secondary: {
    container: { backgroundColor: colors.blue[100] } as ViewStyle,
    text: { color: colors.primary } as TextStyle,
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    } as ViewStyle,
    text: { color: colors.primary } as TextStyle,
  },
  ghost: {
    container: { backgroundColor: 'transparent' } as ViewStyle,
    text: { color: colors.primary } as TextStyle,
  },
  danger: {
    container: { backgroundColor: colors.error } as ViewStyle,
    text: { color: colors.textInverse } as TextStyle,
  },
};

import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, typography } from '../../theme';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={colors.inputPlaceholder}
            style={styles.leftIcon}
          />
        )}
        <RNTextInput
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={colors.inputPlaceholder}
          autoCorrect={false}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconBtn}>
            <Ionicons name={rightIcon} size={18} color={colors.inputPlaceholder} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.md,
    minHeight: 48,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  leftIcon: {
    marginLeft: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  rightIconBtn: {
    position: 'absolute',
    right: spacing.sm,
    padding: spacing.xxs,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: 2,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Image, type ViewStyle, type ImageStyle } from 'react-native';
import { colors, typography } from '../../theme';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  style?: ViewStyle | ImageStyle;
}

const AVATAR_COLORS = [
  colors.primary,
  colors.accent,
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
];

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 48,
  style,
}) => {
  const initials = getInitials(name || 'U');
  const bgColor = getColor(name || 'User');

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.gray[200],
          } as ImageStyle,
          style as ImageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: colors.textInverse,
          fontSize: size * 0.38,
          fontWeight: typography.weights.bold,
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

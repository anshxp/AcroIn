import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button } from '../../components/ui';
import { useCreatePost } from '../../hooks/useApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography } from '../../theme';

export default function CreatePostScreen({ navigation }: any) {
  const createPost = useCreatePost();
  const [content, setContent] = useState('');
  const [scope, setScope] = useState<'campus' | 'department'>('campus');

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Required', 'Post content cannot be empty');
      return;
    }
    try {
      await createPost.mutateAsync({ content: content.trim(), scope });
      Alert.alert('Success', 'Post published');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Failed to create post'));
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Create Post</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Audience</Text>
        <View style={s.scopeRow}>
          {(['campus', 'department'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              style={[s.scopeChip, scope === value && s.scopeChipActive]}
              onPress={() => setScope(value)}
            >
              <Text style={[s.scopeText, scope === value && s.scopeTextActive]}>
                {value === 'campus' ? 'Campus-wide' : 'Department'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Announcement"
          placeholder="Write your announcement..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={8}
          style={{ minHeight: 160, textAlignVertical: 'top' }}
        />

        <Button
          title={createPost.isPending ? 'Publishing...' : 'Publish Post'}
          onPress={handleSubmit}
          loading={createPost.isPending}
          icon="send"
        />
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
  content: { padding: spacing.md, gap: spacing.md },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.gray[700] },
  scopeRow: { flexDirection: 'row', gap: spacing.sm },
  scopeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.gray[100],
  },
  scopeChipActive: { backgroundColor: colors.accent },
  scopeText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  scopeTextActive: { color: colors.textInverse, fontWeight: typography.weights.bold },
});

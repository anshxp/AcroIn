import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '../../components/ui';
import { getApiErrorMessage } from '../../utils/apiError';
import { colors, spacing, radii, typography } from '../../theme';
import { createPostWithAttachments, type PostUploadAsset } from '../../services/postUpload';

const MAX_FILES = 4;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

const formatSize = (bytes?: number | null) => {
  if (!bytes) return 'Size unavailable';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const attachmentKind = (type: string) => {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'pdf';
};

export default function CreatePostScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [scope, setScope] = useState<'campus' | 'department'>('campus');
  const [attachments, setAttachments] = useState<PostUploadAsset[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);

  const hasContent = content.trim().length > 0;
  const canPublish = hasContent || attachments.length > 0;
  const remainingSlots = MAX_FILES - attachments.length;

  const attachmentLabels = useMemo(() => attachments.map((file) => attachmentKind(file.type)), [attachments]);

  const addFiles = (incoming: PostUploadAsset[]) => {
    const valid: PostUploadAsset[] = [];
    const rejected: string[] = [];

    incoming.forEach((file) => {
      if (file.size && file.size > MAX_FILE_BYTES) rejected.push(`${file.name} is larger than 25 MB`);
      else valid.push(file);
    });

    const available = Math.max(0, MAX_FILES - attachments.length);
    const next = valid.slice(0, available);
    setAttachments((current) => [...current, ...next]);

    if (rejected.length || valid.length > available) {
      const extra = valid.length > available ? ` You can attach up to ${MAX_FILES} files.` : '';
      Alert.alert('Attachment limit', `${rejected.join('\n')}${extra}`.trim());
    }
  };

  const pickMedia = async () => {
    if (remainingSlots <= 0) {
      Alert.alert('Attachment limit', `You can attach up to ${MAX_FILES} files.`);
      return;
    }

    setPickerBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow photo and video access to attach media to an announcement.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.9,
      });

      if (result.canceled) return;
      addFiles(result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `attachment-${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
        type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        size: asset.fileSize,
      })));
    } catch (error) {
      Alert.alert('Media picker error', getApiErrorMessage(error, 'Unable to select media.'));
    } finally {
      setPickerBusy(false);
    }
  };

  const pickPdf = async () => {
    if (remainingSlots <= 0) {
      Alert.alert('Attachment limit', `You can attach up to ${MAX_FILES} files.`);
      return;
    }

    setPickerBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      addFiles(result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf',
        size: asset.size,
      })));
    } catch (error) {
      Alert.alert('Document picker error', getApiErrorMessage(error, 'Unable to select the PDF.'));
    } finally {
      setPickerBusy(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async () => {
    if (!canPublish || isPublishing) return;
    setIsPublishing(true);
    try {
      await createPostWithAttachments({ content, scope, files: attachments });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      setContent('');
      setAttachments([]);
      Alert.alert('Published', 'Your announcement is now available from the backend feed.', [{ text: 'Done', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Publish failed', getApiErrorMessage(error, 'The announcement could not be uploaded. Please try again.'));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconButton} accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>New announcement</Text>
          <Text style={s.headerSubtitle}>Faculty & Department Admin</Text>
        </View>
        <View style={s.headerStatus}><View style={s.statusDot} /></View>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTitle}>Who should see this?</Text>
              <Text style={s.sectionSubtitle}>Choose the audience before publishing.</Text>
            </View>
            <Ionicons name="people-outline" size={20} color={colors.accent} />
          </View>

          <View style={s.audienceRow}>
            <TouchableOpacity style={[s.audienceCard, scope === 'campus' && s.audienceCardActive]} onPress={() => setScope('campus')} activeOpacity={0.85}>
              <View style={[s.audienceIcon, scope === 'campus' && s.audienceIconActive]}><Ionicons name="globe-outline" size={19} color={scope === 'campus' ? colors.textInverse : colors.accent} /></View>
              <View style={s.audienceCopy}><Text style={s.audienceTitle}>Campus wide</Text><Text style={s.audienceText}>All eligible students & faculty</Text></View>
              {scope === 'campus' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
            </TouchableOpacity>
            <TouchableOpacity style={[s.audienceCard, scope === 'department' && s.audienceCardActive]} onPress={() => setScope('department')} activeOpacity={0.85}>
              <View style={[s.audienceIcon, scope === 'department' && s.audienceIconActive]}><Ionicons name="business-outline" size={19} color={scope === 'department' ? colors.textInverse : colors.accent} /></View>
              <View style={s.audienceCopy}><Text style={s.audienceTitle}>Department</Text><Text style={s.audienceText}>Your department audience</Text></View>
              {scope === 'department' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.sectionCard}>
          <Input
            label="Announcement"
            placeholder="Share an important update, event, achievement, deadline, or resource..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            style={s.textArea}
          />
          <View style={s.composerMeta}>
            <Text style={s.helperText}>{content.length}/2,000 characters</Text>
            <Text style={s.helperText}>{scope === 'campus' ? 'Campus feed' : 'Department feed'}</Text>
          </View>
        </View>

        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <View><Text style={s.sectionTitle}>Attachments</Text><Text style={s.sectionSubtitle}>{attachments.length}/{MAX_FILES} files · 25 MB each</Text></View>
            <Ionicons name="attach-outline" size={20} color={colors.accent} />
          </View>

          {attachments.length > 0 && (
            <View style={s.attachmentList}>
              {attachments.map((file, index) => {
                const kind = attachmentLabels[index];
                return (
                  <View key={`${file.uri}-${index}`} style={s.attachmentRow}>
                    {kind === 'image' ? <Image source={{ uri: file.uri }} style={s.thumbnail} /> : <View style={[s.fileIcon, kind === 'pdf' ? s.pdfIcon : s.videoIcon]}><Ionicons name={kind === 'pdf' ? 'document-text-outline' : 'videocam-outline'} size={20} color={colors.textInverse} /></View>}
                    <View style={s.fileCopy}><Text style={s.fileName} numberOfLines={1}>{file.name}</Text><Text style={s.fileMeta}>{kind.toUpperCase()} · {formatSize(file.size)}</Text></View>
                    <TouchableOpacity onPress={() => removeAttachment(index)} style={s.removeButton} accessibilityLabel={`Remove ${file.name}`}><Ionicons name="close-circle" size={21} color={colors.gray[500]} /></TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <View style={s.pickerActions}>
            <TouchableOpacity style={s.pickerButton} onPress={pickMedia} disabled={pickerBusy || remainingSlots <= 0} activeOpacity={0.8}>
              <Ionicons name="images-outline" size={20} color={colors.accent} /><Text style={s.pickerButtonText}>Photo / video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.pickerButton} onPress={pickPdf} disabled={pickerBusy || remainingSlots <= 0} activeOpacity={0.8}>
              <Ionicons name="document-attach-outline" size={20} color={colors.accent} /><Text style={s.pickerButtonText}>PDF document</Text>
            </TouchableOpacity>
          </View>
          {pickerBusy && <View style={s.pickerLoading}><ActivityIndicator size="small" color={colors.accent} /><Text style={s.helperText}>Preparing attachment…</Text></View>}
          <Text style={s.uploadNote}>Files are uploaded to the AcroIn backend before the post is published. Other devices receive the stored media URL from the feed.</Text>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <View style={s.footerCopy}><View style={s.secureDot} /><Text style={s.footerText}>Backend upload enabled</Text></View>
        <TouchableOpacity style={[s.publishButton, (!canPublish || isPublishing) && s.publishButtonDisabled]} onPress={handleSubmit} disabled={!canPublish || isPublishing} activeOpacity={0.85}>
          {isPublishing ? <ActivityIndicator size="small" color={colors.textInverse} /> : <Ionicons name="send" size={17} color={colors.textInverse} />}
          <Text style={s.publishText}>{isPublishing ? 'Publishing…' : 'Publish'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 68, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gray[200], backgroundColor: colors.background },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[100] },
  headerCenter: { flex: 1, paddingHorizontal: spacing.sm },
  headerTitle: { color: colors.textPrimary, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  headerSubtitle: { marginTop: 2, color: colors.textSecondary, fontSize: typography.sizes.xs },
  headerStatus: { width: 40, alignItems: 'flex-end' },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  sectionCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.gray[200] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  sectionSubtitle: { marginTop: 3, color: colors.textSecondary, fontSize: typography.sizes.xs },
  audienceRow: { gap: spacing.sm },
  audienceCard: { minHeight: 70, borderWidth: 1, borderColor: colors.gray[200], borderRadius: radii.md, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.background },
  audienceCardActive: { borderColor: colors.accent, backgroundColor: colors.gray[50] },
  audienceIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[100] },
  audienceIconActive: { backgroundColor: colors.accent },
  audienceCopy: { flex: 1 },
  audienceTitle: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  audienceText: { color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: 2 },
  textArea: { minHeight: 165, textAlignVertical: 'top' },
  composerMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  helperText: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  attachmentList: { gap: spacing.xs, marginBottom: spacing.sm },
  attachmentRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.xs, borderRadius: radii.md, backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200] },
  thumbnail: { width: 48, height: 48, borderRadius: radii.sm, backgroundColor: colors.gray[200] },
  fileIcon: { width: 48, height: 48, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  pdfIcon: { backgroundColor: colors.error },
  videoIcon: { backgroundColor: colors.accent },
  fileCopy: { flex: 1, paddingHorizontal: spacing.sm },
  fileName: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  fileMeta: { color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: 2 },
  removeButton: { padding: spacing.xs },
  pickerActions: { flexDirection: 'row', gap: spacing.sm },
  pickerButton: { flex: 1, minHeight: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.gray[300], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.background },
  pickerButtonText: { color: colors.textPrimary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  pickerLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  uploadNote: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.xs, lineHeight: 17 },
  footer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray[200], backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footerCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  secureDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  footerText: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  publishButton: { minWidth: 112, minHeight: 46, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  publishButtonDisabled: { opacity: 0.45 },
  publishText: { color: colors.textInverse, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold },
});

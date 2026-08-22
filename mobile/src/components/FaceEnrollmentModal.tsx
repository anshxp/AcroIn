import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radii, typography, shadows } from '../theme';
import { studentAPI } from '../services/apiClient';

interface FaceEnrollmentModalProps {
  visible: boolean;
  onClose: () => void;
  studentId: string;
  onSuccess: () => void;
}

type Angle = 'front' | 'left' | 'right';

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

export default function FaceEnrollmentModal({
  visible,
  onClose,
  studentId,
  onSuccess,
}: FaceEnrollmentModalProps) {
  const [images, setImages] = useState<Record<Angle, SelectedImage | null>>({
    front: null,
    left: null,
    right: null,
  });
  const [currentStep, setCurrentStep] = useState<Angle>('front');
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async (angle: Angle, useCamera: boolean) => {
    try {
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          `AcroIn needs access to your ${useCamera ? 'camera' : 'gallery'} to capture face verification details.`
        );
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.95,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const uriParts = uri.split('/');
        const filename = uriParts[uriParts.length - 1] || `${angle}_face.jpg`;
        const fileType = asset.mimeType || 'image/jpeg';

        setImages((prev) => ({
          ...prev,
          [angle]: {
            uri,
            name: filename,
            type: fileType,
          },
        }));
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to capture/select image.');
    }
  };

  const handleUpload = async () => {
    if (!images.front || !images.left || !images.right) {
      Alert.alert('Error', 'Please capture all three angles (Front, Left, and Right) before enrolling.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();

      // In React Native, the file object in FormData has uri, name, and type properties
      formData.append('front', {
        uri: images.front.uri,
        name: images.front.name,
        type: images.front.type,
      } as any);

      formData.append('left', {
        uri: images.left.uri,
        name: images.left.name,
        type: images.left.type,
      } as any);

      formData.append('right', {
        uri: images.right.uri,
        name: images.right.name,
        type: images.right.type,
      } as any);

      const response = await studentAPI.enrollFace(studentId, formData);
      if (response.success) {
        Alert.alert('Success', response.message || 'Face details enrolled successfully!');
        onSuccess();
        handleClose();
      } else {
        Alert.alert('Verification Failed', response.message || 'Face service rejected the images.');
      }
    } catch (err: any) {
      Alert.alert(
        'Upload Error',
        err?.response?.data?.message || err?.message || 'Face service rejection. Please ensure clear images and try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setImages({ front: null, left: null, right: null });
    setCurrentStep('front');
    onClose();
  };

  const renderStepButton = (step: Angle, label: string, icon: string) => {
    const isActive = currentStep === step;
    const isCompleted = !!images[step];

    return (
      <TouchableOpacity
        style={[
          s.stepTab,
          isActive && s.stepTabActive,
          isCompleted && s.stepTabCompleted,
        ]}
        onPress={() => setCurrentStep(step)}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={
            isActive
              ? colors.accent
              : isCompleted
              ? colors.success
              : colors.textTertiary
          }
        />
        <Text
          style={[
            s.stepTabText,
            isActive && s.stepTabActiveText,
            isCompleted && s.stepTabCompletedText,
          ]}
        >
          {label}
        </Text>
        {isCompleted && (
          <Ionicons
            name="checkmark-circle"
            size={12}
            color={colors.success}
            style={s.checkMark}
          />
        )}
      </TouchableOpacity>
    );
  };

  const getStepGuideText = (step: Angle) => {
    switch (step) {
      case 'front':
        return {
          title: 'Front Portrait Photo',
          guide: 'Look directly into the camera. Ensure your face is fully lit, clearly visible, and without hats or sunglasses.',
        };
      case 'left':
        return {
          title: 'Left Profile Photo',
          guide: 'Turn your face slightly to the left (profile view). Ensure your left ear and profile details are clearly visible.',
        };
      case 'right':
        return {
          title: 'Right Profile Photo',
          guide: 'Turn your face slightly to the right (profile view). Ensure your right ear and profile details are clearly visible.',
        };
    }
  };

  const activeGuide = getStepGuideText(currentStep);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>Face Verification</Text>
              <Text style={s.headerSubtitle}>Enroll your biometric facial data</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn} disabled={isUploading}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Divider style={s.divider} />

          {/* Steps Horizontal Navigation */}
          <View style={s.stepsRow}>
            {renderStepButton('front', 'Front', 'person')}
            {renderStepButton('left', 'Left Profile', 'arrow-back')}
            {renderStepButton('right', 'Right Profile', 'arrow-forward')}
          </View>

          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Guide Card */}
            <View style={s.guideCard}>
              <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={s.guideTitle}>{activeGuide.title}</Text>
                <Text style={s.guideDesc}>{activeGuide.guide}</Text>
              </View>
            </View>

            {/* Photo Capture Preview Box */}
            <View style={s.previewContainer}>
              {images[currentStep] ? (
                <View style={s.imageWrapper}>
                  <Image source={{ uri: images[currentStep]!.uri }} style={s.previewImage} />
                  <TouchableOpacity
                    style={s.removeBtn}
                    onPress={() => setImages((prev) => ({ ...prev, [currentStep]: null }))}
                    disabled={isUploading}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.emptyPreview}>
                  <Ionicons name="camera-outline" size={48} color={colors.textTertiary} />
                  <Text style={s.emptyPreviewText}>No image captured yet</Text>
                </View>
              )}
            </View>

            {/* Capture Buttons */}
            {!images[currentStep] && (
              <View style={s.buttonsRow}>
                <TouchableOpacity
                  style={[s.captureBtn, s.galleryBtn]}
                  onPress={() => handlePickImage(currentStep, false)}
                  disabled={isUploading}
                >
                  <Ionicons name="images-outline" size={18} color={colors.accent} />
                  <Text style={s.galleryBtnText}>Choose from Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.captureBtn, s.cameraBtn]}
                  onPress={() => handlePickImage(currentStep, true)}
                  disabled={isUploading}
                >
                  <Ionicons name="camera" size={18} color="#fff" />
                  <Text style={s.cameraBtnText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Overall Progress Indicator & Save */}
            <View style={s.submitContainer}>
              <Divider style={[s.divider, { marginBottom: spacing.md }]} />

              <View style={s.statusRow}>
                <Text style={s.statusLabel}>Angles Captured:</Text>
                <Text style={s.statusText}>
                  {Object.values(images).filter(Boolean).length} / 3
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  s.enrollBtn,
                  (!images.front || !images.left || !images.right) && s.enrollBtnDisabled,
                ]}
                onPress={handleUpload}
                disabled={isUploading || !images.front || !images.left || !images.right}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    <Text style={s.enrollBtnText}>Enroll Face Embeddings</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    backgroundColor: colors.border,
  },
  stepsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    gap: spacing.xxs,
  },
  stepTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.gray[50],
    gap: 4,
    position: 'relative',
  },
  stepTabActive: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.accent,
  },
  stepTabCompleted: {
    backgroundColor: colors.blue[50] + '33', // faint success
  },
  stepTabText: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  stepTabActiveText: {
    color: colors.accent,
  },
  stepTabCompletedText: {
    color: colors.success,
  },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  guideCard: {
    flexDirection: 'row',
    backgroundColor: colors.blue[50],
    padding: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  guideTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  guideDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  previewContainer: {
    height: 240,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPreview: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyPreviewText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  captureBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  galleryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  galleryBtnText: {
    color: colors.accent,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  cameraBtn: {
    backgroundColor: colors.accent,
  },
  cameraBtnText: {
    color: '#fff',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  submitContainer: {
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  statusLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  statusText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  enrollBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.elevated,
  },
  enrollBtnDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  enrollBtnText: {
    color: '#fff',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
});

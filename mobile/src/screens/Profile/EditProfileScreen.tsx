import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, LoadingSpinner, Avatar } from '../../components/ui';
import * as ImagePicker from 'expo-image-picker';
import { studentAPI, facultyAPI } from '../../services/apiClient';
import { getApiErrorMessage } from '../../utils/apiError';
import { useAuthStore } from '../../stores/authStore';
import {
  useStudentProfile,
  useFacultyProfile,
  useUpdateStudentProfile,
  useUpdateFacultyProfile,
} from '../../hooks/useApi';
import { getProfileId } from '../../utils/authIds';
import { colors, spacing, radii, typography, shadows } from '../../theme';

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuthStore();
  const userType = user?.userType || 'student';
  const profileId = getProfileId(user);

  const studentQuery = useStudentProfile(userType === 'student' ? profileId : undefined);
  const facultyQuery = useFacultyProfile(userType === 'faculty');
  const updateStudentMut = useUpdateStudentProfile();
  const updateFacultyMut = useUpdateFacultyProfile();

  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    birthday: '',
    address: '',
    bio: '',
    linkedin: '',
    github: '',
    portfolio: '',
    location: '',
    year: '',
    semester: '',
    roll: '',
    department: '',
    parentInfo: {
      fatherName: '',
      fatherPhone: '',
      fatherEmail: '',
      motherName: '',
      motherPhone: '',
      motherEmail: '',
      isParentInfoLocked: false,
    },
  });

  const [facultyForm, setFacultyForm] = useState({
    firstname: '',
    lastName: '',
    phone: '',
    linkedin: '',
    qualification: '',
    dob: '',
    subjects: '',
    skills: '',
    techstacks: '',
  });

  // Modal selector states
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorType, setSelectorType] = useState<'year' | 'semester' | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | undefined>();

  const handlePickProfileImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Allow photo library access to upload a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('profileImage', {
        uri: asset.uri,
        name: 'profile.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as any);

      if (userType === 'student') {
        const res = await studentAPI.uploadProfileImage(profileId, formData);
        setProfileImageUri(res.profile_image);
      } else {
        const res = await facultyAPI.uploadProfileImage(formData);
        setProfileImageUri(res.profilepic);
      }
      Alert.alert('Success', 'Profile photo updated');
      if (userType === 'student') studentQuery.refetch();
      else facultyQuery.refetch();
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (userType === 'student' && studentQuery.data) {
      const p = studentQuery.data;
      setStudentForm({
        name: p.name || '',
        phone: p.phone || '',
        birthday: p.birthday || '',
        address: p.address || '',
        bio: p.bio || '',
        linkedin: p.linkedin || '',
        github: p.github || '',
        portfolio: p.portfolio || '',
        location: p.location || '',
        year: p.year || '',
        semester: p.semester || '',
        roll: p.roll || '',
        department: p.department || '',
        parentInfo: {
          fatherName: p.parentInfo?.fatherName || '',
          fatherPhone: p.parentInfo?.fatherPhone || '',
          fatherEmail: p.parentInfo?.fatherEmail || '',
          motherName: p.parentInfo?.motherName || '',
          motherPhone: p.parentInfo?.motherPhone || '',
          motherEmail: p.parentInfo?.motherEmail || '',
          isParentInfoLocked: !!p.parentInfo?.isParentInfoLocked,
        },
      });
    }
  }, [studentQuery.data]);

  useEffect(() => {
    if (userType !== 'student' && facultyQuery.data) {
      const p = facultyQuery.data;
      setFacultyForm({
        firstname: p.firstname || '',
        lastName: p.lastName || '',
        phone: p.phone || '',
        linkedin: p.linkedin || '',
        qualification: p.qualification || '',
        dob: p.dob || '',
        subjects: p.subjects?.join(', ') || '',
        skills: p.skills?.join(', ') || '',
        techstacks: p.techstacks?.join(', ') || '',
      });
    }
  }, [facultyQuery.data]);

  const handleSave = async () => {
    try {
      if (userType === 'student') {
        if (!studentForm.birthday) {
          Alert.alert('Required Field', 'Please add your birthday before saving your profile.');
          return;
        }
        if (!studentForm.address.trim()) {
          Alert.alert('Required Field', 'Please add your address before saving your profile.');
          return;
        }

        const payload: Record<string, unknown> = { ...studentForm };
        if (studentForm.parentInfo.isParentInfoLocked) {
          delete payload.parentInfo;
        } else {
          const { isParentInfoLocked, ...parentFields } = studentForm.parentInfo;
          payload.parentInfo = parentFields;
        }

        await updateStudentMut.mutateAsync({ id: profileId, data: payload as any });
        Alert.alert('Success', 'Profile updated!');
      } else {
        const data = {
          ...facultyForm,
          subjects: facultyForm.subjects.split(',').map((s) => s.trim()).filter(Boolean),
          skills: facultyForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
          techstacks: facultyForm.techstacks.split(',').map((s) => s.trim()).filter(Boolean),
        };
        await updateFacultyMut.mutateAsync(data as any);
        await setUser({ ...user!, name: `${facultyForm.firstname} ${facultyForm.lastName}` });
        Alert.alert('Success', 'Profile updated!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to update');
    }
  };

  const openSelector = (type: 'year' | 'semester') => {
    setSelectorType(type);
    setSelectorVisible(true);
  };

  const handleSelectOption = (option: string) => {
    if (selectorType === 'year') {
      setStudentForm((prev) => ({ ...prev, year: option }));
    } else if (selectorType === 'semester') {
      setStudentForm((prev) => ({ ...prev, semester: option }));
    }
    setSelectorVisible(false);
    setSelectorType(null);
  };

  const isLoading = userType === 'student' ? studentQuery.isLoading : facultyQuery.isLoading;
  const isSaving = updateStudentMut.isPending || updateFacultyMut.isPending;

  if (isLoading) return <LoadingSpinner fullScreen message="Loading profile..." />;

  const isParentLocked = studentForm.parentInfo.isParentInfoLocked;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.photoRow}>
          <Avatar
            name={userType === 'student' ? studentForm.name : `${facultyForm.firstname} ${facultyForm.lastName}`}
            imageUrl={
              profileImageUri ||
              (userType === 'student' ? studentQuery.data?.profile_image : facultyQuery.data?.profilepic)
            }
            size={72}
          />
          <Button
            title={uploadingImage ? 'Uploading...' : 'Change Photo'}
            onPress={handlePickProfileImage}
            loading={uploadingImage}
            variant="secondary"
            fullWidth={false}
            style={{ flex: 1 }}
          />
        </View>

        {userType === 'student' ? (
          <>
            {/* Personal Information */}
            <Text style={s.sectionTitle}>Personal Information</Text>
            <Input
              label="Full Name"
              icon="person-outline"
              value={studentForm.name}
              onChangeText={(t) => setStudentForm({ ...studentForm, name: t })}
            />
            <Input
              label="Phone"
              icon="call-outline"
              value={studentForm.phone}
              onChangeText={(t) => setStudentForm({ ...studentForm, phone: t })}
              keyboardType="phone-pad"
            />
            <Input
              label="Birthday"
              icon="calendar-outline"
              placeholder="YYYY-MM-DD"
              value={studentForm.birthday}
              onChangeText={(t) => setStudentForm({ ...studentForm, birthday: t })}
            />
            <Input
              label="Location"
              icon="location-outline"
              value={studentForm.location}
              onChangeText={(t) => setStudentForm({ ...studentForm, location: t })}
            />
            <Input
              label="Address"
              icon="home-outline"
              value={studentForm.address}
              onChangeText={(t) => setStudentForm({ ...studentForm, address: t })}
            />

            {/* Academic Information */}
            <Text style={s.sectionTitle}>Academic Details</Text>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Roll Number"
                  icon="barcode-outline"
                  value={studentForm.roll}
                  onChangeText={(t) => setStudentForm({ ...studentForm, roll: t })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Department"
                  icon="school-outline"
                  value={studentForm.department}
                  onChangeText={(t) => setStudentForm({ ...studentForm, department: t })}
                />
              </View>
            </View>

            <View style={s.row}>
              <TouchableOpacity
                style={[s.dropdownTrigger, { flex: 1 }]}
                onPress={() => openSelector('year')}
              >
                <Text style={s.dropdownLabel}>Year</Text>
                <View style={s.dropdownBox}>
                  <Text style={[s.dropdownText, !studentForm.year && s.dropdownPlaceholder]}>
                    {studentForm.year || 'Select Year'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.dropdownTrigger, { flex: 1 }]}
                onPress={() => openSelector('semester')}
              >
                <Text style={s.dropdownLabel}>Semester</Text>
                <View style={s.dropdownBox}>
                  <Text style={[s.dropdownText, !studentForm.semester && s.dropdownPlaceholder]}>
                    {studentForm.semester || 'Select Sem'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Parent Information Section */}
            <View style={s.parentHeaderRow}>
              <Text style={s.sectionTitle}>Parent Information</Text>
              {isParentLocked && (
                <View style={s.lockBadge}>
                  <Ionicons name="lock-closed" size={12} color={colors.success} />
                  <Text style={s.lockBadgeText}>Locked</Text>
                </View>
              )}
            </View>

            {isParentLocked ? (
              <View style={s.lockedNotice}>
                <Ionicons name="shield-checkmark" size={18} color={colors.success} />
                <Text style={s.lockedNoticeText}>
                  Parent details are locked after initial submission. Contact admin to modify.
                </Text>
              </View>
            ) : (
              <View style={s.unlockedNotice}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
                <Text style={s.unlockedNoticeText}>
                  Fields lock automatically once Father&apos;s Name and Phone are submitted.
                </Text>
              </View>
            )}

            <Input
              label="Father's Name"
              icon="person-outline"
              value={studentForm.parentInfo.fatherName}
              editable={!isParentLocked}
              containerStyle={isParentLocked ? s.disabledInput : undefined}
              onChangeText={(t) =>
                setStudentForm({
                  ...studentForm,
                  parentInfo: { ...studentForm.parentInfo, fatherName: t },
                })
              }
            />

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Father's Phone"
                  icon="call-outline"
                  value={studentForm.parentInfo.fatherPhone}
                  editable={!isParentLocked}
                  keyboardType="phone-pad"
                  containerStyle={isParentLocked ? s.disabledInput : undefined}
                  onChangeText={(t) =>
                    setStudentForm({
                      ...studentForm,
                      parentInfo: { ...studentForm.parentInfo, fatherPhone: t },
                    })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Father's Email"
                  icon="mail-outline"
                  value={studentForm.parentInfo.fatherEmail}
                  editable={!isParentLocked}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={isParentLocked ? s.disabledInput : undefined}
                  onChangeText={(t) =>
                    setStudentForm({
                      ...studentForm,
                      parentInfo: { ...studentForm.parentInfo, fatherEmail: t },
                    })
                  }
                />
              </View>
            </View>

            <Input
              label="Mother's Name"
              icon="person-outline"
              value={studentForm.parentInfo.motherName}
              editable={!isParentLocked}
              containerStyle={isParentLocked ? s.disabledInput : undefined}
              onChangeText={(t) =>
                setStudentForm({
                  ...studentForm,
                  parentInfo: { ...studentForm.parentInfo, motherName: t },
                })
              }
            />

            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Mother's Phone"
                  icon="call-outline"
                  value={studentForm.parentInfo.motherPhone}
                  editable={!isParentLocked}
                  keyboardType="phone-pad"
                  containerStyle={isParentLocked ? s.disabledInput : undefined}
                  onChangeText={(t) =>
                    setStudentForm({
                      ...studentForm,
                      parentInfo: { ...studentForm.parentInfo, motherPhone: t },
                    })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Mother's Email"
                  icon="mail-outline"
                  value={studentForm.parentInfo.motherEmail}
                  editable={!isParentLocked}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={isParentLocked ? s.disabledInput : undefined}
                  onChangeText={(t) =>
                    setStudentForm({
                      ...studentForm,
                      parentInfo: { ...studentForm.parentInfo, motherEmail: t },
                    })
                  }
                />
              </View>
            </View>

            {/* About */}
            <Text style={s.sectionTitle}>About</Text>
            <Input
              label="Bio"
              placeholder="Tell others about yourself"
              value={studentForm.bio}
              onChangeText={(t) => setStudentForm({ ...studentForm, bio: t })}
              multiline
              numberOfLines={4}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            {/* Social Links */}
            <Text style={s.sectionTitle}>Social Links</Text>
            <Input
              label="LinkedIn URL"
              icon="logo-linkedin"
              value={studentForm.linkedin}
              onChangeText={(t) => setStudentForm({ ...studentForm, linkedin: t })}
              autoCapitalize="none"
            />
            <Input
              label="GitHub URL"
              icon="logo-github"
              value={studentForm.github}
              onChangeText={(t) => setStudentForm({ ...studentForm, github: t })}
              autoCapitalize="none"
            />
            <Input
              label="Portfolio URL"
              icon="globe-outline"
              value={studentForm.portfolio}
              onChangeText={(t) => setStudentForm({ ...studentForm, portfolio: t })}
              autoCapitalize="none"
            />
          </>
        ) : (
          <>
            {/* Faculty Form */}
            <Text style={s.sectionTitle}>Personal Information</Text>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="First Name"
                  value={facultyForm.firstname}
                  onChangeText={(t) => setFacultyForm({ ...facultyForm, firstname: t })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Last Name"
                  value={facultyForm.lastName}
                  onChangeText={(t) => setFacultyForm({ ...facultyForm, lastName: t })}
                />
              </View>
            </View>
            <Input
              label="Phone"
              icon="call-outline"
              value={facultyForm.phone}
              onChangeText={(t) => setFacultyForm({ ...facultyForm, phone: t })}
              keyboardType="phone-pad"
            />
            <Input
              label="Date of Birth"
              icon="calendar-outline"
              placeholder="YYYY-MM-DD"
              value={facultyForm.dob}
              onChangeText={(t) => setFacultyForm({ ...facultyForm, dob: t })}
            />
            <Input
              label="LinkedIn"
              icon="logo-linkedin"
              value={facultyForm.linkedin}
              onChangeText={(t) => setFacultyForm({ ...facultyForm, linkedin: t })}
              autoCapitalize="none"
            />

            <Text style={s.sectionTitle}>Professional</Text>
            <Input
              label="Qualification"
              value={facultyForm.qualification}
              onChangeText={(t) => setFacultyForm({ ...facultyForm, qualification: t })}
            />
            <Input
              label="Subjects (comma-separated)"
              value={facultyForm.subjects}
              onChangeText={(t) => setFacultyForm({ ...facultyForm, subjects: t })}
            />
            <Input
              label="Skills (comma-separated)"
              value={facultyForm.skills}
              onChangeText={(t) => setFacultyForm({ ...facultyForm, skills: t })}
            />
            <Input
              label="Tech Stacks (comma-separated)"
              value={facultyForm.techstacks}
              onChangeText={(t) => setFacultyForm({ ...facultyForm, techstacks: t })}
            />
          </>
        )}

        <View style={{ marginTop: spacing.md }}>
          <Button title="Save Changes" onPress={handleSave} loading={isSaving} icon="checkmark" />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Picker Modal */}
      <Modal visible={selectorVisible} animationType="fade" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.pickerContainer}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>
                Select {selectorType === 'year' ? 'Year' : 'Semester'}
              </Text>
              <TouchableOpacity onPress={() => setSelectorVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Divider />
            <FlatList
              data={selectorType === 'year' ? YEAR_OPTIONS : SEMESTER_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.pickerItem}
                  onPress={() => handleSelectOption(item)}
                >
                  <Text style={s.pickerItemText}>{item}</Text>
                  {(selectorType === 'year' ? studentForm.year : studentForm.semester) ===
                    item && <Ionicons name="checkmark" size={20} color={colors.accent} />}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: spacing.xs }}
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  content: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingTop: spacing.xs },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxs,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  disabledInput: { opacity: 0.65 },
  parentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.sm,
    gap: 4,
  },
  lockBadgeText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: typography.weights.bold,
  },
  lockedNotice: {
    flexDirection: 'row',
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  lockedNoticeText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.success,
    lineHeight: 16,
  },
  unlockedNotice: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  unlockedNoticeText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.warning,
    lineHeight: 16,
  },
  dropdownTrigger: {
    gap: 6,
  },
  dropdownLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.md,
    height: 48,
    paddingHorizontal: spacing.sm,
  },
  dropdownText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: colors.inputPlaceholder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    maxHeight: '60%',
    ...shadows.elevated,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  pickerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pickerItemText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
});

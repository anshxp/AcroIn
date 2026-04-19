import React, { useContext, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Text, TextInput } from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";
import { facultyAPI } from "../../services/api";

const emptyProfile = {
  firstname: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  qualification: "",
  experience: "",
  dob: "",
  linkedin: "",
  subjects: "",
  headof: "",
  techstacks: "",
};

const listToString = (value) => (Array.isArray(value) ? value.join(", ") : "");
const stringToList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProfileScreen() {
  const { token, user, setUser, signOut } = useContext(AuthContext);
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fullName = useMemo(() => {
    const composed = `${profile.firstname} ${profile.lastName}`.trim();
    return composed || user?.name || "Faculty Member";
  }, [profile.firstname, profile.lastName, user?.name]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token || user?.userType !== "faculty") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await facultyAPI.getProfile(token);
        const next = {
          firstname: data.firstname || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          department: data.department || "",
          designation: data.designation || "",
          qualification: data.qualification || "",
          experience: String(typeof data.experience === "number" ? data.experience : ""),
          dob: data.dob || "",
          linkedin: data.linkedin || "",
          subjects: listToString(data.subjects),
          headof: listToString(data.headof),
          techstacks: listToString(data.techstacks),
        };

        setProfile(next);
        setDraft(next);
      } catch (err) {
        setError(err?.message || "Unable to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token, user?.userType]);

  const startEdit = () => {
    setMessage("");
    setError("");
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      setError("");
      setMessage("");

      const payload = {
        firstname: draft.firstname.trim(),
        lastName: draft.lastName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        department: draft.department.trim(),
        designation: draft.designation.trim(),
        qualification: draft.qualification.trim(),
        experience: Number(draft.experience) || 0,
        dob: draft.dob,
        linkedin: draft.linkedin.trim(),
        subjects: stringToList(draft.subjects),
        headof: stringToList(draft.headof),
        techstacks: stringToList(draft.techstacks),
      };

      const updated = await facultyAPI.updateProfile(payload, token);
      const next = {
        firstname: updated.firstname || "",
        lastName: updated.lastName || "",
        email: updated.email || "",
        phone: updated.phone || "",
        department: updated.department || "",
        designation: updated.designation || "",
        qualification: updated.qualification || "",
        experience: String(typeof updated.experience === "number" ? updated.experience : ""),
        dob: updated.dob || "",
        linkedin: updated.linkedin || "",
        subjects: listToString(updated.subjects),
        headof: listToString(updated.headof),
        techstacks: listToString(updated.techstacks),
      };

      setProfile(next);
      setDraft(next);
      setIsEditing(false);
      setMessage("Profile updated successfully.");

      if (setUser) {
        setUser((prev) => (
          prev
            ? {
                ...prev,
                email: next.email,
                name: `${next.firstname} ${next.lastName}`.trim() || prev.name,
                firstname: next.firstname,
                lastName: next.lastName,
                department: next.department,
                designation: next.designation,
              }
            : prev
        ));
      }
    } catch (err) {
      setError(err?.message || "Unable to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (user?.userType !== "faculty") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Profile editing is available for faculty accounts.</Text>
        <Button mode="contained" onPress={signOut} style={styles.button} buttonColor="#1A73E8">
          Sign Out
        </Button>
      </View>
    );
  }

  const current = isEditing ? draft : profile;
  const initials = `${current.firstname?.[0] || "F"}${current.lastName?.[0] || "M"}`.toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Avatar.Text size={84} label={initials} />
      <Text style={styles.name}>{fullName}</Text>
      <Text style={styles.subtitle}>{current.designation || "Faculty"} • {current.department || "Department not set"}</Text>

      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <TextInput mode="outlined" label="First Name" value={current.firstname} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, firstname: value })} style={styles.input} />
        <TextInput mode="outlined" label="Last Name" value={current.lastName} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, lastName: value })} style={styles.input} />
        <TextInput mode="outlined" label="Email" value={current.email} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, email: value })} style={styles.input} />
        <TextInput mode="outlined" label="Phone" value={current.phone} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, phone: value })} style={styles.input} />
        <TextInput mode="outlined" label="Department" value={current.department} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, department: value })} style={styles.input} />
        <TextInput mode="outlined" label="Designation" value={current.designation} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, designation: value })} style={styles.input} />
        <TextInput mode="outlined" label="Qualification" value={current.qualification} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, qualification: value })} style={styles.input} />
        <TextInput mode="outlined" label="Experience (Years)" keyboardType="numeric" value={current.experience} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, experience: value })} style={styles.input} />
        <TextInput mode="outlined" label="Date of Birth" value={current.dob} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, dob: value })} style={styles.input} />
        <TextInput mode="outlined" label="LinkedIn" value={current.linkedin} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, linkedin: value })} style={styles.input} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Lists</Text>
        <TextInput mode="outlined" label="Subjects (comma separated)" value={current.subjects} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, subjects: value })} style={styles.input} multiline />
        <TextInput mode="outlined" label="Head Of (comma separated)" value={current.headof} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, headof: value })} style={styles.input} multiline />
        <TextInput mode="outlined" label="Tech Stack (comma separated)" value={current.techstacks} disabled={!isEditing} onChangeText={(value) => setDraft({ ...draft, techstacks: value })} style={styles.input} multiline />
      </View>

      <View style={styles.actions}>
        {!isEditing ? (
          <Button mode="contained" onPress={startEdit} buttonColor="#1A73E8" style={styles.button}>
            Edit Profile
          </Button>
        ) : (
          <>
            <Button mode="outlined" onPress={cancelEdit} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={saveProfile} buttonColor="#1A73E8" style={styles.button} loading={isSaving} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        )}
        <Button mode="text" onPress={signOut} textColor="#dc2626" style={styles.button}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 36, backgroundColor: "#f6faff", gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  name: { marginTop: 12, fontSize: 22, fontWeight: "800", color: "#0f172a" },
  subtitle: { color: "#475569", textAlign: "center" },
  success: { color: "#166534", backgroundColor: "#dcfce7", padding: 10, borderRadius: 10, marginTop: 6 },
  error: { color: "#991b1b", backgroundColor: "#fee2e2", padding: 10, borderRadius: 10, marginTop: 6 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 2, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  input: { backgroundColor: "#fff" },
  actions: { gap: 10, marginTop: 4 },
  button: { marginTop: 4 },
});
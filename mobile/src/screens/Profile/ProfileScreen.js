import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Avatar } from "react-native-paper";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Avatar.Text size={84} label="U" />
      <Text style={styles.name}>Guest User</Text>
      <Button mode="contained" onPress={() => signOut()} style={styles.button} buttonColor="#1A73E8">
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  name: { marginTop: 12, fontSize: 18, fontWeight: "700" },
  button: { marginTop: 16 },
});

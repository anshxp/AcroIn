import React, { useState, useContext } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { signIn } = useContext(AuthContext);

	const loginUser = () => {
		// demo login: set a token so the app navigates to the TabNavigator
		console.log("Logging in", email);
		signIn("demo-token");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome Back</Text>
			<TextInput
				mode="outlined"
				label="Email"
				value={email}
				onChangeText={setEmail}
				style={styles.input}
			/>

			<TextInput
				mode="outlined"
				label="Password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
				style={styles.input}
			/>

			<Button mode="contained" onPress={loginUser} style={styles.button} buttonColor="#1A73E8">
				Login
			</Button>

			<TouchableOpacity onPress={() => navigation.navigate("Register")}> 
				<Text style={styles.footerText}>Don't have an account? Register</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 22, backgroundColor: "#fff", justifyContent: "center" },
	title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 12 },
	input: { marginBottom: 12, backgroundColor: "white" },
	button: { paddingVertical: 6, marginTop: 6 },
	footerText: { textAlign: "center", marginTop: 18, color: "#1A73E8" },
});

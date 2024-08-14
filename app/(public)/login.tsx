import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

export default function login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function login() {
    setLoading(true);

    if (!email || !password) {
      alert("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Sign in failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function register() {
    setLoading(true);

    if (!email || !password) {
      alert("Email and password are required");
      setLoading(false);
      return;
    }

		try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPassword("");
		} catch (e: any) {
			const err = e as FirebaseError;
			alert('Registration failed: ' + err.message);
		} finally {
			setLoading(false);
		}
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Text style={styles.text}>Login/Register</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
      />
      {loading ? (
        <ActivityIndicator
          color={Colors.primary}
          style={{ marginTop: 10 }}
          size="large"
        />
      ) : (
        <>
          <Button onPress={login} title="Login" color={Colors.primary} />
          <View style={{ marginVertical: 10 }} />
          <Button onPress={register} title="Register" color={Colors.primary} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
});

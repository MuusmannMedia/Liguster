// app/(public)/LoginScreen.native.tsx
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

export const options = { headerShown: false };

export default function LoginScreenNative() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const goHome = () => router.replace("/");

  const onLogin = async () => {
    if (loading) return; // undgå dobbelte tryk
    const emailTrimmed = email.trim();

    if (!emailTrimmed || !password) {
      Alert.alert("Fejl", "Udfyld både email og password.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });

      if (error) throw error;

      // Succes: ind i den beskyttede del
      router.replace("/(protected)/Nabolag");
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Login fejlede",
        e instanceof Error ? e.message : String(e)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "height" })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.safe}>
            {/* Tilbage */}
            <TouchableOpacity
              style={styles.backIcon}
              onPress={goHome}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={loading}
            >
              <Text style={styles.backIconText}>‹</Text>
            </TouchableOpacity>

            {/* Formular */}
            <View style={styles.centered}>
              <Text style={styles.title}>Log ind</Text>

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                editable={!loading}
              />

              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                returnKeyType="go"
                onSubmitEditing={onLogin}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={onLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logger ind…" : "LOG IND"}
                </Text>
              </TouchableOpacity>

              {/* Link til reset-password side */}
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 14 }}>Glemt password?</Text>
                <TouchableOpacity
                  onPress={() => router.push("/reset-password-native")}
                  disabled={loading}
                >
                  <Text style={styles.resetLink}>Send reset-link på mail</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#171C22" },
  safe: { flex: 1 },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  backIcon: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    width: 36,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backIconText: { fontSize: 30, color: "#fff" },

  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 16 },

  input: {
    backgroundColor: "#fff",
    width: 260,
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 200,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 1,
  },
  buttonText: { color: "#171C22", fontSize: 16, fontWeight: "700", letterSpacing: 1 },

  resetLink: {
    color: "#BBD2FF",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});
// app/(public)/LoginScreen.native.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session) {
        router.replace("/(protected)/Nabolag");
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const goHome = () => router.replace("/");

  const onLogin = async () => {
    const mail = email.trim();
    const pass = password.trim();

    if (!mail || !pass) {
      Alert.alert("Fejl", "Udfyld både e-mail og password.");
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: mail,
        password: pass,
      });
      if (error) throw error;
      router.replace("/(protected)/Nabolag");
    } catch (e: any) {
      Alert.alert("Login fejlede", e?.message ?? "Prøv igen.");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = () => {
    // Åbn websitets reset password side
    Linking.openURL("https://liguster-app.dk/reset-password");
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: "height" })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={styles.safe}>
            <TouchableOpacity
              style={styles.backIcon}
              onPress={goHome}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIconText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.centered}>
              <Text style={styles.title}>Log ind</Text>

              <TextInput
                style={styles.input}
                placeholder="din@email.dk"
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
              />

              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                returnKeyType="go"
                onSubmitEditing={onLogin}
              />

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={onLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logger ind…" : "LOG IND"}
                </Text>
              </TouchableOpacity>

              {/* Reset password link */}
              <TouchableOpacity onPress={onResetPassword} style={{ marginTop: 14 }}>
                <Text style={styles.link}>Glemt password? Nulstil her</Text>
              </TouchableOpacity>
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

  link: { color: "#93c5fd", textDecorationLine: "underline", fontSize: 14 },
});
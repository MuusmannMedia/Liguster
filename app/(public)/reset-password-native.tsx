// app/(public)/reset-password-native.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function ResetPasswordNative() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const onBack = () => router.back();

  const sendReset = async () => {
    const mail = email.trim();
    if (!mail) {
      Alert.alert("Mangler e-mail", "Skriv din e-mail først.");
      return;
    }
    try {
      setSending(true);
      const { error } = await supabase.auth.resetPasswordForEmail(mail, {
        // Web-siden der fuldender reset efter e-mailbekræftelse:
        redirectTo: "https://www.liguster-app.dk/reset-password",
      });
      if (error) throw error;
      Alert.alert(
        "Tjek din mail",
        "Vi har sendt et link til at nulstille dit password."
      );
      router.back();
    } catch (e: any) {
      Alert.alert("Kunne ikke sende reset-mail", e?.message ?? "Prøv igen senere.");
    } finally {
      setSending(false);
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
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIconText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.centered}>
              <Text style={styles.title}>Nulstil password</Text>
              <Text style={styles.copy}>
                Indtast din e-mail. Vi sender dig et link til at nulstille dit password.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="din@email.dk"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="username"
                value={email}
                onChangeText={setEmail}
                returnKeyType="send"
                onSubmitEditing={sendReset}
              />

              <TouchableOpacity
                style={[styles.button, sending && { opacity: 0.6 }]}
                onPress={sendReset}
                disabled={sending}
              >
                <Text style={styles.buttonText}>
                  {sending ? "Sender…" : "SEND RESET-LINK"}
                </Text>
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

  title: { color: "#fff", fontSize: 26, fontWeight: "700", marginBottom: 10 },
  copy: { color: "#cfd6dd", textAlign: "center", marginBottom: 16 },

  input: {
    backgroundColor: "#fff",
    width: 280,
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 220,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  buttonText: { color: "#171C22", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
});
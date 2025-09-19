// app/(public)/reset-password-native.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert, Keyboard, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../utils/supabase";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

export default function ResetPasswordNative() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const canSend = useMemo(() => isEmail(email), [email]);

  const onSend = async () => {
    if (!canSend || sending) return;
    try {
      setSending(true);
      Keyboard.dismiss();

      // ← VIGTIGT: peg på din webside
      const redirectTo = "https://liguster-app.dk/reset-password";

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      );
      if (error) throw error;

      Alert.alert(
        "Tjek din mail",
        "Vi har sendt et link til at nulstille dit password."
      );
      router.back();
    } catch (e: any) {
      Alert.alert("Kunne ikke sende link", e?.message ?? "Prøv igen.");
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
          <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            {/* Tilbage */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={[styles.back, { top: insets.top + 8 }]}
            >
              <Text style={{ fontSize: 30, color: "#fff" }}>‹</Text>
            </TouchableOpacity>

            <View style={styles.centered}>
              <Text style={styles.title}>Nulstil password</Text>

              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="din@email.dk"
                placeholderTextColor="#9aa3ad"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                returnKeyType="send"
                onSubmitEditing={onSend}
                editable={!sending}
              />

              <TouchableOpacity
                onPress={onSend}
                disabled={!canSend || sending}
                style={[
                  styles.primaryBtn,
                  (!canSend || sending) && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.primaryText}>
                  {sending ? "Sender…" : "SEND RESET-LINK"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.tip}>
                Tip: Hvis mailen ikke kommer, så tjek spam — eller prøv igen om 1–2 min.
              </Text>
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
  back: { position: "absolute", left: 12, zIndex: 10, width: 44, height: 44, justifyContent: "center" },
  centered: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  title: { color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 16, textAlign: "center" },
  input: {
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, marginBottom: 12,
  },
  primaryBtn: { backgroundColor: "#fff", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  primaryText: { color: "#0f1623", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },
  tip: { color: "#cbd5e1", marginTop: 14, textAlign: "center" },
});
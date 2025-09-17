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

const RESET_REDIRECT = "https://liguster-app.dk/reset-password"; // apex + no trailing slash

export default function ResetPasswordNative() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const onBack = () => router.back();

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const sendReset = async () => {
    const mail = email.trim().toLowerCase();
    if (!isValidEmail(mail)) {
      Alert.alert("Ugyldig e-mail", "Skriv en gyldig e-mailadresse.");
      return;
    }

    try {
      setSending(true);

      const { error } = await supabase.auth.resetPasswordForEmail(mail, {
        redirectTo: RESET_REDIRECT,
      });

      if (error) throw error;

      Alert.alert(
        "Tjek din mail",
        "Vi har sendt et link til at nulstille dit password. Brug det nyeste link og åbn det med det samme."
      );
      router.back();
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? "");
      // Hyppige supabase-fejl oversat lidt venligt
      if (msg.includes("rate")) {
        Alert.alert("Ro på 🙂", "Du har anmodet for nylig. Prøv igen om lidt.");
      } else {
        Alert.alert("Kunne ikke sende reset-mail", msg);
      }
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
                editable={!sending}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  (sending || !isValidEmail(email)) && { opacity: 0.6 },
                ]}
                onPress={sendReset}
                disabled={sending || !isValidEmail(email)}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {sending ? "Sender…" : "SEND RESET-LINK"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.hint}>
                Tip: Hvis mailen ikke kommer, så tjek spam, og prøv igen om 1-2 min.
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

  hint: { color: "#9aa3ad", marginTop: 10, fontSize: 12, textAlign: "center" },
});
// app/(public)/LoginScreen.web.tsx
import { Link, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";

export default function LoginScreenWeb() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const didRedirect = useRef(false);

  // Hvis allerede logget ind -> send til Nabolag
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session && !didRedirect.current) {
        didRedirect.current = true;
        router.replace("/Nabolag");
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session && !didRedirect.current) {
        didRedirect.current = true;
        router.replace("/Nabolag");
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendMagicLink = async () => {
    const mail = email.trim();
    if (!mail) return;
    try {
      setSending(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: mail,
        options: { emailRedirectTo: `${window.location.origin}/LoginScreen` },
      });
      if (error) throw error;
      alert("Tjek din mail for et login-link.");
    } catch (e: any) {
      alert(e?.message ?? "Kunne ikke sende login-link.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.h1}>Log ind</Text>
        <Text style={styles.copy}>
          Indtast din e-mail – så sender vi et login-link.
        </Text>

        <TextInput
          placeholder="din@email.dk"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={sendMagicLink}
          disabled={sending || !email.trim()}
          style={[styles.btn, (!email.trim() || sending) && { opacity: 0.6 }]}
        >
          <Text style={styles.btnText}>{sending ? "Sender…" : "Send login-link"}</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <Link href="/privacy" style={styles.link}>
            Privacy
          </Link>
          <Text style={{ color: "#64748b" }}>·</Text>
          <TouchableOpacity onPress={() => router.replace("/Nabolag")}>
            <Text style={styles.link}>Se opslag uden login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0f1623",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  h1: { color: "#e5e7eb", fontSize: 22, fontWeight: "800" },
  copy: { color: "#94a3b8" },
  input: {
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#233244",
    color: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: "#22c55e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#0b1220", fontWeight: "800" },
  row: { marginTop: 8, flexDirection: "row", gap: 10, alignSelf: "center" },
  link: { color: "#93c5fd", textDecorationLine: "underline" },
});
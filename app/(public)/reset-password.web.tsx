// app/(public)/reset-password.web.tsx
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";

// Læs URL-hash som key/value
function parseHashParams(hash: string): Record<string, string> {
  const h = hash.replace(/^#/, "");
  const out: Record<string, string> = {};
  for (const part of h.split("&")) {
    const [k, v] = part.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
  }
  return out;
}

export default function ResetPasswordWeb() {
  const [mode, setMode] = useState<"request" | "change">("request");

  // Request form
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Change form
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);

  const subRef = useRef<ReturnType<typeof supabase.auth.onAuthStateChange> | null>(null);

  useEffect(() => {
    // 1) Hvis vi lander fra mail-linket med tokens i hash → sæt session
    const params = parseHashParams(window.location.hash || "");
    const access_token = params["access_token"];
    const refresh_token = params["refresh_token"];
    const error = params["error"];
    const error_description = params["error_description"];

    if (error) {
      alert(error_description || error);
    }

    (async () => {
      try {
        if (access_token && refresh_token) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErr) throw setErr;

          // Ryd hash i adresselinjen
          window.history.replaceState({}, document.title, window.location.pathname);
          setMode("change");
          return;
        }
      } catch (e: any) {
        // Fald tilbage til request-mode med besked
        console.warn("setSession failed", e?.message ?? e);
      }

      // 2) Hvis siden genindlæses og vi allerede HAR en session → change-mode
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setMode("change");
      }
    })();

    // 3) Lyt efter events (ekstra sikkerhed hvis lib selv fanger hash)
    const { data: sub } = supabase.auth.onAuthStateChange((ev, session) => {
      if (ev === "PASSWORD_RECOVERY" || (session && session.user)) {
        setMode("change");
      }
    });
    subRef.current = sub;

    return () => subRef.current?.subscription.unsubscribe();
  }, []);

  const sendResetMail = async () => {
    const mail = email.trim();
    if (!mail) return;
    try {
      setSending(true);
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo });
      if (error) throw error;
      alert("Vi har sendt et link til at nulstille dit password. Tjek din mail.");
      setEmail("");
    } catch (e: any) {
      alert(e?.message ?? "Kunne ikke sende reset-mail. Prøv igen.");
    } finally {
      setSending(false);
    }
  };

  const changePassword = async () => {
    const pass = newPass.trim();
    if (!pass || pass.length < 8) return alert("Vælg et password på mindst 8 tegn.");
    if (pass !== confirm.trim()) return alert("Passwords er ikke ens.");

    try {
      setChanging(true);
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      alert("Dit password er opdateret. Du kan nu logge ind.");
      setNewPass("");
      setConfirm("");
      // window.location.href = "/LoginScreen";
    } catch (e: any) {
      alert(e?.message ?? "Kunne ikke opdatere password. Prøv igen.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {mode === "request" ? (
          <>
            <Text style={styles.h1}>Nulstil password</Text>
            <Text style={styles.copy}>
              Indtast din e-mail. Vi sender dig et link til at nulstille dit password.
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
              onPress={sendResetMail}
              disabled={sending || !email.trim()}
              style={[styles.btn, (!email.trim() || sending) && { opacity: 0.6 }]}
            >
              <Text style={styles.btnText}>{sending ? "Sender…" : "Send reset-mail"}</Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginTop: 10 }}>
              <a href="/LoginScreen" style={styles.link as any}>Tilbage til log ind</a>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.h1}>Vælg nyt password</Text>
            <Text style={styles.copy}>Indtast dit nye password herunder.</Text>

            <TextInput
              placeholder="Nyt password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              value={newPass}
              onChangeText={setNewPass}
              style={styles.input}
            />
            <TextInput
              placeholder="Gentag password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
            />

            <TouchableOpacity
              onPress={changePassword}
              disabled={changing || !newPass || !confirm}
              style={[styles.btn, (changing || !newPass || !confirm) && { opacity: 0.6 }]}
            >
              <Text style={styles.btnText}>{changing ? "Opdaterer…" : "Opdater password"}</Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginTop: 10 }}>
              <a href="/LoginScreen" style={styles.link as any}>Gå til log ind</a>
            </View>
          </>
        )}
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
    minHeight: "100vh",
  },
  card: {
    width: "100%",
    maxWidth: 460,
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
  link: { color: "#93c5fd", textDecoration: "underline", fontSize: 14 },
});
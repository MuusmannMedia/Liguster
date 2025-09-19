// app/(public)/reset-password.web.tsx
import { Head } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "../../utils/supabase";

/** Læs hash/query params til et key/value-objekt */
const readParams = () => {
  const out: Record<string, string> = {};
  const raw =
    window.location.hash?.slice(1) ||
    window.location.search?.slice(1) ||
    "";
  for (const part of raw.split("&")) {
    if (!part) continue;
    const [k, v] = part.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v || "");
  }
  return out;
};

/** Fjern hash/query fra URL (beholder samme path) */
const stripUrl = () => {
  const cleanUrl = window.location.pathname; // fx /reset-password
  try {
    history.replaceState(null, "", cleanUrl);
  } catch {}
};

export default function ResetPasswordWeb() {
  // UI-mode: "request" = send mail, "change" = skift password
  const [mode, setMode] = useState<"request" | "change">("request");

  // --- Request (send mail)
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // --- Change (nyt password)
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);

  const subRef = useRef<ReturnType<typeof supabase.auth.onAuthStateChange> | null>(null);
  const origin = useMemo(() => window.location.origin, []);

  useEffect(() => {
    const params = readParams();

    // 1) Håndtér direkte fejl fra linket (fx otp_expired / invalid)
    if (params.error) {
      const msg =
        params.error_description?.replace(/\+/g, " ") ||
        "Linket er udløbet eller ugyldigt. Anmod venligst om et nyt nulstillingslink.";
      alert(msg);
      stripUrl();
      setMode("request");
      return;
    }

    // 2) Etabler session (PKCE & implicit)
    (async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href).catch(() => {});
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setMode("change");
          stripUrl();
        }
      } catch {}
    })();

    // 3) Lyt efter PASSWORD_RECOVERY / login
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setMode("change");
        stripUrl();
      }
    });
    subRef.current = subscription;

    return () => subRef.current?.subscription?.unsubscribe?.();
  }, []);

  const sendResetMail = async () => {
    const mail = email.trim();
    if (!mail) return;
    try {
      setSending(true);
      const redirectTo = `${origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo });
      if (error) throw error;
      alert("Vi har sendt et link til at nulstille dit password. Tjek din mail (og evt. spam).");
      setEmail("");
    } catch (e: any) {
      alert(e?.message ?? "Kunne ikke sende reset-mail. Prøv igen.");
    } finally {
      setSending(false);
    }
  };

  const changePassword = async () => {
    const pass = newPass.trim();
    if (pass.length < 8) return alert("Vælg et password på mindst 8 tegn.");
    if (pass !== confirm.trim()) return alert("Passwords er ikke ens.");
    try {
      setChanging(true);
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      alert("Dit password er opdateret. Du kan nu logge ind.");
      setNewPass(""); setConfirm("");
      window.location.href = "/LoginScreen";
    } catch (e: any) {
      alert(e?.message ?? "Kunne ikke opdatere password. Prøv igen.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <View id="click-scope" style={styles.page}>
      {/* Meta + CSS der sikrer klik/fokus på iOS/web */}
      <Head>
        <title>Nyt kodeord</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <style>{`
          html, body, #root, #__next { height: 100%; }
          body { margin: 0; overflow: auto !important; -webkit-overflow-scrolling: touch; }
          /* Sørg for at intet overlay i appens layout blokerer klik på denne side */
          #click-scope, #click-scope * { pointer-events: auto !important; }
          /* Læg inputs/knapper øverst i stacking order (hjælper i iOS Safari) */
          #click-scope input, #click-scope button { position: relative; z-index: 2; }
        `}</style>
      </Head>

      <View style={styles.card}>
        <Text style={styles.h1}>Nyt kodeord</Text>
        <Text style={styles.copy}>Indtast dit nye ønskede kodeord nedenfor.</Text>

        {mode === "request" ? (
          <>
            <input
              type="email"
              placeholder="din@email.dk"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              style={webStyles.input}
              inputMode="email"
              autoComplete="email"
            />
            <button
              onClick={sendResetMail}
              disabled={sending || !email.trim()}
              style={{ ...webStyles.btn, opacity: sending || !email.trim() ? 0.6 : 1 }}
            >
              {sending ? "Sender…" : "Send reset-mail"}
            </button>

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <a href="/LoginScreen" style={webStyles.link}>Tilbage til log ind</a>
            </div>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nyt kodeord"
              value={newPass}
              onChange={(e) => setNewPass(e.currentTarget.value)}
              style={webStyles.input}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Bekræft nyt kodeord"
              value={confirm}
              onChange={(e) => setConfirm(e.currentTarget.value)}
              style={webStyles.input}
              autoComplete="new-password"
            />
            <button
              onClick={changePassword}
              disabled={changing || !newPass || !confirm}
              style={{ ...webStyles.btn, opacity: changing || !newPass || !confirm ? 0.6 : 1 }}
            >
              {changing ? "Gemmer…" : "Gem kodeord"}
            </button>

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <a href="/LoginScreen" style={webStyles.link}>Gå til log ind</a>
            </div>
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
    // hjælp hvis et globalt element har høj z-index:
    zIndex: 0,
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
  h1: { color: "#e5e7eb", fontSize: 22, fontWeight: "800", textAlign: "center" },
  copy: { color: "#94a3b8", textAlign: "center" },
});

// Rene web-styles til <input>/<button>/<a>
const webStyles: Record<string, React.CSSProperties> = {
  input: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    borderRadius: 10,
    border: "1px solid #233244",
    background: "#0b1220",
    color: "#e5e7eb",
    padding: "12px 12px",
    outline: "none",
    fontSize: 16,
    WebkitAppearance: "none",
  },
  btn: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    borderRadius: 10,
    border: 0,
    background: "#22c55e",
    color: "#0b1220",
    fontWeight: 800,
    padding: "12px 12px",
    cursor: "pointer",
  },
  link: {
    color: "#93c5fd",
    textDecoration: "underline",
    fontSize: 14,
  },
};
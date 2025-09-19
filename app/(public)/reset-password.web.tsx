// app/(public)/reset-password.web.tsx
import { Head } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../utils/supabase";

/* Helpers */
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
const stripUrl = () => {
  try {
    history.replaceState(null, "", window.location.pathname);
  } catch {}
};

export default function ResetPasswordWeb() {
  const [mode, setMode] = useState<"request" | "change">("request");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changing, setChanging] = useState(false);

  const subRef = useRef<ReturnType<typeof supabase.auth.onAuthStateChange> | null>(null);
  const origin = useMemo(() => window.location.origin, []);

  useEffect(() => {
    const params = readParams();

    if (params.error) {
      const msg =
        params.error_description?.replace(/\+/g, " ") ||
        "Linket er udløbet eller ugyldigt. Anmod venligst om et nyt nulstillingslink.";
      alert(msg);
      stripUrl();
      setMode("request");
      return;
    }

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
    // @ts-ignore – vi bruger ren HTML på web her
    <div id="reset-top-overlay" style={styles.page}>
      <Head>
        <title>Nyt kodeord</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <style>{globalCss}</style>
      </Head>

      <div style={styles.card}>
        <h1 style={styles.h1}>Nyt kodeord</h1>
        <p style={styles.copy}>Indtast dit nye ønskede kodeord nedenfor.</p>

        {mode === "request" ? (
          <>
            <input
              type="email"
              placeholder="din@email.dk"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              style={styles.input}
              inputMode="email"
              autoComplete="email"
            />
            <button
              onClick={sendResetMail}
              disabled={sending || !email.trim()}
              style={{ ...styles.btn, opacity: sending || !email.trim() ? 0.6 : 1 }}
            >
              {sending ? "Sender…" : "Send reset-mail"}
            </button>

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <a href="/LoginScreen" style={styles.link}>Tilbage til log ind</a>
            </div>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nyt kodeord"
              value={newPass}
              onChange={(e) => setNewPass(e.currentTarget.value)}
              style={styles.input}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Bekræft nyt kodeord"
              value={confirm}
              onChange={(e) => setConfirm(e.currentTarget.value)}
              style={styles.input}
              autoComplete="new-password"
            />
            <button
              onClick={changePassword}
              disabled={changing || !newPass || !confirm}
              style={{ ...styles.btn, opacity: changing || !newPass || !confirm ? 0.6 : 1 }}
            >
              {changing ? "Gemmer…" : "Gem kodeord"}
            </button>

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <a href="/LoginScreen" style={styles.link}>Gå til log ind</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* —————— Global CSS (kun for denne side) —————— */
const globalCss = `
  html, body, #root, #__next { height: 100%; }
  body { margin: 0; background: #0f1623; overflow: auto !important; -webkit-overflow-scrolling: touch; }
  /* Slå ALLE overlays/transitions/gestures fra og tving pointer-events til at virke */
  *, *::before, *::after { transition: none !important; animation: none !important; }
  #reset-top-overlay, #reset-top-overlay * { pointer-events: auto !important; -webkit-tap-highlight-color: transparent; }
  /* Skjul eventuelle fast/fixed navbars/overlays fra app-layout */
  header, nav, .nav, .topbar, .bottom-nav, [data-footer], [role="banner"], [role="navigation"] { display: none !important; }
`;

/* —————— Styles (ren CSS-in-JS for HTML elements) —————— */
const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    isolation: "isolate",      // egen stacking context
    zIndex: 2147483647,        // helt øverst
    background: "#0f1623",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  },
  h1: { color: "#e5e7eb", fontSize: 22, fontWeight: 800, textAlign: "center", margin: "0 0 8px" },
  copy: { color: "#94a3b8", textAlign: "center", margin: "0 0 12px" },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    border: "1px solid #233244",
    background: "#0b1220",
    color: "#e5e7eb",
    padding: "12px 12px",
    outline: "none",
    fontSize: 16,
    WebkitAppearance: "none",
    marginBottom: 12,
    position: "relative",
    zIndex: 2,
  },
  btn: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    border: 0,
    background: "#22c55e",
    color: "#0b1220",
    fontWeight: 800,
    padding: "0 12px",
    cursor: "pointer",
    position: "relative",
    zIndex: 2,
  },
  link: {
    color: "#93c5fd",
    textDecoration: "underline",
    fontSize: 14,
  },
};
// app/(public)/LoginScreen.web.tsx
import { Link, useRouter } from "expo-router";
import Head from "expo-router/head";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../utils/supabase";

export const options = { headerShown: false };

export default function LoginScreenWeb() {
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const passRef  = useRef<HTMLInputElement>(null);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [msg, setMsg]           = useState<string | null>(null);
  const [err, setErr]           = useState<string | null>(null);
  const [showPw, setShowPw]     = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.pointerEvents = "auto";
    emailRef.current?.focus();
  }, []);

  const submit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);
    setMsg(null);

    const eMail = email.trim().toLowerCase();
    if (!eMail || !password) {
      setErr("Udfyld både e-mail og adgangskode.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email: eMail, password });
      if (error) throw error;
      router.replace("/(protected)/Nabolag");
    } catch (ex: any) {
      setErr(ex?.message ?? "Kunne ikke logge ind.");
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const sendReset = useCallback(async () => {
    setErr(null);
    setMsg(null);

    const eMail = email.trim().toLowerCase();
    if (!eMail) {
      setErr("Skriv din e-mail i feltet først.");
      return;
    }
    try {
      setSendingReset(true);
      const { error } = await supabase.auth.resetPasswordForEmail(eMail, {
        redirectTo: "https://liguster-app.dk/reset-password",
      });
      if (error) throw error;
      setMsg("Hvis e-mailen findes hos os, har vi sendt et link til at nulstille dit kodeord.");
    } catch (ex: any) {
      setErr(ex?.message ?? "Kunne ikke sende mail.");
    } finally {
      setSendingReset(false);
    }
  }, [email]);

  return (
    <div style={styles.page}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-store" />
        <title>Log ind • Liguster</title>
      </Head>

      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>Log ind</h1>

        {err ? <div style={styles.error}>{err}</div> : null}
        {msg ? <div style={styles.info}>{msg}</div> : null}

        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          ref={emailRef}
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="dig@email.dk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <label htmlFor="password" style={styles.label}>Adgangskode</label>

        <div style={styles.pwWrap}>
          <input
            id="password"
            ref={passRef}
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, paddingRight: styles.toggleSize.width + 10 }}
          />
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            style={{ ...styles.togglePw, width: styles.toggleSize.width }}
            aria-label={showPw ? "Skjul adgangskode" : "Vis adgangskode"}
          >
            {showPw ? "Skjul" : "Vis"}
          </button>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logger ind…" : "LOG IND"}
        </button>

        <div style={styles.footerRow}>
          <button type="button" onClick={sendReset} disabled={sendingReset} style={styles.footerBtn}>
            {sendingReset ? "Sender link…" : "Send reset-link på mail"}
          </button>
        </div>

        <div style={styles.footerRow}>
          <Link href="/" style={styles.footerLink}>‹ Tilbage</Link>
        </div>
      </form>
    </div>
  );
}

/* ───────────────────────── Tema & Styles ───────────────────────── */
const THEME = {
  pageBg: "#7C8996",
  cardBg: "#0b1220",
  cardBorder: "#1D2A38",
  text: "#FFFFFF",
  sub: "#cbd5e1",
  inputBg: "#FFFFFF",
  inputBorder: "#e5e8ec",
  inputText: "#0b1220",
  btnBg: "#FFFFFF",
  btnText: "#0b1220",
  errBg: "#FEE2E2",
  errText: "#7f1d1d",
  errBorder: "#ef4444",
  infoBg: "#DCFCE7",
  infoText: "#14532d",
  infoBorder: "#22c55e",
};

const styles: Record<string, any> = {
  toggleSize: { width: 64 },

  page: {
    minHeight: "100vh",
    background: THEME.pageBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundImage: "radial-gradient(ellipse at top, rgba(255,255,255,0.14), transparent 60%)",
  },
  card: {
    width: 380,
    maxWidth: "92vw",
    background: THEME.cardBg,
    border: `1px solid ${THEME.cardBorder}`,
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  },
  title: {
    color: THEME.text,
    textAlign: "center",
    fontSize: 26,
    fontWeight: 800,
    margin: "4px 0 16px",
    letterSpacing: 0.2,
  },
  label: {
    color: THEME.sub,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    display: "block",
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: `1px solid ${THEME.inputBorder}`,
    background: THEME.inputBg,
    color: THEME.inputText,
    padding: "0 14px",
    marginBottom: 14,
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box" as const,
  },

  pwWrap: { position: "relative" as const, marginBottom: 14 },
  togglePw: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    height: 48,
    borderRadius: 12,
    border: `1px solid ${THEME.inputBorder}`,
    background: "#f3f4f6",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer",
  },

  button: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    border: 0,
    background: THEME.btnBg,
    color: THEME.btnText,
    fontWeight: 900,
    letterSpacing: 1,
    cursor: "pointer",
    marginTop: 4,
  },

  error: {
    background: THEME.errBg,
    color: THEME.errText,
    border: `1px solid ${THEME.errBorder}`,
    padding: "8px 10px",
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: 700,
  },
  info: {
    background: THEME.infoBg,
    color: THEME.infoText,
    border: `1px solid ${THEME.infoBorder}`,
    padding: "8px 10px",
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: 700,
  },

  footerRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
  },
  footerBtn: {
    appearance: "none",
    background: "transparent",
    border: 0,
    color: "#9fb3ff",
    textDecoration: "underline",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
  },
  footerLink: {
    color: "#9fb3ff",
    textDecoration: "underline",
    fontWeight: 700,
    fontSize: 13,
  },
};
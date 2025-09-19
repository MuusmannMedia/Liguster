// app/(public)/reset-password.web.tsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../utils/supabase";

export default function ResetPasswordWeb() {
  const [phase, setPhase] = useState<"checking"|"ready"|"saving"|"success"|"error">("checking");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const canSave = useMemo(() => p1.length >= 8 && p1 === p2, [p1, p2]);

  // 1) Byt kode fra URL til session
  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
        setPhase("ready");
      } catch (e: any) {
        setErr(e?.message ?? "Kunne ikke starte nulstilling.");
        setPhase("error");
      }
    })();
  }, []);

  // 2) Gem nyt password
  const onSave = async () => {
    if (!canSave) return;
    try {
      setPhase("saving");
      const { error } = await supabase.auth.updateUser({ password: p1.trim() });
      if (error) throw error;
      setPhase("success");
    } catch (e: any) {
      setErr(e?.message ?? "Kunne ikke gemme password.");
      setPhase("error");
    }
  };

  // Simple, ren HTML for maksimal robusthed på web
  return (
    <div style={page}>
      <div style={card}>
        <h1 style={h1}>Nyt kodeord</h1>

        {phase === "checking" && <p>Henter nulstillingssession…</p>}

        {phase === "error" && (
          <>
            <p style={{ color: "#fca5a5" }}>
              {err || "Vi kunne ikke finde en aktiv nulstillingssession."}
            </p>
            <a href="/LoginScreen" style={btnGhost}>Til login</a>
          </>
        )}

        {phase === "ready" && (
          <>
            <p>Indtast dit nye ønskede kodeord nedenfor.</p>
            <input
              type="password"
              placeholder="Nyt kodeord"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              style={input}
            />
            <input
              type="password"
              placeholder="Gentag kodeord"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              style={input}
            />
            <button onClick={onSave} disabled={!canSave} style={btnPrimary}>
              Gem nyt kodeord
            </button>
          </>
        )}

        {phase === "saving" && <p>Gemmer…</p>}

        {phase === "success" && (
          <>
            <p style={{ color: "#16a34a", fontWeight: 700 }}>Dit kodeord er opdateret.</p>
            <a href="/LoginScreen" style={btnPrimary}>Til login</a>
          </>
        )}
      </div>
    </div>
  );
}

/* ——— inline styles for simplicity ——— */
const page: React.CSSProperties = { minHeight: "100vh", background: "#0f1623", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const card: React.CSSProperties = { width: 420, maxWidth: "100%", background: "#111827", color: "#e5e7eb", borderRadius: 16, padding: 22, boxShadow: "0 6px 24px rgba(0,0,0,.25)" };
const h1: React.CSSProperties = { margin: "0 0 12px", fontSize: 28, fontWeight: 800 };
const input: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #334155", marginBottom: 10, outline: "none", fontSize: 16 };
const btnPrimary: React.CSSProperties = { display: "inline-block", padding: "12px 16px", borderRadius: 12, background: "#fff", color: "#0f1623", fontWeight: 800, textDecoration: "none", border: 0, cursor: "pointer", marginTop: 6 };
const btnGhost: React.CSSProperties = { display: "inline-block", padding: "10px 14px", borderRadius: 12, background: "transparent", color: "#e5e7eb", border: "1px solid #475569", textDecoration: "none", marginTop: 8 };
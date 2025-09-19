// app/(public)/reset-password.web.tsx
import { Head } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

  const origin = useMemo(() => window.location.origin, []);

  // Sørg for at intet i resten af appen blokerer klik/fokus på denne side
  useEffect(() => {
    document.body.setAttribute("data-reset-password", "1");
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.pointerEvents = "auto";
    document.body.style.position = "static";
    document.body.style.webkitUserSelect = "auto";
    document.body.style.userSelect = "auto";
    return () => {
      document.body.removeAttribute("data-reset-password");
    };
  }, []);

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

    return () => subscription.subscription.unsubscribe();
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
    <>
      <Head>
        <title>Nyt kodeord</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <style>{`
          /* Læg hele reset-UI ovenpå alt andet for at omgå overlays */
          #reset-root {
            position: fixed;
            inset: 0;
            z-index: 2147483647; /* max */
            background: #0f1623;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            overflow: auto;
          }
          #reset-card {
            width: 100%;
            max-width: 460px;
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 16px;
            padding: 20px;
            box-sizing: border-box;
          }
          h1 {
            color: #e5e7eb;
            font-size: 22px;
            font-weight: 800;
            text-align: center;
            margin: 0 0 10px 0;
          }
          p {
            color: #94a3b8;
            text-align: center;
            margin: 0 0 12px 0;
          }
          .input {
            width: 100%;
            border-radius: 10px;
            border: 1px solid #233244;
            background: #0b1220;
            color: #e5e7eb;
            padding: 12px 12px;
            outline: none;
            font-size: 16px;
            -webkit-appearance: none;
            margin-bottom: 12px;
          }
          .btn {
            width: 100%;
            border-radius: 10px;
            border: 0;
            background: #22c55e;
            color: #0b1220;
            font-weight: 800;
            padding: 12px 12px;
            cursor: pointer;
          }
          .btn[disabled] { opacity: .6; cursor: default; }
          .linkRow { text-align: center; margin-top: 10px; }
          .alink { color: #93c5fd; text-decoration: underline; font-size: 14px; }
        `}</style>
      </Head>

      {/* Ren HTML – ingen RN <View> her */}
      <div id="reset-root">
        <form
          id="reset-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "request") sendResetMail();
            else changePassword();
          }}
        >
          <h1>Nyt kodeord</h1>
          <p>Indtast dit nye ønskede kodeord nedenfor.</p>

          {mode === "request" ? (
            <>
              <input
                className="input"
                type="email"
                placeholder="din@email.dk"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                inputMode="email"
                autoComplete="email"
                autoFocus
              />
              <button
                type="submit"
                className="btn"
                disabled={sending || !email.trim()}
              >
                {sending ? "Sender…" : "Send reset-mail"}
              </button>

              <div className="linkRow">
                <a className="alink" href="/LoginScreen">Tilbage til log ind</a>
              </div>
            </>
          ) : (
            <>
              <input
                className="input"
                type="password"
                placeholder="Nyt kodeord"
                value={newPass}
                onChange={(e) => setNewPass(e.currentTarget.value)}
                autoComplete="new-password"
                autoFocus
              />
              <input
                className="input"
                type="password"
                placeholder="Bekræft nyt kodeord"
                value={confirm}
                onChange={(e) => setConfirm(e.currentTarget.value)}
                autoComplete="new-password"
              />
              <button
                type="submit"
                className="btn"
                disabled={changing || !newPass || !confirm}
              >
                {changing ? "Gemmer…" : "Gem kodeord"}
              </button>

              <div className="linkRow">
                <a className="alink" href="/LoginScreen">Gå til log ind</a>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  );
}
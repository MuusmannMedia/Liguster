// app/index.web.tsx
import React, { useEffect, useState } from "react";

/**
 * RADIKAL TEST-LANDINGPAGE
 * - Helt hvid baggrund, gigantiske links og knapper
 * - Rene <a>-tags + JS-fallback-knapper (window.location.assign)
 * - Debugpanel der viser hydration + registrerer klik
 */

export default function TestLanding() {
  const [hydrated, setHydrated] = useState(false);
  const [clicks, setClicks] = useState<number>(0);

  useEffect(() => {
    setHydrated(true);

    // defensivt: sørg for at intet spærre pointer events
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      const body = document.body;
      const root = (document.getElementById("__next") || body) as HTMLElement;
      [html, body, root].forEach((el) => {
        el.style.pointerEvents = "auto";
        el.style.overflow = "auto";
      });

      const onDocClick = () => setClicks((n) => n + 1);
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }
  }, []);

  const go = (path: string) => {
    try {
      window.location.assign(path);
    } catch {
      // sidste udvej
      window.location.href = path;
    }
  };

  return (
    <div style={styles.page}>
      <style>{baseCss}</style>

      <div style={styles.wrap}>
        <h1 style={styles.h1}>Liguster — TEST LANDING</h1>
        <p style={styles.p}>
          Dette er en <b>radikal</b> testside. Links herunder er bevidst helt enkle, så vi kan tjekke routing.
        </p>

        {/* RENE <a>-LINKS (fuld reload) */}
        <div style={styles.block}>
          <h2 style={styles.h2}>Rene &lt;a&gt;-links</h2>
          <a className="biglink" href="/LoginScreen">/LoginScreen</a>
          <a className="biglink" href="/Nabolag">/Nabolag</a>
          <a className="biglink" href="/privacy">/privacy</a>
          <a className="biglink" href="/reset-password">/reset-password</a>
        </div>

        {/* JS-FALLBACK-KNAPPER */}
        <div style={styles.block}>
          <h2 style={styles.h2}>JS-fallback knapper</h2>
          <button className="bigbtn" onClick={() => go("/LoginScreen")}>
            Gå til /LoginScreen (window.location.assign)
          </button>
          <button className="bigbtn" onClick={() => go("/Nabolag")}>
            Gå til /Nabolag (window.location.assign)
          </button>
          <button className="bigbtn" onClick={() => go("/privacy")}>
            Gå til /privacy (window.location.assign)
          </button>
          <button className="bigbtn" onClick={() => go("/reset-password")}>
            Gå til /reset-password (window.location.assign)
          </button>
        </div>

        {/* DEBUG */}
        <div style={styles.debug}>
          <div>Hydrated: <b>{hydrated ? "YES" : "NO"}</b></div>
          <div>Document click events registreret: <b>{clicks}</b></div>
          <div>Origin: <code>{typeof window !== "undefined" ? window.location.origin : "-"}</code></div>
        </div>
      </div>
    </div>
  );
}

const baseCss = `
  html, body, #__next { height: 100%; background:#ffffff; }
  .biglink {
    display:block;
    margin:10px 0;
    padding:20px 24px;
    font-size:24px;
    font-weight:800;
    text-decoration:none;
    color:#0b1220;
    border:2px solid #0b1220;
    border-radius:14px;
  }
  .biglink:active { transform: translateY(1px); }
  .bigbtn {
    display:block;
    width:100%;
    margin:10px 0;
    padding:18px 24px;
    font-size:18px;
    font-weight:900;
    color:#ffffff;
    background:#0b1220;
    border:0;
    border-radius:14px;
  }
  .bigbtn:active { transform: translateY(1px); }
`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#0b1220",
    pointerEvents: "auto",
  },
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "32px 20px 80px",
  },
  h1: { margin: 0, fontSize: 40, fontWeight: 900 },
  h2: { margin: "18px 0 8px", fontSize: 18 },
  p: { fontSize: 16, lineHeight: 1.5 },
  block: { marginTop: 18, paddingTop: 8, borderTop: "1px solid #e5e7eb" },
  debug: {
    marginTop: 28,
    padding: 16,
    border: "2px dashed #94a3b8",
    borderRadius: 12,
    background: "#f8fafc",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};
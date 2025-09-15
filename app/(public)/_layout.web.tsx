// app/(public)/_layout.web.tsx
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";

export default function PublicWebLayout() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 719;
  });

  useEffect(() => {
    // Make absolutely sure nothing is swallowing clicks:
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      const body = document.body;
      const root = (document.getElementById("__next") || body) as HTMLElement;

      [html, body, root].forEach((el) => {
        el.style.pointerEvents = "auto";
        el.style.overflow = "auto";
      });
    }

    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 719px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    handler(mq);
    mq.addEventListener?.("change", handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener?.("change", handler as (e: MediaQueryListEvent) => void);
  }, []);

  return (
    <div style={styles.page}>
      <style>{baseCss}</style>

      <nav className="nav">
        <a className="brand" href="/">
          <img src="/liguster-logo-website-clean.png" alt="Liguster" height={28} />
        </a>

        <div className="right">
          <a className="btn" href="/LoginScreen">Log ind</a>
        </div>
      </nav>

      {/* Keep content below the sticky nav and ensure it’s clickable */}
      <main className="content" role="main" style={{ pointerEvents: "auto" }}>
        <Slot />
      </main>
    </div>
  );
}

const baseCss = `
  * { box-sizing: border-box; }
  html, body, #__next { height: 100%; pointer-events: auto !important; }
  a, [role=link], button { cursor: pointer; }
  .nav { height:64px; background:#0b1220; border-bottom:1px solid #1e293b;
         padding:0 24px; display:flex; align-items:center; justify-content:space-between;
         position:sticky; top:0; z-index:1000; }
  .brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
  .right { display:flex; align-items:center; gap:16px; }
  .btn  { padding:8px 12px; border:1px solid #334155; border-radius:10px;
          color:#e2e8f0; text-decoration:none; font-weight:700; }
  .content { margin-top: 8px; min-height: calc(100vh - 64px); }
`;

const styles = {
  page: { backgroundColor: "#7C8996", minHeight: "100vh" } as React.CSSProperties,
};
// app/(protected)/_layout.web.tsx
import { Slot, router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { supabase } from "../../utils/supabase";

export default function ProtectedWebLayout() {
  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace("/"); // tilbage til landing efter log ud
    }
  }, []);

  const Logo = useMemo(
    () => (
      <a className="brand" href="/Nabolag" aria-label="Liguster – Nabolag">
        <img
          src="/liguster-logo-website-clean.png"
          alt="Liguster"
          height={22}
          style={{ display: "block" }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            // fallback til evt. stort L i Assets hvis navn/case adskiller sig
            if (!el.dataset.triedFallback) {
              el.dataset.triedFallback = "1";
              el.src = "/Liguster-logo-website-clean.png";
            } else {
              el.style.display = "none";
              const txt = el.nextElementSibling as HTMLSpanElement | null;
              if (txt) txt.style.display = "inline-block";
            }
          }}
        />
        <span
          style={{
            display: "none",
            color: "#e2e8f0",
            fontWeight: 800,
            letterSpacing: 0.5,
            fontSize: 16,
          }}
        >
          Liguster
        </span>
      </a>
    ),
    []
  );

  return (
    <div className="page">
      <style>{baseCss}</style>

      <nav className="nav">
        {Logo}

        <div className="right">
          <a className="link" href="/Nabolag">Nabolag</a>
          <a className="link" href="/Forening">Forening</a>
          <a className="link" href="/Beskeder">Beskeder</a>
          <button className="logout" onClick={handleLogout}>Log ud</button>
        </div>
      </nav>

      <main className="content">
        <Slot />
      </main>
    </div>
  );
}

const baseCss = `
  .page { min-height: 100vh; background:#7C8996; }
  .nav {
    height:64px; background:#0b1220; border-bottom:1px solid #1e293b;
    padding:0 24px; display:flex; align-items:center; justify-content:space-between;
    position:sticky; top:0; z-index:100;
  }
  .brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
  .right { display:flex; align-items:center; gap:12px; }
  .link {
    color:#cbd5e1; text-decoration:none; font-size:14px; padding:6px 8px; border-radius:8px;
  }
  .link:hover { background:#111827; }
  .logout {
    padding:8px 10px; border:1px solid #334155; border-radius:10px;
    background:#0f172a; color:#e2e8f0; font-weight:800; cursor:pointer;
  }
  .logout:hover { filter: brightness(1.1); }
  .content { padding-top: 14px; }
  @media (max-width: 719px) {
    .right { gap:8px; }
    .link { display:none; } /* hold topnav kompakt på mobil, kun Log ud */
  }
`;
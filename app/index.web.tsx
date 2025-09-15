// app/index.web.tsx
import React from "react";

export default function TestLanding() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>🚧 TEST SIDE 🚧</h1>
      <p style={styles.p}>
        Hvis du kan se denne tekst, kører vi <b>den rigtige index.web.tsx</b>.
      </p>

      <a href="https://www.google.com" style={styles.link}>
        Klik her for at gå til Google
      </a>

      <p style={styles.note}>
        Hvis linket ikke virker → så er det ikke koden, men Vercel/rewrites der
        blokerer.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    gap: "20px",
  },
  h1: { fontSize: "48px", margin: 0 },
  p: { fontSize: "20px", margin: 0 },
  link: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0b57d0",
    textDecoration: "underline",
  },
  note: { marginTop: "40px", fontSize: "16px", color: "#666" },
};
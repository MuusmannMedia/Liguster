// app/(public)/index.web.tsx
export default function TestLanding() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>🚧 ABSOLUT TEST 🚧</h1>
      <p style={styles.p}>Denne side kommer fra <b>app/(public)/index.web.tsx</b>.</p>

      <a href="https://www.google.com" style={styles.link}>→ Gå til Google</a>

      <p style={styles.note}>
        Ser du stadig den gamle hero-side, har du en anden <code>index</code>-route i projektet
        som “vinder”, eller bygget artefakt er ikke opdateret.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    color: "#111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    gap: "20px",
  },
  h1: { fontSize: "48px", margin: 0 },
  p: { fontSize: "20px", margin: 0, textAlign: "center" },
  link: { fontSize: "24px", fontWeight: 700, color: "#0b57d0", textDecoration: "underline" },
  note: { marginTop: "40px", fontSize: "16px", color: "#666", maxWidth: 720, textAlign: "center" },
};
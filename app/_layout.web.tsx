// app/index.web.tsx
import { Link, router } from "expo-router";
import React, { useEffect } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import LogoNEG from "../assets/images/Liguster-logo-NEG.png";

export default function WebLanding() {
  useEffect(() => {
    // Kun debug – må gerne slettes
    console.log("EXPO_PUBLIC_SUPABASE_URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log(
      "EXPO_PUBLIC_SUPABASE_ANON_KEY:",
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? "•sat•" : "•mangler•"
    );
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <View style={styles.heroCol}>
            <Text style={styles.heroTitle}>Nabolaget – samlet ét sted</Text>
            <Text style={styles.heroSubtitle}>
              Hjælp hinanden, lån ting, del arrangementer og hold styr på foreningen.
              Liguster samler hverdagen i dit nabolag.
            </Text>

            <Text style={styles.heroNote}>
              Webudgaven er under udvikling. Har du allerede en konto, kan du logge ind nedenfor.
            </Text>

            <View style={styles.inlineLinks}>
              <Link href="/privacy" asChild>
                <Pressable><Text style={styles.inlineLink}>Privacy Policy</Text></Pressable>
              </Link>
            </View>
          </View>

          <View style={styles.heroCol}>
            <Image source={LogoNEG} style={styles.heroImage} resizeMode="contain" />
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <View style={styles.columns}>
          <Feature title="Opslag & hjælp" text="Efterlys hjælp, tilbyd din hånd eller del ting væk. Alt samlet i nabolaget." />
          <Feature title="Foreninger" text="Medlemslister, kalender, opslag og beskeder – nemt for bestyrelsen." />
          <Feature title="Beskeder" text="Hold samtalen i appen – både 1:1 og i grupper." />
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <Text style={styles.bottomCtaTitle}>Klar til at logge ind?</Text>
        <View style={styles.bottomCtaRow}>
          <Link href="/LoginScreen" asChild>
            <Pressable><Text style={styles.bottomLink}>Log ind</Text></Pressable>
          </Link>
          <Text style={styles.dot}>·</Text>
          <Link href="/privacy" asChild>
            <Pressable><Text style={styles.bottomLink}>Privacy Policy</Text></Pressable>
          </Link>
        </View>

        {/* Bonus: direkte knap til Nabolag uden login */}
        <View style={{ marginTop: 8 }}>
          <Pressable onPress={() => router.push("/Nabolag")}>
            <Text style={[styles.bottomLink, { textDecorationLine: "underline" }]}>
              Se opslag uden login
            </Text>
          </Pressable>
        </View>

        <Text style={styles.copy}>© {new Date().getFullYear()} Liguster</Text>
      </View>
    </ScrollView>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#0f1623" },

  hero: { paddingVertical: 56, backgroundColor: "#0f1623" },
  heroInner: {
    maxWidth: 1200, width: "100%", alignSelf: "center",
    paddingHorizontal: 24, gap: 32, flexDirection: "row", flexWrap: "wrap",
  },
  heroCol: { flex: 1, minWidth: 300, justifyContent: "center" },
  heroTitle: { color: "white", fontSize: 42, fontWeight: "800", marginBottom: 12 },
  heroSubtitle: { color: "#cbd5e1", fontSize: 18, lineHeight: 26, marginBottom: 16, maxWidth: 560 },
  heroNote: { color: "#94a3b8", fontSize: 13, marginTop: 10 },
  heroImage: { width: "100%", height: 320 },
  inlineLinks: { flexDirection: "row", gap: 16, marginTop: 12 },
  inlineLink: { color: "#93c5fd", textDecorationLine: "underline", fontSize: 14 },

  section: { backgroundColor: "#0f1623", paddingVertical: 40 },
  columns: {
    maxWidth: 1200, width: "100%", alignSelf: "center",
    paddingHorizontal: 24, gap: 24, flexDirection: "row", flexWrap: "wrap",
  },
  feature: {
    flex: 1, minWidth: 260, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937",
    padding: 20, borderRadius: 16,
  },
  featureTitle: { color: "#e2e8f0", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  featureText: { color: "#94a3b8", lineHeight: 20 },

  bottomCta: {
    backgroundColor: "#0b1220", borderTopWidth: 1, borderTopColor: "#1f2937",
    paddingVertical: 36, paddingHorizontal: 24, alignItems: "center", gap: 8,
  },
  bottomCtaTitle: { color: "#e2e8f0", fontWeight: "800", fontSize: 20 },
  bottomCtaRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  bottomLink: { color: "#cbd5e1", fontSize: 14 },
  dot: { color: "#475569", fontSize: 18, marginHorizontal: 4, marginTop: -2 },
  copy: { color: "#64748b", fontSize: 12, marginTop: 6 },
});
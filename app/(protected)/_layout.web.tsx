// app/(protected)/_layout.web.tsx
import { Link, Slot, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const LINKS = [
  { label: "Nabolag",     href: "/Nabolag" },
  { label: "Forening",    href: "/forening" },   // tilpas hvis din fil/rute hedder andet
  { label: "Beskeder",    href: "/Beskeder" },
  { label: "Mine opslag", href: "/MineOpslag" },
  { label: "Mig",         href: "/Mig" },
];

function TopNav() {
  const pathname = usePathname();
  return (
    <View style={styles.navWrap}>
      <View style={styles.nav}>
        <Text style={styles.brand}>Liguster</Text>
        <View style={styles.links}>
          {LINKS.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/Nabolag" && pathname?.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} asChild>
                <TouchableOpacity
                  accessibilityRole="link"
                  style={[styles.linkBtn, active && styles.linkBtnActive]}
                >
                  <Text style={[styles.linkText, active && styles.linkTextActive]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function ProtectedWebLayout() {
  return (
    <View style={styles.page}>
      <TopNav />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#7C8996" },

  navWrap: {
    position: "sticky" as any,
    top: 0,
    zIndex: 100,
    backgroundColor: "#0b1220",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  nav: {
    height: 56,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.2 },
  links: { flexDirection: "row", gap: 6, alignItems: "center" },

  linkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  linkBtnActive: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#243244",
  },
  linkText: { color: "#cbd5e1", fontWeight: "700", fontSize: 14 },
  linkTextActive: { color: "#fff" },

  content: { paddingTop: 14 },
});
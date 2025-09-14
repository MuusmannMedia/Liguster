// app/(protected)/_layout.tsx
import { Stack } from "expo-router"; // <-- korrekt import
import React from "react";
import { Platform } from "react-native";

/** Layout for alle beskyttede skærme (kræver login). */
export default function ProtectedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: Platform.OS === "web" ? { backgroundColor: "#0f172a" } : undefined,
      }}
    />
  );
}

// (valgfrit) vælg initial route for gruppen
export const unstable_settings = { initialRouteName: "Nabolag" };
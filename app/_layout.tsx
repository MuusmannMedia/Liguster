// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

/** Root layout shared by web & native; group layouts take over inside */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
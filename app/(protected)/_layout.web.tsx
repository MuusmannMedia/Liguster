// app/(protected)/_layout.web.tsx
import { Slot } from "expo-router";

/**
 * Ultra-minimalt layout til web.
 * Viser bare børnene (ruterne) – ingen Stack, ingen header.
 */
export default function ProtectedWebLayout() {
  return <Slot />;
}
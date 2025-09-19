// utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

// Detekterer web vs. native uden at importere Platform
const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

type ExtraCfg = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

const extra = (Constants?.expoConfig?.extra ?? {}) as ExtraCfg;

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[supabase] Mangler SUPABASE_URL eller SUPABASE_ANON_KEY – tjek app.json under expo.extra eller EXPO_PUBLIC_* env vars."
  );
}

/**
 * VIGTIGT for reset-password flow:
 *  - På WEB: detectSessionInUrl = true  (så 'type=recovery' fra mail-URL fanges)
 *  - På NATIVE: detectSessionInUrl = false
 */
export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: isWeb,     // ← nøglelinje
    storageKey: "liguster-auth",   // valgfri: stabil nøgle til storage
    // flowType: "pkce",           // valgfri: brug PKCE hvis du senere kører OAuth på native m. deep links
  },
});
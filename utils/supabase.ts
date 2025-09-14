// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

const extra = (Constants?.expoConfig?.extra ?? {}) as {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] Mangler SUPABASE_URL eller SUPABASE_ANON_KEY – tjek app.json under expo.extra eller EXPO_PUBLIC_* env vars.'
  );
}

export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
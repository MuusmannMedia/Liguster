// app/_layout.native.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen"; // ✅ korrekt import
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { enableFreeze, enableScreens } from "react-native-screens";

enableScreens(false);
enableFreeze(false);

// Hold splash til root-view er klar (guarder hvis API ikke findes)
try {
  // @ts-ignore
  SplashScreen?.preventAutoHideAsync?.();
} catch {}

import { useColorScheme } from "../hooks/useColorScheme";
import useRegisterPushToken from "../hooks/useRegisterPushToken";
import { useSession } from "../hooks/useSession";
import { supabase } from "../utils/supabase";

/* ---------- Global JS error handler (once) ---------- */
if (typeof (global as any).__LigusterGlobalErrorHandler === "undefined") {
  (global as any).__LigusterGlobalErrorHandler = true;
  const defaultHandler = (ErrorUtils as any)?.getGlobalHandler?.();
  (ErrorUtils as any)?.setGlobalHandler?.((e: any, isFatal?: boolean) => {
    try {
      const msg = e?.message ?? String(e);
      Alert.alert("Uventet fejl", msg.slice(0, 300));
    } catch {}
    defaultHandler?.(e, isFatal);
  });
}

/* ---------- Supabase deep link handler ---------- */
function useSupabaseDeepLinking() {
  useEffect(() => {
    const onUrl = async ({ url }: { url: string }) => {
      try {
        await supabase.auth.exchangeCodeForSession(url);
      } catch (err) {
        console.error("exchangeCodeForSession failed", err);
      }
    };
    const sub = Linking.addEventListener("url", onUrl);
    Linking.getInitialURL().then((url) => { if (url) onUrl({ url }); });
    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({ SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf") });

  const { session } = useSession();
  const userId = session?.user?.id ?? null;

  useRegisterPushToken(userId ?? undefined);
  useSupabaseDeepLinking();

  const [isReady, setReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (!isReady) {
      setReady(true);
      try {
        // @ts-ignore
        await SplashScreen?.hideAsync?.();
      } catch {}
    }
  }, [isReady]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Mal baggrund helt fra start så Expo Go ikke kan vise hvid */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#7C8996" }]} pointerEvents="none" />

      <View style={styles.root} onLayout={onLayoutRootView}>
        <StatusBar style="light" animated={false} translucent={false} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            ...(Platform.OS === "ios" ? ({ stackAnimation: "none" } as const) : {}),
            detachPreviousScreen: false,
            freezeOnBlur: false,
            // Sørg for at scene-container har korrekt baggrund
            contentStyle: { backgroundColor: "#7C8996" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="LoginScreen" />
          <Stack.Screen name="OpretBruger" />
          <Stack.Screen name="Nabolag" />
          <Stack.Screen name="MigScreen" />
          <Stack.Screen name="OpretOpslag" />
          <Stack.Screen name="ForeningerScreen" />
          <Stack.Screen name="MineOpslag" />
          <Stack.Screen name="Beskeder" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#7C8996" },
});
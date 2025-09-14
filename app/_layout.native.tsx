import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useColorScheme } from "../hooks/useColorScheme";
import useRegisterPushToken from "../hooks/useRegisterPushToken";
import { useSession } from "../hooks/useSession";

/**
 * Native-specific root wrapper.
 * IMPORTANT: Do NOT manually list <Stack.Screen name="…"/> here when using
 * file-based routing. Let Expo Router discover files. This prevents the
 * “element type is invalid” crash after HMR.
 */
export default function RootLayoutNative() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { session } = useSession();
  const userId = session?.user?.id ?? null;
  useRegisterPushToken(userId ?? undefined); // no-op on web

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        <StatusBar style="light" />
        {/* single Stack – let files register themselves */}
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#7C8996" },
});
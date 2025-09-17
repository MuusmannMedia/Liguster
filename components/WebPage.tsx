import React, { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";

type Props = PropsWithChildren<{ title?: string; description?: string }>;

// Load <Head> kun på web
let Head: any = null;
if (Platform.OS === "web") {
  try {
    Head = require("expo-router/head").default;
  } catch {
    Head = null;
  }
}

export default function WebPage({ title, description, children }: Props) {
  // Native: no-op wrapper for at undgå første-render artefakter
  if (Platform.OS !== "web") return <>{children}</>;

  return (
    <View style={styles.page}>
      {Head ? (
        <Head>
          {title ? <title>{title}</title> : null}
          {description ? <meta name="description" content={description} /> : null}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
      ) : null}
      <View style={styles.container}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f1623", minHeight: "calc(100vh - 64px)" },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
});
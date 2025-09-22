// app/_layout.web.tsx
import { Stack } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function RootWebLayout() {
  return (
    <View style={styles.page}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7C8996" />
        <style>{`
          /* Basal reset + baggrund */
          html, body, #root, #__next {
            height: 100%;
            margin: 0;
            background: #7C8996;
            /* Sikr at intet “låser” klik */
            pointer-events: auto !important;
            position: static !important;
            overflow: auto !important;
          }

          /* Slå ALLE CSS-animationer/transitions fra globalt */
          * { animation: none !important; transition: none !important; }

          /* --- Reset-password fail-safe ---
             Når reset-siden er aktiv, sørger vi for at INTET overlay blokerer klik/fokus.
             body[data-reset-password] sættes/ryddes inde i selve reset-password.web.tsx
          */
          body[data-reset-password],
          body[data-reset-password] * {
            pointer-events: auto !important;
          }

          /* Skjul potentielle overlays/nav/footers hvis de stadig er i DOM'en */
          body[data-reset-password] header,
          body[data-reset-password] nav,
          body[data-reset-password] footer,
          body[data-reset-password] .footer,
          body[data-reset-password] .bottom-nav,
          body[data-reset-password] [data-footer],
          body[data-reset-password] [role="banner"],
          body[data-reset-password] [role="contentinfo"] {
            display: none !important;
          }

          /* Løft inputs/knapper/links i stacking-order på reset-siden (iOS Safari især) */
          body[data-reset-password] input,
          body[data-reset-password] button,
          body[data-reset-password] a,
          body[data-reset-password] label,
          body[data-reset-password] select,
          body[data-reset-password] textarea {
            position: relative; z-index: 1000;
          }
        `}</style>
      </Head>

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          // @ts-expect-error – web accepterer denne via shim
          stackAnimation: "none",
          detachPreviousScreen: false,
          freezeOnBlur: false,
          presentation: "card",
          contentStyle: { backgroundColor: "#7C8996" },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#7C8996" },
});
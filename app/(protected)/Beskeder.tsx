// app/(protected)/Beskeder.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import BottomNav from "../../components/BottomNav";
import useBeskeder from "../../hooks/useBeskeder";

type ThreadItem = {
  thread_id: string;
  post_id: string | null;
  sender_id: string;
  receiver_id: string;
  text: string;
  posts?: { overskrift?: string | null; omraade?: string | null } | null;
};

export default function BeskederScreen() {
  const { userId, threads, loading, deleteThread, refresh } = useBeskeder();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Opdater liste når skærmen får fokus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const isTablet =
    (Platform.OS === "ios" && (Platform as any)?.isPad) ||
    Math.min(width, height) >= 768;

  const OUTER_PADDING = 16;
  const GAP = 12;
  const numColumns = isTablet ? 2 : 1;

  const cardWidth =
    numColumns === 1
      ? Math.min(420, width - OUTER_PADDING * 2)
      : (width - OUTER_PADDING * 2 - GAP) / 2;

  const goToChat = useCallback(
    (item: ThreadItem) => {
      if (!item?.thread_id) return;

      const otherUserId =
        item.sender_id === userId ? item.receiver_id : item.sender_id;

      // Hvis ChatScreen ligger i (protected), brug denne path:
      router.push({
        pathname: "/(protected)/ChatScreen",
        params: {
          threadId: item.thread_id,
          postId: item.post_id ?? "",
          otherUserId: otherUserId ?? "",
        },
      });

      // Hvis din ChatScreen i stedet ligger i /app/ (uden for gruppen),
      // så skift pathname til "/ChatScreen".
    },
    [router, userId]
  );

  const renderItem = useCallback(
    ({ item }: { item: ThreadItem }) => (
      <View style={[styles.card, { width: cardWidth }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={() => goToChat(item)}>
          <View style={styles.titleBox}>
            <Text style={styles.titleText}>
              {item?.posts?.overskrift || "UKENDT OPSLAG"}
            </Text>
          </View>

          <Text style={styles.omraade}>{item?.posts?.omraade || ""}</Text>

          <Text style={styles.besked} numberOfLines={2} ellipsizeMode="tail">
            {item?.text ?? ""}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.laesBtn} onPress={() => goToChat(item)}>
            <Text style={styles.laesBtnText}>LÆS BESKED</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteThread(item.thread_id)}
          >
            <Text style={styles.deleteBtnText}>SLET</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [cardWidth, goToChat, deleteThread]
  );

  const listData = useMemo(() => threads as ThreadItem[], [threads]);

  return (
    <View style={styles.root}>
      {loading ? (
        <ActivityIndicator size="large" color="#254890" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={listData}
          key={numColumns} // tving re-layout når kolonner skifter
          keyExtractor={(item) => String(item.thread_id)}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingTop: 60,
            paddingHorizontal: OUTER_PADDING,
            ...(numColumns === 1 ? { alignItems: "center" } : null),
          }}
          columnWrapperStyle={
            numColumns > 1 ? { justifyContent: "space-between", gap: GAP } : undefined
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Du har ingen beskeder endnu.</Text>
          }
        />
      )}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#7C8996" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    flexDirection: "column",
    alignItems: "flex-start",
  },

  titleBox: {
    backgroundColor: "#131921",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  titleText: { fontSize: 15, fontWeight: "bold", color: "#fff" },

  omraade: { color: "#222", fontSize: 15, fontWeight: "600", marginBottom: 8 },

  besked: { color: "#111", fontSize: 15, marginBottom: 18, marginTop: 2, lineHeight: 21 },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    gap: 16,
  },
  laesBtn: {
    backgroundColor: "#131921",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-end",
    elevation: 1,
  },
  laesBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13, letterSpacing: 1 },

  deleteBtn: {
    backgroundColor: "#e34141",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-end",
    elevation: 1,
  },
  deleteBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13, letterSpacing: 1 },

  emptyText: { color: "#fff", marginTop: 22, alignSelf: "center" },
});
// app/Beskeder.tsx
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import useBeskeder from "../hooks/useBeskeder";

type ThreadItem = {
  thread_id: string;
  post_id?: string | null;
  sender_id: string;
  receiver_id: string;
  text?: string | null;
  posts?: { overskrift?: string | null; omraade?: string | null } | null;
};

const BG = "#7C8996";

export default function BeskederScreen() {
  const { userId, threads, loading, deleteThread, refresh } = useBeskeder();
  const nav = useNavigation<any>();
  const { width, height } = useWindowDimensions();

  // 1 kolonne på mobil, 2 på små tablets, 3 på iPad 13"+
  const isPhone = Math.min(width, height) < 650;
  const NUM_COLS = isPhone ? 1 : width >= 1024 ? 3 : 2;

  const OUTER = 16;
  const GAP = 12;
  const innerWidth = Math.max(0, width - OUTER * 2);
  const cardWidth =
    NUM_COLS === 1
      ? Math.min(420, innerWidth)
      : (innerWidth - GAP * (NUM_COLS - 1)) / NUM_COLS;

  // Genindlæs når skærmen får fokus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const renderItem = ({ item, index }: { item: ThreadItem; index: number }) => (
    <View style={[styles.card, { width: cardWidth, marginBottom: index === threads.length - 1 ? 0 : 18 }]}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.85}
        onPress={() =>
          nav.navigate("ChatScreen", {
            threadId: item.thread_id,
            postId: item.post_id,
            otherUserId: item.sender_id === userId ? item.receiver_id : item.sender_id,
          })
        }
      >
        <Text style={styles.title}>{item.posts?.overskrift || "UKENDT OPSLAG"}</Text>
        {!!item.posts?.omraade && <Text style={styles.place}>{item.posts.omraade}</Text>}
        {!!item.text && (
          <Text style={styles.snippet} numberOfLines={2} ellipsizeMode="tail">
            {item.text}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() =>
            nav.navigate("ChatScreen", {
              threadId: item.thread_id,
              postId: item.post_id,
              otherUserId: item.sender_id === userId ? item.receiver_id : item.sender_id,
            })
          }
        >
          <Text style={styles.readBtnText}>LÆS BESKED</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteThread(item.thread_id)}>
          <Text style={styles.deleteBtnText}>SLET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["left", "right", "bottom", "top"]} // gør baggrunden 100% ens
    >
      {loading ? (
        <ActivityIndicator size="large" color="#254890" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={threads as ThreadItem[]}
          key={`cols-${NUM_COLS}`} // tving layoutskifte når kolonneantal ændres
          keyExtractor={(it, i) => it?.thread_id ?? String(i)}
          numColumns={NUM_COLS}
          style={styles.list}

          /* 🔒 Slå alle auto-insets fra for at undgå “ramme” første visning */
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          automaticallyAdjustsScrollIndicatorInsets={false}
          scrollIndicatorInsets={{ top: 0, left: 0, bottom: 0, right: 0 }}

          /* Brug spacers i stedet for paddingTop/Bottom (iOS ændrer ikke disse) */
          ListHeaderComponent={<View style={{ height: 16 }} />}
          ListFooterComponent={<View style={{ height: 90 }} />}

          contentContainerStyle={{
            paddingHorizontal: OUTER,
            ...(NUM_COLS === 1 ? { alignItems: "center" } : null),
            backgroundColor: BG,
          }}
          columnWrapperStyle={NUM_COLS > 1 ? { gap: GAP } : undefined}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Du har ingen beskeder endnu.</Text>}
          removeClippedSubviews={Platform.OS === "android"} // lidt jank-reducering
          initialNumToRender={10}
          windowSize={5}
        />
      )}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  list: { flex: 1, width: "100%", backgroundColor: "transparent" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: "flex-start",
  },

  title: { fontSize: 20, fontWeight: "700", color: "#131921", marginBottom: 6 },
  place: { color: "#222", fontSize: 15, fontWeight: "600", marginBottom: 8 },
  snippet: { color: "#111", fontSize: 15, marginBottom: 18, marginTop: 2, lineHeight: 21 },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    gap: 16,
  },
  readBtn: {
    backgroundColor: "#131921",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    elevation: 1,
  },
  readBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13, letterSpacing: 1 },
  deleteBtn: {
    backgroundColor: "#e34141",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    elevation: 1,
  },
  deleteBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13, letterSpacing: 1 },

  empty: { color: "#fff", marginTop: 22, alignSelf: "center" },
});
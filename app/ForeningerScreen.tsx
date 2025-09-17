// app/ForeningerScreen.tsx
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import BottomNav from "../components/BottomNav";
import { useAlleForeninger, useMineForeninger } from "../hooks/useForeninger";
import { useSession } from "../hooks/useSession";
import { Forening } from "./types/forening";

export default function ForeningerScreen() {
  const [visning, setVisning] = useState<"mine" | "alle">("mine");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user?.id;

  const { data: alleForeninger = [], loading: loadingAlle } = useAlleForeninger(refreshKey);
  const { data: mineForeninger = [], loading: loadingMine } = useMineForeninger(userId, refreshKey);

  const foreninger: Forening[] = visning === "mine" ? mineForeninger : alleForeninger;
  const loading = visning === "mine" ? loadingMine : loadingAlle;

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
      return () => {};
    }, [])
  );

  const onPullToRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    requestAnimationFrame(() => setRefreshing(false));
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return foreninger ?? [];
    return (foreninger ?? []).filter((f) => {
      const navn = (f?.navn ?? "").toLowerCase();
      const sted = (f?.sted ?? "").toLowerCase();
      const beskrivelse = (f?.beskrivelse ?? "").toLowerCase();
      return navn.includes(s) || sted.includes(s) || beskrivelse.includes(s);
    });
  }, [foreninger, search]);

  // Responsive: telefon = 1 kolonne fuld bredde; tablets = grid
  const { width } = useWindowDimensions();
  const isPhone = width < 650;
  const NUM_COLS = isPhone ? 1 : width >= 900 ? 3 : 2;
  const GRID_GAP = 18;
  const H_PADDING = 14;
  const isGrid = !isPhone;
  const itemWidth = isGrid
    ? (width - H_PADDING * 2 - GRID_GAP * (NUM_COLS - 1)) / NUM_COLS
    : "100%";

  // Billedhøjde (ens for alle kort)
  const imageHeight = 200;

  // Tekstblok-højde: 1 linje navn + 1 linje sted + 2 linjer beskrivelse + små gaps
  const NAME_LH = 20;
  const PLACE_LH = 18;
  const DESC_LH = 18;
  const GAP_AFTER_NAME = 2;
  const GAP_AFTER_PLACE = 4;
  const TEXT_BLOCK_HEIGHT = NAME_LH + GAP_AFTER_NAME + PLACE_LH + GAP_AFTER_PLACE + (DESC_LH * 2);

  return (
    <View style={styles.root}>
      {/* Søg + plus */}
      <View style={[styles.searchRow, { paddingHorizontal: H_PADDING }]}>
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Søg i foreninger…"
            placeholderTextColor="#a1a9b6"
            returnKeyType="search"
          />
          <Feather name="search" size={21} color="#254890" style={styles.searchIcon} />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.87}
        >
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Skift MINE/ALLE */}
      <View style={[styles.switchRow, { paddingHorizontal: H_PADDING }]}>
        <TouchableOpacity
          style={[styles.switchBtn, visning === "mine" && styles.switchBtnActive]}
          onPress={() => setVisning("mine")}
        >
          <Text style={[styles.switchText, visning === "mine" && styles.switchTextActive]}>
            MINE FORENINGER
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, visning === "alle" && styles.switchBtnActive]}
          onPress={() => setVisning("alle")}
        >
          <Text style={[styles.switchText, visning === "alle" && styles.switchTextActive]}>
            ALLE FORENINGER
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          key={NUM_COLS}
          keyExtractor={(item: Forening) => item.id}
          numColumns={NUM_COLS}
          columnWrapperStyle={isGrid ? { gap: GRID_GAP, paddingHorizontal: H_PADDING } : undefined}
          contentContainerStyle={{
            paddingBottom: 90,
            paddingHorizontal: isPhone ? H_PADDING : 0,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onPullToRefresh} tintColor="#fff" />
          }
          renderItem={({ item }) => {
            const wrapStyle = isGrid
              ? { width: itemWidth as number, marginBottom: 18 }
              : { width: "100%", marginBottom: 17 };
            return (
              <TouchableOpacity
                onPress={() => router.push(`/forening/${item.id}`)}
                activeOpacity={0.87}
                style={wrapStyle}
              >
                <View style={styles.card}>
                  {!!item.billede_url && (
                    <Image
                      source={{ uri: item.billede_url }}
                      style={[styles.img, { height: imageHeight }]}
                    />
                  )}

                  {/* FAST TEKST-BLOK */}
                  <View style={[styles.textBlock, { height: TEXT_BLOCK_HEIGHT }]}>
                    <Text
                      style={[styles.navn, { lineHeight: NAME_LH, marginBottom: GAP_AFTER_NAME }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.navn}
                    </Text>

                    <Text
                      style={[styles.sted, { lineHeight: PLACE_LH, marginBottom: GAP_AFTER_PLACE }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.sted}
                    </Text>

                    <Text
                      style={[styles.beskrivelse, { lineHeight: DESC_LH }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.beskrivelse || " "}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ color: "#fff", marginTop: 40, textAlign: "center" }}>
              {visning === "mine"
                ? "Du er endnu ikke medlem af nogen foreninger."
                : "Ingen foreninger fundet."}
            </Text>
          }
        />
      )}

      {/* Modal til oprettelse – uændret */}
      {showCreate && (
        <CreateForeningModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          userId={userId}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}

      <BottomNav />
    </View>
  );
}

/* resten af din CreateForeningModal er uændret */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#7C8996", paddingTop: 60 },

  // Top controls
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 7 },
  searchWrap: { flex: 1, position: "relative" },
  searchInput: {
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#222",
    borderWidth: 1,
    borderColor: "#dde1e8",
  },
  searchIcon: { position: "absolute", right: 12, top: 11 },
  addBtn: {
    height: 44,
    width: 44,
    borderRadius: 8,
    backgroundColor: "#131921",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    gap: 10,
  },
  switchBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  switchBtnActive: { backgroundColor: "#131921", borderWidth: 3, borderColor: "#fff" },
  switchText: { color: "#131921", fontWeight: "bold", fontSize: 10, letterSpacing: 0.5 },
  switchTextActive: { color: "#fff", fontWeight: "bold" },

  // Cards
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  img: { width: "100%", borderRadius: 9, marginBottom: 6, resizeMode: "cover" },

  // Fast tekstblok under billedet
  textBlock: {
    width: "100%",
    justifyContent: "flex-start",
  },
  navn: { fontWeight: "bold", fontSize: 16, color: "#131921" },
  sted: { color: "#444", fontSize: 15, fontWeight: "600" },
  beskrivelse: { color: "#666", fontSize: 14 },

  // Modal (uændret)
  modalBackdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(40,50,60,0.43)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modalContent: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 7,
  },
  modalTitle: { fontWeight: "bold", fontSize: 22, color: "#254890", marginBottom: 13, textAlign: "center" },
  fieldLabel: { fontSize: 15, fontWeight: "bold", color: "#254890", marginBottom: 2, marginTop: 6 },
  modalInput: {
    backgroundColor: "#f3f3f7",
    borderRadius: 7,
    padding: 9,
    fontSize: 17,
    color: "#222",
    borderWidth: 1,
    borderColor: "#dde1e8",
    marginBottom: 8,
  },
  modalBtn: { flex: 1, backgroundColor: "#254890", borderRadius: 7, padding: 13, alignItems: "center" },
});
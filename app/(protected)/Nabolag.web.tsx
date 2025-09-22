// app/(protected)/Nabolag.web.tsx
import { decode } from "base64-arraybuffer";
// ⚠️ VIGTIGT: Ingen top-level imports af image-picker/manipulator på web
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";

import { KATEGORIER, Post, useNabolag } from "../../hooks/useNabolag";
import { supabase } from "../../utils/supabase";

/* ───────── TEMA ───────── */
const THEME = {
  pageBg: "#7C8996",
  boardBg: "#ffffff",
  ink: "#0b1220",
  sub: "#425466",
  line: "#d0d7de",
  chipBg: "#eef2ff",
  chipText: "#1e293b",
  btn: "#131921",
  cardBg: "#ffffff",
  cardInk: "#0f172a",
};
const RADII = { sm: 8, md: 12, lg: 16, xl: 22 };
const GRID = { boardMaxW: 1120, padX: 20, gap: 18, brk3: 1024, brk2: 680 };
const SHADOW = {
  soft: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
};
const distances = [1, 2, 3, 5, 10, 20, 50];
const km = (n: number) => (Number.isNaN(n) ? "" : `${n.toFixed(1)} km`);

/* ───────── UI-klodser ───────── */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}

function KategoriPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.chipBtn} onPress={() => setOpen(true)}>
        <Text style={styles.chipBtnText}>{value ?? "Alle kategorier"}</Text>
        <Text style={styles.caret}>▾</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Vælg kategori</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <Text>Alle</Text>
            </TouchableOpacity>
            {KATEGORIER.map((k) => (
              <TouchableOpacity
                key={k}
                style={styles.modalOption}
                onPress={() => {
                  onChange(k);
                  setOpen(false);
                }}
              >
                <Text style={{ fontWeight: value === k ? "800" : "400" }}>{k}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setOpen(false)}>
              <Text style={styles.modalCloseText}>Luk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function RadiusPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.chipBtn} onPress={() => setOpen(true)}>
        <Text style={styles.chipBtnText}>{value} km</Text>
        <Text style={styles.caret}>▾</Text>
      </TouchableOpacity>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Radius</Text>
            {distances.map((d) => (
              <TouchableOpacity
                key={d}
                style={styles.modalOption}
                onPress={() => {
                  onChange(d);
                  setOpen(false);
                }}
              >
                <Text style={{ fontWeight: d === value ? "800" : "400" }}>{d} km</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setOpen(false)}>
              <Text style={styles.modalCloseText}>Luk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ───────── Opret-opslag ───────── */
function OpretOpslagWeb({
  visible,
  onClose,
  onSubmit,
  currentUserId,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  currentUserId: string | null;
}) {
  const [overskrift, setOverskrift] = useState("");
  const [text, setText] = useState("");
  const [omraade, setOmraade] = useState("");
  const [kategori, setKategori] = useState<string | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = overskrift.trim() && text.trim();

  // ⬇️ Lazy-load image libs KUN når brugeren vælger billede
  const pickImage = async () => {
    const ImagePicker = await import("expo-image-picker");
    const ImageManipulator = await import("expo-image-manipulator");

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false,
    });
    if ((res as any)?.canceled) return;
    const asset = (res as any)?.assets?.[0];
    if (!asset?.uri) return;

    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1600 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!manipulated.base64) return;

    setImagePreview(manipulated.uri);
    setImageBase64(manipulated.base64);
  };

  const handleSubmit = async () => {
    if (!currentUserId || !canSubmit) return;
    try {
      setSaving(true);
      let image_url: string | null = null;

      if (imageBase64) {
        const filePath = `posts/${currentUserId}/${Date.now()}.jpg`;
        const { error } = await supabase.storage
          .from("foreningsbilleder")
          .upload(filePath, decode(imageBase64), { contentType: "image/jpeg", upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from("foreningsbilleder").getPublicUrl(filePath);
        image_url = data?.publicUrl ?? null;
      }

      await onSubmit({
        overskrift: overskrift.trim(),
        text: text.trim(),
        omraade: omraade.trim() || null,
        kategori,
        image_url,
      });

      setOverskrift("");
      setText("");
      setOmraade("");
      setKategori(null);
      setImagePreview(null);
      setImageBase64(null);
      onClose();
    } catch (e: any) {
      alert(e?.message || "Kunne ikke oprette opslag.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { width: 520 }]}>
            <Text style={styles.modalTitle}>Opret opslag</Text>

            <TextInput
              style={styles.input}
              placeholder="Overskrift *"
              placeholderTextColor="#9aa0a6"
              value={overskrift}
              onChangeText={setOverskrift}
            />
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Tekst *"
              placeholderTextColor="#9aa0a6"
              value={text}
              onChangeText={setText}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Område (valgfri)"
              placeholderTextColor="#9aa0a6"
              value={omraade}
              onChangeText={setOmraade}
            />

            <View style={{ marginTop: 8, gap: 8 }}>
              <Text style={styles.label}>Kategori</Text>
              <KategoriPicker value={kategori} onChange={setKategori} />
            </View>

            {imagePreview ? (
              <View style={{ marginTop: 8 }}>
                <Image source={{ uri: imagePreview }} style={styles.preview} />
                <TouchableOpacity
                  onPress={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  style={[styles.smallBtn, styles.grayBtn, { marginTop: 8 }]}
                >
                  <Text style={styles.smallBtnText}>Fjern billede</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={[styles.smallBtn, styles.btn]}>
                <Text style={styles.smallBtnText}>Vælg billede</Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.action, styles.btn, !canSubmit && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={!canSubmit || saving}
              >
                <Text style={styles.actionText}>{saving ? "Opretter…" : "Opret opslag"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.action, styles.grayBtn]} onPress={onClose}>
                <Text style={styles.actionText}>Annullér</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/* ───────── Detalje ───────── */
function OpslagDetaljeWeb({
  visible,
  opslag,
  onClose,
  distanceText,
}: {
  visible: boolean;
  opslag: Post | null;
  onClose: () => void;
  distanceText?: string | null;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { width: 640 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.modalTitle}>Opslag</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 18, fontWeight: "900" }}>✕</Text>
            </TouchableOpacity>
          </View>

          {opslag ? (
            <View>
              {!!opslag.image_url && (
                <Image
                  source={{ uri: opslag.image_url }}
                  style={{ width: "100%", height: 280, borderRadius: RADII.md, marginBottom: 10 }}
                />
              )}
              {!!opslag.kategori && <Chip>{opslag.kategori}</Chip>}
              <Text style={{ fontWeight: "900", fontSize: 18, color: THEME.cardInk }}>{opslag.overskrift}</Text>
              {!!opslag.omraade && <Text style={{ color: "#475569", marginTop: 2 }}>{opslag.omraade}</Text>}
              {!!distanceText && <Text style={{ color: "#6b7280", marginTop: 2 }}>{distanceText}</Text>}
              {!!opslag.text && <Text style={{ color: "#111827", marginTop: 10, lineHeight: 20 }}>{opslag.text}</Text>}
            </View>
          ) : (
            <Text>Indlæser…</Text>
          )}

          <TouchableOpacity onPress={onClose} style={[styles.action, styles.btn, { marginTop: 16 }]}>
            <Text style={styles.actionText}>Luk</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ───────── Skærm ───────── */
export default function NabolagWeb() {
  // Backup: sikre scroll/klik globalt når vi mount’er web-siden
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.body.style.pointerEvents = "auto";
      const root = (document.getElementById("__next") || document.body) as HTMLElement;
      root.style.pointerEvents = "auto";
    }
  }, []);

  const {
    userId,
    userLocation,
    loading,
    refreshing,
    filteredPosts,
    searchQuery,
    setSearchQuery,
    radius,
    handleRadiusChange,
    kategoriFilter,
    setKategoriFilter,
    onRefresh,
    createPost,
    distanceInKm,
  } = useNabolag();

  const { width } = useWindowDimensions();
  const boardW = Math.min(width, GRID.boardMaxW);
  const cols = boardW >= GRID.brk3 ? 3 : boardW >= GRID.brk2 ? 2 : 1;
  const isGrid = cols > 1;
  const rawW = (boardW - GRID.padX * 2 - (isGrid ? GRID.gap * (cols - 1) : 0)) / (isGrid ? cols : 1);
  const cardW = Math.floor(rawW);
  const singleW = Math.floor(boardW - GRID.padX * 2);
  const isNarrow = boardW < 560;

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);

  const distanceText = useMemo(() => {
    if (!selected || !userLocation || !selected.latitude || !selected.longitude) return null;
    return km(
      distanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        selected.latitude,
        selected.longitude
      )
    );
  }, [selected, userLocation]);

  const renderItem = ({ item }: { item: Post }) => {
    const showD = !!userLocation && !!item.latitude && !!item.longitude;
    const d = showD
      ? distanceInKm(userLocation!.latitude, userLocation!.longitude, item.latitude!, item.longitude!)
      : NaN;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelected(item);
          setDetailOpen(true);
        }}
        activeOpacity={0.92}
        style={{ width: isGrid ? cardW : singleW, marginBottom: GRID.gap }}
      >
        <View style={styles.card}>
          {!!item.image_url && <Image source={{ uri: item.image_url }} style={styles.cardImage} />}
          <View style={{ padding: 10 }}>
            {!!item.kategori && <Chip>{item.kategori}</Chip>}
            <Text style={styles.title}>{item.overskrift}</Text>
            {!!item.omraade && <Text style={styles.place}>{item.omraade}</Text>}
            {!!item.text && (
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.teaser}>
                {item.text}
              </Text>
            )}
            {showD ? <Text style={styles.distance}>{km(d)} væk</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.page}>
      <View style={[styles.board, { width: boardW }]}>
        <View style={styles.header}>
          <Text style={styles.h1}>Nabolag</Text>
          <TouchableOpacity style={styles.primary} onPress={() => setCreateOpen(true)}>
            <Text style={styles.primaryText}>Opret opslag</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.filters, isNarrow && { flexDirection: "column", gap: 10 }]}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.search, isNarrow && { width: "100%" }]}
            placeholder="Søg i opslag…"
            placeholderTextColor="#6b7280"
            returnKeyType="search"
          />
          <View
            style={[
              styles.filterRight,
              isNarrow && { width: "100%", justifyContent: "space-between" },
            ]}
          >
            <KategoriPicker value={kategoriFilter} onChange={setKategoriFilter} />
            <RadiusPicker value={radius} onChange={handleRadiusChange} />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.ink} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(it) => it.id}
            style={{ width: "100%" }}
            contentContainerStyle={{
              paddingHorizontal: GRID.padX,
              paddingBottom: 72,
              alignItems: "center",
              alignSelf: "center",
              maxWidth: boardW,
            }}
            numColumns={isGrid ? cols : 1}
            columnWrapperStyle={isGrid ? { gap: GRID.gap } : undefined}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            scrollEnabled
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={{ color: THEME.sub, marginTop: 14 }}>Ingen opslag fundet.</Text>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME.ink]} />
            }
          />
        )}
      </View>

      <OpretOpslagWeb
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          await createPost(payload);
        }}
        currentUserId={userId}
      />
      <OpslagDetaljeWeb
        visible={detailOpen}
        opslag={selected}
        onClose={() => setDetailOpen(false)}
        distanceText={distanceText}
      />
    </View>
  );
}

/* ───────── Styles ───────── */
const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    backgroundColor: THEME.pageBg,
    alignItems: "center",
    paddingVertical: 18,
  },
  board: { backgroundColor: THEME.boardBg, borderRadius: RADII.xl, ...SHADOW.soft },
  header: {
    height: 68,
    paddingHorizontal: GRID.padX,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  h1: { color: THEME.ink, fontSize: 22, fontWeight: "900" },

  primary: {
    backgroundColor: THEME.btn,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  primaryText: { color: "#fff", fontWeight: "800" },

  filters: {
    paddingHorizontal: GRID.padX,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  search: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: THEME.line,
    color: THEME.ink,
  },
  filterRight: { flexDirection: "row", alignItems: "center", gap: 10 },

  chipBtn: {
    height: 44,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: THEME.line,
    backgroundColor: THEME.chipBg,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipBtnText: { color: THEME.chipText, fontWeight: "800" },
  caret: { color: THEME.chipText, fontSize: 12, marginTop: 1 },

  chip: {
    alignSelf: "flex-start",
    backgroundColor: THEME.chipBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  chipText: { color: THEME.chipText, fontWeight: "800", fontSize: 12 },

  card: {
    width: "100%",
    backgroundColor: THEME.cardBg,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: THEME.line,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 132, backgroundColor: "#f1f5f9" },
  title: { fontWeight: "900", fontSize: 16, color: THEME.cardInk },
  place: { fontSize: 12, color: "#64748b", marginTop: 2 },
  teaser: { fontSize: 13, color: "#475569", marginTop: 6 },
  distance: { fontSize: 11, color: "#6b7280", marginTop: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: "#eef1f4",
    padding: 18,
    width: 420,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827", marginBottom: 12 },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADII.md,
    backgroundColor: "#f6f8fa",
    marginBottom: 8,
    alignItems: "center",
  },
  modalClose: { alignSelf: "center", marginTop: 6, padding: 8 },
  modalCloseText: { color: "#374151", fontWeight: "700" },

  input: {
    backgroundColor: "#fff",
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: "#e5e8ec",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
    color: "#000",
    marginTop: 6,
    fontSize: 14,
  },
  inputMulti: { minHeight: 90, textAlignVertical: "top" },
  label: { color: "#111827", fontWeight: "700" },

  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.md,
    alignSelf: "flex-start",
  },
  smallBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  btn: { backgroundColor: THEME.btn },
  grayBtn: { backgroundColor: "#9aa0a6" },
  preview: { width: "100%", height: 180, backgroundColor: "#f1f5f9", borderRadius: RADII.md },

  action: {
    borderRadius: RADII.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "900" },
});
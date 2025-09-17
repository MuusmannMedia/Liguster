// components/BottomNav.tsx
import { usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type BtnProps = {
  to: string;
  label: string;
  isMig?: boolean;
  active: boolean;
  onPress: () => void;
  fontSize: number;
  activePaddingH: number;
  activePaddingHMig: number;
};

const Btn = ({
  to,
  label,
  isMig,
  active,
  onPress,
  fontSize,
  activePaddingH,
  activePaddingHMig,
}: BtnProps) => {
  const base = [styles.item, { fontSize }];
  const activeStyle = active
    ? [
        isMig ? styles.activeMig : styles.active,
        { paddingHorizontal: isMig ? activePaddingHMig : activePaddingH },
      ]
    : [];

  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <Text style={[...base, ...activeStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const { width, height } = useWindowDimensions();

  // iPad-detektion
  const isTablet = useMemo(() => {
    // @ts-ignore - Platform.isPad findes kun på iOS
    if (Platform.OS === "ios" && Platform.isPad) return true;
    return Math.min(width, height) >= 768;
  }, [width, height]);

  const labelFontSize = isTablet ? 18 : 10;
  const activePaddingH = isTablet ? 18 : 12;
  const activePaddingHMig = isTablet ? 24 : 18;

  const go = (to: string) => {
    if (path !== to) router.replace(to);
  };

  return (
    <View style={styles.nav}>
      <View style={styles.row}>
        <Btn
          to="/Nabolag"
          label="NABOLAG"
          active={path === "/Nabolag"}
          onPress={() => go("/Nabolag")}
          fontSize={labelFontSize}
          activePaddingH={activePaddingH}
          activePaddingHMig={activePaddingHMig}
        />
        <Btn
          to="/ForeningerScreen"
          label="FORENING"
          active={path === "/ForeningerScreen"}
          onPress={() => go("/ForeningerScreen")}
          fontSize={labelFontSize}
          activePaddingH={activePaddingH}
          activePaddingHMig={activePaddingHMig}
        />
        <Btn
          to="/Beskeder"
          label="BESKEDER"
          active={path === "/Beskeder"}
          onPress={() => go("/Beskeder")}
          fontSize={labelFontSize}
          activePaddingH={activePaddingH}
          activePaddingHMig={activePaddingHMig}
        />
      </View>

      <View style={styles.row}>
        <Btn
          to="/MineOpslag"
          label="MINE OPSLAG"
          active={path === "/MineOpslag"}
          onPress={() => go("/MineOpslag")}
          fontSize={labelFontSize}
          activePaddingH={activePaddingH}
          activePaddingHMig={activePaddingHMig}
        />
        <Btn
          to="/MigScreen"
          label="MIG"
          isMig
          active={path === "/MigScreen"}
          onPress={() => go("/MigScreen")}
          fontSize={labelFontSize}
          activePaddingH={activePaddingH}
          activePaddingHMig={activePaddingHMig}
        />
        {/* tom knap for balance */}
        <View style={styles.navButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: "#171C22",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 18,
    paddingBottom: 24,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
  },
  item: {
    color: "#fff",
    fontWeight: "500",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  active: {
    backgroundColor: "#fff",
    color: "#171C22",
    borderRadius: 8,
    fontWeight: "bold",
  },
  activeMig: {
    backgroundColor: "#fff",
    color: "#171C22",
    borderRadius: 10,
    fontWeight: "bold",
  },
});
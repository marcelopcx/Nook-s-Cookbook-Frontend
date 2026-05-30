import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { startSoundtrack, stopSoundtrack } from "@/services/soundtrack";
import { useAudioSettings } from "@/providers/AudioSettingsProvider";

export default function TabsLayout() {
  const { musicEnabled } = useAudioSettings();
  const pathname = usePathname();
  const prevTabPath = useRef<string | null>(null);
  const { width } = useWindowDimensions();
  const [turnDirection, setTurnDirection] = useState<1 | -1>(1);

  const overlayTranslateX = useSharedValue(width || 0);
  const overlayOpacity = useSharedValue(0);

  const tabOrder = useRef([
    "/inicio",
    "/mis-recetas",
    "/cesta",
    "/perfil",
    "/ajustes",
  ]).current;

  const isDashboardTabPath = (path: string) => tabOrder.includes(path);

  const getTabIndex = (path: string) => tabOrder.indexOf(path);

  const playPageTurnAnimation = (direction: 1 | -1) => {
    if (!width) return;

    overlayOpacity.value = 1;
    if (direction === 1) {
      overlayTranslateX.value = width;
      overlayTranslateX.value = withTiming(
        -width,
        { duration: 420 },
        (finished) => {
          if (finished) {
            overlayTranslateX.value = width;
            overlayOpacity.value = 0;
          }
        },
      );
      return;
    }

    overlayTranslateX.value = -width;
    overlayTranslateX.value = withTiming(
      width,
      { duration: 420 },
      (finished) => {
        if (finished) {
          overlayTranslateX.value = -width;
          overlayOpacity.value = 0;
        }
      },
    );
  };

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      transform: [{ translateX: overlayTranslateX.value }],
    };
  });

  useEffect(() => {
    if (musicEnabled) {
      void startSoundtrack();
    } else {
      void stopSoundtrack();
    }
  }, [musicEnabled]);

  useEffect(() => {
    if (!width) return;
    if (!isDashboardTabPath(pathname)) return;

    const prev = prevTabPath.current;
    if (!prev) {
      prevTabPath.current = pathname;
      overlayTranslateX.value = width;
      overlayOpacity.value = 0;
      return;
    }

    if (prev !== pathname && isDashboardTabPath(prev)) {
      const prevIndex = getTabIndex(prev);
      const nextIndex = getTabIndex(pathname);
      const direction: 1 | -1 = nextIndex >= prevIndex ? 1 : -1;
      setTurnDirection(direction);
      playPageTurnAnimation(direction);
    }

    prevTabPath.current = pathname;
  }, [pathname, width]);

  useEffect(() => {
    return () => {
      void stopSoundtrack();
    };
  }, []);

  const tabBarStyle = {
    backgroundColor: "#FFFAEF",
    borderTopColor: "#e8dfd4",
    borderTopWidth: 2,
    height: 80,
    paddingBottom: 25,
    paddingTop: 25,
    marginBottom: 25,
    marginHorizontal: 10,
    borderRadius: 20,
  };
  return (
    <View className="flex-1 bg-[#FFFAEF]">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: "#5c4a3d",
          tabBarInactiveTintColor: "#8b7355",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="inicio"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-2xl px-3 py-2 mb-4 ${
                  focused ? "bg-[#7cb69d]/15" : ""
                }`}
              >
                <View
                  className={`mb-2 items-center justify-center rounded-lg ${
                    focused
                      ? "bg-[#7cb69d]/20 border border-[#7cb69d]/40"
                      : "bg-[#f5ebe0] border border-[#e8dfd4]"
                  }`}
                  style={{ height: 44, width: 44 }}
                >
                  <MaterialCommunityIcons
                    name="leaf"
                    size={20}
                    color={focused ? "#5c4a3d" : color}
                  />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="mis-recetas"
          options={{
            title: "Mis Recetas",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-2xl px-3 py-2 mb-4 ${
                  focused ? "bg-[#7cb69d]/15" : ""
                }`}
              >
                <View
                  className={`mb-2 items-center justify-center rounded-lg ${
                    focused
                      ? "bg-[#7cb69d]/20 border border-[#7cb69d]/40"
                      : "bg-[#f5ebe0] border border-[#e8dfd4]"
                  }`}
                  style={{ height: 44, width: 44 }}
                >
                  <MaterialCommunityIcons
                    name="book-open-page-variant"
                    size={20}
                    color={focused ? "#5c4a3d" : color}
                  />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="cesta"
          options={{
            title: "Cesta",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-2xl px-3 py-2 mb-4 ${
                  focused ? "bg-[#7cb69d]/15" : ""
                }`}
              >
                <View
                  className={`mb-2 items-center justify-center rounded-lg ${
                    focused
                      ? "bg-[#7cb69d]/20 border border-[#7cb69d]/40"
                      : "bg-[#f5ebe0] border border-[#e8dfd4]"
                  }`}
                  style={{ height: 44, width: 44 }}
                >
                  <MaterialCommunityIcons
                    name="basket"
                    size={20}
                    color={focused ? "#5c4a3d" : color}
                  />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-2xl px-3 py-2 mb-4 ${
                  focused ? "bg-[#7cb69d]/15" : ""
                }`}
              >
                <View
                  className={`mb-2 items-center justify-center rounded-lg ${
                    focused
                      ? "bg-[#7cb69d]/20 border border-[#7cb69d]/40"
                      : "bg-[#f5ebe0] border border-[#e8dfd4]"
                  }`}
                  style={{ height: 44, width: 44 }}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={20}
                    color={focused ? "#5c4a3d" : color}
                  />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="ajustes"
          options={{
            title: "Ajustes",
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center rounded-2xl px-3 py-2 mb-4 ${
                  focused ? "bg-[#7cb69d]/15" : ""
                }`}
              >
                <View
                  className={`mb-2 items-center justify-center rounded-lg ${
                    focused
                      ? "bg-[#7cb69d]/20 border border-[#7cb69d]/40"
                      : "bg-[#f5ebe0] border border-[#e8dfd4]"
                  }`}
                  style={{ height: 44, width: 44 }}
                >
                  <MaterialCommunityIcons
                    name="cog"
                    size={20}
                    color={focused ? "#5c4a3d" : color}
                  />
                </View>
              </View>
            ),
          }}
        />
      </Tabs>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#FFFAEF",
            borderLeftWidth: turnDirection === 1 ? 2 : 0,
            borderLeftColor: turnDirection === 1 ? "#e8dfd4" : "transparent",
            borderRightWidth: turnDirection === -1 ? 2 : 0,
            borderRightColor: turnDirection === -1 ? "#e8dfd4" : "transparent",
          },
          overlayStyle,
        ]}
      />
    </View>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { startSoundtrack, stopSoundtrack } from "@/services/soundtrack";

export default function TabsLayout() {
  useEffect(() => {
    startSoundtrack();
    return () => {
      stopSoundtrack();
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
    </View>
  );
}

import { Stack, usePathname } from "expo-router";
import { AuthProvider } from "@/providers/AuthProvider";
import { AchievementsProvider } from "@/providers/AchievementsProvider";
import { AudioSettingsProvider } from "@/providers/AudioSettingsProvider";
import { RecipesProvider } from "@/providers/RecipesProvider";
import { playPageTurnSfx, unloadPageTurnSfx } from "@/services/soundtrack";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  const isAuthPath = (path: string) => {
    return (
      path === "/login" || path === "/register" || path === "/forgot-password"
    );
  };

  const shouldPlaySfxForTransition = (from: string, to: string) => {
    if (from === "/" && to === "/login") return false;
    if (from === "/login" && to === "/inicio") return false;
    if (from === "/" && to === "/inicio") return false;
    if (isAuthPath(from) && isAuthPath(to)) return false;
    return true;
  };

  useEffect(() => {
    const prev = prevPathname.current;
    if (!prev) {
      prevPathname.current = pathname;
      return;
    }

    if (prev !== pathname && shouldPlaySfxForTransition(prev, pathname)) {
      void playPageTurnSfx();
    }

    prevPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    return () => {
      void unloadPageTurnSfx();
    };
  }, []);

  return (
    <View className="flex-1 bg-[#5c4a3d]">
      <AuthProvider>
        <AchievementsProvider>
          <AudioSettingsProvider>
            <RecipesProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            </RecipesProvider>
          </AudioSettingsProvider>
        </AchievementsProvider>
      </AuthProvider>
    </View>
  );
}

import { Stack, usePathname } from "expo-router";
import { AudioSettingsProvider } from "@/providers/AudioSettingsProvider";
import { RecipesProvider } from "@/providers/RecipesProvider";
import { playPageTurnSfx, unloadPageTurnSfx } from "@/services/soundtrack";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import "react-native-reanimated";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  const isAuthPath = (path: string) => {
    return (
      path === "/login" || path === "/register" || path === "/forgot-password"
    );
  };

  const shouldPlaySfxForTransition = (from: string, to: string) => {
    // Silenciar transiciones automáticas de arranque/auth.
    if (from === "/" && to === "/login") return false;
    if (from === "/login" && to === "/inicio") return false;

    // Por si el router hace un redirect directo al dashboard.
    if (from === "/" && to === "/inicio") return false;

    // No reproducir SFX dentro del flujo de autenticación.
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
      <AudioSettingsProvider>
        <RecipesProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </RecipesProvider>
      </AudioSettingsProvider>
    </View>
  );
}

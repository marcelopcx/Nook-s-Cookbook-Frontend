import { useAuth } from "@/providers/AuthProvider";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

const SPLASH_MIN_MS = 1500;

SplashScreen.preventAutoHideAsync().catch(() => {});

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const [minTimeDone, setMinTimeDone] = useState(false);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  const ready = !isLoading && minTimeDone;

  return (
    <View style={styles.root}>
      {!ready ? (
        <View style={styles.splash}>
          <Image
            source={require("../../../assets/images/splash.png")}
            style={{ width, height }}
            resizeMode="cover"
            resizeMethod={Platform.OS === "android" ? "resize" : "auto"}
          />
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#5c4a3d",
  },
  splash: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#5c4a3d",
  },
});

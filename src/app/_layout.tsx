import { Stack } from "expo-router";
import { RecipesProvider } from "@/providers/RecipesProvider";
import { View } from "react-native";
import "react-native-reanimated";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  return (
    <View className="flex-1 bg-[#5c4a3d]">
      <RecipesProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </RecipesProvider>
    </View>
  );
}

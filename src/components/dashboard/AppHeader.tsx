import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function AppHeader() {
  return (
    <View className="relative py-[50px] px-4">
      <View className="absolute left-8 top-14 h-2 w-2 rounded-full bg-[#f4b8c5]" />
      <View className="absolute left-4 top-20 h-1.5 w-1.5 rounded-full bg-[#7cb69d]" />
      <View className="absolute right-6 top-14 h-2 w-2 rounded-full bg-[#f9d77e]" />
      <View className="absolute right-10 top-20 h-1.5 w-1.5 rounded-full bg-[#ffd9b3]" />

      <View className="flex-row items-center justify-center gap-2">
        <MaterialCommunityIcons
          name="leaf"
          size={28}
          color="#7cb69d"
          style={{ transform: [{ rotate: "-10deg" }] }}
        />
        <Text className="text-2xl font-extrabold tracking-wide text-[#5c4a3d]">
          Nook's CookBook
        </Text>
        <MaterialCommunityIcons
          name="leaf"
          size={28}
          color="#7cb69d"
          style={{ transform: [{ scaleX: -1 }, { rotate: "-10deg" }] }}
        />
      </View>

      <View className="mt-1 flex-row justify-center gap-1">
        <MaterialCommunityIcons name="flower" size={10} color="#f4b8c5" />
        <MaterialCommunityIcons name="flower" size={10} color="#7cb69d" />
        <MaterialCommunityIcons name="flower" size={10} color="#f9d77e" />
        <MaterialCommunityIcons name="flower" size={10} color="#ffd9b3" />
        <MaterialCommunityIcons name="flower" size={10} color="#f4b8c5" />
      </View>
    </View>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type AchievementCardProps = {
  title: string;
  description: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  completed?: boolean;
};

export default function AchievementCard({
  title,
  description,
  iconName,
  completed = false,
}: AchievementCardProps) {
  return (
    <View
      className={`w-full rounded-xl border-2 p-3 ${
        completed
          ? "border-[#f9d77e] bg-[#fff9f0]"
          : "border-[#e8dfd4] bg-[#f5ebe0]/50 opacity-60"
      }`}
      style={{ position: "relative" }}
    >
      {completed ? (
        <View style={{ position: "absolute", top: 8, right: 8 }}>
          <Text className="text-xs font-medium text-[#d4a54a]">Completado</Text>
        </View>
      ) : null}

      <MaterialCommunityIcons name={iconName} size={22} color="#f9d77e" />
      <Text
        className={`mt-1 text-sm font-bold ${
          completed ? "text-[#5c4a3d]" : "text-[#8b7355]"
        }`}
      >
        {title}
      </Text>
      <Text className="text-xs text-[#8b7355]">{description}</Text>
    </View>
  );
}

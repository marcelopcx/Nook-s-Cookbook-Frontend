import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string | number;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  backgroundClassName: string;
};

export default function StatCard({
  label,
  value,
  iconName,
  backgroundClassName,
}: StatCardProps) {
  const mutedColor = "#8b7355";
  return (
    <View
      className={`w-full rounded-xl border border-[#e8dfd4]/50 p-3 ${backgroundClassName}`}
    >
      <View className="mb-1 flex-row items-center gap-2">
        <MaterialCommunityIcons name={iconName} size={18} color={mutedColor} />
        <Text className="text-xs text-[#8b7355]">{label}</Text>
      </View>
      <Text className="text-lg font-bold text-[#5c4a3d]">{value}</Text>
    </View>
  );
}
